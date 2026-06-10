import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Personal Finance Tracker
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight text-slate-950">
              Manage your money with a clearer view.
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Track income, expenses, budgets, savings goals, recurring
              transactions, spending reports, and financial insights from one
              simple dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/transactions"
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Add Transaction
              </Link>

              <Link
                to="/dashboard"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Current Balance</p>

              <p className="mt-2 text-4xl font-bold text-slate-950">
                $2,430.50
              </p>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <span className="text-sm font-medium text-slate-700">
                    Income
                  </span>
                  <span className="font-bold text-emerald-600">
                    $3,200.00
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-red-50 p-3">
                  <span className="text-sm font-medium text-slate-700">
                    Expenses
                  </span>
                  <span className="font-bold text-red-500">
                    $769.50
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                  <span className="text-sm font-medium text-slate-700">
                    Savings Goal
                  </span>
                  <span className="font-bold text-blue-600">
                    62%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Transactions', 'Record and manage income and expenses.'],
          ['Reports', 'Understand spending habits and trends.'],
          ['Budgets', 'Set limits and track spending progress.'],
          ['Savings Goals', 'Track progress toward financial goals.'],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">How It Works</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              'Step 1',
              'Add transactions',
              'Record income and expenses with categories, dates, and recurring payment options.',
            ],
            [
              'Step 2',
              'Review insights',
              'Use summaries, charts, and reports to understand your financial activity.',
            ],
            [
              'Step 3',
              'Track progress',
              'Set budgets and savings goals to monitor your progress over time.',
            ],
          ].map(([step, title, text]) => (
            <div
              key={step}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-semibold text-blue-600">{step}</p>

              <h3 className="mt-2 text-xl font-bold text-slate-950">
                {title}
              </h3>

              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home