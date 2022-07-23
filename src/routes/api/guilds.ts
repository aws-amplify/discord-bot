/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ locals }) {
  // TODO: dynamically load guilds from Discord, filter by guilds the authenticated user is also a membor of
  const guilds = [{ id: '935912872352051313', text: 'amplify-sandbox' }]
  if (import.meta.env.DEV) {
    guilds.unshift({ id: '976838371383083068', text: 'amplify-local' })
  }

  return {
    status: 200,
    body: guilds,
  }
}
