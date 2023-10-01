export function getMonday(date: Date) {
  // sunday = 0
  const day = date.getDay() || 7
  if (day !== 1) {
    date.setHours(-24 * (day - 1))
  }
  return date
}
