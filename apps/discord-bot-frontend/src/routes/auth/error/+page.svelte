<script lang="ts">
  import type { PageData } from './$types'
  import { Content } from 'carbon-components-svelte'

  export let data: PageData
  $: ({ title } = data)
</script>

<Content>
  <h1>{title}</h1>
</Content>
