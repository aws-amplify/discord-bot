<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = ({ props }) => {
    return {
      props,
    }
  }
</script>

<script lang="ts">
  // import '@carbon/styles/css/styles.css'
  // import '@carbon/charts/styles.css'
  import {
    BarChartStacked,
    PieChart,
  } from '@carbon/charts-svelte'
  import {
    Column,
    Content,
    DataTable,
    Grid,
    Row,
    Tag,
  } from 'carbon-components-svelte'
  import { ArrowUp, CaretUp, Group } from 'carbon-icons-svelte'
  import { filterAnswers, filterQuestions, sortChannels } from './applyFilter'
  import { getTopContributors } from './contributors'
  import { timeBetweenDates } from './dates'
  import FilterMenu from './FilterMenu.svelte'
  import type { Contributors, Questions } from './types'

  export let channels: string[]
  export let contributors: Contributors
  export let memberCount: number
  export let name: string
  export let presenceCount: number
  export let questions: Questions

  let today = new Date()
  let endDate = today
  let startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  let dates: Date[] = timeBetweenDates('months', [startDate, endDate])
  let filteredQuestions = filterQuestions(channels, dates, questions)
  // let filteredContributors = filterAnswers(
  //   channels,
  //   [dates[0], today],
  //   allContributors
  // )

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

  // let topOverall = getTopContributors(allContributors, false)
  // let topStaff = getTopContributors(allContributors, true)

    $: filteredQuestions = filterQuestions(channels, dates, questions)
  //   $: filteredContributors = filterAnswers(
  //     channels,
  //     [dates[0], today],
  //     allContributors
  //   )

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
    $: pieDataStaff = sortChannels(filteredQuestions.get('aggregate')!.staff)
    $: pieDataCommunity= sortChannels(filteredQuestions.get('aggregate')!.community)
    $: pieDataUnanswered = sortChannels(filteredQuestions.get('aggregate')!.unanswered)
  //   $: topStaff = getTopContributors(filteredContributors, true)
  //   $: topOverall = getTopContributors(filteredContributors, false)
</script>

<svelte:head>
  <title>Discord Metrics Dashboard></title>
</svelte:head>

<Content>
  <Grid>
    <Row>
      <Column class="styled-row" style="background: rgb(15, 98, 254, 0.1);">
        <h1 class="number">
          {memberCount}
          <ArrowUp size="{32}" color="var(--cds-interactive-01, #0f62fe)" />
        </h1>
        <h4 class="number-text">Total Members</h4>
      </Column>
      <Column class="styled-row" style="background: rgb(0, 255, 0, 0.1);">
        <h1 class="number">
          {presenceCount}
          <Group size="{32}" color="green" />
        </h1>
        <h4 class="number-text">Members Online</h4>
      </Column>
    </Row>
    <Row class="date-container">
      <Column style="max-width:min-content"
        ><h2 style="font-weight: 300;">Questions</h2></Column
      >
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
      <Column >
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
        /></Column>
      <Row  style="justify-content: center;" class="styled-row">
      <Column style="display: grid; justify-content:center">
        <PieChart
          bind:data="{pieDataTotal}"
          options="{{
            title: 'All questions',
            resizable: true,
            pie: {
              valueMapsTo: 'count',
            },
            height: '400px',
          }}"
          theme="g100"
        />
      </Column>
      <Column class="styled-row">
        <PieChart
          bind:data="{pieDataStaff}"
          options="{{
            title: 'Answered Staff',
            resizable: true,
            pie: {
              valueMapsTo: 'count',
            },
            height: '400px',
          }}"
          theme="g100"
        />
      </Column> 
    <Column class="styled-row">
        <PieChart
          bind:data="{pieDataCommunity}"
          options="{{
            title: 'Answered Community',
            resizable: true,
            pie: {
              valueMapsTo: 'count',
            },
            height: '400px',
          }}"
          theme="g100"
        />
      </Column>
      <Column style="display: grid; justify-content:center">
        <PieChart
          bind:data="{pieDataUnanswered}"
          options="{{
            title: 'Unanswered',
            resizable: true,
            pie: {
              valueMapsTo: 'count',
            },
            height: '400px',
          }}"
          theme="g100"
        />
      </Column>
    </Row>
    </Row>
    <Row style="justify-content: center;" class="styled-row"
      ><h1 class="number-text">Top Contributors</h1></Row
    >
    <!-- <Row
      ><Column style="display: grid; justify-content:center">
        <Row>
          <h2>
            Overall <CaretUp
              style="vertical-align:middle"
              color="green"
              size="{32}"
            />
          </h2></Row
        >
        <Row
          ><DataTable
            headers="{[
              { key: 'name', value: 'User' },
              { key: 'answers', value: 'Answers' },
            ]}"
            bind:rows="{topOverall}"
          /></Row
        >
      </Column>
      <Column style="display: grid; justify-content:center"
        ><Row
          ><h2>
            Staff <CaretUp
              style="vertical-align:middle"
              color="rgb(255, 153, 0, 0.6)"
              size="{32}"
            />
          </h2></Row
        >
        <Row
          ><DataTable
            headers="{[
              { key: 'name', value: 'User' },
              { key: 'answers', value: 'Answers' },
            ]}"
            bind:rows="{topStaff}"
          /></Row
        ></Column
      ></Row
    > -->
  </Grid> 
</Content>

<style>
  :global(.styled-row) {
    flex-direction: row;
    position: relative;
    left: unset;
    bottom: unset;
    right: unset;
    margin: 6px;
    padding: 12px;
  }

  :global(.number-text) {
    font-weight: 300;
  }

  :global(.number) {
    font-size: 60px;
  }

  :global(.date-container) {
    flex-direction: row;
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
</style>
