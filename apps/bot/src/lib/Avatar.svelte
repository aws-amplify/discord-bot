<script lang="ts">
  import { RouteBases } from 'discord-api-types/v10'

  export let userId: string | undefined
  export let avatarHash: string | undefined
  export let url
</script>

{#if userId && avatarHash}
  <img
    src="{RouteBases.cdn + `/avatars/${userId}/${avatarHash}`}"
    alt="Discord avatar"
  />
{:else}
  <img src="{url}" alt="Discord avatar" />
{/if}

<style>
  img {
    width: 32px;
    height: 32px;
    border-radius: 32px;
  }
</style>
