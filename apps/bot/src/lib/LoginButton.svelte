<script lang="ts">
  import { Button } from 'carbon-components-svelte'
  import { getCsrfToken } from './auth'
</script>

<form
  action="{`${import.meta.env.VITE_NEXTAUTH_URL}/api/auth/signin/discord`}"
  method="POST"
>
  {#await getCsrfToken() then csrfToken}
    <input type="hidden" name="csrfToken" value="{csrfToken}" />
  {/await}
  <input
    type="hidden"
    name="callbackUrl"
    value="{`${import.meta.env.VITE_HOST}`}"
  />
  <Button type="submit">Login</Button>
</form>
