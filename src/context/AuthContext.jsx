import { createContext, useContext, useState } from 'react'
import { accounts } from '../data/demo.js'
import { SESSION_KEY, validPhone } from '../services/store.js'
import { useStore } from './StoreContext.jsx'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function existingSession() {
  try { return window.sessionStorage.getItem(SESSION_KEY) }
  catch { return null }
}

export function AuthProvider({ children }) {
  const { data, update } = useStore()
  const [session, setSession] = useState(existingSession)
  const account = accounts.find(entry => entry.id === session)
  const user = account ? {
    id: account.id, name: account.name, role: account.role, email: account.email,
    phone: '', image: '', ...data.profiles[account.id],
  } : null

  function login(email, password) {
    const match = accounts.find(entry => entry.email === email.trim().toLowerCase() && entry.password === password)
    if (!match) throw new Error('Correo o contraseña incorrectos.')
    try { window.sessionStorage.setItem(SESSION_KEY, match.id) }
    catch { throw new Error('El navegador no permitió guardar la sesión.') }
    setSession(match.id)
  }

  function logout() {
    try { window.sessionStorage.removeItem(SESSION_KEY) }
    catch { throw new Error('El navegador no permitió cerrar la sesión guardada.') }
    setSession(null)
  }

  function saveProfile({ name, phone, image }) {
    if (!user) throw new Error('Inicia sesión para editar el perfil.')
    if (!name.trim() || (phone.trim() && !validPhone(phone.trim()))) {
      throw new Error('Ingresa un nombre y, si lo incluyes, un teléfono válido.')
    }
    return update(current => ({
      ...current, profiles: { ...current.profiles, [user.id]: { name: name.trim(), phone: phone.trim(), image } },
    }))
  }

  return <AuthContext.Provider value={{ user, login, logout, saveProfile }}>{children}</AuthContext.Provider>
}
