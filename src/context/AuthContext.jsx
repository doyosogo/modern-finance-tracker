import { useMemo, useState } from 'react'
import { AuthContext } from './authContextObject.js'

const AUTH_TOKEN_STORAGE_KEY = 'finance_tracker_access_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''
  })

  function login(accessToken) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken)
    setToken(accessToken)
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    setToken('')
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
