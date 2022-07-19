import { Octokit } from '@octokit/rest'
import { prisma } from '$lib/db'

// for each repository belonging to the org, retrieves a list of
// contributors. returns success if the user with a given id is
// a contributor in at least one repository
export async function isContributor(accessToken, repos, userId) {
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
     // should be faster than filtering 
     const index = data.findIndex(contributor => contributor.id == userId)
      if (index !== -1) {
        const user = data[index]
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
export async function fetchRepos(accessToken) {
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
export async function isMember(accessToken) {
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

// applies a role to a given user
export async function applyRole(
  roleId: string | undefined,
  guildId: string | undefined,
  userId: string
) {
  const res = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
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
      status: 400
    }
  } else {
    return {
      status: 200
    }
  }
}

// removes a role from a given user
export async function removeRole(
  roleId: string | undefined,
  guildId: string | undefined,
  userId: string
) {
  const res = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
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
      status: 400
    }
  } else {
    return {
      status: 200
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

  // user's current roles from Discord
  const userRes = await fetchGuildUser(discUserId)
  if (userRes.status === 400) return { status: 400 }
  const userRoles = userRes.body.roles

  const memberRes = await isMember(accessToken)

  // user is member of amplify org
  // and user DOESN'T already have staff role -> apply staff role
  if (
    memberRes.status === 200 &&
    !(process.env.DISCORD_STAFF_ROLE_ID in userRoles)
  ) {
    staffResponse = await applyRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      discUserId
    )
  }
  // user is NOT member of amplify org
  // but user DOES have staff role -> remove role
  else if (
    memberRes.status === 400 &&
    process.env.DISCORD_STAFF_ROLE_ID in userRoles
  ) {
    staffResponse = await removeRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      discUserId
    )
  }

  // if user is a contrinutor, apply contributor role
  const repoRes = await fetchRepos(accessToken)
  if (repoRes.status === 200 && repoRes.body) {
    const contribution = await isContributor(
      accessToken,
      repoRes.body,
      ghUserId
    )

    // user is a contributor and
    // user DOESN'T have contrubitor role -> apply role
    if (
      contribution.status === 200 &&
      !(process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles)
    ) {
      contributorResponse = await applyRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        discUserId
      )
      // user is not a contributor and role exists and user has role -> removerole
    } else if (
      contribution.status === 400 &&
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles
    ) {
      contributorResponse = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        discUserId
      )
    }
  }
  if (contributorResponse.status === 400 || staffResponse.status === 400)
    statusCode = 400
  return {
    status: statusCode,
    body: {
      staff: staffResponse.status,
      contributor: contributorResponse.status,
    },
  }
}

