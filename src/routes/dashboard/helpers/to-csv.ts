/**
 * Generate CSV content from a list of objects
 */
export function toCSV(list: Record<string, unknown>[]) {
  const headers = Object.keys(list[0])
  const csv = [headers.join(',')]
  for (const item of list) {
    const row = headers.map((header) => item[header])
    csv.push(row.join(','))
  }
  return csv.join('\n')
}
