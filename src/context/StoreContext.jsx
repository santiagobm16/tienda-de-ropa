import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { readStore, STORE_KEY, writeStore } from '../services/store.js'
import { useToast } from './ToastContext.jsx'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)
const storage = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}
const withStoreLock = action => navigator.locks
  ? navigator.locks.request(STORE_KEY, action)
  : Promise.resolve().then(action)

export function StoreProvider({ children }) {
  const initial = useRef(null)
  initial.current ??= readStore(storage)
  const [data, setData] = useState(initial.current.data)
  const notify = useToast()
  useEffect(() => {
    if (initial.current.error) notify(initial.current.error, 'error')
    if (initial.current.fresh) {
      withStoreLock(() => {
        const latest = readStore(storage)
        if (latest.fresh) writeStore(storage, latest.data)
        else if (!latest.error) setData(latest.data)
      }).catch(error => notify(error.message, 'error'))
    }
    function sync(event) {
      if (event.key !== STORE_KEY && event.key !== null) return
      const latest = readStore(storage)
      if (latest.error) notify(latest.error, 'error')
      else setData(latest.data)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [notify])

  const transact = useCallback(mutate => withStoreLock(() => {
    const latest = readStore(storage)
    if (latest.error) throw new Error(latest.error)
    const { next, result } = mutate(latest.data)
    if (next !== latest.data || latest.fresh) writeStore(storage, next)
    setData(next)
    return result
  }), [])

  const update = useCallback(mutate => transact(current => ({ next: mutate(current) })), [transact])
  return <StoreContext.Provider value={{ data, update, transact }}>{children}</StoreContext.Provider>
}
