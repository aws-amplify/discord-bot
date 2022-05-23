<script context="module">
  /** * @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    if (!session.user) {
      return { redirect: '/login', status: 302 }
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
