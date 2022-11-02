<script lang="ts">
  export let isActive = false
</script>

<div data-active="{isActive}">
  <div>
    <slot name="content">
      <span>Loading...</span>
    </slot>
  </div>
</div>
<slot />

<style>
  div {
    display: none;
  }

  div[data-active='true'] {
    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--cds-ui-background);
    filter: opacity(0.8);
  }

  div[data-active='true'] > div {
    display: block;
    z-index: 100;
  }

  span {
    font-size: var(--cds-productive-heading-01-font-size, 0.875rem);
    line-height: var(--cds-productive-heading-01-line-height, 1.28572);
    letter-spacing: var(--cds-productive-heading-01-letter-spacing, 0.16px);
    display: block;
    height: var(--cds-spacing-07, 2rem);
    padding: 0.375rem var(--cds-spacing-05, 1rem);
    text-decoration: none;
  }
</style>
