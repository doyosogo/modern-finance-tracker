import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/dashboard.js'

const emptySummary = {
  total_income: '0.00',
  total_expenses: '0.00',
  balance: '0.00',
  transaction_count: 0,
  budget_count: 0,
  goal_count: 0,
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`
}

function Dashboard() {
  const [summary, setSummary] = useState(emptySummary)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboardSummary() {
      try {
        const data = await getDashboardSummary()

        if (isMounted) {
          setSummary(data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard summary.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = [
    {
      title: 'Income',
      value: formatCurrency(summary.total_income),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Expenses',
      value: formatCurrency(summary.total_expenses),
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      title: 'Balance',
      value: formatCurrency(summary.balance),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Transactions',
      value: summary.transaction_count,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
    },
    {
      title: 'Budgets',
      value: summary.budget_count,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
    },
    {
      title: 'Goals',
      value: summary.goal_count,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Dashboard</h1>

      {isLoading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Loading dashboard summary...</p>
        </section>
      )}

      {!isLoading && error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-red-600">
            Dashboard unavailable
          </h2>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </section>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
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
      )}
    </div>
  )
}

export default Dashboard
