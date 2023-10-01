export function secretsEnabled() {
  if (
    (process.env.GITHUB_APP_ID,
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
    process.env.GITHUB_PRIVATE_KEY,
    process.env.GITHUB_INSTALLATION_ID,
    process.env.GITHUB_ORG_LOGIN)
  ) {
    process.env.GITHUB_TESTS_ENABLED = 'true'
  } else {
    console.warn('Make sure to set github app secrets')
  }
}

beforeAll(() => {
  try {
    secretsEnabled()
  } catch (err) {
    console.error(`Error checking github tests ${err.message}`)
  }
})
