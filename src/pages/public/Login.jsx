import { useState } from 'react'
import { Eye, EyeOff, UserRound } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Accordion, Field } from '../../components/common/UI.jsx'
import { accounts } from '../../data/demo.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const notify = useToast()
  const { state } = useLocation()
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  if (user) return <Navigate replace to={state?.from || (user.role === 'administrador' ? '/admin' : '/perfil')} />

  function submit(event) {
    event.preventDefault()
    try {
      login(email, password)
      notify('Sesión iniciada.')
    } catch (failure) { setError(failure.message); notify(failure.message, 'error') }
  }
  return <div className="wrap page">
    <div className="auth-grid">
      <div className="auth-intro"><UserRound size={27} /><h1>Iniciar sesión</h1><p>Accede a tu perfil, consulta tus pedidos o administra la tienda.</p>
        <Link to="/productos" className="text-link">Seguir explorando</Link></div>
      <div className="panel flow">
        <form className="flow" onSubmit={submit}>
          <Field label="Correo electrónico"><input type="email" autoComplete="username" required value={email} onChange={event => { setEmail(event.target.value); setError('') }} /></Field>
          <Field label="Contraseña"><span className="password-field"><input type={show ? 'text' : 'password'} autoComplete="current-password" required
            value={password} onChange={event => { setPassword(event.target.value); setError('') }} />
          <button type="button" className="icon-button" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></Field>
          {error && <p role="alert" className="error">{error}</p>}
          <button type="submit" className="button">Iniciar sesión</button>
        </form>
        <Accordion items={accounts.map(account => ['Cuenta de ' + account.role, <div className="demo-credentials" key={account.id}>
          <p>{account.email}<br />{account.password}</p>
          <button type="button" className="button secondary small" onClick={() => { setEmail(account.email); setPassword(account.password); setError('') }}>Usar credenciales</button>
        </div>])} />
        <small className="muted">Credenciales visibles para la evaluación. Autenticación simulada de uso académico.</small>
      </div>
    </div>
  </div>
}
