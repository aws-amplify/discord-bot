<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'
  export const load: Load = ({ error, status }) => {
    console.error('[app] Error:', error)
    return {
      props: {
        title: `${status}`,
      },
    }
  }
</script>

<script lang="ts">
  import { Content, Grid, Row, Column } from 'carbon-components-svelte'

  export let title: string
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <h1>{title}</h1>
        <p>Something went wrong.</p>
      </Column>
    </Row>
  </Grid>
</Content>
