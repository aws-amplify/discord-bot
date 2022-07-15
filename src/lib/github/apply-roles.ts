import { Octokit } from '@octokit/rest'

async function isContributor(accessToken: string, repos) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  for (let i = 0; i < repos.length; i++) {
    const amplifyRepo = repos[i]
    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner: process.env.GITHUB_ORG_ID,
          repo: amplifyRepo,
        }
      )
      return {
        status: 200,
        body: data,
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

async function getRepos(accessToken: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  try {
    const { data } = await octokit.request('GET /orgs/{org}/repos', {
      org: process.env.GITHUB_ORG_ID,
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

async function isMember(accessToken: string) {
  // use octokit to fetch github org membership
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /user/memberships/orgs/{org}', {
      org: process.env.GITHUB_ORG_ID,
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

export async function appplyRoles(accessToken: string) {
  console.log(accessToken)

  const memberRes = await isMember(accessToken)
  if (memberRes.status === 200) {
    // apply staff role
  }

  const repoRes = await getRepos(accessToken)
  if (repoRes.status === 200) {
    // is contributor
    const contribution = await isContributor(repoRes.body, accessToken)
    if(contribution.status === 200){
        // apply contrinutor role
    }
  }

  // fetch aws amplify github repositories
  // loop through all repos and get contributors
  // if user is contributor

  // fetch user id from database

  // org repos
  //   await octokit.request('GET /orgs/{org}/repos', {
  //     org: 'ORG'
  //   })

  //https://docs.github.com/en/rest/repos/repos#list-repository-contributors
  // org contributors
  // await octokit.request('GET /repos/{owner}/{repo}/contributors', {
  //     owner: 'OWNER',
  //     repo: 'REPO'
  //   })
  // this includes id which is hopefully the same as our user id
  // if user id is in contrinbutor list, apply contributor role the first time this happens
}
