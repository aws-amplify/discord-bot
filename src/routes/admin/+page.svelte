<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData
  let { commands, configure, discord, integrations, selectedTab } = data
  // $: ({ commands, configure, discord, features } = data)

  import {
    Checkbox,
    Form,
    FormGroup,
    TextInput,
    Content,
    Grid,
    InlineLoading,
    Row,
    Column,
    Button,
    Tabs,
    Tab,
    TabContent,
    Toggle,
  } from 'carbon-components-svelte'
  import { get } from 'svelte/store'
  import { ACCESS_LEVELS } from '$lib/constants'
  import { guild, notifications } from '$lib/store'
  import { tabs } from './tabs'

  const roles = discord.roles.sort((a, b) => b.position - a.position)

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.target

    const body = {
      id: get(guild),
      name: discord.guild.name,
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
            configure?.id ? 'updated' : 'created'
          } configuration`,
          subtitle: '',
        })
      }
    } catch (error) {
      notifications.add({
        kind: 'error',
        title: `Error ${configure?.id ? 'updating' : 'creating'} configuration`,
        subtitle: error.message,
      })
    }
  }

  const toggleFeature = async (feature, enabled) => {
    const body = {
      configurationId: configure.id,
      code: feature.code,
      enabled,
    }

    try {
      const res = await fetch(`/api/admin/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      let data
      try {
        data = await res.json()
        if (!data) {
          // fallback to text for errors
          data = await res.text()
        }
      } catch (error) {
        notifications.add({
          kind: 'error',
          title: `Error ${enabled ? 'enabling' : 'disabling'} feature`,
          subtitle: '',
        })
      }
      if (data?.id) {
        notifications.add({
          kind: 'success',
          title: `Successfully ${enabled ? 'enabled' : 'disabled'} ${
            feature.name
          }`,
          subtitle: '',
        })
      }
    } catch (error) {
      notifications.add({
        kind: 'error',
        title: `Error ${enabled ? 'enabling' : 'disabling'} feature`,
        subtitle: '',
      })
    }
  }

  const handleOnFeatureToggleChange = async (event, feature) => {
    const { checked } = event.target
    await toggleFeature(feature, checked)
    /** @TODO throttling */
    // throttle(toggleFeature(feature, checked), 5)
  }

  const handleOnFeatureSubmit = async (event, feature) => {
    event.preventDefault()
    const form = event.target
    const data = new FormData(form)
    console.log('submit', form, data)
  }

  let togglingCommandIds: string[] = []
  const toggleCommand = async (command, enabled) => {
    if (command.id !== undefined) {
      togglingCommandIds.push(command.id)
    }
    const body = new FormData()
    if (!enabled) {
      body.append('id', command.registration.id)
    } else {
      body.append('command', command.name)
    }

    try {
      const res = await fetch(`/api/admin/commands`, {
        method: enabled ? 'PUT' : 'DELETE',
        body,
      })
      let data
      try {
        data = await res.json()
      } catch (error) {
        notifications.add({
          kind: 'error',
          title: `Error ${enabled ? 'enabling' : 'disabling'} command`,
          subtitle: '',
        })
      }
      if (res.status === 200 || data?.id) {
        notifications.add({
          kind: 'success',
          title: `Successfully ${enabled ? 'enabled' : 'disabled'} ${
            command.name
          }`,
          subtitle: '',
        })
      }
    } catch (error) {
      notifications.add({
        kind: 'error',
        title: `Error ${enabled ? 'enabling' : 'disabling'} command`,
        subtitle: '',
      })
    }
    togglingCommandIds = togglingCommandIds.filter((id) => id !== command.id)
  }

  const handleOnCommandToggleSubmit = async (event, command) => {
    event.preventDefault()
    const form = event.target
    const data = new FormData(form)
    console.log('submit', form, data)
  }

  const handleOnCommandToggleChange = async (event, command) => {
    const { checked } = event.target
    await toggleCommand(command, checked)
    /** @TODO throttling */
  }
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <Tabs selected="{selectedTab}">
          {#each tabs as tab}
            <Tab label="{tab.title}" />
          {/each}
          <svelte:fragment slot="content">
            <TabContent>
              <div class="ha--section-wrapper">
                <p>{$guild}</p>
                <section>
                  <!-- <Button disabled="{isSyncing}" on:click="{syncCommands}">
                    Sync Commands
                  </Button> -->
                  <h2>Commands</h2>
                  <ul class="ha--command-list">
                    {#each commands as command (command)}
                      {@const tags = [
                        command.registration && 'Registered',
                      ].filter(Boolean)}
                      <li class="ha--command">
                        <p>
                          <span class="ha--command-name">{command.name}</span
                          ><br />
                          {command.description}
                        </p>
                        <form
                          on:submit="{(e) =>
                            handleOnCommandToggleSubmit(e, command)}"
                        >
                          <!-- <InlineLoading
                            status="{togglingCommandId !== command.id
                              ? 'inactive'
                              : 'active'}"
                          /> -->
                          <Toggle
                            labelText="{`Enable/disable ${command.name}`}"
                            hideLabel
                            disabled="{togglingCommandIds.some(
                              (id) => id === command.id
                            )}"
                            toggled="{!!command.registration}"
                            on:change="{(e) =>
                              handleOnCommandToggleChange(e, command)}"
                          />
                        </form>
                      </li>
                    {/each}
                  </ul>
                </section>
                <section>
                  <h2>Role Associations</h2>
                  <!-- <pre><code>{JSON.stringify(guilds, null, 2)}</code></pre> -->
                  <Form on:submit="{onSubmit}">
                    <div class="ha--configure-roles">
                      <FormGroup id="adminRoles" legendText="Admin Roles">
                        {#each roles as role}
                          <Checkbox
                            id="{`admin-${role.id}`}"
                            labelText="{role.name}"
                            checked="{configure?.roles?.some(
                              (r) =>
                                r.accessLevelId === ACCESS_LEVELS.ADMIN &&
                                r.discordRoleId === role.id
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
                            checked="{configure?.roles?.some(
                              (r) =>
                                r.accessLevelId === ACCESS_LEVELS.STAFF &&
                                r.discordRoleId === role.id
                            ) || false}"
                            value="{role.id}"
                          />
                        {/each}
                      </FormGroup>
                      <FormGroup
                        id="contributorRoles"
                        legendText="Contributor Roles"
                      >
                        {#each roles as role}
                          <Checkbox
                            id="{`contributor-${role.id}`}"
                            labelText="{role.name}"
                            checked="{configure?.roles?.some(
                              (r) =>
                                r.accessLevelId === ACCESS_LEVELS.CONTRIBUTOR &&
                                r.discordRoleId === role.id
                            ) || false}"
                            value="{role.id}"
                          />
                        {/each}
                      </FormGroup>
                    </div>
                    <Button type="submit">
                      {configure?.id ? 'Update' : 'Create'} Configuration
                    </Button>
                  </Form>
                </section>
              </div>
            </TabContent>
            <TabContent>
              <div class="ha--integration-list">
                {#each integrations as feature (feature)}
                  <div class="ha--integration">
                    <p>
                      <span class="ha--integration-name">{feature.name}</span
                      ><br />
                      {feature.description}
                    </p>
                    <form
                      on:submit="{(e) => handleOnFeatureSubmit(e, feature)}"
                    >
                      <Toggle
                        labelText="{feature.code}"
                        hideLabel
                        toggled="{configure.features.some(
                          (f) => f.enabled && f.code === feature.code
                        )}"
                        on:change="{(e) =>
                          handleOnFeatureToggleChange(e, feature)}"
                      />
                      {#each feature?.inputs || [] as input}
                        <TextInput id="{input.code}" labelText="{input.name}" />
                      {/each}
                    </form>
                  </div>
                {/each}
              </div>
            </TabContent>
          </svelte:fragment>
        </Tabs>
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

  .ha--command-list,
  .ha--integration-list {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--cds-spacing-05);
  }

  .ha--command,
  .ha--integration {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto min-content;
    grid-column-gap: var(--cds-spacing-05);
    align-items: center;
  }

  .ha--command-name,
  .ha--integration-name {
    font-weight: bold;
  }

  .ha--command form {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: var(--cds-spacing-05);
    align-items: center;
  }
</style>
