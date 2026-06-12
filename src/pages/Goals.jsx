import { useEffect, useState } from 'react'
import {
  createGoal,
  deleteGoal as deleteGoalRequest,
  getGoals,
  updateGoal,
} from '../api/goals.js'

function Goals() {
  const [goals, setGoals] = useState([])
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadGoals() {
    const data = await getGoals()
    setGoals(data)
  }

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      try {
        const data = await getGoals()

        if (isMounted) {
          setGoals(data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load goals.')
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

  async function addGoal(e) {
    e.preventDefault()

    if (!name || !targetAmount || Number(targetAmount) <= 0) {
      alert('Please enter a valid goal name and target amount.')
      return
    }

    const payload = {
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount) || 0,
    }

    try {
      setIsSaving(true)
      setError('')
      await createGoal(payload)
      await loadGoals()
      setName('')
      setTargetAmount('')
      setCurrentAmount('')
    } catch (err) {
      setError(err.message || 'Unable to save goal.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteGoal(id) {
    try {
      setError('')
      await deleteGoalRequest(id)
      setGoals((currentGoals) =>
        currentGoals.filter((goal) => goal.id !== id)
      )
    } catch (err) {
      setError(err.message || 'Unable to delete goal.')
    }
  }

  async function updateGoalAmount(id, value) {
    try {
      setError('')
      const updatedGoal = await updateGoal(id, {
        current_amount: Number(value),
      })

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === id ? updatedGoal : goal
        )
      )
    } catch (err) {
      setError(err.message || 'Unable to update goal.')
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Savings Goals
      </h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={addGoal}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Create Goal
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Goal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            type="number"
            placeholder="Target amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            type="number"
            placeholder="Current saved amount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          disabled={isSaving}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? 'Saving...' : 'Save Goal'}
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Goal Progress
        </h2>

        {isLoading ? (
          <p className="text-slate-500">Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="text-slate-500">No savings goals created yet.</p>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const current = Number(goal.current_amount)
              const target = Number(goal.target_amount)
              const progress = Math.min((current / target) * 100, 100)
              const remaining = Math.max(target - current, 0)

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {goal.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        ${current.toFixed(2)} / ${target.toFixed(2)}
                      </p>

                      <p className="mt-1 text-sm text-blue-600">
                        Remaining: ${remaining.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:w-48">
                      <input
                        type="number"
                        value={goal.current_amount}
                        onChange={(e) =>
                          updateGoalAmount(goal.id, e.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-500 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Goals
