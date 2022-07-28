<script lang="ts">
  import { Content } from 'carbon-components-svelte'
  import { session } from '$app/stores'
  import LoginButton from '$lib/LoginButton.svelte'
  import { onMount } from 'svelte'

  let formGitHub
  let formDiscord 

  onMount(() => {
    console.log('on mount')
    if ($session.user) {
      // push user through GitHub auth
      formGitHub.requestSubmit()
    } else {
      // push user through Discord auth
      console.log('discord login')
      formDiscord.requestSubmit()
    }
  })
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
