import { Construct } from 'constructs'
import { Port } from 'aws-cdk-lib/aws-ec2'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { v4 as uuid } from 'uuid'
import type { AmplifyAwsSubdomain } from './amplify-aws-subdomain'

interface DockerProps {
  name: string
  context: string
  dockerfile?: string
  environment?: { [key: string]: string }
}

export interface HeyAmplifyAppProps {
  /**
   * ECS Cluster the Application Load Balanced Fargate Service will be deployed to.
   */
  cluster: ecs.Cluster

  /**
   * Asset path to the directory with the Dockerfile.
   */
  docker: DockerProps

  /**
   * Filesystem to be used for storing the application's data.
   */
  filesystem: efs.FileSystem

  /**
   * Filesystem container mount point
   */
  filesystemMountPoint: string

  /**
   * Discord Bot secrets
   *
   * Discord bots can be managed in the {@link https://discord.com/developers/applications Developer Portal}.
   */
  secrets: {
    // DISCORD_BOT_TOKEN: ssm.IParameter
    [name: string]: ssm.IParameter
  }

  /**
   * Amplify AWS Subdomain (if exists)
   */
  subdomain: AmplifyAwsSubdomain | undefined
}

export class HeyAmplifyApp extends Construct {
  private readonly appName: string = this.node.tryGetContext('name')
  private readonly envName: string = this.node.tryGetContext('env')

  constructor(scope: Construct, id: string, props: HeyAmplifyAppProps) {
    super(scope, id)

    const { cluster, filesystem, filesystemMountPoint, docker, subdomain } =
      props

    const secrets = {}
    for (const [name, param] of Object.entries(props.secrets)) {
      secrets[name] = ecs.Secret.fromSsmParameter(param)
    }

    const albFargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        `fargate-service`,
        {
          cluster,
          cpu: 256,
          memoryLimitMiB: 512,
          desiredCount: 1,
          taskImageOptions: {
            containerName: docker.name,
            image: ecs.ContainerImage.fromAsset(docker.context, {
              file: docker.dockerfile || 'Dockerfile',
              // https://github.com/aws/aws-cdk/issues/14395
              buildArgs: docker.environment,
            }),
            environment: docker.environment,
            enableLogging: true,
            secrets,
            containerPort: 3000,
          },
          publicLoadBalancer: true, // needed for bridge to CF
        }
      )

    albFargateService.targetGroup.setAttribute(
      'deregistration_delay.timeout_seconds',
      '30'
    )

    albFargateService.targetGroup.configureHealthCheck({
      path: '/healthcheck',
      interval: cdk.Duration.seconds(5),
      healthyHttpCodes: '200',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
      timeout: cdk.Duration.seconds(4),
    })

    const volumeName = 'efs-volume'
    albFargateService.service.taskDefinition.addVolume({
      name: volumeName,
      efsVolumeConfiguration: {
        fileSystemId: filesystem.fileSystemId,
      },
    })

    const container = albFargateService.service.taskDefinition.findContainer(
      docker.name
    ) as ecs.ContainerDefinition

    // mount the filesystem
    container.addMountPoints({
      containerPath: filesystemMountPoint,
      sourceVolume: volumeName,
      readOnly: false,
    })

    // grant access to the filesystem
    filesystem.grant(
      container.taskDefinition.taskRole,
      'elasticfilesystem:ClientRootAccess',
      'elasticfilesystem:ClientWrite',
      'elasticfilesystem:ClientMount',
      'elasticfilesystem:DescribeMountTargets'
    )

    // allow inbound connections to the filesystem
    filesystem.connections.allowDefaultPortFrom(albFargateService.service)

    // allow outbound connections to the filesystem
    albFargateService.service.connections.allowTo(filesystem, Port.tcp(2049))

    const xAmzSecurityTokenHeaderName = 'X-HeyAmplify-Security-Token'
    const xAmzSecurityTokenHeaderValue = uuid()

    // set up CloudFront
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      // domainNames and certificate needed for amplify.aws subdomain (connected to a Route53 hosted zone)
      domainNames: subdomain?.domainNames ? subdomain.domainNames : undefined,
      certificate: subdomain?.certificate ? subdomain.certificate : undefined,
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        }),
        origin: new origins.LoadBalancerV2Origin(
          albFargateService.loadBalancer,
          {
            customHeaders: {
              // send the X-HeyAmplify-Security-Token header to the ALB
              [xAmzSecurityTokenHeaderName]: xAmzSecurityTokenHeaderValue,
            },
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        // TODO: cache policy?
      },
    })

    // set up DNS record for the CloudFront distribution if subdomain exists
    if (subdomain) {
      new route53.ARecord(this, 'AliasRecord', {
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
        zone: subdomain.hostedZone,
        recordName: this.envName,
      })
    }

    for (const listener of albFargateService.loadBalancer.listeners) {
      // create listener rule for Security headers
      new elb.ApplicationListenerRule(this, 'SecurityListenerRule', {
        listener,
        priority: 1,
        conditions: [
          // verify the X-HeyAmplify-Security-Token header is set and valid
          elb.ListenerCondition.httpHeader(xAmzSecurityTokenHeaderName, [
            xAmzSecurityTokenHeaderValue,
          ]),
        ],
        targetGroups: [albFargateService.targetGroup],
      })
      // modify default action to send 403
      listener.addAction('default', {
        action: elb.ListenerAction.fixedResponse(403, {
          messageBody: 'Forbidden',
        }),
      })
    }
  }
}
