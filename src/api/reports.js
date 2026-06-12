import { apiRequest } from './client.js'

export function getSpendingByCategory() {
  return apiRequest('/reports/spending-by-category')
}

export function getMonthlySummary() {
  return apiRequest('/reports/monthly-summary')
}

export function getBudgetProgress() {
  return apiRequest('/reports/budget-progress')
}

export function getFinancialInsights() {
  return apiRequest('/reports/financial-insights')
}
