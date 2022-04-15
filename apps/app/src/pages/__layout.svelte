<script context="module">
</script>

<script>
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
    HeaderPanelDivider,
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    SideNavDivider,
  } from 'carbon-components-svelte'
  import SettingsAdjust20 from 'carbon-icons-svelte/lib/SettingsAdjust20'
  import UserAvatarFilledAlt20 from 'carbon-icons-svelte/lib/UserAvatarFilledAlt20'
  import { Launch20 } from 'carbon-icons-svelte'
  import 'carbon-components-svelte/css/all.css'

  let theme = 'g100'

  let user
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
      <!-- <code>v{process.env.VERSION || ""}</code> -->
    </span>

    <HeaderUtilities>
      {#if user}
        <HeaderGlobalAction aria-label="Settings" icon="{SettingsAdjust20}" />
        <HeaderAction
          aria-label="User settings"
          icon="{UserAvatarFilledAlt20}"
          closeIcon="{UserAvatarFilledAlt20}"
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
</Theme>

<style global>
  .bx--col > h1 {
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    margin-bottom: var(--cds-layout-01);
  }

  .bx--content {
    background-color: var(--cds-ui-background);
  }
</style>
