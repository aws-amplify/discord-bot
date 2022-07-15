<script lang="ts">
  import {
    Header,
    SkipToContent,
    Theme,
    HeaderUtilities,
    HeaderAction,
    HeaderPanelLinks,
    HeaderPanelLink,
    ToastNotification,
  } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'
  import { session } from '$app/stores'
  import { afterNavigate } from '$app/navigation'
  import Avatar from '$lib/Avatar.svelte'
  import LoginButton from '$lib/LoginButton.svelte'
  import { notifications } from '$lib/store'
  import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte'
  import '../app.css'

  let theme: CarbonTheme = 'g100'

  let isSideNavOpen = false
  let isUserPanelOpen = false

  afterNavigate((navigation) => {
    if (isUserPanelOpen) isUserPanelOpen = false
  })
</script>

<Theme bind:theme>
  <Header href="/" bind:isSideNavOpen>
    <div slot="skip-to-content">
      <SkipToContent />
    </div>

    <span slot="platform" class="ha--platform--container">
      <img src="/logo.svg" alt="AWS Amplify Logo" />
      <span class="ha--platform-name">AWS Amplify Discord Bot</span>
      <!-- <code>v{process.env.VERSION || ''}</code> -->
    </span>

    <HeaderUtilities>
      {#if $session.expires}
        <HeaderAction
          aria-label="User settings"
          bind:isOpen="{isUserPanelOpen}"
          transition="{{ duration: 200 }}"
        >
          <Avatar slot="icon" url="{$session.user.image}" />
          <HeaderPanelLinks>
            <HeaderPanelLink href="/logout">Logout</HeaderPanelLink>
            {#if !$session.user.github}
              <HeaderPanelLink href="/profile/link">Link Github Account</HeaderPanelLink>
            {:else}
              <p class="header-text">Github Account Linked</p>
            {/if}
          </HeaderPanelLinks>
        </HeaderAction>
      {:else}
        <LoginButton provider="{'discord'}" />
      {/if}
    </HeaderUtilities>
  </Header>

  <slot />

  <div class="ha--notification--container">
    {#each $notifications as notification}
      <ToastNotification {...notification} />
    {/each}
  </div>
</Theme>

<style>
  :global(.bx--col > h1) {
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    margin-bottom: var(--cds-layout-01);
  }
  
  :global(.bx--header-panel--expanded) {
    height: min-content;
    padding-bottom: var(--cds-spacing-08);
  }
  
  .header-text {
    font-size: var(--cds-productive-heading-01-font-size, 0.875rem);
    line-height: var(--cds-productive-heading-01-line-height, 1.28572);
    letter-spacing: var(--cds-productive-heading-01-letter-spacing, 0.16px);
    display: block;
    height: var(--cds-spacing-07, 2rem);
    padding: 0.375rem var(--cds-spacing-05, 1rem);
    color: #c6c6c6;
    text-decoration: none;
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

  .ha--platform--container {
    display: grid;
    align-items: center;
    grid-auto-flow: column;
    column-gap: var(--cds-spacing-04);
  }

  .ha--platform-name {
    display: none;
  }

  @media (min-width: 33rem) {
    .ha--platform-name {
      display: inline-block;
    }
  }

  img {
    height: 24px;
    width: 24px;
  }
</style>
