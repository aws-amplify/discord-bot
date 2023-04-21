<script lang="ts">
  import {
    Button,
    Column,
    Content,
    DataTable,
    DataTableSkeleton,
    Grid,
    Row,
  } from 'carbon-components-svelte'
  import { CaretUp, DocumentDownload } from 'carbon-icons-svelte'
  import { downloadCSV } from './helpers/download-csv'
  import { toCSV } from './helpers/to-csv'
  import { filterAnswers } from './helpers/filter-answers'
  import { filterQuestions } from './helpers/filter-questions'
  import { groupQuestions } from './helpers/group-questions'
  import { getTopContributors } from './helpers/legacy-contributors'
  import { timeBetweenDates } from './helpers/legacy-dates'
  import { COHORTS, TIME_PERIODS } from './constants'
  import ChannelHealthTable from './ChannelHealthTable.svelte'
  import ForumChannelTagHealthTable from './ForumChannelTagHealthTable.svelte'
  import GuildMembers from './GuildMembers.svelte'
  import QuestionBarChart from './QuestionBarChart.svelte'
  import QuestionPieChart from './QuestionPieChart.svelte'
  import QuestionBreakdownCards from './QuestionBreakdownCards.svelte'
  import QuestionFilterMenu from './QuestionFilterMenu.svelte'
  import type { Contributor, TimePeriod } from './types'
  import type { PageServerData } from './$types'

  export let data: PageServerData
  let {
    allHelpChannels,
    allQuestions,
    availableTags,
    contributors,
    gitHubStaff,
    guild,
  } = data

  let today = new Date()
  let endDate = today
  let startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  let dates: Date[] = timeBetweenDates('months', [startDate, endDate])

  let filteredContributors: Contributor[] = filterAnswers(
    allHelpChannels,
    [dates[0], today],
    contributors.all
  )
  let filteredStaffContributors: Contributor[] = filterAnswers(
    allHelpChannels,
    [dates[0], today],
    contributors.staff
  )
  let topOverallPromise = getTopContributors(contributors.all, gitHubStaff, 9)
  let topStaffPromise = getTopContributors(contributors.staff, gitHubStaff, 9)

  const tableHeaders = [
    { key: 'discord', value: 'Discord User' },
    { key: 'github', value: 'GitHub' },
    { key: 'name', value: 'Name' },
    { key: 'answers', value: 'Answers' },
  ]

  $: filteredContributors = filterAnswers(
    allHelpChannels,
    [dates[0], today],
    contributors.all
  )
  $: filteredStaffContributors = filterAnswers(
    allHelpChannels,
    [dates[0], today],
    contributors.staff
  )

  $: topStaffPromise = getTopContributors(
    filteredStaffContributors,
    gitHubStaff,
    9
  )
  $: topOverallPromise = getTopContributors(
    filteredContributors,
    gitHubStaff,
    9
  )

  /**
   * Selected start date
   * @default "3 months ago"
   */
  let selectedStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  /**
   * Selected end date
   * @default "today"
   */
  let selectedEndDate = today
  /**
   * Selected time period
   */
  let selectedTimePeriod: TimePeriod = TIME_PERIODS.MONTH
  /**
   * Selected post tags
   */
  let selectedTags: string[] = [...availableTags]
  /**
   * Selected channels
   */
  let selectedChannels: string[] = [...allHelpChannels]

  /**
   * @todo rename this when we have finished the migration to the revised helpers
   * @todo fix the need to typecast
   */
  $: filteredQuestions = filterQuestions(allQuestions, {
    channels: selectedChannels,
    dates: [selectedStartDate, selectedEndDate],
    tags: selectedTags,
  })

  /**
   * Questions grouped by cohort. In this sense, cohort is a group of questions by status
   */
  $: questionsGroupedByCohort = groupQuestions(filteredQuestions, {
    by: 'cohort',
  })
  $: questionsGroupedByChannel = groupQuestions(filteredQuestions, {
    by: 'channel',
  })
  $: questionsGroupedByTag = groupQuestions(filteredQuestions, {
    by: 'tag',
  })

  /**
   * Unanswered questions by tag, used by pie chart
   */
  $: unansweredQuestionsByTag = groupQuestions(
    filterQuestions(filteredQuestions, {
      isSolved: false,
    }),
    {
      by: 'tag',
    }
  )

  /**
   * Unanswered questions by channel, used by pie chart
   */
  $: unansweredQuestionsByChannel = groupQuestions(
    filterQuestions(filteredQuestions, {
      isSolved: false,
    }),
    {
      by: 'channel',
    }
  )

  /**
   * Question breakdown - fed into cards
   */
  $: questionBreakdown = [
    {
      title: 'Total Questions',
      count: filteredQuestions.length,
    },
    {
      title: 'Answered by Staff',
      count: questionsGroupedByCohort[COHORTS.STAFF]?.length || 0,
      color: 'var(--ha-cohort-staff)',
      percentageColor: 'var(--ha-cohort-staff-dim)',
      percentage: Math.round(
        (questionsGroupedByCohort[COHORTS.STAFF]?.length /
          filteredQuestions.length) *
          100
      ),
    },
    {
      title: 'Answered by Community',
      count: questionsGroupedByCohort[COHORTS.COMMUNITY]?.length || 0,
      color: 'var(--ha-cohort-community)',
      percentageColor: 'var(--ha-cohort-community-dim)',
      percentage: Math.round(
        (questionsGroupedByCohort[COHORTS.COMMUNITY]?.length /
          filteredQuestions.length) *
          100
      ),
    },
    {
      title: 'Solved without answer',
      count:
        questionsGroupedByCohort[COHORTS.SOLVED_WITHOUT_ANSWER]?.length || 0,
      color: 'var(--ha-cohort-solved-without-answer)',
      percentageColor: 'var(--ha-cohort-solved-without-answer-dim)',
      percentage: Math.round(
        (questionsGroupedByCohort[COHORTS.SOLVED_WITHOUT_ANSWER]?.length /
          filteredQuestions.length) *
          100
      ),
    },
    {
      title: 'Unanswered',
      count: questionsGroupedByCohort[COHORTS.UNANSWERED]?.length || 0,
      color: 'var(--ha-cohort-unanswered)',
      percentageColor: 'var(--ha-cohort-unanswered-dim)',
      percentage: Math.round(
        (questionsGroupedByCohort[COHORTS.UNANSWERED]?.length /
          filteredQuestions.length) *
          100
      ),
    },
  ]

  $: console.log()
