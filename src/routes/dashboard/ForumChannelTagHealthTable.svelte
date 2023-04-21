<script lang="ts">
  import { onMount } from 'svelte'
  import { DataTable } from 'carbon-components-svelte'
  import { browser } from '$app/environment'
  import { groupQuestions } from './helpers/group-questions'
  import { getPercentageOfQuestionsSolved } from './helpers/get-percentage-of-questions-solved'
  import { filterQuestions } from './helpers/filter-questions'
  import type { Question } from './types'

  /**
   * The questions to be displayed
   */
  export let questions: Question[]

  /**
   * All Forum Channel tags
   */
  // export let allForumChannelTags: string[]

  $: rows = Object.entries(
    groupQuestions(questions, {
      by: 'tag',
    })
  )
    .map(([tag, tagQuestions]) => ({
      id: tag,
      tag,
      percentage: getPercentageOfQuestionsSolved(tagQuestions),
      answered: `${getPercentageOfQuestionsSolved(tagQuestions)}%`,
      unanswered: `${
        tagQuestions.filter((question) => !question.isSolved).length
      }`,
      questions: tagQuestions,
      unansweredQuestions: filterQuestions(tagQuestions, {
        isSolved: false,
      }).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)),
    }))
    .sort((a, b) => {
      return a.percentage - b.percentage
    })

  const title = 'Tag health'

  function setHealthRowColor() {
    for (const row of rows) {
      const element = document.querySelector(`tr[data-row="${row.tag}"]`)
      if (!element) continue
      if (row.percentage < 50) {
        element.setAttribute('data-health', 'low')
      } else if (row.percentage < 75) {
        element.setAttribute('data-health', 'okay')
      } else {
        element.setAttribute('data-health', 'good')
      }
    }
  }

  onMount(() => {
    setHealthRowColor()
  })

  $: if (rows.length && browser) setHealthRowColor()
</script>

<section aria-label="{title}">
  <DataTable
    rows="{rows}"
    headers="{[
      { key: 'tag', value: 'Tag Name' },
      { key: 'answered', value: 'Health' },
      { key: 'unanswered', value: 'Unanswered' },
    ]}"
    title="{title}"
    expandable
    nonExpandableRowIds="{rows
      .filter((row) => row.unansweredQuestions.length === 0)
      .map((row) => row.tag)}"
    sortable
    size="tall"
  >
    <svelte:fragment slot="expanded-row" let:row>
      <div class="ha-tag-health--expanded-container">
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
            <!-- control how we render URLs and Dates -->
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
