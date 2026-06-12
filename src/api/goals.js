import { apiRequest } from './client.js'

export function getGoals() {
  return apiRequest('/goals')
}

export function getGoalById(goalId) {
  return apiRequest(`/goals/${goalId}`)
}

export function createGoal(goal) {
  return apiRequest('/goals', {
    method: 'POST',
    body: goal,
  })
}

export function updateGoal(goalId, goal) {
  return apiRequest(`/goals/${goalId}`, {
    method: 'PATCH',
    body: goal,
  })
}

export function deleteGoal(goalId) {
  return apiRequest(`/goals/${goalId}`, {
    method: 'DELETE',
  })
}
