/** rounds start date UP to the next whole week, month, or year */
function roundStartDate(unit: string, start: Date): boolean {
  switch (unit) {
    case 'days':
      return true
    case 'weeks': // start at the closest Monday
      if (start.getDay() < 1) {
        start.setDate(start.getDate() + 1)
      } else if (start.getDay() !== 1) {
        start.setDate(start.getDate() + (7 - start.getDay()))
      }
      return true
    case 'months': // start at the first of the month
      if (start.getDate() !== 1) {
        start.setDate(1)
        start.setMonth(start.getMonth() + 1)
      }
      return true
    case 'years': // start on the first of January
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

/** increments date based on unit of time by mutating the date */
function incrementDate(unit: string, start: Date): boolean {
  switch (unit) {
    case 'days':
      start.setDate(start.getDate() + 1)
      return true
    case 'weeks':
      start.setDate(start.getDate() + 7)
      return true
    case 'months':
      start.setMonth(start.getMonth() + 1)
      return true
    case 'years':
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
export function timeBetweenDates(unit: string, dateRange: Date[]) {
  const dates = []
  const start = new Date(dateRange[0])
  roundStartDate(unit, start)
  while (start <= dateRange[1]) {
    dates.push(new Date(start))
    if (!incrementDate(unit, start)) return dates
  }
  return dates
}
