// Champs de formulaire étiquetés, avec aide et message d'erreur reliés au champ.

import type { ReactNode } from 'react'
import { useI18n } from '../i18n'

interface FieldProps {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; required?: boolean }) => ReactNode
}

export function Field({ id, label, hint, error, required, children }: FieldProps) {
  const { t } = useI18n()
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required ? <span className="field__req"> ({t('required')})</span> : <span className="field__opt"> ({t('optional')})</span>}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {t('error')} : {error}
        </p>
      )}
    </div>
  )
}

export function ErrorSummary({ errors, labels }: { errors: Record<string, string>; labels: Record<string, string> }) {
  const keys = Object.keys(errors)
  if (!keys.length) return null
  return (
    <div className="error-summary" role="alert" tabIndex={-1} id="error-summary">
      <p className="error-summary__title">
        {keys.length === 1 ? 'Un champ est à corriger' : `${keys.length} champs sont à corriger`}
      </p>
      <ul>
        {keys.map((k) => (
          <li key={k}>
            <a
              href={`#${k}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(k)?.focus()
              }}
            >
              {labels[k] ?? k} : {errors[k]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function focusSoon(id: string) {
  window.requestAnimationFrame(() => {
    const el = document.getElementById(id)
    el?.focus()
    el?.scrollIntoView({ block: 'start' })
  })
}
