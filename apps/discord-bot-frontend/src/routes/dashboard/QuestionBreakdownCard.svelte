<script lang="ts">
  import type { QuestionBreakdownItem } from './types'

  /**
   * Title of the section
   */
  export let item: QuestionBreakdownItem
</script>

<div
  class="ha-breakdown-card--container"
  style:--breakdown-card-color="{item.color || 'inherit'}"
>
  <div class="ha-breakdown-card--count-container">
    <span class="ha-breakdown-card--count">{item.count}</span>
    {#if item.percentage}
      <!-- tag -->
      <div
        class="bx--tag ha-breakdown-card--percentage"
        style:--breakdown-card-percentage-color="{item.percentageColor ||
          item.color ||
          'initial'}"
      >
        <span>
          {item.percentage}%
        </span>
      </div>
    {/if}
  </div>
  <div>
    <span class="ha-breakdown-card--title">{item.title}</span>
  </div>
</div>

<style>
  .ha-breakdown-card--container {
    background: rgb(198, 198, 198, 0.05);
    padding: var(--cds-spacing-04);

    display: grid;
    row-gap: var(--cds-spacing-04);
    /* ensure descriptions are aligned */
    grid-template-rows: min-content 1fr;
    /* fill height of Column */
    height: 100%;
  }

  .ha-breakdown-card--percentage {
    background-color: var(--breakdown-card-percentage-color);
  }

  .ha-breakdown-card--percentage span {
    color: var(--cds-inverse-02);
  }

  .ha-breakdown-card--count-container {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-04);
  }

  .ha-breakdown-card--count,
  .ha-breakdown-card--title {
    color: var(--breakdown-card-color);
  }

  .ha-breakdown-card--count {
    /* .bx--col > h1 */
    font-size: var(--cds-display-01-font-size);
    font-weight: var(--cds-display-01-font-weight);
    letter-spacing: var(--cds-display-01-letter-spacing);
    line-height: var(--cds-display-01-line-height);
    /* margin-bottom: var(--cds-layout-01); */
  }

  .ha-breakdown-card--title {
    /* h4 */
    font-size: var(--cds-productive-heading-03-font-size);
    /* font-weight: var(--cds-productive-heading-03-font-weight, 400); */
    line-height: var(--cds-productive-heading-03-line-height);
    letter-spacing: var(--cds-productive-heading-03-letter-spacing);
    /* override h4 font-weight */
    font-weight: var(--cds-productive-heading-07-font-weight);
  }
</style>
