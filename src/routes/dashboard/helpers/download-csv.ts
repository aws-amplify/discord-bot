/**
 * Download CSV file
 * @param csv CSV content
 * @param filename file name to appear on download
 * @returns
 */
export function downloadCSV(csv: string, filename: string) {
  const hiddenElement = document.createElement('a')
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
  hiddenElement.target = '_blank'

  hiddenElement.download = filename
  if (!filename.endsWith('.csv')) {
    hiddenElement.download += '.csv'
  }
  hiddenElement.click()
  return
}
