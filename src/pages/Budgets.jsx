import { useEffect, useState } from 'react'
import { categories } from '../data/categories'
import { getFromStorage, saveToStorage } from '../utils/storage'

function Budgets() {
  const [budgets, setBudgets] = useState({})
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    setBudgets(getFromStorage('budgets', {}))
    setTransactions(getFromStorage('transactions'))
  }, [])

  function updateBudget(category, value) {
    const updatedBudgets = {
      ...budgets,
      [category]: Number(value),
    }

    setBudgets(updatedBudgets)
    saveToStorage('budgets', updatedBudgets)
  }

  function getCategorySpent(category) {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          transaction.category === category
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Budgets</h1>

      <section className="rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20">
        <h2 className="mb-2 text-xl font-bold">Category Budgets</h2>

        <p className="mb-6 text-sm text-violet-200/70">
          Set a monthly budget for each category and compare it with your actual
          spending.
        </p>

        <div className="grid gap-4">
          {categories.map((category) => {
            const spent = getCategorySpent(category)
            const budget = budgets[category] || 0

            const percentage =
              budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

            return (
              <div
                key={category}
                className="rounded-xl border border-violet-500/10 bg-violet-950/40 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{category}</h3>

                    <p className="text-sm text-violet-200/70">
                      Spent ${spent.toFixed(2)} / Budget $
                      {budget.toFixed(2)}
                    </p>

                    {budget > 0 && spent > budget && (
                      <p className="mt-1 text-sm font-semibold text-rose-400">
                        Over budget by ${(spent - budget).toFixed(2)}
                      </p>
                    )}

                    {budget > 0 &&
                      spent <= budget &&
                      spent >= budget * 0.8 && (
                        <p className="mt-1 text-sm font-semibold text-fuchsia-300">
                          Approaching budget limit
                        </p>
                      )}
                  </div>

                  <input
                    type="number"
                    placeholder="Set budget"
                    value={budgets[category] || ''}
                    onChange={(e) =>
                      updateBudget(category, e.target.value)
                    }
                    className="rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none placeholder:text-violet-200/40 focus:border-fuchsia-400 md:w-40"
                  />
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-violet-950">
                  <div
                    className={`h-full ${
                      spent > budget && budget > 0
                        ? 'bg-rose-500'
                        : 'bg-fuchsia-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Budgets