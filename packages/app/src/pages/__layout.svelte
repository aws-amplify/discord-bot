<script context="module">
  import { Auth } from '@aws-amplify/auth'
  import { Amplify } from '@aws-amplify/core'
  import amplifyConfig from '@hey-amplify/aws-exports'
  import { user as userStore } from '$lib/store'

  Amplify.configure(amplifyConfig)

  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load({ page, fetch, session, stuff }) {
    try {
      const user = await Auth.currentAuthenticatedUser()
      userStore.set(user)
      return {
        props: {
          user,
        },
      }
    } catch (error) {
      // not logged in
      console.error('Error getting current user', error)
      if (page.path === '/login') return {}
      return {
        status: 302,
        redirect: '/login',
      }
    }
  }
</script>

<script>
  import { Header, SkipToContent, Theme } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  /** @type {import('@aws-amplify/auth').CognitoUser} */
  export let user

  // if user is logged in and on the login page, redirect home
  if (user?.username && $page.path === '/login') goto('/')

  /** @type {boolean} */
  let isSideNavOpen = false

  /** @type {"white" | "g10" | "g80" | "g90" | "g100"} */
  let theme = 'g100'
</script>

<Theme bind:theme>
  <Header href="/" bind:isSideNavOpen>
    <div slot="skip-to-content">
      <SkipToContent />
    </div>

    <span slot="platform" class="platform-name">
      AWS Amplify Discord Bot
      <!-- <code>v{process.env.VERSION || ""}</code> -->
    </span>
  </Header>

  <slot />
</Theme>

<style global>
  .bx--col > h1 {
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    margin-bottom: var(--cds-layout-01);
  }

  .bx--content {
    background-color: var(--cds-ui-background);
  }
</style>
