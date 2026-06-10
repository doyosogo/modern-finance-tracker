import { useEffect, useState } from 'react'
import { getFromStorage, saveToStorage } from '../utils/storage'

function Goals() {
  const [goals, setGoals] = useState([])
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')

  useEffect(() => {
    setGoals(getFromStorage('goals'))
  }, [])

  function saveGoals(updatedGoals) {
    setGoals(updatedGoals)
    saveToStorage('goals', updatedGoals)
  }

  function addGoal(e) {
    e.preventDefault()

    if (!name || !targetAmount || Number(targetAmount) <= 0) {
      alert('Please enter a valid goal name and target amount.')
      return
    }

    const newGoal = {
      id: Date.now(),
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      createdAt: new Date().toISOString(),
    }

    saveGoals([...goals, newGoal])

    setName('')
    setTargetAmount('')
    setCurrentAmount('')
  }

  function deleteGoal(id) {
    const updatedGoals = goals.filter((goal) => goal.id !== id)
    saveGoals(updatedGoals)
  }

  function updateGoalAmount(id, value) {
    const updatedGoals = goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            currentAmount: Number(value),
          }
        : goal
    )

    saveGoals(updatedGoals)
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Savings Goals
      </h1>

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

        <button className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Save Goal
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Goal Progress
        </h2>

        {goals.length === 0 ? (
          <p className="text-slate-500">No savings goals created yet.</p>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const progress = Math.min(
                (goal.currentAmount / goal.targetAmount) * 100,
                100
              )

              const remaining = Math.max(
                goal.targetAmount - goal.currentAmount,
                0
              )

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
                        ${goal.currentAmount.toFixed(2)} / $
                        {goal.targetAmount.toFixed(2)}
                      </p>

                      <p className="mt-1 text-sm text-blue-600">
                        Remaining: ${remaining.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:w-48">
                      <input
                        type="number"
                        value={goal.currentAmount}
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