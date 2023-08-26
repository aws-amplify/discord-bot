<script lang="ts">
  import type { LayoutData } from './$types'
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
  import DashboardReference from 'carbon-icons-svelte/lib/DashboardReference.svelte'
  import Home from 'carbon-icons-svelte/lib/Home.svelte'
  import UserAdmin from 'carbon-icons-svelte/lib/UserAdmin.svelte'
  import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte'
  import LogoDiscord from 'carbon-icons-svelte/lib/LogoDiscord.svelte'
  import MessageQueue from 'carbon-icons-svelte/lib/MessageQueue.svelte'
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import Avatar from '$lib/Avatar.svelte'
  import LoginButton from '$lib/LoginButton.svelte'
  import GuildSwitcher from '$lib/GuildSwitcher.svelte'
  import {
    notifications,
    session,
    guild,
    isSplashScreenActive,
  } from '$lib/store'
  import SplashScreen from '$lib/SplashScreen.svelte'
  import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte'

  import 'carbon-components-svelte/css/all.css'
  import '../app.css'
  import '../styles/sidenav.css'

  export let data: LayoutData
  let { guilds, selectedGuild } = data
  $: ({ guilds, selectedGuild } = data)
  $: guild.set(selectedGuild)

  let theme: CarbonTheme = 'g100'

  let isSideNavOpen = false
  let isUserPanelOpen = false

  afterNavigate(() => {
    if (isUserPanelOpen) isUserPanelOpen = false
  })

  // $: console.log('SESSION FROM LAYOUT', $session, $page.data.session)
</script>

<svelte:head>
  <title>Hey, Amplify!</title>
</svelte:head>

<Theme bind:theme>
  <SplashScreen isActive="{$isSplashScreenActive}">
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
          {#if guilds.length > 1}
            <GuildSwitcher guilds="{guilds}" bind:selected="{selectedGuild}" />
          {/if}
          <HeaderAction
            aria-label="User settings"
            bind:isOpen="{isUserPanelOpen}"
            transition="{{ duration: 200 }}"
          >
            <Avatar slot="icon" url="{$session.user.image}" />
            <HeaderPanelLinks class="ha--panel-user">
              {#if $session.user.isAdmin}
                <HeaderPanelLink href="/admin">Admin</HeaderPanelLink>
              {/if}
              <HeaderPanelLink href="/logout">Logout</HeaderPanelLink>
              <!-- {#if !$session.user.github}
                <HeaderPanelLink href="/profile/link"
                  >Link GitHub Account</HeaderPanelLink
                >
              {:else}
                <p class="header-text">Github Account Linked</p>
              {/if} -->
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
          {#if $session?.user?.isAdmin}
            <SideNavLink
              icon="{UserAdmin}"
              text="Admin"
              href="/admin"
              isSelected="{$page.url.pathname === '/admin'}"
            />
          {/if}
          {#if $session?.user?.isGuildOwner || $session?.user?.isAdmin || $session?.user?.isStaff}
            <SideNavLink
              icon="{DashboardReference}"
              text="Dashboard"
              href="/dashboard"
              isSelected="{$page.url.pathname === '/dashboard'}"
            />
          {/if}
          <SideNavDivider />
          <SideNavLink
            icon="{LogoGithub}"
            text="GitHub"
            href="https://github.com/aws-amplify/discord-bot"
            target="_blank"
          />
          <SideNavLink
            icon="{LogoDiscord}"
            text="Join us on Discord"
            href="https://discord.gg/invite/amplify"
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
  </SplashScreen>
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

  :global(.bx--header-panel--expanded),
  :global(.bx--header-panel) {
    height: fit-content;
    border-bottom: 1px solid #393939;
  }

  :global(ul.bx--switcher__item) {
    height: auto;
    margin-bottom: var(--cds-spacing-04, 1rem);
  }

  .header-text {
    font-size: var(--cds-productive-heading-01-font-size, 0.875rem);
    line-height: var(--cds-productive-heading-01-line-height, 1.28572);
    letter-spacing: var(--cds-productive-heading-01-letter-spacing, 0.16px);
    display: block;
    height: var(--cds-spacing-07, 2rem);
    padding: 0.375rem var(--cds-spacing-05, 1rem);
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

  .ha--panel-user {
    height: fit-content;
    border-bottom: 1px solid #393939;
  }

  img {
    height: 24px;
    width: 24px;
  }
</style>
