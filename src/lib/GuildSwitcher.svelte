<script lang="ts">
  import { Dropdown } from 'carbon-components-svelte'
  import { guild } from '$lib/store'
  export let guilds: [{ id: string; text: string }]
  let selected = guilds[0].id

  $: guild.set(selected)
</script>

<div class="ha--guild-switcher">
  <Dropdown bind:selectedId="{selected}" items="{guilds}" let:item>
    <div>
      <!-- TODO: add server avatar -->
      <span>{item.text}</span>
    </div>
  </Dropdown>
</div>

<style>
  .ha--guild-switcher {
    display: flex;
  }

  :global(.ha--guild-switcher .bx--dropdown) {
    background-color: transparent;
    height: 100%;
    max-height: unset;
    border-bottom: unset;
  }
</style>
