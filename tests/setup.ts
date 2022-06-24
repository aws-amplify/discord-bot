// TODO: set up mocked Discord stack with API
import * as Discord from 'discord.js'
import type { IntentsString } from 'discord.js'

// aws-amplify Discord server template
const GUILD_TEMPLATE = 'https://discord.new/vmyFvRYDtUsn'
const intents: IntentsString[] = ['GUILD_MESSAGES', 'GUILD_MESSAGES']
const client = new Discord.Client({
  intents,
})

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('Bot token not available')
}
// const template = client.fetchGuildTemplate(GUILD_TEMPLATE)

// template.createGuild()

// @ts-ignore
function create(Class, ...args) {
  // @ts-ignore
  const mocked = new (Class.prototype as any).constructor(...args)
  return mocked
}

// const guild = create(Discord.Guild, client, {
//   id: Discord.SnowflakeUtil.generate(),
//   name: 'HEY-AMPLIFY-TEST-SERVER',
// })

// const guild = new Discord.Guild(discordClient, {
//   id: Discord.SnowflakeUtil.generate(),
// })
// const user = new Discord.User(discordClient, {
//   id: Discord.SnowflakeUtil.generate(),
// })
// const member = new Discord.GuildMember(
//   discordClient,
//   { id: Discord.SnowflakeUtil.generate(), user: { id: user.id } },
//   guild
// )
// const role = new Discord.Role(
//   discordClient,
//   { id: Discord.SnowflakeUtil.generate() },
//   guild
// )
// const message = new DiscordMessage(
//   discordClient,
//   {
//     content: 'ab help',
//     author: { username: 'BiggestBulb', discriminator: 1234 },
//     id: 'test',
//   },
//   new Discord.TextChannel(new Guild(discordClient), {
//     client: discordClient,
//     guild: new Guild(discordClient),
//     id: 'channel-id',
//   })
// )
