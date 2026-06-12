import { apiRequest } from './client.js'

export function getBudgets() {
  return apiRequest('/budgets')
}

export function getBudgetById(budgetId) {
  return apiRequest(`/budgets/${budgetId}`)
}

export function createBudget(budget) {
  return apiRequest('/budgets', {
    method: 'POST',
    body: budget,
  })
}

export function updateBudget(budgetId, budget) {
  return apiRequest(`/budgets/${budgetId}`, {
    method: 'PATCH',
    body: budget,
  })
}

export function deleteBudget(budgetId) {
  return apiRequest(`/budgets/${budgetId}`, {
    method: 'DELETE',
  })
}
