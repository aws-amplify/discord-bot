import { join } from 'path'
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core'
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import * as iam from '@aws-cdk/aws-iam'
import { Runtime, LayerVersion, Code } from '@aws-cdk/aws-lambda'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'

interface DiscordBotStackProps extends StackProps {
  // here is where we would put bot-specific props
}

export class DiscordBotStack extends Stack {
  /**
   * The constructor for building the stack.
   * @param {Construct} scope The Construct scope to create the stack in.
   * @param {string} id The ID of the stack to use.
   * @param {BotStackProps} [props] Additional properties to add to stack
   */
  constructor(scope: Construct, id: string, props?: DiscordBotStackProps) {
    super(scope, id, props)

    // create role to read secrets
    const statementReadSecrets = new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['arn:aws:secretsmanager:*'],
    })

    const layer = new LayerVersion(this, 'discord-bot-layer-commands', {
      code: Code.fromAsset(join(__dirname, 'commands')),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      license: 'Apache-2.0',
      description: 'A layer to house commands',
    })

    // create lambda to execute commands
    const discordCommandLambda = new NodejsFunction(
      this,
      'discord-bot-lambda-command',
      {
        runtime: Runtime.NODEJS_14_X,
        entry: join(__dirname, 'functions', 'handleCommand.ts'),
        handler: 'handler',
        timeout: Duration.seconds(60),
        // environment: secrets,
        bundling: {
          minify: false,
          nodeModules: ['slash-commands', 'fast-glob', 'aws-sdk', 'node-fetch'],
        },
        layers: [layer],
      }
    )

    // create role to invoke command lambda
    const statementInvokeLambda = new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [discordCommandLambda.functionArn],
    })

    // attach policy to command lambda to read secrets
    discordCommandLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'discord-bot-lambda-command-policy', {
        statements: [statementReadSecrets],
      })
    )

    // create entrypoint lambda to verify and invoke
    const discordBotLambda = new NodejsFunction(
      this,
      'discord-bot-lambda-entry',
      {
        runtime: Runtime.NODEJS_14_X,
        entry: join(__dirname, 'functions', 'entry.ts'),
        handler: 'handler',
        timeout: Duration.seconds(60),
        environment: {
          COMMAND_LAMBDA_ARN: discordCommandLambda.functionArn,
        },
        bundling: {
          minify: false,
          nodeModules: ['slash-commands', 'fast-glob', 'aws-sdk', 'node-fetch'],
        },
      }
    )

    // attach policy to read and invoke
    discordBotLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'discord-bot-lambda-entry-policy', {
        statements: [statementReadSecrets, statementInvokeLambda],
      })
    )

    const discordBotIntegration = new LambdaProxyIntegration({
      handler: discordBotLambda,
    })

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'discord-bot-api',
    })

    httpApi.addRoutes({
      path: '/event',
      methods: [HttpMethod.POST],
      integration: discordBotIntegration,
    })

    // sync
    const syncDiscordCommandsLambda = new NodejsFunction(
      this,
      'discord-bot-lambda-sync',
      {
        runtime: Runtime.NODEJS_14_X,
        entry: join(__dirname, 'functions', 'syncCommands.ts'),
        handler: 'handler',
        timeout: Duration.seconds(60),
        bundling: {
          minify: false,
          nodeModules: ['aws-sdk', 'fast-glob', 'node-fetch'],
        },
        layers: [layer],
      }
    )

    // attach policy to read and invoke
    syncDiscordCommandsLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'discord-bot-lambda-sync-policy', {
        statements: [statementReadSecrets],
      })
    )

    const syncDiscordCommandsIntegration = new LambdaProxyIntegration({
      handler: syncDiscordCommandsLambda,
    })

    // todo: move this to a discord command?
    httpApi.addRoutes({
      path: '/sync',
      methods: [HttpMethod.GET],
      integration: syncDiscordCommandsIntegration,
    })
  }
}
