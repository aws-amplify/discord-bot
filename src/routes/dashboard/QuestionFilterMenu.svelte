<script lang="ts">
  import {
    Button,
    Column,
    DatePicker,
    DatePickerInput,
    Dropdown,
    MultiSelect,
    Row,
  } from 'carbon-components-svelte'
  import { TIME_PERIODS } from './constants'
  import { timeBetweenDates } from './helpers/legacy-dates'
  import type { TimePeriod } from './types'

  export let dates: Date[]
  export let today: Date
  export let startDate: Date
  export let endDate: Date
  export let channels: string[]
  export let tags: string[]
  export let timePeriod: TimePeriod = TIME_PERIODS.MONTH

  const availableTags = tags
  const availableChannels = channels

  // construct channel dropdown items
  const channelDropdownItems = channels.map((channel, idx) => ({
    id: idx,
    text: channel,
  }))

  // construct frequency (time period) items
  const frequencyDropdownItems = [
    { id: 0, text: 'Daily', disabled: false, value: 'days', description: '' },
    {
      id: 1,
      text: 'Weekly',
      disabled: false,
      value: TIME_PERIODS.WEEK,
      description: 'Starting Monday',
    },
    {
      id: 2,
      text: 'Monthly',
      disabled: false,
      value: TIME_PERIODS.MONTH,
      description: 'Starting first of the month',
    },
    {
      id: 3,
      text: 'Yearly',
      disabled: false,
      value: TIME_PERIODS.YEAR,
      description: 'Starting January 1',
    },
  ]

  // set initial selections
  let selectedChannelIds = channelDropdownItems.map((item) => item.id)
  let selectedTagIds = [...availableTags]
  let selectedFrequencyId = 2

  // update bound timePeriod
  $: timePeriod = frequencyDropdownItems.find(
    (item) => item.id === selectedFrequencyId
  )?.value as TimePeriod
  // update bound channels
  $: channels = availableChannels.filter((channel, idx) =>
    selectedChannelIds.includes(idx)
  )
  // update bound tags
  $: tags = availableTags.filter((tag) => selectedTagIds.includes(tag))
  // update bound dates
  $: dates = timeBetweenDates(timePeriod, [startDate, endDate])

  function onDateChange(event: CustomEvent) {
    startDate = event.detail.selectedDates[0]
    endDate = event.detail.selectedDates[1]
    dates = timeBetweenDates(timePeriod, event.detail.selectedDates)
  }

  function handleSelectAllChannels() {
    selectedChannelIds = channelDropdownItems.map((item) => item.id)
  }

  function handleSelectAllTags() {
    selectedTagIds = [...availableTags]
  }

  function getTagLabel(availableTags: string[], selectedTags: string[]) {
    if (availableTags.length === 0) {
      return 'No tags available'
    } else if (selectedTags.length === 0) {
      return 'Filter by tags'
    } else if (selectedTags.length === availableTags.length) {
      return 'All tags'
    } else {
      return selectedTags.join(', ')
    }
  }

  function getChannelLabel(
    availableChannels: string[],
    selectedChannels: number[]
  ) {
    if (availableChannels.length === 0) {
      return 'No channels available'
    } else if (selectedChannels.length === 0) {
      return 'Filter by channels'
    } else if (selectedChannels.length === availableChannels.length) {
      return 'All channels'
    } else {
      return availableChannels
        .filter((channel, idx) => selectedChannels.includes(idx))
        .join(', ')
    }
  }

  function getDateLabel() {
    return `${dates.length} ${timePeriod}${
      dates.length !== 1 ? 's' : ''
    } (beginning ${dates[0]?.toDateString() ?? ''})`
  }

  $: dateLabel = getDateLabel()
  $: tagLabel = getTagLabel(availableTags, selectedTagIds)
  $: channelLabel = getChannelLabel(channels, selectedChannelIds)
</script>

<Row padding>
  <Column>
    <section>
      <Dropdown
        class="frequency-selector"
        titleText="Frequency"
        bind:selectedId="{selectedFrequencyId}"
        items="{frequencyDropdownItems}"
        let:item
      >
        <div>
          <strong>{item.text}</strong>
        </div>
        <div>
          {item.description}
        </div>
      </Dropdown>

      <div>
        <DatePicker
          datePickerType="range"
          maxDate="{today}"
          on:change="{onDateChange}"
          valueFrom="{startDate.toLocaleDateString()}"
          valueTo="{endDate.toLocaleDateString()}"
        >
          <DatePickerInput labelText="FROM" placeholder="mm/dd/yyyy" />
          <DatePickerInput labelText="TO" placeholder="mm/dd/yyyy" />
        </DatePicker>
        <span class="bx--form__helper-text">{dateLabel}</span>
      </div>

      <div class="ha--filter-dropdown-container">
        <MultiSelect
          class="frequency-selector"
          items="{channelDropdownItems}"
          label="{channelLabel}"
          placeholder="All channels"
          titleText="Filter by Channel"
          bind:selectedIds="{selectedChannelIds}"
        />
        <div>
          <Button
            kind="secondary"
            size="field"
            disabled="{selectedChannelIds.length === availableChannels.length}"
            on:click="{handleSelectAllChannels}"
          >
            Select all
          </Button>
        </div>
      </div>

      <div class="ha--filter-dropdown-container">
        <MultiSelect
          titleText="Filter by tags"
          label="{tagLabel}"
          name="tags"
          items="{availableTags.map((name) => ({
            id: name,
            text: name,
          }))}"
          bind:selectedIds="{selectedTagIds}"
          itemToString="{(item) => item?.text}"
          placeholder="All tags"
        />
        <div>
          <Button
            kind="secondary"
            size="field"
            disabled="{selectedTagIds.length === availableTags.length}"
            on:click="{handleSelectAllTags}"
          >
            Select all
          </Button>
        </div>
      </div>
    </section>
  </Column>
</Row>

<style>
  :global(.flatpickr-calendar.open) {
    background-color: var(--cds-ui-01, #f4f4f4);
  }

  :global(.frequency-selector
      .bx--list-box__menu-item, .bx--list-box__menu-item__option) {
    height: auto;
  }

  .ha--filter-dropdown-container {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
  }

  .ha--filter-dropdown-container :global(.bx--list-box__label) {
    /* prevent span from causing overflow */
    max-width: 200px;
  }

  p {
    font-weight: 300;
    font-size: 14px;
  }

  section {
    display: grid;
    column-gap: var(--cds-spacing-04);
    row-gap: var(--cds-spacing-05);
  }

  @media (min-width: 640px) {
    section {
      grid-template-columns: 50% 50%;
    }
  }
</style>
