<script lang="ts">
  import { BarChartStacked } from '@carbon/charts-svelte'
  import { COHORTS } from './constants'
  import { groupQuestions } from './helpers/group-questions'
  import type { TimePeriod, Question } from './types'

  const GROUPS = {
    ANSWERED_BY_STAFF: 'Answered by Staff',
    UNANSWERED: 'Unanswered',
    SOLVED_WITHOUT_ANSWER: 'Solved without Answer',
    ANSWERED_BY_COMMUNITY: 'Answered by Community',
  } as const

  /**
   * @todo can this be imported from @carbon/charts?
   */
  type BarChartData = {
    group: string
    key: string
    value: number
  }[]

  /**
   * The questions to be displayed
   */
  export let questions: Question[]
  /**
   * The time period to be grouped by
   */
  export let timePeriod: TimePeriod

  function createBarChartData(questions: Question[], timePeriod: TimePeriod) {
    let data: BarChartData = []
    const grouped = groupQuestions(questions, {
      by: 'date',
      byDateOptions: { period: timePeriod },
    })
    for (const [date, questionsGroupedByDate] of Object.entries(grouped)) {
      const key = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      const groupedQuestionsByCohort = groupQuestions(questionsGroupedByDate, {
        by: 'cohort',
      })
      for (const [cohort, questionsGroupedByCohort] of Object.entries(
        groupedQuestionsByCohort
      )) {
        switch (cohort) {
          case COHORTS.STAFF:
            data.push({
              group: GROUPS.ANSWERED_BY_STAFF,
              key,
              value: questionsGroupedByCohort.length,
            })
            break
          case COHORTS.UNANSWERED:
            data.push({
              group: GROUPS.UNANSWERED,
              key,
              value: questionsGroupedByCohort.length,
            })
            break
          case COHORTS.SOLVED_WITHOUT_ANSWER: {
            data.push({
              group: GROUPS.SOLVED_WITHOUT_ANSWER,
              key,
              value: questionsGroupedByCohort.length,
            })
            break
          }
          case COHORTS.COMMUNITY:
          default:
            data.push({
              group: GROUPS.ANSWERED_BY_COMMUNITY,
              key,
              value: questionsGroupedByCohort.length,
            })
            break
        }
      }
    }
    return data
  }

  $: data = createBarChartData(questions, timePeriod)
</script>

<BarChartStacked
  bind:data
  options="{{
    title: '',
    axes: {
      left: {
        title: 'Questions',
        mapsTo: 'value',
        stacked: true,
      },
      bottom: {
        title: 'Date',
        mapsTo: 'key',
        // @ts-expect-error - "time" is a valid value
        scaleType: 'time',
      },
    },
    color: {
      scale: {
        [GROUPS.SOLVED_WITHOUT_ANSWER]:
          'var(--ha-cohort-solved-without-answer)',
        [GROUPS.ANSWERED_BY_STAFF]: 'var(--ha-cohort-staff)',
        [GROUPS.ANSWERED_BY_COMMUNITY]: 'var(--ha-cohort-community)',
        [GROUPS.UNANSWERED]: 'var(--ha-cohort-unanswered)',
      },
    },
    grid: {
      x: {
        enabled: false,
      },
    },
    height: '400px',
  }}"
  theme="g100"
/>
