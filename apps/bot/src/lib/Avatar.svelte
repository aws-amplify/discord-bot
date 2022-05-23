<script>
  import { RouteBases } from 'discord-api-types/v10'

  export let userId
  export let avatarHash
</script>

<img
  src="{RouteBases.cdn + `/avatars/${userId}/${avatarHash}`}"
  alt="Discord avatar"
/>

<style>
  img {
    width: 32px;
    height: 32px;
    border-radius: 32px;
  }
</style>
