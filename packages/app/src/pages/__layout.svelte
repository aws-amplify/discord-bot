<script>
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SkipToContent,
    Content,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SideNavDivider,
  } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'

  /** @type {"white" | "g10" | "g80" | "g90" | "g100"} */
  let theme = 'g100'

  // document.documentElement.setAttribute('theme', theme)

  let isSideNavOpen = false
</script>

<Header company="" platformName="AWS Amplify Discord Bot" bind:isSideNavOpen>
  <div slot="skip-to-content">
    <SkipToContent />
  </div>

  <!-- <HeaderNav>
    <HeaderNavItem href="/" text="Link 1" />
    <HeaderNavItem href="/" text="Link 2" />
    <HeaderNavItem href="/" text="Link 3" />
    <HeaderNavMenu text="Menu">
      <HeaderNavItem href="/" text="Link 1" />
      <HeaderNavItem href="/" text="Link 2" />
      <HeaderNavItem href="/" text="Link 3" />
    </HeaderNavMenu>
  </HeaderNav> -->
</Header>

<!-- <SideNav bind:isOpen="{isSideNavOpen}">
  <SideNavItems>
    <SideNavLink text="Link 1" />
    <SideNavLink text="Link 2" />
    <SideNavLink text="Link 3" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
    <SideNavDivider />
    <SideNavLink text="Link 4" />
  </SideNavItems>
</SideNav> -->

<Content>
  <slot />
</Content>

<style>
  :global(.bx--content) {
    background: 0 0;
  }

  /* @media (max-width: 1056px) {
    :global(.bx--side-nav ~ .bx--content) {
      margin-left: 0;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  } */
</style>
