<script lang="ts">
  import { Content, Grid, Row, Column, Button } from 'carbon-components-svelte'
  import * as store from '$lib/store'
  import Command from '$lib/Command.svelte'

  export let list

  let isSyncing = false
  async function syncCommands() {
    isSyncing = true
    let data
    try {
      const response = await fetch('/api/admin/commands/sync', {
        method: 'POST',
      })
      if (response.ok && response.status === 200) {
        data = await response.json()
      }
    } catch (error) {
      store.notifications.add({
        kind: 'error',
        title: 'Error syncing commands',
        subtitle: error.message,
      })
      console.error('Unable to sync commands', error)
    }
    isSyncing = false
    if (data) {
      store.notifications.add({
        kind: 'success',
        title: 'Successfully synced commands',
        subtitle: '',
      })
    }
    return data
  }
</script>

<Content>
  <Grid noGutter>
    <Row>
      <Column>
        <Button disabled="{isSyncing}" on:click="{syncCommands}">
          Sync Commands
        </Button>
        <section>
          <h2>Commands:</h2>
          {#each list as command (command)}
            {@const tags = [command.registration && 'Registered'].filter(
              Boolean
            )}
            <Command {...command} tags="{tags}" />
          {/each}
        </section>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  section {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--cds-spacing-05);
  }
</style>
