<script lang="ts">
  import { Column, Grid, Row } from 'carbon-components-svelte'
  import { getChannelHealth } from '../helpers/channels'
  import type { Questions } from '../types'

  export let filteredQuestions: Map<string, Questions>

  let data = getChannelHealth(filteredQuestions.get('aggregate')!)

  $: data = getChannelHealth(filteredQuestions.get('aggregate')!)
</script>

<svelte:head>
  <title>Discord Metrics Dashboard</title>
</svelte:head>

<Grid class="styled-col" style="justify-content:center">
  <h1 class="number-text">Channel Health</h1>
  <div>
    <Column>
      {#each Object.values(data) as channel}
        <Row style="background:{channel.color}" class="list-item">
          <Column><h4>{channel.channel}</h4></Column>
          <Column>
            <Row><h2>{channel.percent}%</h2></Row>
            <Row><p>answered</p></Row>
          </Column>
          <Column>
            <Row><h2>{channel.unanswered}</h2></Row>
            <Row><p>questions unanswered</p></Row>
          </Column>
        </Row>
      {/each}
    </Column>
  </div>
</Grid>

<style>
  :global(.list-item) {
    position: relative;
    left: unset;
    bottom: unset;
    right: unset;
    margin: 6px;
    padding: 4px 6px 4px 6px;
  }

  div {
    max-height: 90vh;
    overflow-y: scroll;
  }

  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    visibility: hidden;
  }
  ::-webkit-scrollbar-thumb {
    background: #ddd;
    visibility: hidden;
  }

  :hover::-webkit-scrollbar-thumb {
    visibility: visible;
    border-radius: 6px;
  }
</style>
