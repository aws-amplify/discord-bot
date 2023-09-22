<script lang="ts">
  import { signOut } from '@auth/sveltekit/client'
  import { Button } from 'carbon-components-svelte'
</script>

<Button on:click="{() => signOut()}">
  <slot>Logout</slot>
</Button>
