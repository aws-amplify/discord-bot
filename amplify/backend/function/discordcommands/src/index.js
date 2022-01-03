/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["DISCORD_BOT_TOKEN","DISCORD_APP_ID","DISCORD_PUBLIC_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const awsServerlessExpress = require('aws-serverless-express')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { app } = require('@hey-amplify/handler-commands')
const { loadSecrets } = require('/opt/secrets')

const wrapped = app([awsServerlessExpressMiddleware.eventContext()])
wrapped.listen(3000, function () {
  console.log('commands server started!')
})
const server = awsServerlessExpress.createServer(wrapped)

let secretsLoaded = false
exports.handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise
}
