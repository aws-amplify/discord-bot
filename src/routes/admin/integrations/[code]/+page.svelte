<script lang="ts">
  import {
    Grid,
    Column,
    Row,
    Toggle,
    TextInput,
  } from 'carbon-components-svelte'
  import { notifications } from '$lib/store'
  import type { PageServerData } from './$types'
  import { createIntegrationHrefFromCode } from '../../breadcrumbs'
  export let data: PageServerData
  const { configurationId, integration } = data

  const toggleFeature = async (feature, enabled) => {
    const body = {
      configurationId,
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
</script>

<div class="ha--integration">
  <p>
    <span class="ha--integration-name">{integration.name}</span><br />
    {integration.description}
  </p>
  <form on:submit="{(e) => handleOnFeatureSubmit(e, integration)}">
    <Toggle
      labelText="{integration.code}"
      hideLabel
      toggled="{integration.enabled}"
      on:change="{(e) => handleOnFeatureToggleChange(e, integration)}"
    />
    {#each integration?.inputs || [] as input}
      <TextInput id="{input.code}" labelText="{input.name}" />
    {/each}
  </form>
</div>
<a href="{createIntegrationHrefFromCode(integration.code)}">
  Visit {integration.name}
</a>

<style>
  .ha--integration {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto min-content;
    grid-column-gap: var(--cds-spacing-05);
    align-items: center;
  }

  .ha--integration-name {
    font-weight: bold;
  }
</style>
