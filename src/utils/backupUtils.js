export function exportFinanceData() {
  const transactions =
    JSON.parse(localStorage.getItem('transactions')) || []

  const data = {
    transactions,
    exportedAt: new Date().toISOString(),
    app: 'FinanceTracker',
  }

  const jsonData = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'finance-tracker-backup.json'
  link.click()

  URL.revokeObjectURL(url)
}

export function importFinanceData(file, onSuccess, onError) {
  const reader = new FileReader()

  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)

      if (!Array.isArray(data.transactions)) {
        throw new Error('Invalid backup file.')
      }

      localStorage.setItem(
        'transactions',
        JSON.stringify(data.transactions)
      )

      onSuccess()
    } catch (error) {
      onError(error.message)
    }
  }

  reader.readAsText(file)
}