<script lang="ts">
  import { page } from '$app/stores'
  import { Content, Grid, Row, Column } from 'carbon-components-svelte'

  if (import.meta.env.DEV) {
    console.error('Error', $page.error)
  }
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <h1>{$page.status}: {$page.error.message}</h1>
        <p>Something went wrong.</p>
      </Column>
    </Row>
  </Grid>
</Content>
