<script lang="ts">
  import { signIn } from '@auth/sveltekit/client'
  import { Button } from 'carbon-components-svelte'
  import Login from 'carbon-icons-svelte/lib/Login.svelte'

  type Provider = 'discord' | 'github'

  export let provider: Provider = 'discord'
  export let buttonText = ''
</script>

<Button icon="{Login}" on:click="{() => signIn(provider)}">
  <slot>Login {buttonText}</slot>
</Button>
