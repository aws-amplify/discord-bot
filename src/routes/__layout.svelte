<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = async ({ session, fetch }) => {
    if (session) {
      return {
        props: {
          guilds: await (await fetch('/api/guilds')).json(),
        },
      }
    }
    return {
      props: {},
    }
  }
</script>

<script lang="ts">
  import {
    Header,
    SkipToContent,
    Theme,
    HeaderUtilities,
    HeaderAction,
    HeaderPanelLinks,
    HeaderPanelLink,
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavDivider,
    ToastNotification,
  } from 'carbon-components-svelte'
  import Home from 'carbon-icons-svelte/lib/Home.svelte'
  import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte'
  import MessageQueue from 'carbon-icons-svelte/lib/MessageQueue.svelte'
  import { session, page } from '$app/stores'
  import { afterNavigate } from '$app/navigation'
  import Avatar from '$lib/Avatar.svelte'
  import LoginButton from '$lib/LoginButton.svelte'
  import GuildSwitcher from '$lib/GuildSwitcher.svelte'
  import { notifications } from '$lib/store'
  import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte'

  import 'carbon-components-svelte/css/all.css'
  import '../app.css'
  import '../styles/sidenav.css'

  export let guilds

  let theme: CarbonTheme = 'g100'

  let isSideNavOpen = false
  let isUserPanelOpen = false

  afterNavigate(() => {
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
      {#if $session?.user}
        <!-- {#if guilds.length > 1}
          <GuildSwitcher guilds="{guilds}" />
        {/if} -->
        <HeaderAction
          aria-label="User settings"
          bind:isOpen="{isUserPanelOpen}"
          transition="{{ duration: 200 }}"
        >
          <Avatar slot="icon" url="{$session.user.image}" />
          <HeaderPanelLinks>
            {#if $session.user.isAdmin}
              <HeaderPanelLink href="/admin">Admin</HeaderPanelLink>
            {/if}
            <HeaderPanelLink href="/logout">Logout</HeaderPanelLink>
          </HeaderPanelLinks>
        </HeaderAction>
      {:else}
        <LoginButton provider="{'discord'}" />
      {/if}
    </HeaderUtilities>

    <SideNav bind:isOpen="{isSideNavOpen}" rail>
      <SideNavItems>
        <SideNavLink
          icon="{Home}"
          text="Home"
          href="/"
          isSelected="{$page.url.pathname === '/'}"
        />
        <SideNavLink
          icon="{MessageQueue}"
          text="Questions"
          href="/questions"
          isSelected="{$page.url.pathname === '/questions'}"
        />
        <SideNavDivider />
        <SideNavLink
          icon="{LogoGithub}"
          text="GitHub"
          href="https://github.com/aws-amplify/discord-bot"
          target="_blank"
        />
      </SideNavItems>
    </SideNav>
  </Header>

  <slot />

  <div class="ha--notification--container">
    {#each $notifications as notification}
      <ToastNotification {...notification} />
    {/each}
  </div>
</Theme>

<style>
  :global(.bx--content) {
    background-image: unset;
    background-color: var(--cds-ui-background);
  }

  :global(.bx--col > h1) {
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    margin-bottom: var(--cds-layout-01);
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
