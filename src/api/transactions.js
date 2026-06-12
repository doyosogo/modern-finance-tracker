import { apiRequest } from './client.js'

export function getTransactions(filters = {}) {
  return apiRequest('/transactions', {
    params: filters,
  })
}

export function getTransactionById(transactionId) {
  return apiRequest(`/transactions/${transactionId}`)
}

export function createTransaction(transaction) {
  return apiRequest('/transactions', {
    method: 'POST',
    body: transaction,
  })
}

export function updateTransaction(transactionId, transaction) {
  return apiRequest(`/transactions/${transactionId}`, {
    method: 'PATCH',
    body: transaction,
  })
}

export function deleteTransaction(transactionId) {
  return apiRequest(`/transactions/${transactionId}`, {
    method: 'DELETE',
  })
}
