import { useEffect, useMemo, useState } from 'react'
import {
  createBudget,
  deleteBudget as deleteBudgetRequest,
  getBudgets,
  updateBudget,
} from '../api/budgets.js'
import { getCategories } from '../api/categories.js'
import { getBudgetProgress } from '../api/reports.js'

function Budgets() {
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [budgetProgress, setBudgetProgress] = useState([])
  const [budgetValues, setBudgetValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingCategoryId, setSavingCategoryId] = useState(null)
  const [error, setError] = useState('')

  const budgetByCategoryId = useMemo(() => {
    return budgets.reduce((acc, budget) => {
      acc[budget.category_id] = budget
      return acc
    }, {})
  }, [budgets])

  const progressByBudgetId = useMemo(() => {
    return budgetProgress.reduce((acc, progress) => {
      acc[progress.budget_id] = progress
      return acc
    }, {})
  }, [budgetProgress])

  async function fetchBudgetData() {
    return Promise.all([
      getBudgets(),
      getBudgetProgress(),
    ])
  }

  function applyBudgetData(budgetData, progressData) {
    setBudgets(budgetData)
    setBudgetProgress(progressData)
    setBudgetValues(
      budgetData.reduce((acc, budget) => {
        acc[budget.category_id] = String(budget.amount)
        return acc
      }, {})
    )
  }

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      try {
        const [categoryData, [budgetData, progressData]] = await Promise.all([
          getCategories(),
          fetchBudgetData(),
        ])

        if (isMounted) {
          setCategories(categoryData)
          applyBudgetData(budgetData, progressData)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load budgets.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPageData()

    return () => {
      isMounted = false
    }
  }, [])

  function updateBudgetValue(categoryId, value) {
    setBudgetValues((currentValues) => ({
      ...currentValues,
      [categoryId]: value,
    }))
  }

  async function saveBudget(categoryId) {
    const value = budgetValues[categoryId]
    const amount = Number(value)

    if (value === '' || Number.isNaN(amount) || amount < 0) {
      setError('Please enter a valid budget amount.')
      return
    }

    const existingBudget = budgetByCategoryId[categoryId]

    try {
      setSavingCategoryId(categoryId)
      setError('')

      if (existingBudget) {
        await updateBudget(existingBudget.id, { amount })
      } else {
        await createBudget({
          category_id: categoryId,
          amount,
        })
      }

      const [budgetData, progressData] = await fetchBudgetData()
      applyBudgetData(budgetData, progressData)
    } catch (err) {
      setError(err.message || 'Unable to save budget.')
    } finally {
      setSavingCategoryId(null)
    }
  }

  async function removeBudget(categoryId) {
    const existingBudget = budgetByCategoryId[categoryId]

    if (!existingBudget) return

    try {
      setSavingCategoryId(categoryId)
      setError('')
      await deleteBudgetRequest(existingBudget.id)
      const [budgetData, progressData] = await fetchBudgetData()
      applyBudgetData(budgetData, progressData)
    } catch (err) {
      setError(err.message || 'Unable to delete budget.')
    } finally {
      setSavingCategoryId(null)
    }
  }

  function handleBudgetKeyDown(e, categoryId) {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveBudget(categoryId)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Budgets</h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-slate-950">
          Category Budgets
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          Set a monthly budget for each category and compare it with your actual
          spending.
        </p>

        {isLoading ? (
          <p className="text-slate-500">Loading budgets...</p>
        ) : categories.length === 0 ? (
          <p className="text-slate-500">No categories available.</p>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => {
              const categoryId = category.id
              const existingBudget = budgetByCategoryId[categoryId]
              const progress = existingBudget
                ? progressByBudgetId[existingBudget.id]
                : null
              const spent = Number(progress?.spent_amount || 0)
              const budget = Number(budgetValues[categoryId] || 0)
              const percentage =
                budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
              const isSaving = savingCategoryId === categoryId

              return (
                <div
                  key={category.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {category.name}
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

                    <div className="flex flex-col gap-2 md:w-56">
                      <input
                        type="number"
                        placeholder="Set budget"
                        value={budgetValues[categoryId] || ''}
                        onChange={(e) =>
                          updateBudgetValue(categoryId, e.target.value)
                        }
                        onBlur={() => {
                          if (budgetValues[categoryId] !== undefined) {
                            saveBudget(categoryId)
                          }
                        }}
                        onKeyDown={(e) =>
                          handleBudgetKeyDown(e, categoryId)
                        }
                        className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => saveBudget(categoryId)}
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>

                        {existingBudget && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => removeBudget(categoryId)}
                            className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
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
        )}
      </section>
    </div>
  )
}

export default Budgets
