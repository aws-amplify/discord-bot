<script>
  import { Content } from 'carbon-components-svelte'
</script>

<div class="ha--homepage-wrapper">
  <Content>
    <section>
      <header>
        <h1>Hey, Amplify!</h1>
        <p>A Discord Bot.</p>
      </header>
    </section>
  </Content>
</div>

<style>
  .ha--homepage-wrapper {
    --background-color: var(--cds-ui-background, #ffffff);
    --blurple: #5865f2;
    margin-top: 3rem;
    min-height: calc(100vh - 3rem);
    background-color: var(--background-color);
    background-image: linear-gradient(
      165deg,
      var(--background-color) 60%,
      var(--blurple) 100%
    );
  }

  :global(.ha--homepage-wrapper .bx--content) {
    background-color: transparent;
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