</script>

<svelte:head>
  <title>Discord Metrics Dashboard</title>
</svelte:head>

<Content>
  <div class="ha-dashboard--container">
    <Grid>
      <Row>
        <Column>
          <h1>Questions Dashboard</h1>
        </Column>
        <Column>
          <div
            style:display="flex"
            style:align-items="center"
            style:justify-content="flex-end"
          >
            <Button
              iconDescription="Download CSV"
              kind="ghost"
              icon="{DocumentDownload}"
              on:click="{() =>
                downloadCSV(toCSV(filteredQuestions), `discord-questions.csv`)}"
            >
              Download CSV
            </Button>
          </div>
        </Column>
      </Row>
      <GuildMembers guild="{guild}" />
      <QuestionFilterMenu
        bind:dates
        bind:channels="{selectedChannels}"
        bind:tags="{selectedTags}"
        bind:timePeriod="{selectedTimePeriod}"
        today="{today}"
        startDate="{startDate}"
        endDate="{endDate}"
      />
      <Row padding>
        <Column>
          <QuestionBreakdownCards breakdown="{questionBreakdown}" />
        </Column>
      </Row>
      <!-- answer breakdown -->
      <Row padding>
        <Column>
          <QuestionBarChart
            bind:questions="{filteredQuestions}"
            timePeriod="{selectedTimePeriod}"
          />
        </Column>
      </Row>
      <!-- pie charts for channels -->
      <Row padding>
        <Column sm="{4}" lg="{8}">
          <QuestionPieChart
            bind:data="{questionsGroupedByChannel}"
            title="All Questions by Channel"
          />
        </Column>
        <Column sm="{4}" lg="{8}">
          <QuestionPieChart
            bind:data="{unansweredQuestionsByChannel}"
            title="Unanswered Questions by Channel"
          />
        </Column>
      </Row>
      <!-- pie charts for tags -->
      <Row padding>
        <Column sm="{4}" lg="{8}">
          <QuestionPieChart
            bind:data="{questionsGroupedByTag}"
            title="All questions by Tag"
          />
        </Column>
        <Column sm="{4}" lg="{8}">
          <QuestionPieChart
            bind:data="{unansweredQuestionsByTag}"
            title="Unanswered questions by Tag"
          />
        </Column>
      </Row>
      <!-- channel health -->
      <Row padding>
        <Column>
          <ChannelHealthTable
            bind:questions="{filteredQuestions}"
            allHelpChannels="{allHelpChannels}"
          />
        </Column>
      </Row>
      <!-- tag health -->
      <Row padding>
        <Column>
          <ForumChannelTagHealthTable bind:questions="{filteredQuestions}" />
        </Column>
      </Row>
      <section aria-label="Top Contributors">
        <Row padding>
          <!-- <h2>Top Contributors</h2> -->
          <Column sm="{4}" lg="{8}">
            {@const title = 'Top Overall'}
            {#await topOverallPromise}
              <DataTableSkeleton
                title="{title}"
                headers="{tableHeaders}"
                rows="{10}"
              />
            {:then topOverall}
              <DataTable
                title="{title}"
                headers="{tableHeaders}"
                rows="{topOverall}"
              >
                <!-- <strong slot="description" style="font-size: 1rem">
                Download table contents <Button
                  iconDescription="Download CSV"
                  kind="ghost"
                  icon="{DocumentDownload}"
                  on:click="{() => toCSVContributors(topOverall, 'Overall')}"
                  style="vertical-align:middle"
                />
              </strong> -->
                <svelte:fragment slot="title">
                  {title}
                  <CaretUp
                    style="vertical-align:middle"
                    color="green"
                    size="{32}"
                  />
                </svelte:fragment>
              </DataTable>
            {:catch error}
              <p>Failed to fetch top contributors: {error.message}</p>
            {/await}
          </Column>
          <Column sm="{4}" lg="{8}">
            {@const title = 'Top Staff'}
            {#await topStaffPromise}
              <DataTableSkeleton
                title="{title}"
                headers="{tableHeaders}"
                rows="{10}"
              />
            {:then topStaff}
              <DataTable
                title="{title}"
                headers="{tableHeaders}"
                rows="{topStaff}"
              >
                <svelte:fragment slot="title">
                  {title}
                  <CaretUp
                    style="vertical-align:middle"
                    color="var(--ha-cohort-staff-dim)"
                    size="{32}"
                  />
                </svelte:fragment>
                <!-- <strong slot="description" style="font-size: 1rem">
                  Download table contents <Button
                    iconDescription="Download CSV"
                    kind="ghost"
                    icon="{DocumentDownload}"
                    on:click="{() => toCSVContributors(topStaff, 'Staff')}"
                    style="vertical-align:middle"
                  />
                </strong> -->
              </DataTable>
            {:catch error}
              <p>Failed to fetch top staff contributors: {error.message}</p>
            {/await}
          </Column>
        </Row>
      </section>
    </Grid>
  </div>
</Content>

<style>
  .ha-dashboard--container {
    --ha-cohort-staff: rgb(255, 153, 0);
    --ha-cohort-staff-dim: rgb(255, 153, 0, 0.6);
    --ha-cohort-community: rgb(15, 98, 254);
    --ha-cohort-community-dim: rgb(15, 98, 254, 0.6);
    --ha-cohort-unanswered: rgb(255, 0, 0);
    --ha-cohort-unanswered-dim: rgb(255, 0, 0, 0.6);
    --ha-cohort-total: rgb(198, 198, 198);
    --ha-cohort-total-dim: rgb(198, 198, 198, 0.6);
    --ha-cohort-solved-without-answer: rgb(0, 170, 0);
    --ha-cohort-solved-without-answer-dim: rgb(0, 170, 0, 0.6);

    --ha-health-low: rgb(255, 0, 0, 0.4);
    --ha-health-okay: rgb(255, 153, 0, 0.4);
    --ha-health-good: rgb(0, 170, 0, 0.4);
  }

  :global(.styled-col) {
    flex: 1;
    position: relative;
    left: unset;
    bottom: unset;
    right: unset;
    margin: 6px;
    padding: 12px;
  }

  :globa(.column-container) {
    display: flex;
    width: 100%;
  }

  :global(.number-text) {
    font-weight: 300;
  }

  :global(.number) {
    font-size: 60px;
  }

  :global(.date-container) {
    position: relative;
    margin-top: 6px;
    padding-top: 12px;
    width: 100%;
  }

  :global(.split-counts) {
    background: rgb(198, 198, 198, 0.05);
    margin: 6px;
    padding: 12px;
    margin-top: 20px;
  }

  :global(.date-container .bx--tooltip__label) {
    font-size: 36px;
    font-weight: 300;
    color: white;
  }
</style>
