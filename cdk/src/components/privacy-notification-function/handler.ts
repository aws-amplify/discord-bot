import { EmbedBuilder } from '@discordjs/builders'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

/**
 * Create notification of "no confidential or privileged information"
 */
function createNotificationNoConfidential() {
  const embed = new EmbedBuilder()
  embed.setTitle(`Hello World`)
  embed.setColor(parseInt('ff9900', 16))
  embed.setDescription(`This is a test notification`)
  embed.setURL(`https://aws.amazon.com/privacy/`)
  embed.setAuthor({
    name: 'aws-amplify-reminders',
    url: 'https://docs.amplify.aws',
    iconURL: 'https://aws-amplify.github.io/docs/images/logo-dark.png',
  })
  return {
    content: 'aws-amplify-reminders',
    tts: false,
    embeds: [embed],
  }
}

async function sendNotification(url: string): Promise<void> {
  const notification = createNotificationNoConfidential()
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  })
}

const client = new SSMClient({ region: process.env.AWS_REGION })
export async function handler() {
  try {
    const input = {
      // GetParameterRequest
      Name: process.env.WEBHOOK_URL,
    }
    const command = new GetParameterCommand(input)
    const response = await client.send(command)
    await sendNotification(response?.Parameter?.Value ?? '')

    return {
      statusCode: 200,
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      statusCode: 500,
      body: 'Error sending notification',
    }
  }
}
