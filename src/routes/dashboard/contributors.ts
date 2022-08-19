// import { Routes } from 'discord-api-types/v10'
// import type { APIGuildMember } from 'discord-api-types/v10'
// import { api } from '$lib/discord'
// import { getGHUsername } from './queries'
import type { Contributor } from './types'

// const guildId = import.meta.env.VITE_DISCORD_GUILD_ID

// async function getDiscordUsername(userId: string) {
//   try {
//     const guildMember = (await api.get(Routes.guildMember(guildId, userId))) as
//       | APIGuildMember
//       | undefined
//     if (guildMember?.nick) return guildMember.nick
//     if (guildMember?.user?.username) return guildMember.user.username
//   } catch (error) {
//     console.error(`Failed to fetch discord username: ${error.message}`)
//   }
//   return 'unknown discord user'
//   return 'user'
// }

// export async function getTopContributors(
//   contributors: Contributor[],
//   n: number
// ) {
//     console.log(contributors)
//   return Promise.all(
//     contributors
//       .sort((prev, next) => next.answers.length - prev.answers.length)
//       .slice(0, n)
//       .map(async (contributor) => {
//         const ghUsername = ''
//         // if (contributor.githubId)
//         //   ghUsername = `${await getGHUsername(contributor.githubId)}`
//         return {
//           id: contributor.id,
//           name: await getDiscordUsername(contributor.id),
//           github: ghUsername,
//           count: contributor.answers.length,
//         }
//       })
//   )
// }
export function getTopContributors(contributors: Contributor[], n: number) {
  contributors
    .sort((prev, next) => next.answers.length - prev.answers.length)
    .slice(0, n)
    .map((contributor) => {
      const ghUsername = ''
      return {
        id: contributor.id,
        name: contributor.discordUsername,
        github: ghUsername,
        count: contributor.answers.length,
      }
    })
}
