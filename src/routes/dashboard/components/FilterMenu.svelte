<script lang="ts">
  import {
    Column,
    DatePicker,
    DatePickerInput,
    Dropdown,
    MultiSelect,
    Row,
  } from 'carbon-components-svelte'
  import { timeBetweenDates } from '../helpers/dates'

  export let dates: Date[]
  export let today: Date
  export let startDate: Date
  export let endDate: Date
  export let channels: string[]
  export let tags: string[]

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const availableTags = tags

  // filter by channel
  const channelDropdownItems: { id: string; text: string }[] = []

  for (const [idx, channel] of channels.entries()) {
    channelDropdownItems.push({
      id: idx.toString(),
      text: channel,
    })
  }

  let channel_selectedIds = channelDropdownItems.map((item) => item.id)
  let tag_selectedIds = tags

  // filter by date
  let frequency_selectedId = '2'
  const frequencyDropdownItems = [
    { id: '0', text: 'Daily', disabled: false, value: 'days', description: '' },
    {
      id: '1',
      text: 'Weekly',
      disabled: false,
      value: 'weeks',
      description: 'Starting Monday',
    },
    {
      id: '2',
      text: 'Monthly',
      disabled: false,
      value: 'months',
      description: 'Starting first of the month',
    },
    {
      id: '3',
      text: 'Yearly',
      disabled: false,
      value: 'years',
      description: 'Starting January 1',
    },
  ]

  const onDateChange = (d: CustomEvent) => {
    startDate = d.detail.selectedDates[0]
    endDate = d.detail.selectedDates[1]
    dates = timeBetweenDates(frequency, d.detail.selectedDates)
  }

  const getChannels = (channel_selectedIds: string[]) => {
    return channel_selectedIds.map(
      (id) => channelDropdownItems.find((item) => item.id === id)?.text
    )
  }

  const getTags = (tag_selectedIds: string[]) => {
    return tag_selectedIds.map((id) => availableTags.find((tag) => tag === id))
  }

  const frequencySpelling = () =>
    dates.length === 1 ? frequency.slice(0, -1) : frequency

  $: label = `${dates.length} ${frequencySpelling()} (beginning ${
    dates[0]?.toDateString() ?? ''
  })`
  $: frequency =
    frequencyDropdownItems.find((item) => item.id === frequency_selectedId)
      ?.value ?? ''
  $: channels = getChannels(channel_selectedIds)
  $: tags = getTags(tag_selectedIds)
  $: dates = timeBetweenDates(frequency, [startDate, endDate])
</script>

<Row>
  <Column>
    <Dropdown
      class="frequency-selector"
      titleText="Frequency"
      bind:selectedId="{frequency_selectedId}"
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
  </Column>
  <Column>
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
    <p>{label}</p>
  </Column>
  <Column>
    <MultiSelect
      class="frequency-selector"
      items="{channelDropdownItems}"
      titleText="Filter by Channel"
      bind:selectedIds="{channel_selectedIds}"
    />
    <MultiSelect
      titleText="Filter by tags"
      label="{tag_selectedIds.length === availableTags.length
        ? 'All tags'
        : tag_selectedIds.length === 0
        ? 'Filter by tags'
        : tag_selectedIds.join(', ')}"
      name="tags"
      items="{availableTags.map((name) => ({
        id: name,
        text: name,
      }))}"
      bind:selectedIds="{tag_selectedIds}"
      itemToString="{(item) => item?.text}"
      placeholder="All tags"
    />
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

  p {
    font-weight: 300;
    font-size: 14px;
  }
</style>
