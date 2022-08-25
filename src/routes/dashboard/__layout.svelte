<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ session }) => {
    if (
      session?.user?.isGuildOwner ||
      session?.user?.isAdmin ||
      session?.user?.isStaff
    ) {
      return {}
    }
    return { redirect: '/restricted', status: 302 }
  }
</script>

<slot />
