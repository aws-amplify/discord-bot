<script context="module">
  /** * @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    return {
      props: {
        isLoggedIn: !!session?.user,
      },
    }
  }
</script>

<script lang="ts">
  import { Content, Grid, Row, Column } from 'carbon-components-svelte'
  import LogoutButton from '$lib/LogoutButton.svelte'

  export let isLoggedIn: boolean
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <!-- <h1>Hey, Amplify!</h1> -->
        {#if isLoggedIn}
          <h1>Logout</h1>
          <p>Are you sure you want to log out?</p>
          <LogoutButton />
        {:else}
          <p>You are not logged in.</p>
        {/if}
      </Column>
    </Row>
  </Grid>
</Content>

<style>
</style>
