import { useEffect, useState } from 'react'
import { categories } from '../data/categories'
import { getFromStorage, saveToStorage } from '../utils/storage'

function TransactionForm({
  onTransactionSaved,
  editingTransaction,
  clearEditingTransaction,
}) {
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')

  const inputStyle =
    'w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const labelStyle = 'mb-1 block text-sm font-medium text-slate-600'

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      setDescription(editingTransaction.description)
      setAmount(editingTransaction.amount)
      setCategory(editingTransaction.category)
      setDate(editingTransaction.date)
      setIsRecurring(editingTransaction.isRecurring || false)
      setRecurringFrequency(editingTransaction.recurringFrequency || 'monthly')
    }
  }, [editingTransaction])

  function resetForm() {
    setDescription('')
    setAmount('')
    setCategory('Food')
    setType('expense')
    setDate(new Date().toISOString().split('T')[0])
    setIsRecurring(false)
    setRecurringFrequency('monthly')
    clearEditingTransaction()
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!description || !amount || Number(amount) <= 0) {
      alert('Please fill in a valid description and amount.')
      return
    }

    const transactions = getFromStorage('transactions')

    if (editingTransaction) {
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === editingTransaction.id
          ? {
              ...transaction,
              type,
              description,
              amount: Number(amount),
              category,
              date,
              isRecurring,
              recurringFrequency: isRecurring ? recurringFrequency : null,
            }
          : transaction
      )

      saveToStorage('transactions', updatedTransactions)
      onTransactionSaved()
      resetForm()
      return
    }

    const newTransaction = {
      id: Date.now(),
      type,
      description,
      amount: Number(amount),
      category,
      date,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
    }

    saveToStorage('transactions', [...transactions, newTransaction])

    onTransactionSaved()
    resetForm()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-bold text-slate-950">
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelStyle}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputStyle}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputStyle}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelStyle}>Description</label>
          <input
            type="text"
            placeholder="e.g. Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Amount</label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className={labelStyle}>Recurring</label>

          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 p-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />

            <span className="text-sm text-slate-600">
              Repeat this transaction
            </span>
          </div>
        </div>

        {isRecurring && (
          <div>
            <label className={labelStyle}>Frequency</label>

            <select
              value={recurringFrequency}
              onChange={(e) => setRecurringFrequency(e.target.value)}
              className={inputStyle}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700">
          {editingTransaction ? 'Save Changes' : 'Save Transaction'}
        </button>

        {editingTransaction && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TransactionForm