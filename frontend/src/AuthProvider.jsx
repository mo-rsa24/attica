/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {jwtDecode} from "jwt-decode";
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens')
    return stored ? JSON.parse(stored) : null
  })
  const [user, setUser] = useState(null)

  // Function to refresh access token
  const refreshToken = useCallback(async () => {
    if (!tokens?.refresh) return false

    const res = await fetch('/api/accounts/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })

    if (res.ok) {
      const data = await res.json()
      setTokens(prev => ({ ...prev, access: data.access }))
      return true
    } else {
      setTokens(null)
      return false
    }
  }, [tokens])

  useEffect(() => {
    if (!tokens) {
      setUser(null)
      localStorage.removeItem('tokens')
      return
    }

    localStorage.setItem('tokens', JSON.stringify(tokens))

    const decoded = jwtDecode(tokens.access)
    const isExpired = decoded.exp * 1000 < Date.now()

    const fetchUser = async () => {
      let tokenValid = true

      if (isExpired) {
        tokenValid = await refreshToken()
      }

      if (tokenValid) {
        fetch('/api/accounts/me/', {
          headers: { Authorization: `Bearer ${tokens.access}` },
        })
          .then(res => (res.ok ? res.json() : null))
          .then(data => setUser(data))
          .catch(() => setUser(null))
      } else {
        setUser(null)
      }
    }

    fetchUser()
  }, [tokens, refreshToken])

  const login = async (username, password) => {
    const res = await fetch('/api/accounts/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      const data = await res.json()
      setTokens({ access: data.access, refresh: data.refresh })
      return true
    }
    return false
  }

  const logout = () => {
    setTokens(null)
  }

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
