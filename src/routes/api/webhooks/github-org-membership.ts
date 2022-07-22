import { addRole } from '$discord/roles/addRole'
import { prisma } from '$lib/db'
import { removeRole } from '$discord/roles/removeRole'
import { verifyGithubWebhookEvent } from './_verifyWebhook'
import { seed } from '../../../../tests/setup/seed'

async function getDiscordUserId(ghUserId: string) {
  const data = await prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: 'github',
          providerAccountId: ghUserId,
        },
      },
    },
    select: {
      accounts: {
        where: {
          provider: 'discord',
        },
      },
    },
  })

  if (data && data.accounts && data.accounts.length === 1) {
    const userId = data.accounts[0].providerAccountId
    if (userId) return userId
  }
  throw new Error(`Discord account not found for GitHub user ${ghUserId}`)
}

export async function post({ request }) {
  let rolesApplied, guildMemberId
  const payload = await request.json()

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
   // console.log(sig256)
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

  try {
    guildMemberId = await getDiscordUserId(String(payload.membership.user.id))
  } catch (err) {
    console.error(err)
    return { status: 403 }
  }

  switch (payload.action) {
    case 'member_added':
      rolesApplied = await addRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      break
    case 'member_removed':
      rolesApplied = await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      break
    default:
      rolesApplied = true
  }

  if (!rolesApplied) {
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
    }
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  try {
    // seed database
    await seed()
  } catch (error) {
    console.log(error)
  }

  const removedPayload1 = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=493d810e4b395d478fdc685a865308101ad4df12bb59bd8b64c0dfc22e44909c',
      'content-type': 'application/json',
    },
    body: {
      action: 'member_removed',
      membership: {
        url: 'https://api.github.com/orgs/discord-bot-org/memberships/esauerbo1',
        state: 'inactive',
        role: 'unaffiliated',
        organization_url: 'https://api.github.com/orgs/discord-bot-org',
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
          subscriptions_url:
            'https://api.github.com/users/esauerbo1/subscriptions',
          organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
          repos_url: 'https://api.github.com/users/esauerbo1/repos',
          events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/esauerbo1/received_events',
          type: 'User',
          site_admin: false,
        },
      },
      organization: {
        login: 'discord-bot-org',
        id: 109253565,
        node_id: 'O_kgDOBoMTvQ',
        url: 'https://api.github.com/orgs/discord-bot-org',
        repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
        events_url: 'https://api.github.com/orgs/discord-bot-org/events',
        hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
        issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
        members_url:
          'https://api.github.com/orgs/discord-bot-org/members{/member}',
        public_members_url:
          'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
        avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
        description: null,
      },
      sender: {
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
        subscriptions_url:
          'https://api.github.com/users/esauerbo1/subscriptions',
        organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
        repos_url: 'https://api.github.com/users/esauerbo1/repos',
        events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/esauerbo1/received_events',
        type: 'User',
        site_admin: false,
      },
    },
  }
  const addedPayload1 = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=455b15690ee84763d7ad833c2ff0aee7fcf25304650185e179903a6e01231256',
      'content-type': 'application/json',
    },
    body: {
      action: 'member_added',
      membership: {
        url: 'https://api.github.com/orgs/discord-bot-org/memberships/esauerbo1',
        state: 'active',
        role: 'admin',
        organization_url: 'https://api.github.com/orgs/discord-bot-org',
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
          subscriptions_url:
            'https://api.github.com/users/esauerbo1/subscriptions',
          organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
          repos_url: 'https://api.github.com/users/esauerbo1/repos',
          events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/esauerbo1/received_events',
          type: 'User',
          site_admin: false,
        },
      },
      organization: {
        login: 'discord-bot-org',
        id: 109253565,
        node_id: 'O_kgDOBoMTvQ',
        url: 'https://api.github.com/orgs/discord-bot-org',
        repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
        events_url: 'https://api.github.com/orgs/discord-bot-org/events',
        hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
        issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
        members_url:
          'https://api.github.com/orgs/discord-bot-org/members{/member}',
        public_members_url:
          'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
        avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
        description: null,
      },
      sender: {
        login: 'josefaidt',
        id: 5033303,
        node_id: 'MDQ6VXNlcjUwMzMzMDM=',
        avatar_url: 'https://avatars.githubusercontent.com/u/5033303?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/josefaidt',
        html_url: 'https://github.com/josefaidt',
        followers_url: 'https://api.github.com/users/josefaidt/followers',
        following_url:
          'https://api.github.com/users/josefaidt/following{/other_user}',
        gists_url: 'https://api.github.com/users/josefaidt/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/josefaidt/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/josefaidt/subscriptions',
        organizations_url: 'https://api.github.com/users/josefaidt/orgs',
        repos_url: 'https://api.github.com/users/josefaidt/repos',
        events_url: 'https://api.github.com/users/josefaidt/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/josefaidt/received_events',
        type: 'User',
        site_admin: false,
      },
    },
  }
  const removedPayload2 = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=2f7b3f2420ab1a19183ae87b5486e3c0f0adc68d3c75f6a2be45c80cdfbd6502',
      'content-type': 'application/json',
    },
    body: {
      action: 'member_removed',
      membership: {
        url: 'https://api.github.com/orgs/discord-bot-org/memberships/josefaidt',
        state: 'inactive',
        role: 'unaffiliated',
        organization_url: 'https://api.github.com/orgs/discord-bot-org',
        user: {
          login: 'josefaidt',
          id: 5033303,
          node_id: 'MDQ6VXNlcjUwMzMzMDM=',
          avatar_url: 'https://avatars.githubusercontent.com/u/5033303?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/josefaidt',
          html_url: 'https://github.com/josefaidt',
          followers_url: 'https://api.github.com/users/josefaidt/followers',
          following_url:
            'https://api.github.com/users/josefaidt/following{/other_user}',
          gists_url: 'https://api.github.com/users/josefaidt/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/josefaidt/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/josefaidt/subscriptions',
          organizations_url: 'https://api.github.com/users/josefaidt/orgs',
          repos_url: 'https://api.github.com/users/josefaidt/repos',
          events_url: 'https://api.github.com/users/josefaidt/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/josefaidt/received_events',
          type: 'User',
          site_admin: false,
        },
      },
      organization: {
        login: 'discord-bot-org',
        id: 109253565,
        node_id: 'O_kgDOBoMTvQ',
        url: 'https://api.github.com/orgs/discord-bot-org',
        repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
        events_url: 'https://api.github.com/orgs/discord-bot-org/events',
        hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
        issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
        members_url:
          'https://api.github.com/orgs/discord-bot-org/members{/member}',
        public_members_url:
          'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
        avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
        description: null,
      },
      sender: {
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
        subscriptions_url:
          'https://api.github.com/users/esauerbo1/subscriptions',
        organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
        repos_url: 'https://api.github.com/users/esauerbo1/repos',
        events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/esauerbo1/received_events',
        type: 'User',
        site_admin: false,
      },
    },
  }
  const addedPayload2 = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=6ef3394bbe1b63c1b47643079c05f4fbbf685335818edbe9fcc7a310aabe7a47',
      'content-type': 'application/json',
    },
    body: {
      action: 'member_added',
      membership: {
        url: 'https://api.github.com/orgs/discord-bot-org/memberships/josefaidt',
        state: 'active',
        role: 'admin',
        organization_url: 'https://api.github.com/orgs/discord-bot-org',
        user: {
          login: 'josefaidt',
          id: 5033303,
          node_id: 'MDQ6VXNlcjUwMzMzMDM=',
          avatar_url: 'https://avatars.githubusercontent.com/u/5033303?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/josefaidt',
          html_url: 'https://github.com/josefaidt',
          followers_url: 'https://api.github.com/users/josefaidt/followers',
          following_url:
            'https://api.github.com/users/josefaidt/following{/other_user}',
          gists_url: 'https://api.github.com/users/josefaidt/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/josefaidt/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/josefaidt/subscriptions',
          organizations_url: 'https://api.github.com/users/josefaidt/orgs',
          repos_url: 'https://api.github.com/users/josefaidt/repos',
          events_url: 'https://api.github.com/users/josefaidt/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/josefaidt/received_events',
          type: 'User',
          site_admin: false,
        },
      },
      organization: {
        login: 'discord-bot-org',
        id: 109253565,
        node_id: 'O_kgDOBoMTvQ',
        url: 'https://api.github.com/orgs/discord-bot-org',
        repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
        events_url: 'https://api.github.com/orgs/discord-bot-org/events',
        hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
        issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
        members_url:
          'https://api.github.com/orgs/discord-bot-org/members{/member}',
        public_members_url:
          'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
        avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
        description: null,
      },
      sender: {
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
        subscriptions_url:
          'https://api.github.com/users/esauerbo1/subscriptions',
        organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
        repos_url: 'https://api.github.com/users/esauerbo1/repos',
        events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/esauerbo1/received_events',
        type: 'User',
        site_admin: false,
      },
    },
  }
  const removedPayloadUserDNE = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=1258fa36640638e4f6a9805b3a94e21c697b249425415e98aa0eef5336b7b759',
      'content-type': 'application/json',
    },
    body: {
      action: 'member_removed',
      membership: {
        url: 'https://api.github.com/orgs/discord-bot-org/memberships/esauerbo',
        state: 'inactive',
        role: 'unaffiliated',
        organization_url: 'https://api.github.com/orgs/discord-bot-org',
        user: {
          login: 'esauerbo',
          id: 70536670,
          node_id: 'MDQ6VXNlcjcwNTM2Njcw',
          avatar_url: 'https://avatars.githubusercontent.com/u/70536670?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/esauerbo',
          html_url: 'https://github.com/esauerbo',
          followers_url: 'https://api.github.com/users/esauerbo/followers',
          following_url:
            'https://api.github.com/users/esauerbo/following{/other_user}',
          gists_url: 'https://api.github.com/users/esauerbo/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/esauerbo/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/esauerbo/subscriptions',
          organizations_url: 'https://api.github.com/users/esauerbo/orgs',
          repos_url: 'https://api.github.com/users/esauerbo/repos',
          events_url: 'https://api.github.com/users/esauerbo/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/esauerbo/received_events',
          type: 'User',
          site_admin: false,
        },
      },
      organization: {
        login: 'discord-bot-org',
        id: 109253565,
        node_id: 'O_kgDOBoMTvQ',
        url: 'https://api.github.com/orgs/discord-bot-org',
        repos_url: 'https://api.github.com/orgs/discord-bot-org/repos',
        events_url: 'https://api.github.com/orgs/discord-bot-org/events',
        hooks_url: 'https://api.github.com/orgs/discord-bot-org/hooks',
        issues_url: 'https://api.github.com/orgs/discord-bot-org/issues',
        members_url:
          'https://api.github.com/orgs/discord-bot-org/members{/member}',
        public_members_url:
          'https://api.github.com/orgs/discord-bot-org/public_members{/member}',
        avatar_url: 'https://avatars.githubusercontent.com/u/109253565?v=4',
        description: null,
      },
      sender: {
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
        subscriptions_url:
          'https://api.github.com/users/esauerbo1/subscriptions',
        organizations_url: 'https://api.github.com/users/esauerbo1/orgs',
        repos_url: 'https://api.github.com/users/esauerbo1/repos',
        events_url: 'https://api.github.com/users/esauerbo1/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/esauerbo1/received_events',
        type: 'User',
        site_admin: false,
      },
    },
  }
  const addedPayloadUserDNE = {
    headers: {
      'X-Hub-Signature-256': 'sha256=68a14e23fae69a948265e6a6d21e6661243eac094d5e731d147423c93a37836a',
      'content-type':'application/json',
    },
    body: {
      "action": "member_added",
      "membership": {
        "url": "https://api.github.com/orgs/discord-bot-org/memberships/esauerbo",
        "state": "active",
        "role": "member",
        "organization_url": "https://api.github.com/orgs/discord-bot-org",
        "user": {
          "login": "esauerbo",
          "id": 70536670,
          "node_id": "MDQ6VXNlcjcwNTM2Njcw",
          "avatar_url": "https://avatars.githubusercontent.com/u/70536670?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/esauerbo",
          "html_url": "https://github.com/esauerbo",
          "followers_url": "https://api.github.com/users/esauerbo/followers",
          "following_url": "https://api.github.com/users/esauerbo/following{/other_user}",
          "gists_url": "https://api.github.com/users/esauerbo/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/esauerbo/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/esauerbo/subscriptions",
          "organizations_url": "https://api.github.com/users/esauerbo/orgs",
          "repos_url": "https://api.github.com/users/esauerbo/repos",
          "events_url": "https://api.github.com/users/esauerbo/events{/privacy}",
          "received_events_url": "https://api.github.com/users/esauerbo/received_events",
          "type": "User",
          "site_admin": false
        }
      },
      "organization": {
        "login": "discord-bot-org",
        "id": 109253565,
        "node_id": "O_kgDOBoMTvQ",
        "url": "https://api.github.com/orgs/discord-bot-org",
        "repos_url": "https://api.github.com/orgs/discord-bot-org/repos",
        "events_url": "https://api.github.com/orgs/discord-bot-org/events",
        "hooks_url": "https://api.github.com/orgs/discord-bot-org/hooks",
        "issues_url": "https://api.github.com/orgs/discord-bot-org/issues",
        "members_url": "https://api.github.com/orgs/discord-bot-org/members{/member}",
        "public_members_url": "https://api.github.com/orgs/discord-bot-org/public_members{/member}",
        "avatar_url": "https://avatars.githubusercontent.com/u/109253565?v=4",
        "description": null
      },
      "sender": {
        "login": "esauerbo1",
        "id": 107655607,
        "node_id": "U_kgDOBmqxtw",
        "avatar_url": "https://avatars.githubusercontent.com/u/107655607?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/esauerbo1",
        "html_url": "https://github.com/esauerbo1",
        "followers_url": "https://api.github.com/users/esauerbo1/followers",
        "following_url": "https://api.github.com/users/esauerbo1/following{/other_user}",
        "gists_url": "https://api.github.com/users/esauerbo1/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/esauerbo1/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/esauerbo1/subscriptions",
        "organizations_url": "https://api.github.com/users/esauerbo1/orgs",
        "repos_url": "https://api.github.com/users/esauerbo1/repos",
        "events_url": "https://api.github.com/users/esauerbo1/events{/privacy}",
        "received_events_url": "https://api.github.com/users/esauerbo1/received_events",
        "type": "User",
        "site_admin": false
      }
    }
  }

  describe('Webhook verification', () => {
    it('should return true', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          addedPayload1.body,
          addedPayload1.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return true', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          removedPayload2.body,
          removedPayload2.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return true', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          removedPayloadUserDNE.body,
          removedPayloadUserDNE.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    it('should return true', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          addedPayloadUserDNE.body,
          addedPayloadUserDNE.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    it('should return false', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_RELEASES_WEBHOOK_SECRET,
          addedPayloadUserDNE.body,
          addedPayloadUserDNE.headers['X-Hub-Signature-256']
        )
      ).toBe(false)
    })

    it('should return false', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          addedPayloadUserDNE.body,
          addedPayload1.headers['X-Hub-Signature-256']
        )
      ).toBe(false)
    })

    it('should return false', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_ORG_WEBHOOK_SECRET,
          {},
          addedPayload2.headers['X-Hub-Signature-256']
        )
      ).toBe(false)
    })

    it('should return false', () => {
      expect(verifyGithubWebhookEvent('', {}, '')).toBe(false)
    })
  })

  describe('Getting discord user id', () => {
    test('user in db: should return correct id', async () => {
      expect(
        await getDiscordUserId(String(removedPayload1.body.membership.user.id))
      ).toEqual('985985131271585833')
    })

    test('user in db: should return correct id', async () => {
      expect(
        await getDiscordUserId(String(addedPayload2.body.membership.user.id))
      ).toEqual('143912968529117185')
    })

    test('user not in db: should throw error', async () => {
      await expect(
         getDiscordUserId(String(addedPayloadUserDNE.body.membership.user.id))
      ).rejects.toThrowError()
    })

    test('no id passed: should throw error', async () => {
      await expect(getDiscordUserId('')).rejects.toThrowError()
    })
  })

}
