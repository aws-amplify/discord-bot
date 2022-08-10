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
import type * as s3 from 'aws-cdk-lib/aws-s3'
import type { AmplifyAwsSubdomain } from './amplify-aws-subdomain'

interface DockerProps {
  name: string
  context: string
  dockerfile?: string
  environment?: { [key: string]: string }
}

export interface HeyAmplifyAppProps {
  /**
   * S3 bucket to store SQLite backups and logs
   */
  bucket: s3.Bucket

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

    const {
      bucket,
      cluster,
      filesystem,
      filesystemMountPoint,
      docker,
      subdomain,
    } = props

    const secrets = {}
    for (const [name, param] of Object.entries(props.secrets)) {
      secrets[name] = ecs.Secret.fromSsmParameter(param)
    }

    const albFargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        `AlbFargateService`,
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

    const headerAllowlist = [
      'X-GitHub-Delivery',
      'X-GitHub-Event',
      'X-GitHub-Hook-ID',
      'X-GitHub-Hook-Installation-Target-ID',
      'X-GitHub-Hook-Installation-Target-Type',
      'X-Hub-Signature',
      'X-Hub-Signature-256',
    ]

    // set up CloudFront
    const distribution = new cloudfront.Distribution(this, 'CFDistribution', {
      // domainNames and certificate needed for amplify.aws subdomain (connected to a Route53 hosted zone)
      domainNames: subdomain?.domainNames ? subdomain.domainNames : undefined,
      certificate: subdomain?.certificate ? subdomain.certificate : undefined,
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
            ...headerAllowlist
          ),
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
      },
    })

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

    // enable access logging for load balancer
    // albFargateService.loadBalancer.logAccessLogs(bucket, 'elb-access')

    // enable deletion protection for load balancer
    albFargateService.loadBalancer.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)

    // set up DNS record for the CloudFront distribution if subdomain exists
    if (subdomain) {
      const record = new route53.ARecord(this, 'AliasRecordApp', {
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
        zone: subdomain.hostedZone,
        recordName: this.envName,
      })

      new cdk.CfnOutput(this, 'HeyAmplifyAppURL', {
        value: record.domainName,
      })
    }

    /**
     * if DATABASE_URL is a SQLite database, create a backup solution
     * @TODO litestream is causing conflicts with prisma, locking the database and throwing disk I/O errors, revisit with backups on cron
     */
    if (docker.environment?.DATABASE_URL?.startsWith('file:')) {
      // create backup infrastructure, Litestream sidecar
      // const litestreamContainer =
      //   albFargateService.service.taskDefinition.addContainer('db-backup', {
      //     image: ecs.ContainerImage.fromRegistry('litestream/litestream'),
      //     environment: {
      //       BUCKET_NAME: bucket.bucketName,
      //     },
      //     logging: new ecs.AwsLogDriver({
      //       streamPrefix: 'backup',
      //     }),
      //     command: [
      //       'replicate',
      //       `${docker.environment.DATABASE_URL.replace('file:', '')}`,
      //       `s3://${bucket.bucketName}/backups`,
      //     ],
      //   })
      // bucket.grantReadWrite(albFargateService.service.taskDefinition.taskRole)
      // // mount the filesystem
      // litestreamContainer.addMountPoints({
      //   containerPath: filesystemMountPoint,
      //   sourceVolume: volumeName,
      //   readOnly: false,
      // })
    }
  }
}
