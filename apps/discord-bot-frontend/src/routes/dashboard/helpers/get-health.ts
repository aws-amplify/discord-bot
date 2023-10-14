/**
 * Get health status based on percentage
 */
export function getHealth(percentage: number) {
  if (percentage < 50) {
    return 'low'
  } else if (percentage < 75) {
    return 'okay'
  } else {
    return 'good'
  }
}
