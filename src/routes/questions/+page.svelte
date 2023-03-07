<script lang="ts">
  import {
    Content,
    Dropdown,
    Grid,
    Row,
    Column,
    UnorderedList,
    ListItem,
    Link,
    MultiSelect,
  } from 'carbon-components-svelte'
  import type { Question } from '@prisma/client'
  import type { PageData } from './$types'

  export let data: PageData
  $: ({ questions } = data)
  let filtered: Question[] = questions

  let availableChannels: string[] = []
  $: availableChannels = Array.from(
    new Set(questions.map(({ channelName }) => channelName))
  )
  $: availableTags = Array.from(
    new Set(questions.map(({ tags }) => tags.map(({ name }) => name)).flat())
  ).sort((a, b) => a.localeCompare(b))

  $: statusFilter = ['solved', 'unsolved']
  $: channelFilter = availableChannels
  $: tagFilter = availableTags

  function handleFilterByStatus(event: CustomEvent) {
    statusFilter = event.detail.selectedIds
  }

  function handleFilterByChannel(event: CustomEvent) {
    channelFilter = event.detail.selectedIds
  }

  function handleFilterByTag(event: CustomEvent) {
    tagFilter = event.detail.selectedIds
  }

  const sortByFields = {
    title: (a: Question, b: Question) => a.title.localeCompare(b.title),
    channelName: (a: Question, b: Question) =>
      a.channelName.localeCompare(b.channelName),
    isSolved: (a: Question, b: Question) => (a.isSolved > b.isSolved ? 1 : -1),
  }

  let selectedSortBy: keyof typeof sortByFields = 'isSolved'
  let selectedSortDirection: 'ASC' | 'DESC' = 'ASC'

  function sortBy(
    field: keyof typeof sortByFields,
    direction: 'ASC' | 'DESC' = 'ASC'
  ) {
    const sorted = filtered.sort(sortByFields[field])
    if (direction === 'DESC') {
      return sorted.reverse()
    }
    return sorted
  }

  function handleSortBy(event: CustomEvent) {
    const field = event.detail.selectedId as keyof typeof sortByFields
    selectedSortBy = field
    filtered = sortBy(field, selectedSortDirection)
  }

  function handleSortDirection(event: CustomEvent) {
    if (selectedSortDirection !== event.detail.selectedId) {
      filtered = sortBy(selectedSortBy, event.detail.selectedId)
    }
    selectedSortDirection = event.detail.selectedId
  }

  $: filtered = questions
    .filter((question) => {
      if (
        statusFilter.includes(question.isSolved ? 'solved' : 'unsolved') &&
        channelFilter.includes(question.channelName) &&
        question.tags.some(({ name }) => tagFilter.includes(name))
      ) {
        return true
      }
      // handle the case of text channel questions where there are no tags
      if (tagFilter.length === 0 && question.tags.length === 0) {
        return true
      }
      return false
    })
    .sort(sortByFields[selectedSortBy])
</script>

<svelte:head>
  <title>Discord Questions</title>
</svelte:head>

<Content>
  <Grid>
    <Row>
      <Column class="ha--questions">
        <h1>Discord Questions</h1>
        <div>
          <MultiSelect
            titleText="Filter by status"
            label="{statusFilter.length === 2
              ? 'All statuses'
              : statusFilter.length === 1
              ? statusFilter[0] === 'solved'
                ? 'Solved'
                : 'Unsolved'
              : ''}"
            name="status"
            items="{[
              { id: 'solved', text: 'Solved' },
              { id: 'unsolved', text: 'Unsolved' },
            ]}"
            selectedIds="{statusFilter}"
            itemToString="{(item) => item?.text}"
            placeholder="All statuses"
            size="xl"
            on:select="{handleFilterByStatus}"
          />
          <div id="filter-by-channel">
            <MultiSelect
              titleText="Filter by channel"
              label="{channelFilter.length === availableChannels.length
                ? 'All channels'
                : channelFilter.length === 0
                ? 'Filter by channel'
                : channelFilter.join(', ')}"
              name="channel"
              items="{availableChannels.map((name) => ({
                id: name,
                text: name,
              }))}"
              selectedIds="{channelFilter}"
              itemToString="{(item) => item?.text}"
              placeholder="All channels"
              size="xl"
              on:select="{handleFilterByChannel}"
            />
          </div>
          <MultiSelect
            titleText="Filter by tags"
            label="{tagFilter.length === availableTags.length
              ? 'All tags'
              : tagFilter.length === 0
              ? 'Filter by tags'
              : tagFilter.join(', ')}"
            name="tags"
            items="{availableTags.map((name) => ({
              id: name,
              text: name,
            }))}"
            selectedIds="{availableTags}"
            itemToString="{(item) => item?.text}"
            placeholder="All tags"
            size="xl"
            on:select="{handleFilterByTag}"
          />
          <Dropdown
            titleText="Sort by"
            items="{[
              { id: 'title', text: 'Title' },
              { id: 'channelName', text: 'Channel' },
              { id: 'isSolved', text: 'Status' },
            ]}"
            itemToString="{(item) => item?.text}"
            placeholder="Sort by"
            selectedId="{selectedSortBy}"
            size="xl"
            on:select="{handleSortBy}"
          />
          <Dropdown
            titleText="Sort direction"
            items="{[
              { id: 'ASC', text: 'ASC' },
              { id: 'DESC', text: 'DESC' },
            ]}"
            itemToString="{(item) => item?.text}"
            placeholder="Direction"
            selectedId="{selectedSortDirection}"
            size="xl"
            on:select="{handleSortDirection}"
          />
        </div>
        <UnorderedList>
          {#each filtered as question}
            <ListItem>
              <Link href="{`/questions/${question.id}`}">
                {question.isSolved ? '✅' : '﹖'} [{question.channelName}] {question.title}
              </Link>
            </ListItem>
          {/each}
        </UnorderedList>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  div {
    display: flex;
    flex-direction: row;
    gap: var(--cds-spacing-03);
    position: relative;
    left: unset;
    bottom: unset;
    right: unset;
  }

  @media (max-width: 33rem) {
    div {
      flex-direction: column;
    }
  }

  :global(.ha--questions) {
    display: grid;
    grid-gap: var(--cds-layout-02);
  }

  #filter-by-channel {
    flex-grow: 1;
    /* quick hack to show a list of channels but not allow it to overflow */
    max-width: 90vw;
  }

  @media (min-width: 33rem) {
    #filter-by-channel {
      max-width: 50vw;
    }
  }

  #filter-by-channel :global(.bx--multi-select__wrapper) {
    width: 100%;
  }
</style>
