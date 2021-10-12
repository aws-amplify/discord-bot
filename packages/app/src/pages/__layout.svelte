<script>
  import { Amplify } from '@aws-amplify/core'
  import { defineCustomElements } from '@aws-amplify/ui-components/dist/components/index.js'
  import amplifyConfig from '@amplify-discord-bots/aws-exports'
  import {
    Header,
    SkipToContent,
    Content,
  } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/all.css'
  import { onMount } from 'svelte'

  onMount(() => {
    defineCustomElements(window)
  })

  Amplify.configure(amplifyConfig)

  /** @type {"white" | "g10" | "g80" | "g90" | "g100"} */
  // let theme = 'g100'

  let isSideNavOpen = false
</script>

<Header company="" platformName="AWS Amplify Discord Bot" bind:isSideNavOpen>
  <div slot="skip-to-content">
    <SkipToContent />
  </div>
</Header>

<Content>
  <amplify-authenticator>
    <slot />
  </amplify-authenticator>
</Content>

<style>
  :global(.bx--content) {
    background: 0 0;
  }
</style>
