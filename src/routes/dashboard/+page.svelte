<script lang="ts">
  import '@carbon/styles/css/styles.css'
  import '@carbon/charts/styles.css'
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
  import { getTopContributors } from './helpers/contributors'
  import { timeBetweenDates } from './helpers/dates'
  import FilterMenu from './components/FilterMenu.svelte'
  import ChannelHealth from './components/ChannelHealth.svelte'
  import type { Contributor, Questions } from './types'
  import type { PageServerData } from './$types'

  export let data: PageServerData
  let {
    channels,
    contributors,
    gitHubStaff,
    memberCount,
    name,
    presenceCount,
    questions,
  } = data

  let today = new Date()
  let endDate = today
  let startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  let dates: Date[] = timeBetweenDates('months', [startDate, endDate])
  let filteredQuestions: Map<string, Questions> =
    filterQuestionsByChannelAndDate(channels, dates, questions)
  let filteredContributors: Contributor[] = filterAnswers(
    channels,
    [dates[0], today],
    contributors.all
  )
  let filteredStaffContributors: Contributor[] = filterAnswers(
    channels,
    [dates[0], today],
    contributors.staff
  )
  let topOverallPromise = getTopContributors(contributors.all, gitHubStaff, 9)
  let topStaffPromise = getTopContributors(contributors.staff, gitHubStaff, 9)
  const colors = [
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
  const chartColors = channels.reduce(
    (accumulator, channel, idx) => ({
      ...accumulator,
      [channel]:
        idx < colors.length - 1 ? colors[idx] : colors[idx % colors.length],
    }),
    {}
  )

  const tableHeaders = [
    { key: 'discord', value: 'Discord User' },
    { key: 'github', value: 'GitHub' },
    { key: 'name', value: 'Name' },
    { key: 'answers', value: 'Answers' },
  ]
  const getBarData = (filteredQuestions: Map<string, Questions>) => {
    const map = new Map(filteredQuestions)
    map.delete('aggregate')
    const values: Record<string, any>[] = []
    for (const [date, questionCategories] of map) {
      Object.entries(questionCategories).forEach(
        ([category, questionsArray]) => {
          values.push({
            group: category,
            key: date,
            value: questionsArray?.length,
          })
        }
      )
    }
    return values
  }

  $: filteredQuestions = filterQuestionsByChannelAndDate(
    channels,
    dates,
    questions
  )
  $: filteredContributors = filterAnswers(
    channels,
    [dates[0], today],
    contributors.all
  )
  $: filteredStaffContributors = filterAnswers(
    channels,
    [dates[0], today],
    contributors.staff
  )

  /** @TODO check for divide by zero */
  $: total = filteredQuestions.get('aggregate')?.total?.length ?? ''
  $: unanswered = filteredQuestions.get('aggregate')?.unanswered?.length ?? ''
  $: unansweredPct =
    total && unanswered
      ? `${Math.round((100 * parseInt(unanswered)) / parseInt(total))}%`
      : ''
  $: staff = filteredQuestions.get('aggregate')?.staff?.length ?? ''
  $: staffPct =
    total && staff
      ? `${Math.round((100 * parseInt(staff)) / parseInt(total))}%`
      : ''
  $: community = filteredQuestions.get('aggregate')?.community?.length ?? ''
  $: communityPct =
    total && staff
      ? `${Math.round((100 * parseInt(community)) / parseInt(total))}%`
      : ''

  $: barData = getBarData(filteredQuestions)
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
</script>

<svelte:head>
  <title>Discord Metrics Dashboard</title>
</svelte:head>

<Content>
  <Grid>
    <Row>
      <Column class="styled-col" style="background: rgb(15, 98, 254, 0.1);">
        <h1 class="number">
          {memberCount}
          <ArrowUp size="{32}" color="#0c4fcc" />
        </h1>
        <h4 class="number-text">Total Members</h4>
      </Column>
      <Column class="styled-col" style="background: rgb(0, 255, 0, 0.1);">
        <h1 class="number">
          {presenceCount}
          <Group size="{32}" color="#036b03" />
        </h1>
        <h4 class="number-text">Members Online</h4>
      </Column>
    </Row>
    <Row class="date-container">
      <Column style="max-width:min-content">
        <Row>
          <Column><h1>Questions</h1></Column><Column
            ><Button
              iconDescription="Download csv"
              kind="ghost"
              icon="{DocumentDownload}"
              on:click="{() => toCSVQuestions(channels, filteredQuestions)}"
            /></Column
          >
        </Row>
      </Column>
      <Column>
        <FilterMenu
          bind:dates
          bind:channels
          today="{today}"
          startDate="{startDate}"
          endDate="{endDate}"
        />
      </Column>
    </Row>
    <Row>
      <Column class="split-counts">
        <h1 class="number">{total}</h1>
        <h4 class="number-text">Total Questions</h4>
      </Column>
      <Column class="split-counts" style="color: rgb(255, 153, 0)">
        <h1 class="number">
          {staff}
          <Tag style="background-color:rgb(255, 153, 0, 0.6)">{staffPct}</Tag>
        </h1>
        <h4 class="number-text">Answered by Staff</h4>
      </Column>
      <Column class="split-counts" style="color:rgb(15, 98, 254)">
        <h1 class="number">
          {community}
          <Tag style="background-color:rgb(15, 98, 254, 0.6)"
            >{communityPct}</Tag
          >
        </h1>
        <h4 class="number-text">Answered by Community</h4>
      </Column>
      <Column class="split-counts" style="color: rgb(255, 0, 0);">
        <h1 class="number">
          {unanswered}
          <Tag style="background-color:rgb(255, 0, 0, 0.4)">{unansweredPct}</Tag
          >
        </h1>
        <h4 class="number-text">Unanswered</h4>
      </Column>
    </Row>
    <Row style="margin-top:16px">
      <Column>
        <BarChartStacked
          bind:data="{barData}"
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
                scaleType: 'time',
              },
            },
            color: {
              scale: {
                total: '#6f6f6f',
                staff: 'rgb(255, 153, 0, 0.8)',
                community: 'rgb(15, 98, 254)',
                unanswered: 'rgb(255, 0, 0, 0.7)',
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
        /></Column
      >
    </Row>
    <Row>
      <Column sm="{2}" md="{6}" lg="{8}" class="styled-col"
        ><ChannelHealth bind:filteredQuestions /></Column
      >
      <Column sm="{2}" md="{2}" lg="{4}" class="styled-col">
        <Row style="justify-content: center;" class="styled-col">
          <PieChart
            bind:data="{pieDataTotal}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'All questions',
              resizable: true,
              pie: {
                labels: {
                  enabled: false,
                },
                valueMapsTo: 'count',
              },
              height: '400px',
            }}"
            theme="g100"
          />
        </Row>
        <Row style="justify-content: center;" class="styled-col">
          <PieChart
            bind:data="{pieDataUnanswered}"
            options="{{
              color: {
                scale: chartColors,
              },
              title: 'Unanswered',
              resizable: true,
              pie: {
                labels: {
                  enabled: false,
                },
                valueMapsTo: 'count',
              },
              height: '400px',
            }}"
            theme="g100"
          />
        </Row>
      </Column>
    </Row>
    <h1 style="margin-top:12px;" class="number-text">Top Contributors</h1>
    <Row>
      <Column class="styled-col">
        <Row
          ><h2>
            Overall<CaretUp
              style="vertical-align:middle"
              color="green"
              size="{32}"
            />
          </h2></Row
        >
        <Row>
          {#await topOverallPromise}
            <DataTableSkeleton headers="{tableHeaders}" rows="{10}" />
          {:then topOverall}
            <DataTable headers="{tableHeaders}" rows="{topOverall}">
              <strong slot="description" style="font-size: 1rem">
                Download table contents <Button
                  iconDescription="Download CSV"
                  kind="ghost"
                  icon="{DocumentDownload}"
                  on:click="{() => toCSVContributors(topOverall, 'Overall')}"
                  style="vertical-align:middle"
                />
              </strong>
            </DataTable>
          {:catch error}
            <p>Failed to fetch top contributors: {error.message}</p>
          {/await}
        </Row>
      </Column>
      <Column class="styled-col">
        <Row
          ><h2>
            Staff<CaretUp
              style="vertical-align:middle"
              color="rgb(255, 153, 0, 0.6)"
              size="{32}"
            />
          </h2></Row
        >
        {#await topStaffPromise}
          <DataTableSkeleton headers="{tableHeaders}" rows="{10}" />
        {:then topStaff}
          <Row
            ><DataTable headers="{tableHeaders}" rows="{topStaff}">
              <strong slot="description" style="font-size: 1rem">
                Download table contents <Button
                  iconDescription="Download CSV"
                  kind="ghost"
                  icon="{DocumentDownload}"
                  on:click="{() => toCSVContributors(topStaff, 'Staff')}"
                  style="vertical-align:middle"
                />
              </strong></DataTable
            >
          </Row>
        {:catch error}
          <p>Failed to fetch top staff contributors: {error.message}</p>
        {/await}
      </Column>
    </Row>
  </Grid>
</Content>

<style>
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
