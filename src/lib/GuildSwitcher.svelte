<script lang="ts">
  import { Dropdown } from 'carbon-components-svelte'
  import { browser } from '$app/environment'
  import { guild, isSplashScreenActive } from '$lib/store'

  export let guilds: [{ id: string; text: string }]
  export let selected = guilds[0].id

  $: if (browser && $guild !== selected) {
    isSplashScreenActive.set(true)
    const body = new FormData()
    body.append('guild', selected)
    body.append('redirect', window.location.pathname)
    const request = new Request('/api/switch-guild', {
      method: 'POST',
      body,
      redirect: 'follow',
    })
    fetch(request).then((res) => {
      if (res.redirected) {
        window.location.href = res.url
      }
    })
  }
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
