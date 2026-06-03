export function getFinancialInsights(transactions) {
  const expenses = transactions.filter(
    (transaction) => transaction.type === 'expense'
  )

  const incomes = transactions.filter(
    (transaction) => transaction.type === 'income'
  )

  const biggestExpense =
    expenses.length > 0
      ? expenses.reduce((max, transaction) =>
          transaction.amount > max.amount ? transaction : max
        )
      : null

  const highestIncome =
    incomes.length > 0
      ? incomes.reduce((max, transaction) =>
          transaction.amount > max.amount ? transaction : max
        )
      : null

  const averageExpense =
    expenses.length > 0
      ? expenses.reduce((sum, transaction) => sum + transaction.amount, 0) /
        expenses.length
      : 0

  const categoryCounts = {}

  expenses.forEach((transaction) => {
    categoryCounts[transaction.category] =
      (categoryCounts[transaction.category] || 0) + 1
  })

  const mostUsedCategory =
    Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
      : 'N/A'

  return {
    biggestExpense,
    highestIncome,
    averageExpense,
    mostUsedCategory,
  }
}