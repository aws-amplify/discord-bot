<script lang="ts">
  import { UnorderedList, ListItem } from 'carbon-components-svelte'
  import type { PageData } from './$types'
  export let data: PageData
  const { integrations } = data
</script>

<h1>Integrations</h1>
<UnorderedList>
  {#each integrations as integration}
    <ListItem>
      <a href="{integration.href}">{integration.name}</a>
    </ListItem>
  {/each}
</UnorderedList>
