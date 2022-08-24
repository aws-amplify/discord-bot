<script lang="ts">
  import { Content, Column, Grid, Row } from 'carbon-components-svelte'
  import { session } from '$app/stores'
  import LoginButton from '$lib/LoginButton.svelte'

  let formGitHub
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        {#if !$session?.user}
          <p>You do not appear to be logged in. First, login with Discord</p>
        {:else if $session?.user?.github}
          <p>
            Thanks for linking your GitHub account! It is now safe to close this
            page
          </p>
        {:else}
          <LoginButton
            buttonText="with GitHub"
            bind:this="{formGitHub}"
            provider="github"
          />
        {/if}
      </Column>
    </Row>
  </Grid>
</Content>

<style>
</style>
