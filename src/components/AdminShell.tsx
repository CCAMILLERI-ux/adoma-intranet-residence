import type { ReactNode } from 'react'
import { Icon, type IconName } from './ui'

export interface AdminNavItem {
  href: string
  label: string
  icon: IconName
  current: boolean
}

/** Gabarit commun aux deux administrations : bandeau sombre et navigation. */
export function AdminShell({
  space,
  context,
  nav,
  children,
}: {
  space: string
  context: string
  nav: AdminNavItem[]
  children: ReactNode
}) {
  return (
    <div className="admin">
      <header className="admin-header">
        <div className="container admin-header__inner">
          <div>
            <p className="admin-header__space">{space}</p>
            <p className="admin-header__context">{context}</p>
          </div>
          <nav aria-label={`Navigation — ${space}`}>
            <ul className="admin-nav">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} aria-current={n.current ? 'page' : undefined}>
                    <Icon name={n.icon} size={18} />
                    <span>{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="contenu" className="admin-main" tabIndex={-1}>
        <div className="container stack-lg">{children}</div>
      </main>
    </div>
  )
}
