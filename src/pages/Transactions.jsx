import { useEffect, useState } from 'react'
import TransactionForm from '../components/TransactionForm'
import { getFromStorage, saveToStorage } from '../utils/storage'
import { categories } from '../data/categories'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  function loadTransactions() {
    const savedTransactions = getFromStorage('transactions')
    setTransactions(savedTransactions)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  function deleteTransaction(id) {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    )

    saveToStorage('transactions', updatedTransactions)
    setTransactions(updatedTransactions)
  }

  function formatFrequency(frequency) {
    if (!frequency) return ''

    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesType =
      typeFilter === 'all' ? true : transaction.type === typeFilter

    const matchesCategory =
      categoryFilter === 'all' ? true : transaction.category === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  const sectionStyle =
    'mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'

  const inputStyle =
    'rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">
        Transactions
      </h1>

      <TransactionForm
        onTransactionSaved={loadTransactions}
        editingTransaction={editingTransaction}
        clearEditingTransaction={() => setEditingTransaction(null)}
      />

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
              <option key={category} value={category}>
                {category}
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

        {filteredTransactions.length === 0 ? (
          <p className="text-slate-500">No transactions found.</p>
        ) : (
          <div className="grid gap-3">
            {filteredTransactions
              .slice()
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {transaction.description}
                      </h3>

                      {transaction.isRecurring && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                          Recurring: {formatFrequency(transaction.recurringFrequency)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500">
                      {transaction.category} • {transaction.date}
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
                      {transaction.amount.toFixed(2)}
                    </p>

                    <button
                      onClick={() => setEditingTransaction(transaction)}
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