import * as crypto from 'crypto'

const MOCKED_WEBHOOK_SECRET = 'superspecialsecret123'
const MOCKED_WEBHOOK_HASH = 'asdfasdfasdf'

// https://gist.github.com/stigok/57d075c1cf2a609cb758898c0b202428
function verifyGithubWebhookEvent(request) {
  const token = process.env.GITHUB_WEBHOOK_SECRET
  const sig = Buffer.from(request.headers['X-Hub-Signature-256'] || '', 'utf8')
  const hmac = crypto.createHmac('sha256', token)
  const digest = Buffer.from('sha256' + '=' + hmac.update(JSON.stringify(request.body)).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return false
  }
  console.log(sig)
  console.log(digest)
  return true
}

export async function post({ request }) {
  if (!import.meta.vitest) {
    verifyGithubWebhookEvent(request)
  }
  // work with raw markdown from releases
  // transform into a Discord Message Embed (message helper src/support/message)
  // send a request off to our Discord webhook URL
}

if (import.meta.vitest) {
  const { test, it, describe } = import.meta.vitest
  
  const mocked = {
    headers: {
      'X-Hub-Signature-256':
        'sha256=73a19d60c7b42c4260a73e2a38e53107c69da5338ad7d4b9a3addbb70f0dbeb1',
      'X-GitHub-Event': 'push',
    },
    body: {
      ref: 'refs/heads/main',
      before: '4d1b9d38052359dca117850a0020303318438785',
      after: '48adb8e59db96572d57d73398a4fc15a84aa7b1e',
      repository: {
        id: 506086433,
        node_id: 'R_kgDOHipEIQ',
        name: 'Amplify-Bot-Testing',
        full_name: 'esauerbo1/Amplify-Bot-Testing',
        private: true,
        owner: {
          name: 'esauerbo1',
          email: '107655607+esauerbo1@users.noreply.github.com',
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
        url: 'https://github.com/esauerbo1/Amplify-Bot-Testing',
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
        created_at: 1655869057,
        updated_at: '2022-06-22T03:37:37Z',
        pushed_at: 1655871144,
        git_url: 'git://github.com/esauerbo1/Amplify-Bot-Testing.git',
        ssh_url: 'git@github.com:esauerbo1/Amplify-Bot-Testing.git',
        clone_url: 'https://github.com/esauerbo1/Amplify-Bot-Testing.git',
        svn_url: 'https://github.com/esauerbo1/Amplify-Bot-Testing',
        homepage: null,
        size: 0,
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
        open_issues_count: 0,
        license: null,
        allow_forking: true,
        is_template: false,
        topics: [],
        visibility: 'private',
        forks: 0,
        open_issues: 0,
        watchers: 0,
        default_branch: 'main',
        stargazers: 0,
        master_branch: 'main',
      },
      pusher: {
        name: 'esauerbo1',
        email: '107655607+esauerbo1@users.noreply.github.com',
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
      created: false,
      deleted: false,
      forced: false,
      base_ref: null,
      compare:
        'https://github.com/esauerbo1/Amplify-Bot-Testing/compare/4d1b9d380523...48adb8e59db9',
      commits: [
        {
          id: '48adb8e59db96572d57d73398a4fc15a84aa7b1e',
          tree_id: '1ef55d3a4e54a3d195f9b7fadf237bba38edaf83',
          distinct: true,
          message: 'Update README.md',
          timestamp: '2022-06-21T21:12:24-07:00',
          url: 'https://github.com/esauerbo1/Amplify-Bot-Testing/commit/48adb8e59db96572d57d73398a4fc15a84aa7b1e',
          author: {
            name: 'esauerbo1',
            email: '107655607+esauerbo1@users.noreply.github.com',
            username: 'esauerbo1',
          },
          committer: {
            name: 'GitHub',
            email: 'noreply@github.com',
            username: 'web-flow',
          },
          added: [],
          removed: [],
          modified: ['README.md'],
        },
      ],
      head_commit: {
        id: '48adb8e59db96572d57d73398a4fc15a84aa7b1e',
        tree_id: '1ef55d3a4e54a3d195f9b7fadf237bba38edaf83',
        distinct: true,
        message: 'Update README.md',
        timestamp: '2022-06-21T21:12:24-07:00',
        url: 'https://github.com/esauerbo1/Amplify-Bot-Testing/commit/48adb8e59db96572d57d73398a4fc15a84aa7b1e',
        author: {
          name: 'esauerbo1',
          email: '107655607+esauerbo1@users.noreply.github.com',
          username: 'esauerbo1',
        },
        committer: {
          name: 'GitHub',
          email: 'noreply@github.com',
          username: 'web-flow',
        },
        added: [],
        removed: [],
        modified: ['README.md'],
      },
    },
  }

  verifyGithubWebhookEvent(mocked)
  post({ request: mocked })
}
