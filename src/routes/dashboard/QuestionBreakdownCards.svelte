<script lang="ts">
  import QuestionBreakdownCard from './QuestionBreakdownCard.svelte'
  import type { QuestionBreakdownItem } from './types'

  /**
   * Title of the section
   */
  export let title = 'Question Breakdown'
  export let breakdown: QuestionBreakdownItem[] = []
</script>

<section aria-label="{title}">
  <div>
    {#each breakdown as item}
      <QuestionBreakdownCard item="{item}" />
    {/each}
  </div>
</section>

<style>
  div {
    display: grid;
    grid-auto-flow: row;
    gap: var(--cds-spacing-04);
  }

  @media (min-width: 640px) {
    div {
      grid-auto-flow: column;
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }
</style>
