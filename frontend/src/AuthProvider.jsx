import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens')
    return stored ? JSON.parse(stored) : null
  })
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens))
      fetch('/api/accounts/profile/', {
        headers: { Authorization: `Bearer ${tokens.access}` },
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => setUser(data))
        .catch(() => setUser(null))
    } else {
      localStorage.removeItem('tokens')
      setUser(null)
    }
  }, [tokens])

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

  const register = async (username, email, password) => {
    const res = await fetch('/api/accounts/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
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
    <AuthContext.Provider value={{ user, tokens, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)