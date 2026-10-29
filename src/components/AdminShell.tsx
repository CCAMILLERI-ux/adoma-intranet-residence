import type { ReactNode } from 'react'
import { BrandLogo } from './BrandLogo'
import { Icon, type IconName } from './ui'

export interface AdminNavItem {
  href: string
  label: string
  icon: IconName
  current: boolean
}

/**
 * Gabarit commun aux deux administrations.
 * Reprend la barre latérale sombre du design system (252 px) sur ordinateur ;
 * sur mobile, elle devient un bandeau en haut de page.
 */
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
      <header className="admin-sidebar">
        <div className="admin-sidebar__inner">
          <div className="admin-sidebar__logo">
            <BrandLogo />
          </div>
          <p className="admin-sidebar__label">{space}</p>
          <p className="admin-sidebar__context">{context}</p>
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
          <p className="admin-sidebar__footer">Prototype exploratoire — données fictives</p>
        </div>
      </header>
      <main id="contenu" className="admin-main" tabIndex={-1}>
        <div className="container stack-lg">{children}</div>
      </main>
    </div>
  )
}
