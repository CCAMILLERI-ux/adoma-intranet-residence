// Composants de base du design system, réutilisés par les trois vues.

import { useEffect, useRef, type ReactNode } from 'react'
import type { DisplayStatus } from '../data/types'
import { STATUS_LABELS } from '../lib/visibility'
import { useStore } from '../lib/store'

/* ---------- Pictogrammes (toujours accompagnés d'un texte) ---------- */

const ICONS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 18l-6-6 6-6',
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  news: 'M4 5h13v14H6a2 2 0 0 1-2-2V5zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  house: 'M4 20V9l8-5 8 5v11zM10 20v-6h4v6',
  people: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a7 7 0 0 1 14 0v1M17 11a3 3 0 1 0 0-6M22 21v-1a6 6 0 0 0-4-5.6',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  pin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  phone: 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  alert: 'M12 3l10 18H2zM12 10v4M12 17.5v.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  check: 'M4 12l5 5L20 6',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  wash: 'M5 3h14v18H5zM5 7h14M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 5h.01',
  recycle: 'M7 19H4l3-5M17 19h3l-3-5M9 5l3-2 3 2M8 14l4-7 4 7',
  tool: 'M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  menu: 'M4 7h16M4 12h16M4 17h16',
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

/* ---------- Typographie ---------- */

export function Eyebrow({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'muted' | 'inverse' }) {
  return <p className={`eyebrow eyebrow--${tone}`}>{children}</p>
}

/** Titre de page : reçoit le focus après chaque navigation. */
export function PageTitle({ children, lead, eyebrow }: { children: ReactNode; lead?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <header className="page-title">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 id="page-title" tabIndex={-1}>
        {children}
      </h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  )
}

/* ---------- Étapes de parcours ---------- */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepper" aria-label="Étapes">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo'
        return (
          <li key={label} className={`stepper__step stepper__step--${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="stepper__dot" aria-hidden="true">
              {state === 'done' ? <Icon name="check" size={16} /> : i + 1}
            </span>
            <span className="stepper__label">
              <span className="visually-hidden">
                Étape {i + 1} sur {steps.length}
                {state === 'done' ? ', terminée' : state === 'active' ? ', en cours' : ''} :{' '}
              </span>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/* ---------- Boutons ---------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse'

interface ButtonProps {
  children: ReactNode
  variant?: Variant
  icon?: IconName
  iconAfter?: IconName
  size?: 'md' | 'sm'
  href?: string
  external?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  ariaDescribedBy?: string
}

export function Button({
  children,
  variant = 'primary',
  icon,
  iconAfter,
  size = 'md',
  href,
  external,
  onClick,
  type = 'button',
  disabled,
  className = '',
  ariaDescribedBy,
}: ButtonProps) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim()
  const inner = (
    <>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={18} />}
      {external && <span className="visually-hidden"> (site externe, nouvel onglet)</span>}
    </>
  )
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        onClick={onClick}
        aria-describedby={ariaDescribedBy}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }
  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled} aria-describedby={ariaDescribedBy}>
      {inner}
    </button>
  )
}

/* ---------- Étiquettes ---------- */

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>
}

/** Origine d'un contenu : toujours écrite en toutes lettres. */
export function ScopeTag({ scope }: { scope: 'local' | 'national' }) {
  return scope === 'national' ? (
    <span className="scope scope--national">
      <Icon name="globe" size={14} />
      Campagne nationale
    </span>
  ) : (
    <span className="scope scope--local">
      <Icon name="pin" size={14} />
      Information de la résidence
    </span>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>
}

/* ---------- Encadrés ---------- */

export function Callout({
  tone = 'info',
  title,
  children,
  icon,
}: {
  tone?: 'info' | 'warning' | 'success' | 'alert' | 'neutral'
  title?: ReactNode
  children?: ReactNode
  icon?: IconName
}) {
  const fallback: Record<string, IconName> = { info: 'info', warning: 'alert', success: 'check', alert: 'alert', neutral: 'info' }
  return (
    <div className={`callout callout--${tone}`}>
      <span className="callout__icon">
        <Icon name={icon ?? fallback[tone]} />
      </span>
      <div>
        {title && <p className="callout__title">{title}</p>}
        {children && <div className="callout__body">{children}</div>}
      </div>
    </div>
  )
}

/* ---------- Message de confirmation (zone live) ---------- */

export function Notice() {
  const { notice, clearNotice } = useStore()
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(clearNotice, 7000)
    return () => window.clearTimeout(t)
  }, [notice, clearNotice])
  return (
    <div className="notice-region" role="status" aria-live="polite">
      {notice && (
        <div className="notice" key={notice.id}>
          <span className="notice__icon">
            <Icon name="check" />
          </span>
          <p>{notice.text}</p>
          <button type="button" className="icon-btn" onClick={clearNotice}>
            <Icon name="close" size={18} />
            <span className="visually-hidden">Fermer le message</span>
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Boîte de confirmation (élément <dialog> natif) ---------- */

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Annuler',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" onCancel={onCancel} onClose={() => open && onCancel()}>
      <h2 id="dialog-title">{title}</h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}

/* ---------- Divers ---------- */

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children && <div className="empty__body">{children}</div>}
    </div>
  )
}

/** Retourne le texte en paragraphes, en conservant les retours à la ligne saisis. */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim())
  return (
    <div className="rich-text">
      {blocks.map((b, i) => (
        <p key={i}>
          {b.split('\n').map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}
