import { Discord } from '@hey-amplify/discord'

const token = process.env.DISCORD_BOT_TOKEN
export const discord = new Discord({ token })
