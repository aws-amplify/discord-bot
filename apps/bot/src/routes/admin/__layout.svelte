<script context="module">
  /** * @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    if (!session.user || !session.user.isAdmin) {
      return { redirect: '/restricted', status: 302 }
    }
    return {
      props: { user: session.user || false },
    }
  }
</script>

<script>
  export let user
</script>

<slot />
