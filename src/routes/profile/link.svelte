<script lang="ts">
  import { Content } from 'carbon-components-svelte'
  import { session } from '$app/stores'
  import LoginButton from '$lib/LoginButton.svelte'
  import { onMount } from 'svelte'

  // bot sends user DM with
  // [id] = Discord User ID
  // get ID param
  // check if user exists with this ID OR if $user
  // if no, push through Discord login flow
  // -- after user logs in with Discord, bring user back to this page to complete GitHub auth
  // if yes, proceed with "linking" GitHub account (submit form for LoginButton,provider=github)

  let formGitHub
  let formDiscord 

  onMount(() => {
    console.log('on mount')
    if ($session.user) {
      // push user through GitHub auth
      console.log('github login')
      formGitHub.requestSubmit()
    } else {
      // push user through Discord auth
      console.log('discord login')
      formDiscord.requestSubmit()
    }
  })
</script>

{#if $session.user && $session.user.github}
  <Content>
    <p>
      Thanks for linking your GitHub account! It is now safe to close this page
    </p>
  </Content>
{:else}
  <LoginButton bind:this={formDiscord} provider="discord" />
  <LoginButton bind:this="{formGitHub}" provider="github" />
{/if}
