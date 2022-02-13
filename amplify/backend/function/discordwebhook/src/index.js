import awsServerlessExpress from 'aws-serverless-express'
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware'
import { app } from '@hey-amplify/handler-webhook'
import { loadSecrets } from '@hey-amplify/support'

const wrapped = app([awsServerlessExpressMiddleware.eventContext()])
wrapped.listen(3000, function () {
  console.log('commands server started!')
})
const server = awsServerlessExpress.createServer(wrapped)

let secretsLoaded = false

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event, context) {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise
}
