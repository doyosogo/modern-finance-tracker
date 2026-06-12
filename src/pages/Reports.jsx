import { useEffect, useState } from 'react'
import {
  getBudgetProgress,
  getFinancialInsights,
  getMonthlySummary,
  getSpendingByCategory,
} from '../api/reports.js'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const emptyInsights = {
  highest_expense_category: null,
  highest_expense_amount: '0.00',
  average_monthly_expenses: '0.00',
  average_monthly_income: '0.00',
  savings_rate: '0.00',
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`
}

function Reports() {
  const [spendingByCategory, setSpendingByCategory] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [budgetProgress, setBudgetProgress] = useState([])
  const [insights, setInsights] = useState(emptyInsights)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadReports() {
      try {
        const [
          spendingData,
          monthlyData,
          budgetData,
          insightData,
        ] = await Promise.all([
          getSpendingByCategory(),
          getMonthlySummary(),
          getBudgetProgress(),
          getFinancialInsights(),
        ])

        if (isMounted) {
          setSpendingByCategory(spendingData)
          setMonthlySummary(monthlyData)
          setBudgetProgress(budgetData)
          setInsights(insightData)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load reports.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isMounted = false
    }
  }, [])

  const chartData = spendingByCategory.map((item) => ({
    name: item.category_name,
    value: Number(item.amount),
  }))

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

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Reports
      </h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <section className={sectionStyle}>
          <p className="text-slate-500">Loading reports...</p>
        </section>
      ) : (
        <>
          <section className={sectionStyle}>
            <h2 className="mb-4 text-xl font-bold text-slate-950">
              Financial Insights
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Showing all-time results from your saved transactions.
            </p>

            <div className="grid gap-4 md:grid-cols-4">
              <div className={cardStyle}>
                <p className="text-sm text-slate-500">
                  Highest Expense Category
                </p>
                <p className="mt-2 font-bold text-red-500">
                  {insights.highest_expense_category
                    ? `${insights.highest_expense_category} (${formatCurrency(
                        insights.highest_expense_amount
                      )})`
                    : 'N/A'}
                </p>
              </div>

              <div className={cardStyle}>
                <p className="text-sm text-slate-500">
                  Average Monthly Income
                </p>
                <p className="mt-2 font-bold text-emerald-600">
                  {formatCurrency(insights.average_monthly_income)}
                </p>
              </div>

              <div className={cardStyle}>
                <p className="text-sm text-slate-500">
                  Average Monthly Expenses
                </p>
                <p className="mt-2 font-bold text-blue-600">
                  {formatCurrency(insights.average_monthly_expenses)}
                </p>
              </div>

              <div className={cardStyle}>
                <p className="text-sm text-slate-500">Savings Rate</p>
                <p className="mt-2 font-bold text-teal-600">
                  {Number(insights.savings_rate).toFixed(2)}%
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
                  {spendingByCategory.map((item, index) => (
                    <div
                      key={item.category_id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />

                        <span className="text-slate-700">
                          {item.category_name}
                        </span>
                      </div>

                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className={sectionStyle}>
            <h2 className="mb-4 text-xl font-bold text-slate-950">
              Monthly Summary
            </h2>

            {monthlySummary.length === 0 ? (
              <p className="text-slate-500">No monthly data available.</p>
            ) : (
              <div className="grid gap-4">
                {monthlySummary.map((month) => (
                  <div key={month.month} className={cardStyle}>
                    <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <h3 className="font-semibold text-slate-900">
                        {formatMonth(month.month)}
                      </h3>

                      <p
                        className={`font-bold ${
                          Number(month.balance) >= 0
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}
                      >
                        Balance: {formatCurrency(month.balance)}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <p className="text-sm text-slate-500">
                        Income:{' '}
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(month.income)}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500">
                        Expenses:{' '}
                        <span className="font-bold text-red-500">
                          {formatCurrency(month.expenses)}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500">
                        Net:{' '}
                        <span className="font-bold text-blue-600">
                          {formatCurrency(month.balance)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={sectionStyle}>
            <h2 className="mb-4 text-xl font-bold text-slate-950">
              Budget Progress
            </h2>

            {budgetProgress.length === 0 ? (
              <p className="text-slate-500">
                Set category budgets to see progress here.
              </p>
            ) : (
              <div className="grid gap-4">
                {budgetProgress.map((item) => {
                  const percentage = Number(item.percentage_used)
                  const progressWidth = Math.min(percentage, 100)

                  return (
                    <div key={item.budget_id} className={cardStyle}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.category_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatCurrency(item.spent_amount)} /{' '}
                            {formatCurrency(item.budget_amount)}
                          </p>
                        </div>

                        <p
                          className={`text-sm font-semibold ${
                            percentage > 100
                              ? 'text-red-500'
                              : 'text-emerald-600'
                          }`}
                        >
                          {percentage.toFixed(0)}%
                        </p>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${
                            percentage > 100
                              ? 'bg-red-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Remaining:{' '}
                        <span
                          className={
                            Number(item.remaining_amount) < 0
                              ? 'font-semibold text-red-500'
                              : 'font-semibold text-slate-700'
                          }
                        >
                          {formatCurrency(item.remaining_amount)}
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Reports
