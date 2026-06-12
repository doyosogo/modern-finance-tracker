import { useEffect, useState } from 'react'
import { getCategories } from '../api/categories.js'
import {
  createTransaction,
  deleteTransaction as deleteTransactionRequest,
  getTransactions,
  updateTransaction,
} from '../api/transactions.js'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const sectionStyle =
    'mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'

  const inputStyle =
    'rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const formInputStyle =
    'w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const labelStyle = 'mb-1 block text-sm font-medium text-slate-600'

  async function loadTransactions() {
    const data = await getTransactions()
    setTransactions(data)
  }

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      try {
        const [transactionData, categoryData] = await Promise.all([
          getTransactions(),
          getCategories(),
        ])

        if (isMounted) {
          setTransactions(transactionData)
          setCategories(categoryData)
          setCategoryId(categoryData[0]?.id ? String(categoryData[0].id) : '')
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load transactions.')
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

  function resetForm() {
    setDescription('')
    setAmount('')
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '')
    setType('expense')
    setDate(new Date().toISOString().split('T')[0])
    setIsRecurring(false)
    setRecurringFrequency('monthly')
    setEditingTransaction(null)
  }

  function startEditing(transaction) {
    setEditingTransaction(transaction)
    setType(transaction.type)
    setDescription(transaction.description)
    setAmount(String(transaction.amount))
    setCategoryId(String(transaction.category_id))
    setDate(transaction.date)
    setIsRecurring(transaction.is_recurring || false)
    setRecurringFrequency(transaction.recurring_frequency || 'monthly')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!description || !amount || Number(amount) <= 0) {
      alert('Please fill in a valid description and amount.')
      return
    }

    if (!categoryId) {
      alert('Please select a category.')
      return
    }

    const payload = {
      type,
      description,
      amount: Number(amount),
      category_id: Number(categoryId),
      date,
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? recurringFrequency : null,
    }

    try {
      setIsSaving(true)
      setError('')

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload)
      } else {
        await createTransaction(payload)
      }

      await loadTransactions()
      resetForm()
    } catch (err) {
      setError(err.message || 'Unable to save transaction.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteTransaction(id) {
    try {
      setError('')
      await deleteTransactionRequest(id)
      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== id)
      )
    } catch (err) {
      setError(err.message || 'Unable to delete transaction.')
    }
  }

  function formatFrequency(frequency) {
    if (!frequency) return ''

    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  function getCategoryName(transaction) {
    return transaction.category?.name || 'Uncategorized'
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesType =
      typeFilter === 'all' ? true : transaction.type === typeFilter

    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : String(transaction.category_id) === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  const sortedTransactions = filteredTransactions
    .slice()
    .sort((a, b) => b.id - a.id)

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Transactions
      </h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

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
              className={formInputStyle}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className={labelStyle}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={formInputStyle}
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <input
              type="text"
              placeholder="e.g. Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={formInputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Amount</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={formInputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={formInputStyle}
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
                className={formInputStyle}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            disabled={isSaving || categories.length === 0}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving
              ? 'Saving...'
              : editingTransaction
                ? 'Save Changes'
                : 'Save Transaction'}
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

      <div className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold text-slate-950">Filters</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputStyle}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={inputStyle}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputStyle}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className={sectionStyle}>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-slate-950">
            Transaction History
          </h2>

          <p className="text-sm text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length}
          </p>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Loading transactions...</p>
        ) : sortedTransactions.length === 0 ? (
          <p className="text-slate-500">No transactions found.</p>
        ) : (
          <div className="grid gap-3">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {transaction.description}
                    </h3>

                    {transaction.is_recurring && (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                        Recurring: {formatFrequency(transaction.recurring_frequency)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {getCategoryName(transaction)} • {transaction.date}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {Number(transaction.amount).toFixed(2)}
                  </p>

                  <button
                    onClick={() => startEditing(transaction)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-500 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Transactions
