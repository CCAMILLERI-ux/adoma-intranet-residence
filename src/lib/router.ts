// Routage par fragment (#/…) : fonctionne sur GitHub Pages sans configuration serveur,
// y compris lors d'un rechargement de page.
// Forme : #/<résidence>/<vue>/<chemin…>

import { useEffect, useState } from 'react'

export type View = 'resident' | 'gestion' | 'central' | 'ecran'

export interface Route {
  residenceId: string
  view: View
  path: string[]
}

const VIEWS: View[] = ['resident', 'gestion', 'central', 'ecran']
export const DEFAULT_RESIDENCE = 'tilleuls'

export function parseHash(hash: string, residenceIds: string[]): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const residenceId = residenceIds.includes(parts[0]) ? parts[0] : DEFAULT_RESIDENCE
  const view = VIEWS.includes(parts[1] as View) ? (parts[1] as View) : 'resident'
  return { residenceId, view, path: residenceIds.includes(parts[0]) && VIEWS.includes(parts[1] as View) ? parts.slice(2) : [] }
}

export function href(route: Route): string {
  return '#/' + [route.residenceId, route.view, ...route.path].map(encodeURIComponent).join('/')
}

export function navigate(route: Route) {
  const target = href(route)
  if (window.location.hash !== target) window.location.hash = target
}

export function useHash(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}
