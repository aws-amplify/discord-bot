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

  // filter by channel
  const channelDropdownItems: { id: string; text: string }[] = []
  let i = 0
  for (const channel of channels) {
    channelDropdownItems.push({
      id: i.toString(),
      text: channel,
    })
    i++
  }

  let channel_selectedIds = channelDropdownItems.map((item) => item.id)

  // filter by date
  let frequency_selectedId = '2'
  const frequencyDropdownItems = [
    { id: '0', text: 'Daily', disabled: false, value: 'days' },
    { id: '1', text: 'Weekly', disabled: false, value: 'weeks' },
    { id: '2', text: 'Monthly', disabled: false, value: 'months' },
    { id: '3', text: 'Yearly', disabled: false, value: 'years' },
  ]

  const onDateChange = (d: CustomEvent) => {
    startDate = d.detail.selectedDates[0]
    endDate = d.detail.selectedDates[1]
    dates = timeBetweenDates(frequency, d.detail.selectedDates)
  }

  const getChannels = (channel_selectedIds: string[]) => channel_selectedIds.map(id => channelDropdownItems.find(item => item.id === id)?.text)

  const frequencySpelling = () =>
    dates.length === 1 ? frequency.slice(0, -1) : frequency

  $: label = `${dates.length} ${frequencySpelling()}`
  $: frequency =
    frequencyDropdownItems.find((item) => item.id === frequency_selectedId)
      ?.value ?? ''
  $: channels = getChannels(channel_selectedIds) 
  $: dates = timeBetweenDates(frequency, [startDate, endDate])
</script>

<Row class="filter">
  <Column style="max-width:min-content">
    <Dropdown
      class="frequency-selector"
      titleText="Frequency"
      bind:selectedId="{frequency_selectedId}"
      items="{frequencyDropdownItems}"
    />
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
    <p style="font-weight:260; text-align:center;">{label}</p>
  </Column>
  <Column
    ><MultiSelect
      class="frequency-selector"
      items="{channelDropdownItems}"
      titleText="Channel"
      bind:selectedIds="{channel_selectedIds}"
    />
  </Column>
</Row>

<style>
  :global(.flatpickr-calendar.open) {
    background-color: var(--cds-ui-01, #f4f4f4);
  }
</style>
