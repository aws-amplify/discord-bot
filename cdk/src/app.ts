import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { BotStack } from './stack-bot.js'
// import { AppStack } from './stack-app.js'

// TODO: add common secrets type

const app = new cdk.App({
  context: {
    name: 'hey-amplify',
    env: 'default',
  },
})

new BotStack(app, 'BotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})

// TODO: implement app stack
// new AppStack(app, 'AppStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
// })
