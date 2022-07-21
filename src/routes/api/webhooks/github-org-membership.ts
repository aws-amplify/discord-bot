import { addRole } from '$discord/roles/addRole'
import { prisma } from '$lib/db'
import { removeRole } from '$discord/roles/removeRole'
import { verifyGithubWebhookEvent } from './_verifyWebhook'

async function getDiscordUserId(ghUserId: string) {
//   const user = await prisma.user.findFirst({
//     where: {
//       accounts: {
//         some: {
//           provider: 'github',
//           providerAccountId: ghUserId
//         },
//       },
//     },
//     select: {
//         accounts: {
//             where: {
//                 provider: 'discord',
//             }
//         }
//     }
//   })
  //return user?.accounts
 // console.log(user)
 console.log("nothing")
}

export async function post({ request }) {
  let rolesApplied
  const payload = await request.json()

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
    if (
      !verifyGithubWebhookEvent(
        process.env.GITHUB_ORG_WEBHOOK_SECRET,
        payload,
        sig256
      )
    ) {
      return { status: 403 }
    }
  }

  switch (payload.action) {
    case 'member_added':
      rolesApplied = addRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        payload.user.id
      )
      break
    case 'member_removed':
      rolesApplied = removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        payload.user.id
      )
      break
    default:
      rolesApplied = true
  }
  return rolesApplied
}

// if (import.meta.vitest) {
//   const { describe, expect, test, beforeAll } = import.meta.vitest
//   const removedPayload = {
//     headers: {
//       'X-Hub-Signature-256':
//         'sha256=2f7b3f2420ab1a19183ae87b5486e3c0f0adc68d3c75f6a2be45c80cdfbd6502',
//       'content-type': 'application/json',
//     },
//     body: {
//       action: 'member_removed',
//       membership: {
//         url: 'https://api.github.com/orgs/discord-bot-org/memberships/josefaidt',
//         state: 'inactive',
//         role: 'unaffiliated',
//         organization_url: 'https://api.github.com/orgs/discord-bot-org',
//         user: {
//           login: 'josefaidt',
//           id: 5033303,
//           node_id: 'MDQ6VXNlcjUwMzMzMDM=',
//           avatar_url: 'https://avatars.githubusercontent.com/u/5033303?v=4',
//           gravatar_id: '',
//           url: 'https://api.github.com/users/josefaidt',
//           html_url: 'https://github.com/josefaidt',
//           followers_url: 'https://api.github.com/users/josefaidt/followers',
//           following_url:
//             'https://api.github.com/users/josefaidt/following{/other_user}',
//           gists_url: 'https://api.github.com/users/josefaidt/gists{/gist_id}',
//           starred_url:
//             'https://api.github.com/users/josefaidt/starred{/owner}{/repo}',
//           subscriptions_url:
//             'https://api.github.com/users/josefaidt/subscriptions',
//           organizations_url: 'https://api.github.com/users/josefaidt/orgs',
//           repos_url: 'https://api.github.com/users/josefaidt/repos',
//           events_url: 'https://api.github.com/users/josefaidt/events{/privacy}',
//           received_events_url:
//             'https://api.github.com/users/josefaidt/received_events',
//           type: 'User',
//           site_admin: false,
//         },
//       },
//       organization: {
//         login: 'discord-bot-org',
//         id: 109253565,
//         node_id: 'O_kgDOBoMTvQ',
//         url: 'https://api.github.com/orgs/discord-bot-org',
//         repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
//         events_url: 'https://api.github.com/orgs/discord-bot-org/events',
//         hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
//         issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
//         members_url:
//           'https://api.github.com/orgs/discord-bot-org/members{/member}',
//         public_members_url:
//           'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
//         avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
//         description: null,
//       },
//       sender: {
//         login: 'esauerbo1',
//         id: 107655607,
//         node_id: 'U_kgDOBmqxtw',
//         avatar_url: 'https://avatars.githubusercontent.com/u/107655607?v=4',
//         gravatar_id: '',
//         url: 'https://api.github.com/users/esauerbo1',
//         html_url: 'https://github.com/esauerbo1',
//         followers_url: 'https://api.github.com/users/esauerbo1/followers',
//         following_url:
//           'https://api.github.com/users/esauerbo1/following{/other_user}',
//         gists_url: 'https://api.github.com/users/esauerbo1/gists{/gist_id}',
//         starred_url:
//           'https://api.github.com/users/esauerbo1/starred{/owner}{/repo}',
//         subscriptions_url:
//           'https://api.github.com/users/esauerbo1/subscriptions',
//         organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
//         repos_url: 'https://api.github.com/users/esauerbo1/repos',
//         events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
//         received_events_url:
//           'https://api.github.com/users/esauerbo1/received_events',
//         type: 'User',
//         site_admin: false,
//       },
//     },
//   }

