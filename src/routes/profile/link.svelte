<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ session }) => {
    if (!session?.user) {
      return { redirect: '/restricted', status: 302 }
    }
    return {
      props: {},
    }
  }
</script>

<script lang="ts">
  import { Content, Column, Grid, Row } from 'carbon-components-svelte'
  import { session } from '$app/stores'
  import LoginButton from '$lib/LoginButton.svelte'

  let formGitHub
  let formDiscord
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        {#if $session?.user?.github}
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
