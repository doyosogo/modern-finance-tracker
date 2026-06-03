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
      <h1 className="mb-6 text-3xl font-bold">Savings Goals</h1>

      <form
        onSubmit={addGoal}
        className="rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20"
      >
        <h2 className="mb-4 text-xl font-bold">Create Goal</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Goal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none placeholder:text-violet-200/40 focus:border-fuchsia-400"
          />

          <input
            type="number"
            placeholder="Target amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none placeholder:text-violet-200/40 focus:border-fuchsia-400"
          />

          <input
            type="number"
            placeholder="Current saved amount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none placeholder:text-violet-200/40 focus:border-fuchsia-400"
          />
        </div>

        <button className="mt-5 rounded-lg bg-fuchsia-500 px-5 py-2 font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400">
          Save Goal
        </button>
      </form>

      <section className="mt-6 rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20">
        <h2 className="mb-4 text-xl font-bold">Goal Progress</h2>

        {goals.length === 0 ? (
          <p className="text-violet-200/70">
            No savings goals created yet.
          </p>
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
                  className="rounded-xl border border-violet-500/10 bg-violet-950/40 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold">{goal.name}</h3>

                      <p className="text-sm text-violet-200/70">
                        ${goal.currentAmount.toFixed(2)} / $
                        {goal.targetAmount.toFixed(2)}
                      </p>

                      <p className="mt-1 text-sm text-fuchsia-300">
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
                        className="rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none focus:border-fuchsia-400"
                      />

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-300 hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-violet-950">
                    <div
                      className="h-full bg-fuchsia-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-violet-200/70">
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