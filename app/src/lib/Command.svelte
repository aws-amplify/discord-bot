<script context="module">
  /**
   * @typedef {"initial"} DELETE_STEP_INITIAL
   */
  const DELETE_STEP_INITIAL = 'initial'
  /**
   * @typedef {"confirm"} DELETE_STEP_CONFIRM
   */
  const DELETE_STEP_CONFIRM = 'confirm'
  /**
   * @typedef {"deleting"} DELETE_STEP_DELETING
   */
  const DELETE_STEP_DELETING = 'deleting'
</script>

<script>
  import { Button, Tile } from 'carbon-components-svelte'
  import { TrashCan16 } from 'carbon-icons-svelte'

  /**
   * @type {(DELETE_STEP_INITIAL|DELETE_STEP_CONFIRM|DELETE_STEP_DELETING)}
   */
  let deleteCommandStep = DELETE_STEP_INITIAL

  /**
   * Command ID
   * @type {string}
   */
  export let id
  /**
   * Command name; used to execute command
   * @type {string}
   */
  export let name
  /**
   * Command description
   * @type {string}
   */
  export let description

  async function onDeleteCommand(event) {
    deleteCommandStep = DELETE_STEP_DELETING
    let data
    try {
      const response = await fetch(`/api/commands/delete/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      if (response.ok && response.status === 200) {
        data = await response.json()
        // TODO: improve popping command from list without reload
        location.reload()
      }
    } catch (error) {
      console.error('Unable to delete command', error)
    }
    deleteCommandStep = DELETE_STEP_INITIAL
    return data
  }
</script>

<Tile>
  <article>
    <div>
      <div>
        <span>{id}</span>
        <h3>{name}</h3>
      </div>
      <div>
        {#if deleteCommandStep === DELETE_STEP_INITIAL}
          <Button
            kind="danger-tertiary"
            iconDescription="Delete"
            icon="{TrashCan16}"
            on:click="{() => (deleteCommandStep = DELETE_STEP_CONFIRM)}"
          />
        {:else if deleteCommandStep === DELETE_STEP_CONFIRM}
          <Button
            kind="danger-tertiary"
            iconDescription="Confirm delete"
            on:click="{onDeleteCommand}"
          >
            Are you sure?
          </Button>
        {:else if deleteCommandStep === DELETE_STEP_DELETING}
          <Button
            kind="danger-tertiary"
            iconDescription="Confirm delete"
            disabled
          >
            Are you sure?
          </Button>
        {/if}
      </div>
    </div>
    <!-- command metadata 
          enabled?
          permissions?
          update button
          delete button
  -->
    <!-- <h3>{name}</h3> -->
    <p>{description}</p>
    <!-- command name -->
    <!-- command description -->
    <!-- command options -->
  </article>
</Tile>

<style>
  article {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--cds-spacing-04);
  }

  article > div {
    display: flex;
    justify-content: space-between;
  }

  article span {
    color: var(--cds-text-03);
  }
</style>
