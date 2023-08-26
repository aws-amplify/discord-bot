<script lang="ts">
  import { Button } from 'carbon-components-svelte'
  import { getCsrfToken } from './auth'
</script>

<form action="{`/auth/signout`}" method="POST">
  {#await getCsrfToken() then csrfToken}
    <input type="hidden" name="csrfToken" value="{csrfToken}" />
  {/await}
  <Button type="submit">
    <slot>Logout</slot>
  </Button>
</form>
