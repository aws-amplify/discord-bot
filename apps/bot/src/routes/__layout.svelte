<script context="module">
  /** * @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    return {
      props: { user: session.user || false },
    }
  }
</script>

<script lang="ts">
  import {
    Header,
    SkipToContent,
    Theme,
    Button,
    HeaderUtilities,
    HeaderGlobalAction,
    HeaderAction,
    HeaderPanelLinks,
    HeaderPanelLink,
    ToastNotification,
  } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'
  import Avatar from '$lib/Avatar.svelte'
  import LoginButton from '$lib/LoginButton.svelte'
  import LogoutButton from '$lib/LogoutButton.svelte'
  import { user as userStore, notifications } from '$lib/store'
  import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte'

  export let user
  userStore.set(user)

  let theme: CarbonTheme = 'g100'

  let isSideNavOpen = false
  let isUserPanelOpen = false
</script>

<Theme bind:theme>
  <Header href="/" bind:isSideNavOpen>
    <div slot="skip-to-content">
      <SkipToContent />
    </div>

    <span slot="platform" class="platform-name">
      AWS Amplify Discord Bot
      <!-- <code>v{process.env.VERSION || ''}</code> -->
    </span>

    <HeaderUtilities>
      {#if $userStore}
        <HeaderAction
          aria-label="User settings"
          bind:isOpen="{isUserPanelOpen}"
          transition="{{ duration: 200 }}"
        >
          <Avatar slot="icon" url="{user.image}" />
          <HeaderPanelLinks>
            {#if $userStore.isAdmin}
              <HeaderPanelLink href="/admin">Administration</HeaderPanelLink>
            {/if}
            <HeaderPanelLink href="/api/auth/signout">Logout</HeaderPanelLink>
          </HeaderPanelLinks>
        </HeaderAction>
      {:else}
        <LoginButton provider="{'discord'}" />
      {/if}
    </HeaderUtilities>
  </Header>

  {#if import.meta.env.DEV}
    <slot />
  {/if}

  <div class="ha--notification--container">
    {#each $notifications as notification}
      <ToastNotification {...notification} />
    {/each}
  </div>
</Theme>

<style>
  :global(body) {
    /* --cds-interactive-01: #5865f2;
    --cds-hover-primary: #7289da; */
  }

  :global(.bx--content) {
    background: inherit;
  }

  :global(.bx--col > h1) {
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    margin-bottom: var(--cds-layout-01);
  }

  :global(.bx--content) {
    background-color: var(--cds-ui-background);
  }

  div.ha--notification--container {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 100;

    display: grid;
    grid-auto-flow: row;
    grid-gap: var(--cds-spacing-01);
  }
</style>
