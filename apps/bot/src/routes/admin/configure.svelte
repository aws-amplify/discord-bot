<script>
  import {
    Checkbox,
    Content,
    Dropdown,
    Grid,
    Row,
    Column,
    Button,
    Form,
    FormGroup,
  } from 'carbon-components-svelte'
  import * as store from '$lib/store'

  export let configure

  $: roles = configure.roles.sort((a, b) => b.position - a.position)

  const servers = configure.guilds.map(guild => ({
    id: guild.id,
    text: guild.name,
  }))
  const selectedServer = servers[0]?.id

  async function switchGuild(id) {
    const res = await fetch(`/admin/configure?id=${id}`)
    const data = await res.json()
  }

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.target
    const selectedAdminRoles = Array.from(
      form.adminRoles.querySelectorAll(':checked')
    ).map(node => node.id)

    const body = {
      id: selectedServer,
      name: configure.guild.name,
      adminRoles: selectedAdminRoles,
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/admin/configure`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json()
      if (data?.id) {
        store.notifications.add({
          kind: 'success',
          title: 'Successfully updated configuration',
          subtitle: '',
        })
      }
    } catch (error) {
      store.notifications.add({
        kind: 'error',
        title: 'Error updating configuration',
        subtitle: error.message,
      })
    }
  }
</script>

<Content>
  <Grid noGutter>
    <Row>
      <Column>
        <section>
          <h2>Configure</h2>
          <!-- <pre><code>{JSON.stringify(guilds, null, 2)}</code></pre> -->
          <Dropdown
            titleText="Discord Servers"
            selectedId="{selectedServer}"
            items="{servers}"
            on:select="{switchGuild}"
          />
          <Form on:submit="{onSubmit}">
            <FormGroup id="adminRoles" legendText="Admin Roles">
              {#each roles as role}
                <Checkbox
                  id="{role.id}"
                  labelText="{role.name}"
                  checked="{configure.config?.adminRoles?.find(
                    r => r.id === role.id
                  ) || false}"
                />
              {/each}
            </FormGroup>
            <Button type="submit">
              {configure.config?.id ? 'Update' : 'Create'} Configuration
            </Button>
          </Form>
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
