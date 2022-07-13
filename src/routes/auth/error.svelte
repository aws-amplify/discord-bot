<script lang="ts" context="module">
  /** @type {import('@sveltejs/kit').Load} */
  export function load({ url }) {
    const { searchParams } = new URL(url)
    return {
      props: {
        title: `${searchParams}`,
      },
    }
  }
</script>

<script lang="ts">
  import { Content } from 'carbon-components-svelte'

  export let title
</script>

<Content>
  <h1>{title}</h1>
</Content>
