<script>
  import {
    Content,
    Grid,
    Row,
    Column,
    Button,
    CodeSnippet,
  } from 'carbon-components-svelte'
  import * as store from '$lib/store'
  import Command from '$lib/Command.svelte'

  let syncData = {}
  let isSyncing = false
  async function syncCommands() {
    isSyncing = true
    let data
    try {
      const response = await fetch('/api/commands/sync', { method: 'POST' })
      if (response.ok && response.status === 200) {
        data = await response.json()
      }
    } catch (error) {
      store.notifications.update(notifications =>
        notifications.push({
          kind: 'error',
          title: 'Error syncing commands',
          subtitle: error.message,
          caption: Date.now().toLocaleString(),
        })
      )
      // throw new Error('Unable to fetch commands')
      console.error('Unable to sync commands', error)
    }
    isSyncing = false
    if (data) {
      store.notifications.update(notifications =>
        notifications.push({
          kind: 'success',
          title: 'Successfully synced commands',
          subtitle: '',
          caption: Date.now().toLocaleString(),
        })
      )
      syncData = data
    }
    return data
  }

  async function listCommands() {
    let data
    try {
      const response = await fetch('/api/commands/list')
      if (response.ok && response.status === 200) {
        data = await response.json()
        store.commands.set(data.data)
      }
    } catch (error) {
      // throw new Error('Unable to fetch commands')
      console.error('Unable to fetch commands', error)
    }
    console.log(data)
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
          {#await listCommands()}
            <p>...getting commands</p>
          {:then commands}
            {#each commands as command (command)}
              {@const tags = [command.registration && 'Registered'].filter(
                Boolean
              )}
              <Command {...command} tags="{tags}" />
            {/each}
          {:catch error}
            <p style="color: red">{error.message}</p>
          {/await}
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
