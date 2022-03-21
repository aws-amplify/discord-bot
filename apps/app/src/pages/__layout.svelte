<script context="module">
  import { Amplify } from '@aws-amplify/core'
  import amplifyConfig from '@hey-amplify/aws-exports'

  Amplify.configure(amplifyConfig)
</script>

<script>
  import { Header, SkipToContent, Theme } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'

  /** @type {boolean} */
  let isSideNavOpen = false

  /** @type {"white" | "g10" | "g80" | "g90" | "g100"} */
  let theme = 'g100'
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
  </Header>

  <slot />
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
