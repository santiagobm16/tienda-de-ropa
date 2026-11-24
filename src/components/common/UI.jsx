import { cloneElement, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Minus, Plus, X } from 'lucide-react'
import { imagePlaceholder } from '../../data/demo.js'

export function Photo({ src, alt = '', className, ...props }) {
  return <img src={src || imagePlaceholder} alt={alt} className={className}
    onError={event => { if (event.currentTarget.getAttribute('src') !== imagePlaceholder) event.currentTarget.src = imagePlaceholder }}
    {...props} />
}

export function Field({ label, children, full = false }) {
  const id = useId()
  const control = children.type === 'select' ? cloneElement(children, { 'aria-labelledby': id }) : children
  return <label className={full ? 'field full' : 'field'}><span id={id}>{label}</span>{control}</label>
}

export function Empty({ title, children }) {
  return <div className="empty"><h2>{title}</h2>{children}</div>
}

export function Modal({ title, children, onClose, wide = false }) {
  const dialog = useRef(null)
  const heading = useId()
  const closer = useRef(onClose)
  closer.current = onClose
  useEffect(() => {
    const node = dialog.current
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    node.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      node.close()
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return <dialog ref={dialog} aria-labelledby={heading} className={wide ? 'modal wide' : 'modal'}
    onCancel={event => { event.preventDefault(); closer.current() }}
    onClick={event => { if (event.target === event.currentTarget) closer.current() }}>
    <div className="modal-body">
      <div className="section-head"><h2 id={heading}>{title}</h2><button type="button" className="icon-button" aria-label="Cerrar ventana" onClick={onClose}><X /></button></div>
      {children}
    </div>
  </dialog>
}

export function Confirm({ title, description, action, onClose, onConfirm, pending }) {
  return <Modal title={title} onClose={onClose}>
    <p>{description}</p>
    <div className="action-row">
      <button type="button" className="button secondary" disabled={pending} onClick={onClose}>Volver</button>
      <button type="button" className="button danger" disabled={pending} onClick={onConfirm}>{action}</button>
    </div>
  </Modal>
}

export function Tabs({ items, label }) {
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const prefix = useId()
  function onKey(event) {
    const positions = { ArrowRight: (active + 1) % items.length, ArrowLeft: (active + items.length - 1) % items.length, Home: 0, End: items.length - 1 }
    if (!Object.hasOwn(positions, event.key)) return
    event.preventDefault()
    const index = positions[event.key]
    setActive(index)
    root.current.querySelectorAll('[role="tab"]')[index].focus()
  }
  return <div className="tabs">
    <div ref={root} role="tablist" aria-label={label} className="tab-list" onKeyDown={onKey}>
      {items.map(([name], index) => <button type="button" role="tab" key={name} id={prefix + '-tab-' + index}
        aria-controls={prefix + '-panel-' + index} aria-selected={active === index} tabIndex={active === index ? 0 : -1}
        onClick={() => setActive(index)}>{name}</button>)}
    </div>
    {items.map(([name, content], index) => <div role="tabpanel" key={name} id={prefix + '-panel-' + index}
      aria-labelledby={prefix + '-tab-' + index} hidden={active !== index} tabIndex={0} className="tab-panel">{active === index ? content : null}</div>)}
  </div>
}

export function Accordion({ items }) {
  return <div className="accordion">{items.map(([question, answer]) => <details key={question}>
    <summary>{question}<Plus size={17} aria-hidden="true" /></summary><div>{answer}</div>
  </details>)}</div>
}

export function Dropdown({ label, title, icon, align = 'right', children, disabled }) {
  const ref = useRef(null)
  const trigger = useRef(null)
  const id = useId()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    function outside(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    function escape(event) {
      if (event.key === 'Escape' && ref.current?.contains(document.activeElement)) {
        event.stopPropagation()
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  function choose() { setOpen(false); trigger.current?.focus() }
  return <div ref={ref} className="dropdown">
    <button type="button" ref={trigger} className={icon ? 'icon-button' : 'dropdown-trigger'} aria-label={title}
      aria-expanded={open} aria-controls={id} disabled={disabled} onClick={() => setOpen(value => !value)}>
      {icon || <>{label}<ChevronDown size={15} /></>}
    </button>
    {open && <div id={id} className={'dropdown-panel ' + align}>{children(choose)}</div>}
  </div>
}

export function Quantity({ value, onChange, max, min = 1, label = 'Cantidad', disabled }) {
  return <div className="quantity" role="group" aria-label={label}>
    <button type="button" aria-label="Disminuir cantidad" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}><Minus size={15} /></button>
    <output aria-label="Unidades">{value}</output>
    <button type="button" aria-label="Aumentar cantidad" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}><Plus size={15} /></button>
  </div>
}

export const dateLabel = value => Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value))
