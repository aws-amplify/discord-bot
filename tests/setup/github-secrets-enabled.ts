if ( process.env.GITHUB_APP_ID, process.env.  GITHUB_CLIENT_ID, process.env.  GITHUB_CLIENT_SECRET,
     process.env.  GITHUB_PRIVATE_KEY, process.env.GITHUB_INSTALLATION_ID, process.env.GITHUB_ORG_LOGIN) {
    process.env.TEST_GITHUB_ENABLED = true
  } else {
    console.warn('Make sure to set github app secrets')
  }
