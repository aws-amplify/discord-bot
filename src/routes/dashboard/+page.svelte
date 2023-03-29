<script lang="ts">
  import { BarChartStacked, PieChart } from '@carbon/charts-svelte'
  import {
    Button,
    Column,
    Content,
    DataTable,
    DataTableSkeleton,
    Grid,
    Row,
    Tag,
  } from 'carbon-components-svelte'
  import {
    ArrowUp,
    CaretUp,
    DocumentDownload,
    Group,
  } from 'carbon-icons-svelte'
  import { toCSVContributors, toCSVQuestions } from './csv/downloadCSV'
  import { sortChannels } from './helpers/channels'
  import {
    filterAnswers,
    filterQuestionsByChannelAndDate,
  } from './helpers/filter'
  import { filterQuestions } from './helpers/filter-questions'
  import { groupQuestions } from './helpers/group-questions'
  import { getTopContributors } from './helpers/contributors'
  import { timeBetweenDates } from './helpers/dates'
  import { COHORTS } from './constants'
  import ChannelHealthOld from './components/ChannelHealth.svelte'
  import ChannelHealthTable from './ChannelHealthTable.svelte'
  import ForumChannelTagHealthTable from './ForumChannelTagHealthTable.svelte'
  import GuildMembers from './GuildMembers.svelte'
  import QuestionBarChart from './QuestionBarChart.svelte'
  import QuestionBreakdownCards from './QuestionBreakdownCards.svelte'
  import QuestionFilterMenu from './QuestionFilterMenu.svelte'
  import type {
    Contributor,
    Question,
    Questions,
    QuestionBreakdownItem,
  } from './types'
  import type { PageServerData } from './$types'

  export let data: PageServerData
  let {
    allHelpChannels,
    allQuestions,
    availableTags,
    contributors,
    gitHubStaff,
    guild,
    tags,
    questions,
  } = data

  let today = new Date()
  let endDate = today
  let startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  let dates: Date[] = timeBetweenDates('months', [startDate, endDate])
  let filteredQuestions: Map<string, Questions> =
    filterQuestionsByChannelAndDate(questions, allHelpChannels, [], dates)
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
  ]
  const chartColors = allHelpChannels.reduce(
    (accumulator, channel, idx) => ({
      ...accumulator,
      [channel]:
        idx < availableChartColors.length - 1
          ? availableChartColors[idx]
          : availableChartColors[idx % availableChartColors.length],
    }),
    {}
  )

  const tableHeaders = [
    { key: 'discord', value: 'Discord User' },
    { key: 'github', value: 'GitHub' },
    { key: 'name', value: 'Name' },
    { key: 'answers', value: 'Answers' },
  ]

  /**
   * filtered questions by category ("all", "unanswered", "staff", "community")
   */
  $: filteredQuestions = filterQuestionsByChannelAndDate(
    questions,
    allHelpChannels,
    selectedTags,
    dates
  )
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

  /** @TODO check for divide by zero */
  $: total = filteredQuestions.get('aggregate')?.total?.length ?? ''
  $: unanswered = filteredQuestions.get('aggregate')?.unanswered?.length ?? ''
  $: staff = filteredQuestions.get('aggregate')?.staff?.length ?? ''
  $: community = filteredQuestions.get('aggregate')?.community?.length ?? ''
  $: pieDataTotal = sortChannels(filteredQuestions.get('aggregate')!.total)
  $: pieDataUnanswered = sortChannels(
    filteredQuestions.get('aggregate')!.unanswered
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

  // add tag pie charts
  // add tag health charts

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
  let selectedTimePeriod = 'months'
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
  $: filteredQuestions2 = filterQuestions(allQuestions, {
    dates: [selectedStartDate, selectedEndDate],
    tags: selectedTags,
  })

  $: questionsGroupedByCohort = groupQuestions(filteredQuestions2, {
    by: 'cohort',
  })

  /**
   * Question breakdown - fed into cards
   */
  $: questionBreakdown = [
    {
      title: 'Total Questions',
      count: filteredQuestions2.length,
    },
    {
      title: 'Answered by Staff',
      count: questionsGroupedByCohort[COHORTS.STAFF]?.length || 0,
      color: 'var(--ha-cohort-staff)',
      percentageColor: 'var(--ha-cohort-staff-dim)',
      percentage: Math.round(
        (questionsGroupedByCohort[COHORTS.STAFF]?.length /
          filteredQuestions2.length) *
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
          filteredQuestions2.length) *
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
          filteredQuestions2.length) *
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
          filteredQuestions2.length) *
          100
      ),
    },
  ]
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
                toCSVQuestions(allHelpChannels, filteredQuestions)}"
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
            bind:questions="{filteredQuestions2}"
            timePeriod="{'month'}"
          />
        </Column>
      </Row>
      <!-- pie charts for channels -->
      <Row padding>
        <Column sm="{4}" lg="{8}">
          <PieChart
            bind:data="{pieDataTotal}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'All questions by Channel',
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
              height: '400px',
            }}"
            theme="g100"
          />
        </Column>
        <Column sm="{4}" lg="{8}">
          <PieChart
            bind:data="{pieDataUnanswered}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'Unanswered Questions by Channel',
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
              height: '400px',
            }}"
            theme="g100"
          />
        </Column>
      </Row>
      <!-- pie charts for tags -->
      <Row padding>
        <Column sm="{4}" lg="{8}">
          <PieChart
            bind:data="{pieDataTotal}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'All questions by Tag',
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
              height: '400px',
            }}"
            theme="g100"
          />
        </Column>
        <Column sm="{4}" lg="{8}">
          <PieChart
            bind:data="{pieDataUnanswered}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'Unanswered Questions by Tag',
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
              height: '400px',
            }}"
            theme="g100"
          />
        </Column>
      </Row>
      <!-- channel health -->
      <Row padding>
        <Column>
          <ChannelHealthTable
            questions="{filteredQuestions2}"
            allHelpChannels="{allHelpChannels}"
          />
        </Column>
      </Row>
      <!-- tag health -->
      <Row padding>
        <Column>
          <ForumChannelTagHealthTable questions="{filteredQuestions2}" />
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
