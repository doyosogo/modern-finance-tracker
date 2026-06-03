export function getMonthlySummary(transactions) {
  const months = {}

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.slice(0, 7)

    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
      }
    }

    if (transaction.type === 'income') {
      months[monthKey].income += transaction.amount
    } else {
      months[monthKey].expenses += transaction.amount
    }
  })

  return Object.values(months).sort((a, b) =>
    a.month.localeCompare(b.month)
  )
}