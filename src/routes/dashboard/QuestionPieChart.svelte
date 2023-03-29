<script lang="ts">
  import { PieChart } from '@carbon/charts-svelte'
  import type {
    PieChartOptions,
    BaseChartOptions,
  } from '@carbon/charts/interfaces'
  import type { Question } from './types'

  const availableChartColors = [
    '#6929c4',
    '#1192e8',
    '#005d5d',
    '#9f1853',
    '#fa4d56',
    '#520408',
    '#198038',
    '#002d9c',
    '#ee5396',
    '#b28600',
    '#009d9a',
    '#012749',
    '#8a3800',
    '#a56eff',
    '#6929c4',
    '#1192e8',
  ].sort(() => Math.random() - 0.5)

  /**
   * Pie chart data
   */
  export let data: Record<string, Question[]>

  /**
   * Chart colors
   */
  export let chartColors: BaseChartOptions['color'] = {}

  /**
   * Chart options
   */
  export let options: PieChartOptions = {}

  /**
   * Chart title
   */
  export let title: string

  /**
   * Chart height
   */
  export let height = '400px'

  $: chartData = Object.entries(data).map(([label, questions]) => ({
    group: label,
    count: questions.length,
  }))

  $: chartColors = Object.keys(data).reduce(
    (acc, label, idx) => ({
      ...acc,
      [label]:
        idx < availableChartColors.length - 1
          ? availableChartColors[idx]
          : availableChartColors[idx % availableChartColors.length],
    }),
    {}
  )
</script>

<div>
  <PieChart
    title="{title}"
    bind:data="{chartData}"
    options="{{
      color: {
        scale: chartColors,
      },
      title,
      resizable: true,
      pie: {
        labels: {
          enabled: false,
        },
        valueMapsTo: 'count',
      },
      legend: {
        enabled: true,
        // @ts-expect-error enums are silly
        position: 'right',
      },
      height,
    }}"
    theme="g100"
  />
</div>

<style>
  div {
    max-height: 100%;
    /* overflow: auto; */
  }

  /** override legend style to scroll when overflowing */
  div :global(.cds--cc--chart-wrapper .layout-child.legend) {
    overflow-y: auto;
  }
</style>
