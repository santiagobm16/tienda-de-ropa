import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([])
  const timers = useRef(new Map())
  const dismiss = useCallback(id => {
    clearTimeout(timers.current.get(id))
    setMessages(entries => entries.map(entry => entry.id === id ? { ...entry, closing: true } : entry))
    timers.current.set(id, setTimeout(() => {
      timers.current.delete(id)
      setMessages(entries => entries.filter(entry => entry.id !== id))
    }, 180))
  }, [])
  const notify = useCallback((message, type = 'success', duration = 4200) => {
    const id = crypto.randomUUID()
    setMessages(entries => [...entries, { id, message, type }])
    timers.current.set(id, setTimeout(() => dismiss(id), duration))
  }, [dismiss])

  useEffect(() => {
    const activeTimers = timers.current
    return () => activeTimers.forEach(clearTimeout)
  }, [])

  return <ToastContext.Provider value={notify}>
    {children}
    <div className="toasts">
      {messages.map(({ id, message, type, closing }) => <div key={id} className={closing ? 'toast closing' : 'toast'} role={type === 'error' ? 'alert' : 'status'}>
        {type === 'error' ? <CircleAlert size={20} /> : <CircleCheck size={20} />}
        <span>{message}</span><button type="button" className="icon-button" aria-label="Cerrar aviso" onClick={() => dismiss(id)}><X size={18} /></button>
      </div>)}
    </div>
  </ToastContext.Provider>
}
