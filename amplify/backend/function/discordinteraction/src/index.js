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
const { loadSecrets } = require('/opt/secrets')
const { handler: interact } = require('@amplify-discord-bots/handler-interact')

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
