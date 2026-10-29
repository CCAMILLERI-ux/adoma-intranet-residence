// Barre réservée à la démonstration. Le changement de vue est une simulation :
// ce n'est pas un système d'authentification ni de droits d'accès.

import { useState } from 'react'
import { href, navigate, type Route, type View } from '../lib/router'
import { useStore } from '../lib/store'
import { ConfirmDialog, Icon } from './ui'

const VIEW_LABELS: Record<View, string> = {
  resident: 'Vue résident',
  gestion: 'Administration de résidence',
  central: 'Administration centrale',
}

export function DemoBar({ route }: { route: Route }) {
  const { data, reset, notify, persistent } = useStore()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const changeResidence = (residenceId: string) => {
    // On garde la rubrique ouverte, sans le détail (propre à une résidence).
    const section = route.view === 'resident' && route.path[0] ? [route.path[0]] : []
    navigate({ residenceId, view: route.view, path: section })
    notify(`Résidence affichée : ${data.residences.find((r) => r.id === residenceId)?.name}.`)
  }

  return (
    <div className="demo-bar" role="region" aria-label="Barre de démonstration">
      <div className="demo-bar__inner">
        <p className="demo-bar__label">
          <span className="demo-bar__pill">Démo</span>
          Prototype exploratoire — données fictives
        </p>
        <button
          type="button"
          className="demo-bar__toggle"
          aria-expanded={open}
          aria-controls="demo-options"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="menu" size={18} />
          <span>{open ? 'Masquer les options' : 'Options de démo'}</span>
        </button>
        <div id="demo-options" className={`demo-bar__options ${open ? 'is-open' : ''}`}>
          <nav aria-label="Changer de vue (simulation)">
            <ul className="demo-bar__views">
              {(Object.keys(VIEW_LABELS) as View[]).map((view) => (
                <li key={view}>
                  <a
                    href={href({ residenceId: route.residenceId, view, path: [] })}
                    aria-current={route.view === view ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {VIEW_LABELS[view]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="demo-bar__residence">
            <label htmlFor="demo-residence">Résidence</label>
            <select id="demo-residence" value={route.residenceId} onChange={(e) => changeResidence(e.target.value)}>
              {data.residences.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.replace('Résidence ', '')}
                </option>
              ))}
            </select>
          </div>
          <p className="demo-bar__storage">
            {persistent
              ? 'Modifications enregistrées uniquement sur ce navigateur.'
              : 'Stockage local indisponible : modifications perdues à la fermeture.'}
          </p>
          <button type="button" className="demo-bar__reset" onClick={() => setConfirming(true)}>
            <Icon name="undo" size={16} />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Réinitialiser la démonstration ?"
        confirmLabel="Oui, réinitialiser"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          reset()
          setConfirming(false)
          setOpen(false)
          navigate({ residenceId: route.residenceId, view: route.view, path: [] })
          notify('Démonstration réinitialisée. Les exemples ont été recréés à la date du jour.')
        }}
      >
        <p>
          Tous les contenus créés, modifiés ou retirés sur ce navigateur seront effacés. Les exemples de départ seront
          recréés à la date du jour.
        </p>
      </ConfirmDialog>
    </div>
  )
}
