import { json, type RequestHandler } from '@sveltejs/kit'
import { EmbedBuilder } from 'discord.js'
import { verifyGithubWebhookEvent } from '../_verifyWebhook'

function createReleaseMessage(payload) {
  const embed = new EmbedBuilder()
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

// application/x-www-form-urlencoded
export const POST: RequestHandler = async function post({ request }) {
  let payload
  try {
    payload = await request.json()
  } catch (error) {
    return json(
      {
        errors: [
          {
            message: `Invalid payload: ${error.message}`,
          },
        ],
      },
      {
        status: 400,
      }
    )
  }

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
    if (
      !sig256 ||
      !verifyGithubWebhookEvent(
        process.env.GITHUB_WEBHOOK_SECRET,
        payload,
        sig256
      )
    ) {
      return json(
        {
          errors: [
            {
              message: 'Unable to verify signature',
            },
          ],
        },
        {
          status: 403,
        }
      )
    }
  }

  if (payload.action !== 'released') {
    return new Response(undefined, { status: 204 })
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
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return new Response(undefined, { status: 400 })
  } else {
    return new Response(undefined, { status: 201 })
  }
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest
  const mocked = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=f600e6d07b97993c84faadd09b0ca9c643c27e2e74ed3283dc7bdb2768637076',
      'content-type': 'application/json',
    },
    body: {
      action: 'released',
      release: {
        url: 'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/73467874',
        assets_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/73467874/assets',
        upload_url:
          'https://uploads.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/73467874/assets{?name,label}',
        html_url:
          'https://github.com/esauerbo1/Amplify-Bot-Testing/releases/tag/hello',
        id: 73467874,
        author: {
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
        node_id: 'RE_kwDOHipEIc4EYQfi',
        tag_name: 'hello',
        target_commitish: 'main',
        name: 'New Release Again',
        draft: false,
        prerelease: false,
        created_at: '2022-06-22T22:59:54Z',
        published_at: '2022-08-02T18:05:29Z',
        assets: [],
        tarball_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/tarball/hello',
        zipball_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/zipball/hello',
        body: 'This is a new release!',
      },
      repository: {
        id: 506086433,
        node_id: 'R_kgDOHipEIQ',
        name: 'Amplify-Bot-Testing',
        full_name: 'esauerbo1/Amplify-Bot-Testing',
        private: true,
        owner: {
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
        html_url: 'https://github.com/esauerbo1/Amplify-Bot-Testing',
        description: 'a temporary repo for testing the amplify bot',
        fork: false,
        url: 'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing',
        forks_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/forks',
        keys_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/teams',
        hooks_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/hooks',
        issue_events_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/events',
        assignees_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/tags',
        blobs_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/languages',
        stargazers_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/stargazers',
        contributors_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/contributors',
        subscribers_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/subscribers',
        subscription_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/subscription',
        commits_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/merges',
        archive_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/downloads',
        issues_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/labels{/name}',
        releases_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/deployments',
        created_at: '2022-06-22T03:37:37Z',
        updated_at: '2022-06-22T03:37:37Z',
        pushed_at: '2022-08-02T18:03:05Z',
        git_url: 'git://github.com/esauerbo1/Amplify-Bot-Testing.git',
        ssh_url: 'git@github.com:esauerbo1/Amplify-Bot-Testing.git',
        clone_url: 'https://github.com/esauerbo1/Amplify-Bot-Testing.git',
        svn_url: 'https://github.com/esauerbo1/Amplify-Bot-Testing',
        homepage: null,
        size: 2,
        stargazers_count: 0,
        watchers_count: 0,
        language: null,
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 0,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 1,
        license: null,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: 'private',
        forks: 0,
        open_issues: 1,
        watchers: 0,
        default_branch: 'main',
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
  const mockedBad = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=df80b1d8f9348825f3edd5df44258cb6cfb822f7de73088372c5b54bdd970ce',
      'X-GitHub-Event': 'release',
      'content-type': 'application/json',
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
    it('should return true if everything is correct', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          mocked.body,
          mocked.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    it('should return false with a jumbled payload', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          mockedBad.body,
          mockedBad.headers['X-Hub-Signature-256']
        )
      ).toEqual(false)
    })

    test('should return false with empty payload and header', () => {
      expect(
        verifyGithubWebhookEvent(process.env.GITHUB_WEBHOOK_SECRET, {}, '')
      ).toEqual(false)
    })

    test('should return false with null payload and header is null', () => {
      expect(
        verifyGithubWebhookEvent(process.env.GITHUB_WEBHOOK_SECRET, null, null)
      ).toEqual(false)
    })
  })
}
