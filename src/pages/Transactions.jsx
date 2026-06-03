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
    'mt-6 rounded-2xl border border-fuchsia-500/20 bg-[#130b24]/80 p-6 shadow-xl shadow-fuchsia-950/20'

  const inputStyle =
    'rounded-lg border border-violet-500/20 bg-violet-950/50 p-2 text-white outline-none placeholder:text-violet-200/40 focus:border-fuchsia-400'

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Transactions</h1>

      <TransactionForm
        onTransactionSaved={loadTransactions}
        editingTransaction={editingTransaction}
        clearEditingTransaction={() => setEditingTransaction(null)}
      />

      <div className={sectionStyle}>
        <h2 className="mb-4 text-xl font-bold">Filters</h2>

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
          <h2 className="text-xl font-bold">Transaction History</h2>

          <p className="text-sm text-violet-200/70">
            Showing {filteredTransactions.length} of {transactions.length}
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-violet-200/70">No transactions found.</p>
        ) : (
          <div className="grid gap-3">
            {filteredTransactions
              .slice()
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-violet-500/10 bg-violet-950/40 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {transaction.description}
                      </h3>

                      {transaction.isRecurring && (
                        <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-1 text-xs font-semibold text-fuchsia-300">
                          Recurring: {formatFrequency(transaction.recurringFrequency)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-violet-200/70">
                      {transaction.category} • {transaction.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'income'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </p>

                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-300 hover:bg-rose-500/20"
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