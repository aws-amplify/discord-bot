import { Octokit } from '@octokit/rest'
import type { Role, Guild } from 'discord.js'
import { prisma } from '$lib/db'

// for each repository belonging to the org, retrieves a list of
// contributors. returns success if the user with a given id is
// a contributor in at least one repository
export async function isContributor(accessToken: string, repos, userId) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  for (let i = 0; i < repos.length; i++) {
    const amplifyRepo = repos[i].name
    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner: process.env.GITHUB_ORG_LOGIN,
          repo: amplifyRepo,
        }
      )
      const filtered = data.filter((contributor) => contributor.id == userId)
      if (filtered.length >= 1) {
        const user = filtered[0]
        return {
          status: 200,
          body: { user: user, repo: amplifyRepo },
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  return {
    status: 400,
    body: 'Not a contributor',
  }
}

// returns a list of the given organization's repositories,
// or 400 if there are none
export async function fetchRepos(accessToken: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/repos', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return {
      status: 200,
      body: data,
    }
  } catch (err) {
    return {
      status: 400,
      body: err,
    }
  }
}

// returns the organization object if the user is a member of that org
// 400 otherwise
export async function isMember(accessToken: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /user/memberships/orgs/{org}', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return {
      status: 200,
      body: data,
    }
  } catch (err) {
    return {
      status: 400,
      body: err,
    }
  }
}

// returns the given user's roles within the guild
export async function fetchGuildUser(discUserId: string) {
  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discUserId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'GET',
    }
  )
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
      body: await res.json(),
    }
  }
}

// returns the guild object for this guild
export async function fetchGuild() {
  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'GET',
    }
  )
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
      body: await res.json(),
    }
  }
}

// applies a role to a given user
export async function applyRole(role: Role, guild: Guild, userId: string) {
  const res = await fetch(
    `https://discord.com/api/guilds/${guild.id}/members/${userId}/roles/${role.id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'PUT',
    }
  )
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
      body: await res.json(),
    }
  }
}

// removes a role from a given user
export async function removeRole(role: Role, guild: Guild, userId: string) {
  const res = await fetch(
    `https://discord.com/api/guilds/${guild.id}/members/${userId}/roles/${role.id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'DELETE',
    }
  )
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
      body: await res.json(),
    }
  }
}

// driver code that checks github membership/contribution status and applies roles
export async function appplyRoles(userId: string) {
  let staffResponse
  let contributorResponse

  let statusCode = 200

  const userAccounts = await prisma.account.findMany({
    where: { userId: userId },
  })
  const accessToken = userAccounts.filter(
    (account) => account.provider === 'github'
  )[0].access_token
  const ghUserId = userAccounts.filter(
    (account) => account.provider === 'github'
  )[0].providerAccountId
  const discUserId = userAccounts.filter(
    (account) => account.provider === 'discord'
  )[0].providerAccountId

  if (!accessToken || !ghUserId || !discUserId) return { status: 400 }

  // fetch guild and user's current roles from Discord
  const guildRes = await fetchGuild()
  const userRes = await fetchGuildUser(discUserId)
  if (guildRes.status === 400 || userRes.status === 400) return { status: 400 }
  const guild = guildRes.body
  const userRoles = userRes.body.roles
  const user = userRes.body

  // user is member of amplify org and DOESN'T already have staff role -> apply staff role
  const memberRes = await isMember(accessToken)
  const staffRole = guild.roles.filter(
    (role: Role) => role.id === process.env.DISCORD_STAFF_ROLE_ID
  )[0]

  if (
    memberRes.status === 200 &&
    !(process.env.DISCORD_STAFF_ROLE_ID in userRoles) &&
    staffRole
  ) {
    staffResponse = await applyRole(staffRole, guild, discUserId)
  }
  // user is not a member of amplify org but DOES have staff role -> remove role
  else if (
    memberRes.status === 400 &&
    process.env.DISCORD_STAFF_ROLE_ID in userRoles &&
    staffRole
  ) {
    staffResponse = await removeRole(staffRole, guild, discUserId)
  }

  // if user is a contrinutor, apply contributor role
  const repoRes = await fetchRepos(accessToken)
  if (repoRes.status === 200 && ghUserId && discUserId && repoRes.body) {
    const contribution = await isContributor(
      accessToken,
      repoRes.body,
      ghUserId
    )
    const contributorRole = guild.roles.filter(
      (role: Role) => role.id === process.env.DISCORD_CONTRIBUTOR_ROLE_ID
    )[0]
    // user is a contributor and DOESN'T have contrubitor role -> apply role
    if (
      contribution.status === 200 &&
      !(process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles) &&
      contributorRole
    ) {
      contributorResponse = await applyRole(contributorRole, guild, discUserId)
      // user is not a contributor but has role -> removerole
    } else if (
      contribution.status === 400 &&
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles &&
      contributorRole
    ) {
      contributorResponse = await removeRole(contributorRole, guild, discUserId)
    }
  }
  if (contributorResponse.status === 400 || staffResponse.status === 400) statusCode = 400
  return {
    status: statusCode,
    body: {
      staff: staffResponse,
      contributor: contributorResponse
    }
  }
}

if (import.meta.vitest) {
  const { it, describe, expect, test } = import.meta.vitest
}