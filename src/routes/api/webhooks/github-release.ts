import * as crypto from 'node:crypto'
import { MessageEmbed } from 'discord.js'

function createReleaseMessage(payload) {
  const embed = new MessageEmbed()
  embed.setTitle(`[${payload.repository.full_name}] ${payload.release.name}`)
  embed.setColor('#ff9900')
  embed.setDescription(payload.release.body)
  embed.setURL(payload.release.html_url)
  embed.setAuthor({
    name: payload.repository.full_name,
    url: payload.release.author.html_url,
    iconURL: payload.release.author.avatar_url,
  })
  return {
    content: 'New Release!',
    tts: false,
    embeds: [embed],
  }
}

// https://gist.github.com/stigok/57d075c1cf2a609cb758898c0b202428
function verifyGithubWebhookEvent(payloadbody, signature256: string) {
  if (!signature256) return false
  const token = process.env.GITHUB_WEBHOOK_SECRET
  const sig = Buffer.from(signature256 || '', 'utf8')
  const hmac = crypto.createHmac('sha256', token)
  const digest = Buffer.from(
    'sha256' + '=' + hmac.update(JSON.stringify(payloadbody)).digest('hex'),
    'utf8'
  )
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig))
    return false

  return true
}

export async function post({ request }) {
  const payload = await request.json()

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
    if (!verifyGithubWebhookEvent(payload, sig256)) {
      return { status: 403 }
    }
  }

  if (payload.action !== 'released') {
    return { status: 204 }
  }

  const message = createReleaseMessage(payload)

  const res = await fetch(process.env.DISCORD_WEBHOOK_URL_RELEASES, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(message),
  })

  // if response is not okay or if Discord did not return a 204
  // https://discord.com/developers/docs/topics/opcodes-and-status-codes#http
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 201,
    }
  }
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  const mocked = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=df80b1d8f9348825f3edd5df44258cb6cfb822f7de73088372c5b54bdd970ce0',
      'X-GitHub-Event': 'release',
      'Content-Type': 'application/json',
    },
    body: {
      action: 'published',
      release: {
        url: 'https://api.github.com/repos/aws-amplify/discord-bot/releases/71514916',
        assets_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/releases/71514916/assets',
        upload_url:
          'https://uploads.github.com/repos/aws-amplify/discord-bot/releases/71514916/assets{?name,label}',
        html_url:
          'https://github.com/aws-amplify/discord-bot/releases/tag/v0.5.2',
        id: 71514916,
        author: {
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
        node_id: 'RE_kwDOFmU2Nc4EQzsk',
        tag_name: 'v0.5.2',
        target_commitish: 'main',
        name: 'v0.5.2',
        draft: false,
        prerelease: false,
        created_at: '2022-07-07T20:43:14Z',
        published_at: '2022-07-07T20:43:37Z',
        assets: [],
        tarball_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/tarball/v0.5.2',
        zipball_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/zipball/v0.5.2',
        body: "## What's Changed\n* fix: cloudfront should talk to origin over HTTP by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/111\n* docs: add architecture diagram to contributing guide by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/113\n* fix: URL.pathname -> url.fileURLToPath by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/112\n* docs: improve language for creating local dotenv file by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/114\n* chore: type interaction handler responses by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/116\n\n\n**Full Changelog**: https://github.com/aws-amplify/discord-bot/compare/v0.5.1...v0.5.2",
        mentions_count: 1,
      },
      repository: {
        id: 375731765,
        node_id: 'MDEwOlJlcG9zaXRvcnkzNzU3MzE3NjU=',
        name: 'discord-bot',
        full_name: 'aws-amplify/discord-bot',
        private: false,
        owner: {
          login: 'aws-amplify',
          id: 41077760,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjQxMDc3NzYw',
          avatar_url: 'https://avatars.githubusercontent.com/u/41077760?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/aws-amplify',
          html_url: 'https://github.com/aws-amplify',
          followers_url: 'https://api.github.com/users/aws-amplify/followers',
          following_url:
            'https://api.github.com/users/aws-amplify/following{/other_user}',
          gists_url: 'https://api.github.com/users/aws-amplify/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/aws-amplify/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/aws-amplify/subscriptions',
          organizations_url: 'https://api.github.com/users/aws-amplify/orgs',
          repos_url: 'https://api.github.com/users/aws-amplify/repos',
          events_url:
            'https://api.github.com/users/aws-amplify/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/aws-amplify/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/aws-amplify/discord-bot',
        description: 'Discord bot for the AWS Amplify Discord Server',
        fork: false,
        url: 'https://api.github.com/repos/aws-amplify/discord-bot',
        forks_url: 'https://api.github.com/repos/aws-amplify/discord-bot/forks',
        keys_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/aws-amplify/discord-bot/teams',
        hooks_url: 'https://api.github.com/repos/aws-amplify/discord-bot/hooks',
        issue_events_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/events',
        assignees_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/branches{/branch}',
        tags_url: 'https://api.github.com/repos/aws-amplify/discord-bot/tags',
        blobs_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/languages',
        stargazers_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/stargazers',
        contributors_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/contributors',
        subscribers_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/subscribers',
        subscription_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/subscription',
        commits_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/merges',
        archive_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/downloads',
        issues_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/labels{/name}',
        releases_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/deployments',
        created_at: '2021-06-10T14:46:42Z',
        updated_at: '2022-06-27T22:59:29Z',
        pushed_at: '2022-07-07T20:43:37Z',
        git_url: 'git://github.com/aws-amplify/discord-bot.git',
        ssh_url: 'git@github.com:aws-amplify/discord-bot.git',
        clone_url: 'https://github.com/aws-amplify/discord-bot.git',
        svn_url: 'https://github.com/aws-amplify/discord-bot',
        homepage: '',
        size: 1851,
        stargazers_count: 11,
        watchers_count: 11,
        language: 'TypeScript',
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: false,
        has_pages: false,
        forks_count: 5,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 32,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: ['aws-amplify', 'discord'],
        visibility: 'public',
        forks: 5,
        open_issues: 32,
        watchers: 11,
        default_branch: 'main',
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
      enterprise: {
        id: 1290,
        slug: 'amazon',
        name: 'Amazon',
        node_id: 'MDEwOkVudGVycHJpc2UxMjkw',
        avatar_url: 'https://avatars.githubusercontent.com/b/1290?v=4',
        description: '',
        website_url: 'https://www.amazon.com/',
        html_url: 'https://github.com/enterprises/amazon',
        created_at: '2019-11-13T18:05:41Z',
        updated_at: '2022-03-18T18:37:08Z',
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

  const mockedBad = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=df80b1d8f9348825f3edd5df44258cb6cfb822f7de73088372c5b54bdd970ce',
      'X-GitHub-Event': 'release',
      'Content-Type': 'application/json',
    },
    body: {
      action: 'published',
      release: {
        url: 'https://api.github.com/repos/aws-amplify/discord-bot/releases/71514916',
        assets_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/releases/71514916/assets',
        upload_url:
          'https://uploads.github.com/repos/aws-amplify/discord-bot/releases/71514916/assets{?name,label}',
        html_url:
          'https://github.com/aws-amplify/discord-bot/releases/tag/v0.5.2',
        id: 71514916,
        author: {
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
        node_id: 'RE_kwDOFmU2Nc4EQzsk',
        tag_name: 'v0.5.2',
        target_commitish: 'main',
        name: 'v0.5.2',
        draft: false,
        prerelease: false,
        created_at: '2022-07-07T20:43:14Z',
        published_at: '2022-07-07T20:43:37Z',
        assets: [],
        tarball_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/tarball/v0.5.2',
        zipball_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/zipball/v0.5.2',
        body: "## What's Changed\n* fix: cloudfront should talk to origin over HTTP by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/111\n* docs: add architecture diagram to contributing guide by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/113\n* fix: URL.pathname -> url.fileURLToPath by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/112\n* docs: improve language for creating local dotenv file by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/114\n* chore: type interaction handler responses by @josefaidt in https://github.com/aws-amplify/discord-bot/pull/116\n\n\n**Full Changelog**: https://github.com/aws-amplify/discord-bot/compare/v0.5.1...v0.5.2",
        mentions_count: 1,
      },
      repository: {
        id: 375731765,
        node_id: 'MDEwOlJlcG9zaXRvcnkzNzU3MzE3NjU=',
        name: 'discord-bot',
        full_name: 'aws-amplify/discord-bot',
        private: false,
        owner: {
          login: 'aws-amplify',
          id: 41077760,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjQxMDc3NzYw',
          avatar_url: 'https://avatars.githubusercontent.com/u/41077760?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/aws-amplify',
          html_url: 'https://github.com/aws-amplify',
          followers_url: 'https://api.github.com/users/aws-amplify/followers',
          following_url:
            'https://api.github.com/users/aws-amplify/following{/other_user}',
          gists_url: 'https://api.github.com/users/aws-amplify/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/aws-amplify/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/aws-amplify/subscriptions',
          organizations_url: 'https://api.github.com/users/aws-amplify/orgs',
          repos_url: 'https://api.github.com/users/aws-amplify/repos',
          events_url:
            'https://api.github.com/users/aws-amplify/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/aws-amplify/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/aws-amplify/discord-bot',
        description: 'Discord bot for the AWS Amplify Discord Server',
        fork: false,
        url: 'https://api.github.com/repos/aws-amplify/discord-bot',
        forks_url: 'https://api.github.com/repos/aws-amplify/discord-bot/forks',
        keys_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/aws-amplify/discord-bot/teams',
        hooks_url: 'https://api.github.com/repos/aws-amplify/discord-bot/hooks',
        issue_events_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/events',
        assignees_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/branches{/branch}',
        tags_url: 'https://api.github.com/repos/aws-amplify/discord-bot/tags',
        blobs_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/languages',
        stargazers_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/stargazers',
        contributors_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/contributors',
        subscribers_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/subscribers',
        subscription_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/subscription',
        commits_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/merges',
        archive_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/downloads',
        issues_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/labels{/name}',
        releases_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/aws-amplify/discord-bot/deployments',
        created_at: '2021-06-10T14:46:42Z',
        updated_at: '2022-06-27T22:59:29Z',
        pushed_at: '2022-07-07T20:43:37Z',
        git_url: 'git://github.com/aws-amplify/discord-bot.git',
        ssh_url: 'git@github.com:aws-amplify/discord-bot.git',
        clone_url: 'https://github.com/aws-amplify/discord-bot.git',
        svn_url: 'https://github.com/aws-amplify/discord-bot',
        homepage: '',
        size: 1851,
        stargazers_count: 11,
        watchers_count: 11,
        language: 'TypeScript',
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: false,
        has_pages: false,
        forks_count: 5,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 32,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: ['aws-amplify', 'discord'],
        visibility: 'public',
        forks: 5,
        open_issues: 32,
        watchers: 11,
        default_branch: 'main',
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
      enterprise: {
        id: 1290,
        slug: 'amazon',
        name: 'Amazon',
        node_id: 'MDEwOkVudGVycHJpc2UxMjkw',
        avatar_url: 'https://avatars.githubusercontent.com/b/1290?v=4',
        description: '',
        website_url: 'https://www.amazon.com/',
        html_url: 'https://github.com/enterprises/amazon',
        created_at: '2019-11-13T18:05:41Z',
        updated_at: '2022-03-18T18:37:08Z',
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

  describe('Webhook verification', () => {
    it('should return true', () => {
      expect(
        verifyGithubWebhookEvent(
          mocked.body,
          mocked.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })
    
    it('should return false', () => {
      expect(
        verifyGithubWebhookEvent(
          mockedBad.body,
          mockedBad.headers['X-Hub-Signature-256']
        )
      ).toEqual(false)
    })

    test('should return false', () => {
      expect(
        verifyGithubWebhookEvent(
          mockedBad.body,
          mockedBad.headers['X-Hub-Signature-256']
        )
      ).toEqual(false)
    })

    test('should return false', () => {
      expect(verifyGithubWebhookEvent({}, '')).toEqual(false)
    })

    test('should return false', () => {
      expect(verifyGithubWebhookEvent(null, null)).toEqual(false)
    })
  })
}
