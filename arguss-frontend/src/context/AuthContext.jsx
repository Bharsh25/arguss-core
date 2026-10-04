import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('arguss_token')
    const role = localStorage.getItem('arguss_role')
    const name = localStorage.getItem('arguss_name')
    const id = localStorage.getItem('arguss_id')
    const parsedId = id && !isNaN(Number(id)) ? Number(id) : null
    return token ? { token, role, name, id: parsedId } : null
  })

  const login = useCallback(({ access_token, role, name, id }) => {
    localStorage.setItem('arguss_token', access_token)
    localStorage.setItem('arguss_role', role)
    localStorage.setItem('arguss_name', name)
    if (id !== undefined && id !== null) {
      localStorage.setItem('arguss_id', String(id))
    }
    const parsedId = id && !isNaN(Number(id)) ? Number(id) : null
    setAuth({ token: access_token, role, name, id: parsedId })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('arguss_token')
    localStorage.removeItem('arguss_role')
    localStorage.removeItem('arguss_name')
    localStorage.removeItem('arguss_id')
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated: !!auth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