if (import.meta.vitest) {
  const { describe, expect, test, beforeAll } = import.meta.vitest
  let repos

  const guildMember = {
    avatar: null,
    communication_disabled_until: null,
    flags: 0,
    is_pending: false,
    joined_at: '2022-06-13T19:27:41.326000+00:00',
    nick: null,
    pending: false,
    premium_since: null,
    roles: ['985988852894298155', '985988852894298158'],
    user: {
      id: '985985131271585833',
      username: 'esauerbo',
      avatar: null,
      avatar_decoration: null,
      discriminator: '3835',
      public_flags: 0,
    },
    mute: false,
    deaf: false,
  }
  const ghOrg = {
    url: 'https://api.github.com/orgs/aws-amplify/memberships/esauerbo1',
    state: 'active',
    role: 'member',
    organization_url: 'https://api.github.com/orgs/aws-amplify',
    user: {
      login: 'esauerbo1',
      id: 107655607,
      node_id: 'U_kgDOBmqxtw',
      avatar_url: 'https://avatars.githubusercontent.com/u/107655607?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/esauerbo1',
      html_url: 'https://github.com/esauerbo1',
      followers_url: 'https://api.github.com/users/esauerbo1/followers',
      following_url:
        'https://api.github.com/users/esauerbo1/following{/other_user}',
      gists_url: 'https://api.github.com/users/esauerbo1/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/esauerbo1/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/esauerbo1/subscriptions',
      organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
      repos_url: 'https://api.github.com/users/esauerbo1/repos',
      events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/esauerbo1/received_events',
      type: 'User',
      site_admin: false,
    },
    organization: {
      login: 'aws-amplify',
      id: 41077760,
      node_id: 'MDEyOk9yZ2FuaXphdGlvbjQxMDc3NzYw',
      url: 'https://api.github.com/orgs/aws-amplify',
      repos_url: 'https://api.github.com/orgs/aws-amplify/repos',
      events_url: 'https://api.github.com/orgs/aws-amplify/events',
      hooks_url: 'https://api.github.com/orgs/aws-amplify/hooks',
      issues_url: 'https://api.github.com/orgs/aws-amplify/issues',
      members_url: 'https://api.github.com/orgs/aws-amplify/members{/member}',
      public_members_url:
        'https://api.github.com/orgs/aws-amplify/public_members{/member}',
      avatar_url: 'https://avatars.githubusercontent.com/u/41077760?v=4',
      description: '',
    },
  }
  const userId = 'cl4n0kjqd0006iqtda15yzzcw'
  const accessToken = process.env.GITHUB_ACCESS_TOKEN
  const ghUserId = '107655607'
  const guildMemberId = '985985131271585833'

  beforeAll(async () => {
    await applyRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      guildMemberId
    )
    await applyRole(
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      guildMemberId
    )
    repos = await fetchRepos(accessToken).then((res) => res.body)
  })

  describe('Successful adding and removal of roles', () => {
    test('Fetch guild user', async () => {
      const response = await fetchGuildUser(guildMemberId)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(guildMember)
    })

    test('Fetch org repos', async () => {
      const response = await fetchRepos(accessToken)
      expect(response.status).toBe(200)
    })

    test('Is org member', async () => {
      const response = await isMember(accessToken)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(ghOrg)
    })

    test('Is org contributor', async () => {
      const response = await isContributor(accessToken, repos, ghUserId)
      expect(response.status).toBe(200)
    }, 20000)

    test('Remove staff role', async () => {
      const response = await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response.status).toBe(200)
      const user = await fetchGuildUser(guildMemberId).then((res) => res.body)
      expect(user.roles).not.toContain(process.env.DISCORD_STAFF_ROLE_ID)
    })

    test('Add staff role', async () => {
      const response = await applyRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response.status).toBe(200)
      const user = await fetchGuildUser(guildMemberId).then((res) => res.body)
      expect(user.roles).toContain(process.env.DISCORD_STAFF_ROLE_ID)
    })

    test('Remove contributor role', async () => {
      const response = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response.status).toBe(200)
      const user = await fetchGuildUser(guildMemberId).then((res) => res.body)
      expect(user.roles).not.toContain(process.env.DISCORD_CONTRIBUTOR_ROLE_ID)
    })

    test('Add contributor role', async () => {
      const response = await applyRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response.status).toBe(200)
      const user = await fetchGuildUser(guildMemberId).then((res) => res.body)
      expect(user.roles).toContain(process.env.DISCORD_CONTRIBUTOR_ROLE_ID)
    })
  })

  describe('Failed adding and removal of roles', () => {
    test('Fetch guild user unknown user id', async () => {
      const response = await fetchGuildUser(`bad${guildMemberId}`)
      expect(response.status).toBe(400)
    })

    test('Fetch guild user bad bot token', async () => {
      const botToken = process.env.DISCORD_BOT_TOKEN
      process.env.DISCORD_BOT_TOKEN = `bad${botToken}`
      const response = await fetchGuildUser(guildMemberId)
      process.env.DISCORD_BOT_TOKEN = botToken
      expect(response.status).toBe(400)
    })

    test('Fetch org repos bad access token', async () => {
      const response = await fetchRepos(`b${accessToken}ad`)
      expect(response.status).toBe(400)
    })

    test('Fetch org repos unknown org', async () => {
      const orgLogin = process.env.GITHUB_ORG_LOGIN
      process.env.GITHUB_ORG_LOGIN = `${orgLogin}bad`
      const response = await fetchRepos(accessToken)
      process.env.GITHUB_ORG_LOGIN = orgLogin
      expect(response.status).toBe(400)
    })

    test('Is org member bad access token', async () => {
      const response = await isMember(`bad${accessToken}`)
      expect(response.status).toBe(400)
    })

    test('Is org member unknown org', async () => {
      const orgLogin = process.env.GITHUB_ORG_LOGIN
      process.env.GITHUB_ORG_LOGIN = `bad${orgLogin}`
      const response = await isMember(accessToken)
      process.env.GITHUB_ORG_LOGIN = orgLogin
      expect(response.status).toBe(400)
    })

    test('Remove role from unknown user', async () => {
      const response = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        `1${guildMemberId}`
      )
      expect(response.status).toBe(400)
    })

    test('Add role to unknown user', async () => {
      const response = await applyRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        `1${guildMemberId}`
      )
      expect(response.status).toBe(400)
    })

    test('Add unknown role', async () => {
      const response = await applyRole(
        `1${process.env.DISCORD_CONTRIBUTOR_ROLE_ID}`,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response.status).toBe(400)
    })

    test('Add role in unknown guild', async () => {
      const response = await applyRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        `123${process.env.DISCORD_GUILD_ID}`,
        guildMemberId
      )
      expect(response.status).toBe(400)
    })

    test('Is org contributor wrong repos', async () => {
      const filtered = repos.filter(repo => !(repo.name === "discord-bot"))
      const response = await isContributor(accessToken, filtered, ghUserId)
      expect(response.status).toBe(400)
    }, 20000)

    test('Is org contributor bad user id', async () => {
      const response = await isContributor(accessToken, repos, `bad${ghUserId}`)
      expect(response.status).toBe(400)
    }, 20000)
  })

  describe('Test full pipeline', async () => {
    test('Add and remove roles', async () => {
      await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
    })

    test('Applying roles full pipeline', async () => {
      const response = await appplyRoles(userId)
      expect(response).toEqual({
        status: 200,
        body: {
          staff: 200,
          contributor: 200,
        },
      })
    }, 10000)
  })
}
