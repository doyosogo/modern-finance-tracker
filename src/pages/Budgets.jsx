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
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Budgets</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-slate-950">
          Category Budgets
        </h2>

        <p className="mb-6 text-sm text-slate-500">
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
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {category}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Spent ${spent.toFixed(2)} / Budget $
                      {budget.toFixed(2)}
                    </p>

                    {budget > 0 && spent > budget && (
                      <p className="mt-1 text-sm font-semibold text-red-500">
                        Over budget by ${(spent - budget).toFixed(2)}
                      </p>
                    )}

                    {budget > 0 &&
                      spent <= budget &&
                      spent >= budget * 0.8 && (
                        <p className="mt-1 text-sm font-semibold text-amber-500">
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
                    className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-40"
                  />
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${
                      spent > budget && budget > 0
                        ? 'bg-red-500'
                        : 'bg-blue-600'
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