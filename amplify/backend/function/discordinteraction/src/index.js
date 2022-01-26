const { loadSecrets } = require('/opt/secrets')
const { handler: interact } = require('@hey-amplify/handler-interact')

let secretsLoaded = false
exports.handler = async (event) => {
  console.log('EVENT:', JSON.stringify(event))
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  try {
    event.body = JSON.parse(event.body)
    return {
      statusCode: 200,
      body: JSON.stringify(await interact(event)),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}
