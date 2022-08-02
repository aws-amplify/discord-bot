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
  <LoginButton buttonText="with GitHub" bind:this={formGitHub} provider="github" />
{/if}

<style>
:global(.bx--btn--primary) {
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0,0,0,0);
  background-color: var(--cds-interactive-01, #0f62fe);
  color: var(--cds-text-04, #ffffff);
  margin-top: var(--cds-spacing-10);
  display: block;
  margin-right:  auto;
  margin-left: auto;
}

</style>