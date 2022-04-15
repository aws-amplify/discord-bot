<script context="module">
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
  import { UserAvatarFilledAlt, SettingsAdjust } from 'carbon-icons-svelte'
  import 'carbon-components-svelte/css/all.css'
  import { user, notifications } from '$lib/store'
  import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte'

  let theme = 'g100' as CarbonTheme

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
      {#if $user}
        <HeaderGlobalAction aria-label="Settings" icon="{SettingsAdjust}" />
        <HeaderAction
          aria-label="User settings"
          icon="{UserAvatarFilledAlt}"
          closeIcon="{UserAvatarFilledAlt}"
          bind:isOpen="{isUserPanelOpen}"
        >
          <HeaderPanelLinks>
            <HeaderPanelLink href="/settings">Settings</HeaderPanelLink>
            <HeaderPanelLink href="/logout">Logout</HeaderPanelLink>
          </HeaderPanelLinks>
        </HeaderAction>
      {:else}
        <Button aria-label="Login" href="/login">Login</Button>
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
