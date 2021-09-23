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
const { interact } = require('./interact')

exports.handler = async (event) => {
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
