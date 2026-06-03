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
      const spent = transactions
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
      color: 'text-emerald-400',
    },
    {
      title: 'Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      color: 'text-rose-400',
    },
    {
      title: 'Balance',
      value: `$${balance.toFixed(2)}`,
      color: 'text-cyan-300',
    },
    {
      title: 'Transactions',
      value: transactions.length,
      color: 'text-fuchsia-300',
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

  const sectionStyle =
    'mt-6 rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20'

  const innerCardStyle =
    'rounded-xl border border-violet-500/10 bg-violet-950/40 p-4'

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-5 shadow-lg shadow-fuchsia-950/20"
          >
            <p className="text-sm text-violet-200/70">{stat.title}</p>

            <h2 className={`mt-2 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">
          Monthly Savings Summary
        </h2>

        {currentMonth ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className={innerCardStyle}>
              <p className="text-sm text-violet-200/70">Income</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                ${currentMonth.income.toFixed(2)}
              </p>
            </div>

            <div className={innerCardStyle}>
              <p className="text-sm text-violet-200/70">Expenses</p>
              <p className="mt-2 text-2xl font-bold text-rose-400">
                ${currentMonth.expenses.toFixed(2)}
              </p>
            </div>

            <div className={innerCardStyle}>
              <p className="text-sm text-violet-200/70">Savings</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  monthlySavings >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                ${monthlySavings.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-violet-200/70">
            No monthly data available.
          </p>
        )}
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">Budget Progress</h2>

        {budgetProgress.length === 0 ? (
          <p className="text-violet-200/70">
            Set category budgets to see progress here.
          </p>
        ) : (
          <div className="grid gap-4">
            {budgetProgress.map((item) => (
              <div
                key={item.category}
                className={innerCardStyle}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.category}</p>
                    <p className="text-sm text-violet-200/70">
                      ${item.spent.toFixed(2)} / $
                      {item.budget.toFixed(2)}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      item.spent > item.budget
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {Math.round(item.percentage)}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-violet-950">
                  <div
                    className={`h-full ${
                      item.spent > item.budget
                        ? 'bg-rose-500'
                        : 'bg-fuchsia-500'
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
        <h2 className="mb-4 text-xl font-bold">Income vs Expenses</h2>

        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={incomeVsExpenseData}>
              <XAxis dataKey="name" stroke="#c4b5fd" />
              <YAxis stroke="#c4b5fd" />
              <Tooltip />
              <Bar
                dataKey="amount"
                fill="#d946ef"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">Monthly Overview</h2>

        {monthlySummary.length === 0 ? (
          <p className="text-violet-200/70">No monthly data yet.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={monthlySummary}>
                <XAxis dataKey="month" stroke="#c4b5fd" />
                <YAxis stroke="#c4b5fd" />
                <Tooltip />
                <Bar
                  dataKey="income"
                  fill="#34d399"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="#fb7185"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">
          Recent Transactions
        </h2>

        {recentTransactions.length === 0 ? (
          <p className="text-violet-200/70">No transactions yet.</p>
        ) : (
          <div className="grid gap-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-violet-500/10 bg-violet-950/40 p-3"
              >
                <div>
                  <p className="font-medium">
                    {transaction.description}
                  </p>

                  <p className="text-sm text-violet-200/70">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    transaction.type === 'income'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
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
    </div>
  )
}

export default Dashboard