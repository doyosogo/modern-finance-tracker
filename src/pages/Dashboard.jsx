import { useState } from 'react'
import { getFromStorage } from '../utils/storage'
import { getMonthlySummary } from '../utils/financeUtils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function Dashboard() {
  const transactions = getFromStorage('transactions')
  const budgets = getFromStorage('budgets', {})
  const monthlySummary = getMonthlySummary(transactions)
  const [selectedMonth, setSelectedMonth] = useState(null)

  const today = new Date()

  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)

    return (
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    )
  })

  const recentTransactions = transactions
    .slice()
    .reverse()
    .slice(0, 5)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const currentMonth =
    monthlySummary.length > 0
      ? monthlySummary[monthlySummary.length - 1]
      : null

  const monthlySavings = currentMonth
    ? currentMonth.income - currentMonth.expenses
    : 0

  const budgetProgress = Object.entries(budgets)
    .filter(([, budget]) => Number(budget) > 0)
    .map(([category, budget]) => {
      const spent = currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            transaction.category === category
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0)

      return {
        category,
        budget: Number(budget),
        spent,
        percentage: Math.min((spent / Number(budget)) * 100, 100),
      }
    })

  const stats = [
    {
      title: 'Income',
      value: `$${totalIncome.toFixed(2)}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      title: 'Balance',
      value: `$${balance.toFixed(2)}`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Transactions',
      value: transactions.length,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
    },
  ]

  const incomeVsExpenseData = [
    {
      name: 'Income',
      amount: totalIncome,
    },
    {
      name: 'Expenses',
      amount: totalExpenses,
    },
  ]

  const selectedMonthTransactions = selectedMonth
    ? transactions.filter(
        (transaction) => transaction.date.slice(0, 7) === selectedMonth
      )
    : []

  const selectedMonthExpenses = selectedMonthTransactions.filter(
    (transaction) => transaction.type === 'expense'
  )

  const selectedMonthCategoryTotals = selectedMonthExpenses.reduce(
    (acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] || 0) + transaction.amount

      return acc
    },
    {}
  )

  const selectedMonthCategoryData = Object.entries(
    selectedMonthCategoryTotals
  )
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const selectedMonthTotalExpenses = selectedMonthCategoryData.reduce(
    (sum, item) => sum + item.amount,
    0
  )

  const topCategory =
    selectedMonthCategoryData.length > 0
      ? selectedMonthCategoryData[0]
      : null

  function formatMonth(monthValue) {
    const [year, month] = monthValue.split('-')
    const date = new Date(Number(year), Number(month) - 1)

    return date.toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
    })
  }

  function handleMonthClick(data) {
    if (!data || !data.month) return

    setSelectedMonth(data.month)
  }

  const sectionStyle =
    'mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'

  const innerCardStyle =
    'rounded-xl border border-slate-200 bg-slate-50 p-4'

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-2xl border border-slate-200 ${stat.bg} p-5 shadow-sm`}
          >
            <p className="text-sm text-slate-500">{stat.title}</p>

            <h2 className={`mt-2 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Monthly Savings Summary
        </h2>

        {currentMonth ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-slate-500">Income</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ${currentMonth.income.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-slate-500">Expenses</p>
              <p className="mt-2 text-2xl font-bold text-red-500">
                ${currentMonth.expenses.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-slate-500">Savings</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  monthlySavings >= 0
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                ${monthlySavings.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">No monthly data available.</p>
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
            {budgetProgress.map((item) => (
              <div key={item.category} className={innerCardStyle}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.category}
                    </p>
                    <p className="text-sm text-slate-500">
                      ${item.spent.toFixed(2)} / $
                      {item.budget.toFixed(2)}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      item.spent > item.budget
                        ? 'text-red-500'
                        : 'text-emerald-600'
                    }`}
                  >
                    {Math.round(item.percentage)}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${
                      item.spent > item.budget
                        ? 'bg-red-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Income vs Expenses
        </h2>

        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={incomeVsExpenseData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar
                dataKey="amount"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={sectionStyle}>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-950">
            Monthly Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Click a month in the chart to view a category breakdown.
          </p>
        </div>

        {monthlySummary.length === 0 ? (
          <p className="text-slate-500">No monthly data yet.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={monthlySummary}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => handleMonthClick(data)}
                />
                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => handleMonthClick(data)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Recent Transactions
        </h2>

        {recentTransactions.length === 0 ? (
          <p className="text-slate-500">No transactions yet.</p>
        ) : (
          <div className="grid gap-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {transaction.description}
                  </p>

                  <p className="text-sm text-slate-500">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    transaction.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {formatMonth(selectedMonth)} Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Expense breakdown by category.
                </p>
              </div>

              <button
                onClick={() => setSelectedMonth(null)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {selectedMonthCategoryData.length === 0 ? (
              <p className="text-slate-500">
                No expenses were recorded for this month.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedMonthCategoryData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <span className="font-medium text-slate-900">
                      {item.category}
                    </span>

                    <span className="font-bold text-red-500">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Total Expenses
                    </span>

                    <span className="text-lg font-bold text-red-500">
                      ${selectedMonthTotalExpenses.toFixed(2)}
                    </span>
                  </div>

                  {topCategory && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Top Category
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {topCategory.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard