const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const AUTH_TOKEN_STORAGE_KEY = 'finance_tracker_access_token'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

function buildUrl(path, params) {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  return url
}

async function getErrorMessage(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const errorData = await response.json()

    if (typeof errorData.detail === 'string') {
      return errorData.detail
    }

    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(', ')
    }

    return JSON.stringify(errorData)
  }

  const text = await response.text()
  return text || `Request failed with status ${response.status}`
}

function getStoredAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

function handleUnauthorizedResponse() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

export async function apiRequest(path, options = {}) {
  const { params, body, headers, ...fetchOptions } = options
  const accessToken = getStoredAccessToken()
  const requestHeaders = {
    ...headers,
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse()
    }

    const message = await getErrorMessage(response)
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}
