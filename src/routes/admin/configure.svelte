<script>
  import {
    Checkbox,
    Content,
    Grid,
    Row,
    Column,
    Button,
    Form,
    FormGroup,
  } from 'carbon-components-svelte'
  import { get } from 'svelte/store'
  import { guild, notifications } from '$lib/store'

  export let configure

  $: roles = configure.roles.sort((a, b) => b.position - a.position)

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.target
    const selectedAdminRoles = Array.from(
      form.adminRoles.querySelectorAll(':checked')
    ).map((node) => node.value)
    const selectedStaffRoles = Array.from(
      form.staffRoles.querySelectorAll(':checked')
    ).map((node) => node.value)

    const body = {
      id: get(guild),
      name: configure.guild.name,
      adminRoles: selectedAdminRoles,
      staffRoles: selectedStaffRoles,
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_HOST}/api/admin/configure`,
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
        notifications.add({
          kind: 'success',
          title: `Successfully ${
            configure.config?.id ? 'updated' : 'created'
          } configuration`,
          subtitle: '',
        })
      }
    } catch (error) {
      notifications.add({
        kind: 'error',
        title: `Error ${
          configure.config?.id ? 'updating' : 'creating'
        } configuration`,
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
          <Form on:submit="{onSubmit}">
            <div class="ha--configure-roles">
              <FormGroup id="adminRoles" legendText="Admin Roles">
                {#each roles as role}
                  <Checkbox
                    id="{`admin-${role.id}`}"
                    labelText="{role.name}"
                    checked="{configure.config?.roles?.find(
                      (r) =>
                        r.discordRoleId === role.id && r.accessType === 'ADMIN'
                    ) || false}"
                    value="{role.id}"
                  />
                {/each}
              </FormGroup>
              <FormGroup id="staffRoles" legendText="Staff Roles">
                {#each roles as role}
                  <Checkbox
                    id="{`staff-${role.id}`}"
                    labelText="{role.name}"
                    checked="{configure.config?.roles?.find(
                      (r) =>
                        r.discordRoleId === role.id && r.accessType === 'STAFF'
                    ) || false}"
                    value="{role.id}"
                  />
                {/each}
              </FormGroup>
            </div>
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

  .ha--configure-roles {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--cds-spacing-05);
  }

  @media (min-width: 33rem) {
    .ha--configure-roles {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
