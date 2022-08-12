<script lang="ts">
  import {
    Checkbox,
    Form,
    FormGroup,
    Content,
    Grid,
    Row,
    Column,
    Button,
  } from 'carbon-components-svelte'
  import { get } from 'svelte/store'
  import { ACCESS_LEVELS } from '$lib/constants'
  import * as store from '$lib/store'
  import Command from '$lib/Command.svelte'
  import { guild, notifications } from '$lib/store'
  import type { Configuration, Guild, Role } from '@prisma/client'
  import type {
    RESTGetAPIGuildRolesResult,
    RESTGetAPIApplicationCommandResult,
  } from 'discord-api-types/v10'
  import type { Command as CommandType } from '$discord/commands'

  export let commands: Array<
    CommandType & { registration: RESTGetAPIApplicationCommandResult }
  >
  export let configure: {
    config: Configuration & {
      roles: Role[]
    }
    guild: Guild
    roles: RESTGetAPIGuildRolesResult
  }

  const roles = configure.roles.sort((a, b) => b.position - a.position)

  let isSyncing = false
  async function syncCommands() {
    isSyncing = true
    let data
    try {
      const response = await fetch('/api/admin/commands', {
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

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.target

    const body = {
      id: get(guild),
      name: configure.guild.name,
      adminRoles: [...form.adminRoles.querySelectorAll(':checked')].map(
        (node) => node.value
      ),
      staffRoles: [...form.staffRoles.querySelectorAll(':checked')].map(
        (node) => node.value
      ),
      contributorRoles: [
        ...form.contributorRoles.querySelectorAll(':checked'),
      ].map((node) => node.value),
    }

    try {
      const res = await fetch(`/api/admin/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
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
  <Grid>
    <Row>
      <Column>
        <div class="ha--section-wrapper">
          <section>
            <Button disabled="{isSyncing}" on:click="{syncCommands}">
              Sync Commands
            </Button>
            <h2>Commands:</h2>
            {#each commands as command (command)}
              {@const tags = [command.registration && 'Registered'].filter(
                Boolean
              )}
              <Command {...command} tags="{tags}" />
            {/each}
          </section>
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
                      checked="{configure.config?.roles?.some(
                        (r) =>
                          r.discordRoleId === role.id &&
                          r.accessLevelId === ACCESS_LEVELS.ADMIN
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
                      checked="{configure.config?.roles?.some(
                        (r) =>
                          r.discordRoleId === role.id &&
                          r.accessLevelId === ACCESS_LEVELS.STAFF
                      ) || false}"
                      value="{role.id}"
                    />
                  {/each}
                </FormGroup>
                <FormGroup id="contributorRoles" legendText="Contributor Roles">
                  {#each roles as role}
                    <Checkbox
                      id="{`contributor-${role.id}`}"
                      labelText="{role.name}"
                      checked="{configure.config?.roles?.some(
                        (r) =>
                          r.discordRoleId === role.id &&
                          r.accessTypeId === ACCESS_LEVELS.CONTRIBUTOR
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
        </div>
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

  .ha--section-wrapper {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--cds-layout-05);
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
