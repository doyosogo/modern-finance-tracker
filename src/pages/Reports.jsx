import { useRef } from 'react'
import { getFromStorage } from '../utils/storage'
import { getFinancialInsights } from '../utils/insightUtils'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  exportFinanceData,
  importFinanceData,
} from '../utils/backupUtils'

function Reports() {
  const fileInputRef = useRef(null)
  const transactions = getFromStorage('transactions')
  const insights = getFinancialInsights(transactions)

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  )

  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    acc[transaction.category] =
      (acc[transaction.category] || 0) + transaction.amount

    return acc
  }, {})

  const chartData = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  )

  const colors = [
    '#d946ef',
    '#a855f7',
    '#fb7185',
    '#38bdf8',
    '#34d399',
    '#facc15',
    '#818cf8',
    '#f472b6',
  ]

  const sectionStyle =
    'mb-6 rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20'

  const cardStyle =
    'rounded-xl border border-violet-500/10 bg-violet-950/40 p-4'

  function handleImportClick() {
    fileInputRef.current.click()
  }

  function handleImportFile(e) {
    const file = e.target.files[0]

    if (!file) return

    importFinanceData(
      file,
      () => {
        alert('Backup imported successfully.')
        window.location.reload()
      },
      (errorMessage) => {
        alert(errorMessage)
      }
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Reports</h1>

      <section className={sectionStyle}>
        <h2 className="mb-2 text-xl font-bold">Backup Data</h2>

        <p className="mb-4 text-sm text-violet-200/70">
          Export your transactions to a JSON file or import a previous backup.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportFinanceData}
            className="rounded-lg bg-fuchsia-500 px-4 py-2 font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400"
          >
            Export Backup
          </button>

          <button
            onClick={handleImportClick}
            className="rounded-lg border border-violet-400/30 bg-violet-950/50 px-4 py-2 font-semibold text-white hover:bg-violet-900/70"
          >
            Import Backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">Financial Insights</h2>

        <div className="grid gap-4 md:grid-cols-4">
          <div className={cardStyle}>
            <p className="text-sm text-violet-200/70">Biggest Expense</p>
            <p className="mt-2 font-bold text-rose-400">
              {insights.biggestExpense
                ? `${insights.biggestExpense.description} ($${insights.biggestExpense.amount.toFixed(
                    2
                  )})`
                : 'N/A'}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-violet-200/70">Highest Income</p>
            <p className="mt-2 font-bold text-emerald-400">
              {insights.highestIncome
                ? `${insights.highestIncome.description} ($${insights.highestIncome.amount.toFixed(
                    2
                  )})`
                : 'N/A'}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-violet-200/70">Average Expense</p>
            <p className="mt-2 font-bold text-fuchsia-300">
              ${insights.averageExpense.toFixed(2)}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-violet-200/70">Most Used Category</p>
            <p className="mt-2 font-bold text-cyan-300">
              {insights.mostUsedCategory}
            </p>
          </div>
        </div>
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">Spending by Category</h2>

        {chartData.length === 0 ? (
          <p className="text-violet-200/70">No expense data yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-violet-500/10 bg-violet-950/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: colors[index % colors.length],
                      }}
                    />

                    <span>{item.name}</span>
                  </div>

                  <span className="font-bold">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Reports