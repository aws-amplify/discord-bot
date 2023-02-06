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

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  // filter by channel
  const channelDropdownItems: { id: string; text: string }[] = []

  for (const [idx, channel] of channels.entries()) {
    channelDropdownItems.push({
      id: idx.toString(),
      text: channel,
    })
  }

  let channel_selectedIds = channelDropdownItems.map((item) => item.id)

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

  const getChannels = (channel_selectedIds: string[]) =>
    channel_selectedIds.map(
      (id) => channelDropdownItems.find((item) => item.id === id)?.text
    )

  const frequencySpelling = () =>
    dates.length === 1 ? frequency.slice(0, -1) : frequency

  $: label = `${dates.length} ${frequencySpelling()} (beginning ${
    dates[0]?.toDateString() ?? ''
  })`
  $: frequency =
    frequencyDropdownItems.find((item) => item.id === frequency_selectedId)
      ?.value ?? ''
  $: channels = getChannels(channel_selectedIds)
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

  :global(.frequency-selector
      .bx--list-box__menu-item, .bx--list-box__menu-item__option) {
    height: auto;
  }

  p {
    font-weight: 300;
    font-size: 14px;
  }
</style>
