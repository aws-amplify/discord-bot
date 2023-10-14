<script lang="ts">
  import { DataTable } from 'carbon-components-svelte'
  import { getHealth } from './helpers/get-health'
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
    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'answered'}
        <span data-health="{getHealth(row.percentage)}">{cell.value}</span>
      {:else}
        <span>{cell.value}</span>
      {/if}
    </svelte:fragment>
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
  section :global(td:has([data-health='low'])) {
    background-color: var(--ha-health-low);
  }

  section :global(td:has([data-health='okay'])) {
    background-color: var(--ha-health-okay);
  }

  section :global(td:has([data-health='good'])) {
    background-color: var(--ha-health-good);
  }

  section :global(.bx--data-table tr[data-health]) {
    color: white;
  }
</style>
