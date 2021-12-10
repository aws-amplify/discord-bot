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
