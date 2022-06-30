<script>
  import { Content } from 'carbon-components-svelte'

  async function triggerWebhook() {
    const mocked = {
      action: 'published',
      release: {
        url: 'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/71007317',
        assets_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/71007317/assets',
        upload_url:
          'https://uploads.github.com/repos/esauerbo1/Amplify-Bot-Testing/releases/71007317/assets{?name,label}',
        html_url:
          'https://github.com/esauerbo1/Amplify-Bot-Testing/releases/tag/update',
        id: 71007317,
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
        node_id: 'RE_kwDOHipEIc4EO3xV',
        tag_name: 'update',
        target_commitish: 'main',
        name: 'Second Release',
        draft: false,
        prerelease: false,
        created_at: '2022-06-22T22:59:54Z',
        published_at: '2022-06-30T18:15:00Z',
        assets: [],
        tarball_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/tarball/update',
        zipball_url:
          'https://api.github.com/repos/esauerbo1/Amplify-Bot-Testing/zipball/update',
        body: 'This is another release.\r\n\r\nTagging someone\r\n@esauerbo1 \r\n\r\n\r\nLink to pr\r\n#1 ',
        mentions_count: 1,
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
        pushed_at: '2022-06-30T18:15:00Z',
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
    }

    const res = await fetch('/api/webhooks/github', {
      method: 'POST',
      headers: {
        'X-Hub-Signature-256':
          'sha256=a3207940a5a2451261c95ccfb2c993bd06c2a9f8d8894b536e6b78f1f7a94482',
        'X-GitHub-Event': 'release',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mocked),
    })
    const data = await res.json()
    return data
  }
</script>

<Content>
  <section>
    <header>
      <h1>Hey, Amplify!</h1>
      <p>A Discord Bot.</p>
      <button on:click="{triggerWebhook}">webhook</button>
    </header>
  </section>
</Content>

<style>
  :global(.bx--content) {
    min-height: calc(100vh - 3rem);
    --background-color: var(--cds-ui-background, #ffffff);
    --blurple: #5865f2;
    background-color: var(--background-color);
    background-image: linear-gradient(
      165deg,
      var(--background-color) 60%,
      var(--blurple) 100%
    );
  }

  @media (min-width: 33rem) {
    section {
      margin: 6rem;
    }
  }

  h1 {
    font-weight: var(--cds-expressive-heading-01-font-weight);
  }
</style>
