import { SecretsManager } from 'aws-sdk'

const secretsManager = new SecretsManager({})
const SecretId = 'discord/dev'

type DiscordSecrets = {
  APP_ID: string
  BOT_TOKEN: string
  PUBLIC_KEY: string
}

let secrets: DiscordSecrets | undefined = undefined

/**
 * Gets the Discord secrets (public key, client ID, etc.) for use in our lambdas.
 *
 * @returns {DiscordSecrets | undefined} The Discord secrets to be used.
 */
export async function getDiscordSecrets(): Promise<DiscordSecrets | undefined> {
  if (!secrets) {
    try {
      const discordApiKeys = await secretsManager
        .getSecretValue({
          SecretId,
        })
        .promise()
      if (discordApiKeys.SecretString) {
        secrets = JSON.parse(discordApiKeys.SecretString)
      }
    } catch (exception) {
      console.log(`Unable to get Discord secrets: ${exception}`)
    }
  }
  return secrets
}
