import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-fuchsia-500/20 bg-[#130b24]/80 p-8 shadow-2xl shadow-fuchsia-950/30">
        <p className="text-sm uppercase tracking-widest text-fuchsia-300">
          Personal Finance Tracker
        </p>

        <h1 className="mt-3 max-w-3xl text-5xl font-bold">
          Track your finances with confidence.
        </h1>

        <p className="mt-4 max-w-2xl text-violet-100/80">
          A simple finance management tool for tracking income, expenses,
          budgets, recurring transactions, spending reports, and financial
          insights.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/transactions"
            className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400"
          >
            Add Transaction
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-violet-400/30 bg-violet-950/40 px-5 py-3 font-semibold text-white hover:bg-violet-900/60"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Transactions', 'Record and manage income and expenses.'],
          ['Reports', 'Understand spending habits and trends.'],
          ['Budgets', 'Set limits and track spending progress.'],
          ['Backups', 'Export and import your data when needed.'],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-2xl border border-violet-500/20 bg-[#130b24]/70 p-5 shadow-lg shadow-violet-950/20"
          >
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm text-violet-200/70">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-violet-500/20 bg-[#130b24]/70 p-8 shadow-xl shadow-violet-950/20">
        <h2 className="text-2xl font-bold">How It Works</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Step 1', 'Add Transactions', 'Record income and expenses with categories and dates.'],
            ['Step 2', 'Review Insights', 'Monitor reports, trends, and financial summaries.'],
            ['Step 3', 'Stay on Budget', 'Set spending limits and track your progress over time.'],
          ].map(([step, title, text]) => (
            <div
              key={step}
              className="rounded-2xl border border-fuchsia-500/10 bg-violet-950/40 p-5"
            >
              <p className="text-sm font-semibold text-fuchsia-300">{step}</p>

              <h3 className="mt-2 text-xl font-bold">{title}</h3>

              <p className="mt-2 text-sm text-violet-200/70">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home