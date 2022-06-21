<script lang="ts">
  import { Button } from 'carbon-components-svelte'
  import { getCsrfToken } from './auth'

  type Provider = 'discord' | 'github'

  export let provider: Provider

  let redirect = global?.window?.location?.href || import.meta.env.VITE_HOST
</script>

<form
  action="{`${import.meta.env.VITE_NEXTAUTH_URL}/api/auth/signin/${provider}`}"
  method="POST"
>
  {#await getCsrfToken() then csrfToken}
    <input type="hidden" name="csrfToken" value="{csrfToken}" />
  {/await}
  <input type="hidden" name="callbackUrl" value="{redirect}" />
  <Button type="submit">
    <slot>Login</slot>
  </Button>
</form>
