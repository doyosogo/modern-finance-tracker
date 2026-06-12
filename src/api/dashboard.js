import { apiRequest } from './client.js'

export function getDashboardSummary() {
  return apiRequest('/dashboard/summary')
}
