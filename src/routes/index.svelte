<script>
  import { Content } from 'carbon-components-svelte'
</script>

<Content>
  <section>
    <header>
      <h1>Hey, Amplify!</h1>
      <p>A Discord Bot.</p>
    </header>
  </section>
</Content>

<style>
  :global(.bx--content) {
    min-height: calc(100vh - 3rem);
    --background-color: var(--cds-ui-background, #ffffff);
    --blurple: #5865f2;
    background-color: var(--background-color);
    background-image: linear-gradient(
      165deg,
      var(--background-color) 60%,
      var(--blurple) 100%
    );
  }

  @media (min-width: 33rem) {
    section {
      margin: 6rem;
    }
  }

  h1 {
    font-weight: var(--cds-expressive-heading-01-font-weight);
  }
</style>
