<script context="module">
  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export function load({ error, status }) {
    return {
      props: {
        title: `${status}: ${error.message}`,
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
