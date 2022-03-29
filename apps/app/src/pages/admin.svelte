<script context="module">
  export async function load({ session }) {
    const { user } = session

    if (!user) {
      return {
        status: 302,
        redirect: '/',
      }
    }

    return {
      props: {
        session,
      },
    }
  }
</script>

<script>
  export let session
</script>

<p>Session expiry: {session.expires}</p>
