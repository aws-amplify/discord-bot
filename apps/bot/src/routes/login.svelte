<script context="module">
  /** @type {import('@sveltejs/kit').Load} */
  export async function load({ session }) {
    if (!session.user) {
      return { redirect: '/api/auth/login', status: 302 }
    }
    return {
      props: { redirect: '/', status: 302 },
    }
  }
</script>
