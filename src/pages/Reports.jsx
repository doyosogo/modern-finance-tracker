import { useRef, useState } from 'react'
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
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const availableMonths = [
    ...new Set(transactions.map((transaction) => transaction.date.slice(0, 7))),
  ].sort((a, b) => b.localeCompare(a))

  const filteredTransactions =
    selectedPeriod === 'all'
      ? transactions
      : transactions.filter(
          (transaction) => transaction.date.slice(0, 7) === selectedPeriod
        )

  const insights = getFinancialInsights(filteredTransactions)

  const expenseTransactions = filteredTransactions.filter(
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
    '#3b82f6',
    '#14b8a6',
    '#22c55e',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
  ]

  const sectionStyle =
    'mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'

  const cardStyle =
    'rounded-xl border border-slate-200 bg-slate-50 p-4'

  function formatMonth(monthValue) {
    const [year, month] = monthValue.split('-')
    const date = new Date(Number(year), Number(month) - 1)

    return date.toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
    })
  }

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
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Reports
      </h1>

      <section className={sectionStyle}>
        <h2 className="mb-2 text-xl font-bold text-slate-950">
          Backup Data
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          Export your transactions to a JSON file or import a previous backup.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportFinanceData}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Export Backup
          </button>

          <button
            onClick={handleImportClick}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Report Period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose whether to view all-time data or a specific month.
            </p>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-56"
          >
            <option value="all">All Time</option>

            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Financial Insights
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          Showing{' '}
          {selectedPeriod === 'all'
            ? 'all-time results'
            : formatMonth(selectedPeriod)}
          .
        </p>

        <div className="grid gap-4 md:grid-cols-4">
          <div className={cardStyle}>
            <p className="text-sm text-slate-500">Biggest Expense</p>
            <p className="mt-2 font-bold text-red-500">
              {insights.biggestExpense
                ? `${insights.biggestExpense.description} ($${insights.biggestExpense.amount.toFixed(
                    2
                  )})`
                : 'N/A'}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-slate-500">Highest Income</p>
            <p className="mt-2 font-bold text-emerald-600">
              {insights.highestIncome
                ? `${insights.highestIncome.description} ($${insights.highestIncome.amount.toFixed(
                    2
                  )})`
                : 'N/A'}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-slate-500">Average Expense</p>
            <p className="mt-2 font-bold text-blue-600">
              ${insights.averageExpense.toFixed(2)}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-slate-500">Most Used Category</p>
            <p className="mt-2 font-bold text-teal-600">
              {insights.mostUsedCategory}
            </p>
          </div>
        </div>
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Spending by Category
        </h2>

        {chartData.length === 0 ? (
          <p className="text-slate-500">
            No expense data found for this period.
          </p>
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
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: colors[index % colors.length],
                      }}
                    />

                    <span className="text-slate-700">{item.name}</span>
                  </div>

                  <span className="font-bold text-slate-900">
                    ${item.value.toFixed(2)}
                  </span>
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