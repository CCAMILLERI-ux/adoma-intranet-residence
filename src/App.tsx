import { useEffect, useRef } from 'react'
import { DemoBar } from './components/DemoBar'
import { Notice } from './components/ui'
import { parseHash, useHash } from './lib/router'
import { useStore } from './lib/store'
import { CentralAdmin } from './views/central/CentralAdmin'
import { LocalAdmin } from './views/local/LocalAdmin'
import { ResidentApp } from './views/resident/ResidentApp'
import { HallScreen } from './views/hall/HallScreen'
import { FrenchOnly, useI18n } from './i18n'
import { stopSpeaking } from './components/ListenButton'

export function App() {
  const { data } = useStore()
  const hash = useHash()
  const route = parseHash(hash, data.residences.map((r) => r.id))
  const first = useRef(true)

  // Après chaque navigation : retour en haut et focus sur le titre de la page,
  // pour que les lecteurs d'écran annoncent la nouvelle page.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const opensSection = route.view === 'resident' && route.path[0] === 'services' && route.path[1]
    if (opensSection) return
    window.scrollTo(0, 0)
    const target = document.getElementById('page-title') ?? document.getElementById('contenu')
    target?.focus({ preventScroll: true })
  }, [hash]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const residence = data.residences.find((r) => r.id === route.residenceId)
    const space = {
      resident: 'Mon espace résidence',
      gestion: 'Administration de résidence',
      central: 'Administration centrale',
      ecran: 'Affichage hall',
    }[route.view]
    document.title = route.view === 'central' ? `${space} — Prototype` : `${space} — ${residence?.name} — Prototype`
  }, [route.view, route.residenceId, data.residences])

  // Langue du document : celle de l'interface résident, le français ailleurs.
  const { lang } = useI18n()
  useEffect(() => {
    document.documentElement.lang = route.view === 'resident' ? lang : 'fr'
  }, [route.view, lang])

  // Une lecture vocale en cours s'arrête quand on change de page.
  useEffect(() => stopSpeaking, [hash])

  return (
    <>
      <a
        className="skip-link"
        href="#contenu"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('contenu')?.focus()
        }}
      >
        Aller au contenu
      </a>
      <DemoBar route={route} />
      {route.view === 'resident' && <ResidentApp route={route} />}
      <FrenchOnly>
        {route.view === 'gestion' && <LocalAdmin route={route} />}
        {route.view === 'central' && <CentralAdmin route={route} />}
        {route.view === 'ecran' && <HallScreen residenceId={route.residenceId} />}
      </FrenchOnly>
      <Notice />
    </>
  )
}
