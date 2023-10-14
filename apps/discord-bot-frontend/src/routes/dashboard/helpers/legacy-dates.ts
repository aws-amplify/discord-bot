import { TIME_PERIODS } from '../constants'

/**
 * rounds start date UP to the next whole week, month, or year
 */
function roundStartDate(timePeriod: string, start: Date): boolean {
  switch (timePeriod) {
    case TIME_PERIODS.DAY:
      return true
    case TIME_PERIODS.WEEK: // start at the closest Monday
      if (start.getDay() < 1) {
        start.setDate(start.getDate() + 1)
      } else if (start.getDay() !== 1) {
        start.setDate(start.getDate() + (7 - start.getDay()))
      }
      return true
    case TIME_PERIODS.MONTH: // start at the first of the month
      if (start.getDate() !== 1) {
        start.setDate(1)
        start.setMonth(start.getMonth() + 1)
      }
      return true
    case TIME_PERIODS.YEAR: // start on the first of January
      if (start.getMonth() !== 0 || start.getDate() !== 1) {
        start.setDate(1)
        start.setMonth(0)
        start.setFullYear(start.getFullYear() + 1)
      }
      return true
    default:
      return false
  }
}

/**
 * increments date based on unit of time by mutating the date
 */
function incrementDate(timePeriod: string, start: Date): boolean {
  switch (timePeriod) {
    case TIME_PERIODS.DAY:
      start.setDate(start.getDate() + 1)
      return true
    case TIME_PERIODS.WEEK:
      start.setDate(start.getDate() + 7)
      return true
    case TIME_PERIODS.MONTH:
      start.setMonth(start.getMonth() + 1)
      return true
    case TIME_PERIODS.YEAR:
      start.setFullYear(start.getFullYear() + 1)
      return true
    default:
      return false
  }
}

/**
 * creates a list of dates representing each chunk of
 * time between start and end
 */
export function timeBetweenDates(timePeriod: string, dateRange: Date[]) {
  const dates = []
  const start = new Date(dateRange[0])
  roundStartDate(timePeriod, start)
  while (start <= dateRange[1]) {
    dates.push(new Date(start))
    if (!incrementDate(timePeriod, start)) return dates
  }
  return dates
}
