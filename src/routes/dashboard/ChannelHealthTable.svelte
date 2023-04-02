<script lang="ts">
  import { onMount } from 'svelte'
  import { DataTable } from 'carbon-components-svelte'
  import { groupQuestions } from './helpers/group-questions'
  import { getPercentageOfQuestionsSolved } from './helpers/get-percentage-of-questions-solved'
  import { filterQuestions } from './helpers/filter-questions'
  import type { Question } from './types'

  /**
   * The questions to be displayed
   */
  export let questions: Question[]

  /**
   * All help channels
   */
  export let allHelpChannels: string[]

  $: rows = Object.entries(
    groupQuestions(questions, {
      by: 'channel',
    })
  )
    .map(([channel, channelQuestions]) => ({
      id: channel,
      channel,
      percentage: getPercentageOfQuestionsSolved(channelQuestions),
      answered: `${getPercentageOfQuestionsSolved(channelQuestions)}%`,
      unanswered: `${
        channelQuestions.filter((question) => !question.isSolved).length
      }`,
      questions: channelQuestions,
      unansweredQuestions: filterQuestions(channelQuestions, {
        isSolved: false,
      }).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)),
    }))
    .sort((a, b) => {
      return a.percentage - b.percentage
    })

  const title = 'Channel health'

  onMount(() => {
    for (const row of rows) {
      const element = document.querySelector(`tr[data-row="${row.channel}"]`)
      if (!element) continue
      if (row.percentage < 50) {
        element.setAttribute('data-health', 'low')
      } else if (row.percentage < 75) {
        element.setAttribute('data-health', 'okay')
      } else {
        element.setAttribute('data-health', 'good')
      }
    }
  })
</script>

<section aria-label="{title}">
  <DataTable
    rows="{rows}"
    headers="{[
      { key: 'channel', value: 'Channel Name' },
      { key: 'answered', value: 'Health' },
      { key: 'unanswered', value: 'Unanswered' },
    ]}"
    title="{title}"
    expandable
    nonExpandableRowIds="{rows
      .filter((row) => row.unansweredQuestions.length === 0)
      .map((row) => row.channel)}"
    sortable
    size="tall"
  >
    <svelte:fragment slot="expanded-row" let:row>
      <div class="ha-channel-health--expanded-container">
        <DataTable
          rows="{row.unansweredQuestions}"
          headers="{[
            { key: 'title', value: 'Question' },
            { key: 'url', value: 'URL' },
            { key: 'createdAt', value: 'Created At' },
          ]}"
          size="short"
          sortable
        >
          <svelte:fragment slot="cell" let:cell>
            <!-- control how we render URLs -->
            <span>
              {#if cell.key === 'url'}
                <a href="{cell.value}">Visit HTTPS</a>
                &nbsp;|&nbsp;
                <a href="{cell.value.replace('^https', 'discord')}">
                  Visit Discord
                </a>
              {:else if cell.key === 'createdAt'}
                {new Date(cell.value).toLocaleString()}
              {:else}
                {cell.value}
              {/if}
            </span>
          </svelte:fragment>
        </DataTable>
      </div>
    </svelte:fragment>
  </DataTable>
</section>

<style>
  section :global([data-health='low'] td:nth-child(3)) {
    background-color: var(--ha-health-low);
  }

  section :global([data-health='okay'] td:nth-child(3)) {
    background-color: var(--ha-health-okay);
  }

  section :global([data-health='good'] td:nth-child(3)) {
    background-color: var(--ha-health-good);
  }

  section :global(.bx--data-table tr[data-health]) {
    color: white;
  }
</style>
