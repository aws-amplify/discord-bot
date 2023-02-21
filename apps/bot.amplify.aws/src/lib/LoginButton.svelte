<script lang="ts">
  import { Button } from 'carbon-components-svelte'
  import Login from 'carbon-icons-svelte/lib/Login.svelte'
  import { getCsrfToken } from './auth'

  type Provider = 'discord' | 'github'

  export let provider: Provider
  export let buttonText = ''

  const redirect = import.meta.env.VITE_HOST
</script>

<form action="{`/auth/signin/${provider}`}" method="POST">
  {#await getCsrfToken() then csrfToken}
    <input type="hidden" name="csrfToken" value="{csrfToken}" />
  {/await}
  <input type="hidden" name="callbackUrl" value="{redirect}" />
  <Button type="submit" icon="{Login}">
    <slot>Login {buttonText}</slot>
  </Button>
</form>
