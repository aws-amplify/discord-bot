<script context="module">
  /** @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    return {
      status: session?.user ? 403 : 401,
      props: {},
    }
  }
</script>

<script>
  import { Content, Grid, Row, Column } from 'carbon-components-svelte'
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <h1>Restricted</h1>
        <p>
          Hmm, it does not appear you have access to the requested page. <a
            href="/"
          >
            Go Home
          </a>
        </p>
      </Column>
    </Row>
  </Grid>
</Content>
