import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

const LS_TOKEN = 'sw_token'
const LS_USER  = 'sw_user'
const LS_LOCAL = 'sw_local_users'

const getLocalUsers = () => {
  try { return JSON.parse(localStorage.getItem(LS_LOCAL) || '[]') } catch { return [] }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(LS_TOKEN)
      const saved = localStorage.getItem(LS_USER)
      if (!token || !saved) { setLoading(false); return }

      // local-only token — restore from cache, no backend call
      if (token.startsWith('local_')) {
        setUser(JSON.parse(saved))
        setLoading(false)
        return
      }

      // real JWT — verify with backend
      try {
        const res = await api.get('/auth/me')
        const u = res.data?.user
        if (u) {
          setUser(u)
          localStorage.setItem(LS_USER, JSON.stringify(u))
        } else {
          setUser(JSON.parse(saved))
        }
      } catch {
        // backend unreachable — use cached session
        setUser(JSON.parse(saved))
      }
      setLoading(false)
    }
    init()
  }, [])

  const register = async ({ name, email, password, phone }) => {
    // try real backend
    try {
      const res = await api.post('/auth/register', { name, email, password, phone })
      const { token, user: u } = res.data
      setUser(u)
      localStorage.setItem(LS_TOKEN, token)
      localStorage.setItem(LS_USER, JSON.stringify(u))
      return u
    } catch (err) {
      const status = err.response?.status
      // backend up but rejected (email taken, validation error)
      if (status === 400) {
        const msg = err.response.data?.message
                 || err.response.data?.errors?.[0]?.msg
                 || 'Registration failed'
        throw new Error(msg)
      }
      // backend down — register locally
    }

    const users = getLocalUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered')
    }
    const newUser = {
      _id: `local_${Date.now()}`,
      name, email: email.toLowerCase(), phone: phone || '',
      password,
      financialHealthScore: 50, streak: 0, totalBadges: 0,
      walletBalance: 0, totalDonated: 0, savingsGoalsMet: 0,
      monthlyIncome: 0, isAdmin: false,
      joinedAt: new Date().toISOString(),
    }
    localStorage.setItem(LS_LOCAL, JSON.stringify([...users, newUser]))
    const { password: _, ...safeUser } = newUser
    const token = `local_${newUser._id}_${Date.now()}`
    setUser(safeUser)
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_USER, JSON.stringify(safeUser))
    return safeUser
  }

  const login = async (email, password) => {
    // try real backend
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, user: u } = res.data
      setUser(u)
      localStorage.setItem(LS_TOKEN, token)
      localStorage.setItem(LS_USER, JSON.stringify(u))
      return u
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 400) {
        // backend is up but credentials wrong — also check local registry
        const users = getLocalUsers()
        const found = users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) throw new Error('Invalid email or password')
        const { password: _, ...safeUser } = found
        const token = `local_${found._id}_${Date.now()}`
        setUser(safeUser)
        localStorage.setItem(LS_TOKEN, token)
        localStorage.setItem(LS_USER, JSON.stringify(safeUser))
        return safeUser
      }
      // backend down — check local registry
    }

    const users = getLocalUsers()
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) throw new Error('Invalid email or password')
    const { password: _, ...safeUser } = found
    const token = `local_${found._id}_${Date.now()}`
    setUser(safeUser)
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_USER, JSON.stringify(safeUser))
    return safeUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_USER)
  }

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem(LS_USER, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