//   const addedPayload = {
//     headers: {
//       'X-Hub-Signature-256':
//         'sha256=6ef3394bbe1b63c1b47643079c05f4fbbf685335818edbe9fcc7a310aabe7a47',
//       'content-type': 'application/json',
//     },
//     body: {
//       action: 'member_added',
//       membership: {
//         url: 'https://api.github.com/orgs/discord-bot-org/memberships/josefaidt',
//         state: 'active',
//         role: 'admin',
//         organization_url: 'https://api.github.com/orgs/discord-bot-org',
//         user: {
//           login: 'josefaidt',
//           id: 5033303,
//           node_id: 'MDQ6VXNlcjUwMzMzMDM=',
//           avatar_url: 'https://avatars.githubusercontent.com/u/5033303?v=4',
//           gravatar_id: '',
//           url: 'https://api.github.com/users/josefaidt',
//           html_url: 'https://github.com/josefaidt',
//           followers_url: 'https://api.github.com/users/josefaidt/followers',
//           following_url:
//             'https://api.github.com/users/josefaidt/following{/other_user}',
//           gists_url: 'https://api.github.com/users/josefaidt/gists{/gist_id}',
//           starred_url:
//             'https://api.github.com/users/josefaidt/starred{/owner}{/repo}',
//           subscriptions_url:
//             'https://api.github.com/users/josefaidt/subscriptions',
//           organizations_url: 'https://api.github.com/users/josefaidt/orgs',
//           repos_url: 'https://api.github.com/users/josefaidt/repos',
//           events_url: 'https://api.github.com/users/josefaidt/events{/privacy}',
//           received_events_url:
//             'https://api.github.com/users/josefaidt/received_events',
//           type: 'User',
//           site_admin: false,
//         },
//       },
//       organization: {
//         login: 'discord-bot-org',
//         id: 109253565,
//         node_id: 'O_kgDOBoMTvQ',
//         url: 'https://api.github.com/orgs/discord-bot-org',
//         repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
//         events_url: 'https://api.github.com/orgs/discord-bot-org/events',
//         hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
//         issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
//         members_url:
//           'https://api.github.com/orgs/discord-bot-org/members{/member}',
//         public_members_url:
//           'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
//         avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
//         description: null,
//       },
//       sender: {
//         login: 'esauerbo1',
//         id: 107655607,
//         node_id: 'U_kgDOBmqxtw',
//         avatar_url: 'https://avatars.githubusercontent.com/u/107655607?v=4',
//         gravatar_id: '',
//         url: 'https://api.github.com/users/esauerbo1',
//         html_url: 'https://github.com/esauerbo1',
//         followers_url: 'https://api.github.com/users/esauerbo1/followers',
//         following_url:
//           'https://api.github.com/users/esauerbo1/following{/other_user}',
//         gists_url: 'https://api.github.com/users/esauerbo1/gists{/gist_id}',
//         starred_url:
//           'https://api.github.com/users/esauerbo1/starred{/owner}{/repo}',
//         subscriptions_url:
//           'https://api.github.com/users/esauerbo1/subscriptions',
//         organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
//         repos_url: 'https://api.github.com/users/esauerbo1/repos',
//         events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
//         received_events_url:
//           'https://api.github.com/users/esauerbo1/received_events',
//         type: 'User',
//         site_admin: false,
//       },
//     },
//   }
  
// //   beforeAll(async () => {
// //     await addRole(
// //       process.env.DISCORD_STAFF_ROLE_ID,
// //       process.env.DISCORD_GUILD_ID,
// //       guildMemberId
// //     )
// //     await addRole(
// //       process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
// //       process.env.DISCORD_GUILD_ID,
// //       guildMemberId
// //     )
// //     repos = await fetchRepos(accessToken).then((res) => res.body)
// //   })
//   test.todo('/github-org-membership')
// // test('doing nothing', () => {
// //     getDiscordUserId('107655607')
// // })


// }
