import * as path from 'node:path'
import * as cdk from 'aws-cdk-lib'
import * as events from 'aws-cdk-lib/aws-events'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

// Define the properties for the PrivacyNotificationFunction construct
export interface PrivacyNotificationFunctionProps {
  vpc: ec2.Vpc
  secret: {
    WEBHOOK_URL: ssm.IParameter
  }
}

export class PrivacyNotificationFunction extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: PrivacyNotificationFunctionProps
  ) {
    super(scope, id)

    const { vpc, secret } = props

    // Create a Lambda function nodejs 18.x
    const lambdaFunction = new nodejsLambda.NodejsFunction(
      this,
      'PrivacyNotificationFunction',
      {
        entry: path.join('./handler.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_18_X,
        bundling: {
          minify: true,
          target: 'es2022',
          nodeModules: ['@discordjs/builders'],
          externalModules: ['@aws-sdk/client-ssm'],
        },
        environment: {
          WEBHOOK_URL: secret.WEBHOOK_URL.parameterName, // Pass the SSM Parameter Store secret name to the Lambda function
        },
        vpc: vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      }
    )

    // Allow the Lambda function to read the secret from SSM Parameter Store
    const ssmIAMPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: [secret.WEBHOOK_URL.parameterArn],
    })

    lambdaFunction.addToRolePolicy(ssmIAMPolicy)

    // Create a CloudWatch Events rule that triggers the Lambda function every 60 days
    const rule = new events.Rule(this, 'CronRule', {
      schedule: events.Schedule.rate(cdk.Duration.days(60)),
    })

    rule.addTarget(new targets.LambdaFunction(lambdaFunction))
  }
}
