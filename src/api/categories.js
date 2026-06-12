import { apiRequest } from './client.js'

export function getCategories() {
  return apiRequest('/categories')
}

export function createCategory(category) {
  return apiRequest('/categories', {
    method: 'POST',
    body: category,
  })
}

export function updateCategory(categoryId, category) {
  return apiRequest(`/categories/${categoryId}`, {
    method: 'PATCH',
    body: category,
  })
}

export function deleteCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}`, {
    method: 'DELETE',
  })
}
