<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ session, fetch }) => {
    if (!session?.user) {
      return { redirect: '/restricted', status: 302 }
    }
    return {
      props: {},
    }
  }
</script>

<script lang="ts">
  import { Content } from 'carbon-components-svelte'
  import { session } from '$app/stores'
  import LoginButton from '$lib/LoginButton.svelte'

  let formGitHub
  let formDiscord 

</script>

{#if $session?.user?.github}
  <Content>
    <p>
      Thanks for linking your GitHub account! It is now safe to close this page
    </p>
  </Content>
{:else}
  <LoginButton bind:this={formDiscord} provider="discord" />
  <LoginButton bind:this={formGitHub} provider="github" />
{/if}
