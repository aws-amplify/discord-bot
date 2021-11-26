const awsServerlessExpress = require('aws-serverless-express')
const { app } = require('@amplify-discord-bots/handler-commands')
const { loadSecrets } = require('/opt/secrets')

const server = awsServerlessExpress.createServer(app)

let secretsLoaded = false
exports.handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise
}
