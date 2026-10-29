// Affiche imprimable (format A4) : utilise la fonction d'impression du navigateur.

import type { LocalContent, Residence } from '../../data/types'
import { formatDateRange, formatShortDate, formatTimeRange, today } from '../../lib/dates'
import { displayStatus, TEMPLATE_LABELS } from '../../lib/visibility'
import { Button, Callout, RichText } from '../../components/ui'

export function Poster({ content, residence, backHref }: { content: LocalContent; residence: Residence; backHref: string }) {
  const status = displayStatus(content, today())
  const when = [formatDateRange(content.startDate, content.endDate), formatTimeRange(content.startTime, content.endTime)]
    .filter(Boolean)
    .join(', ')

  return (
    <main id="contenu" className="poster-page" tabIndex={-1}>
      <div className="poster-toolbar no-print">
        <div className="container stack-sm">
          <h1 id="page-title" tabIndex={-1} className="h3">
            Affiche à imprimer
          </h1>
          <p className="small">
            Utilisez « Imprimer l’affiche », puis choisissez une imprimante ou « Enregistrer au format PDF ». Format A4
            portrait.
          </p>
          {status !== 'publie' && (
            <Callout tone="warning" title={`Cette information n’est pas publiée (statut : ${status === 'brouillon' ? 'brouillon' : status === 'programme' ? 'programmée' : status === 'expire' ? 'expirée' : 'retirée'}).`}>
              <p>Vérifiez qu’elle est à jour avant de l’afficher dans la résidence.</p>
            </Callout>
          )}
          <div className="action-row">
            <Button icon="print" onClick={() => window.print()}>
              Imprimer l’affiche
            </Button>
            <Button variant="secondary" icon="back" href={backHref}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>

      <article className="poster" aria-label="Aperçu de l’affiche">
        <header className="poster__band">
          <p className="poster__residence">{residence.name}</p>
          <p className="poster__kind">{TEMPLATE_LABELS[content.template]}</p>
        </header>
        <div className="poster__body">
          <h2 className="poster__title">{content.title}</h2>
          {(when || content.location) && (
            <dl className="poster__facts">
              {when && (
                <div>
                  <dt>Quand</dt>
                  <dd>{when.charAt(0).toUpperCase() + when.slice(1)}</dd>
                </div>
              )}
              {content.location && (
                <div>
                  <dt>Où</dt>
                  <dd>{content.location}</dd>
                </div>
              )}
            </dl>
          )}
          <div className="poster__message">
            <RichText text={content.message || content.description} />
          </div>
          {content.contact && (
            <div className="poster__contact">
              <p className="poster__contact-label">Contact</p>
              <p>{content.contact}</p>
            </div>
          )}
        </div>
        <footer className="poster__footer">
          <p>
            Affiché le {formatShortDate(content.publishAt)}
            {content.expireAt && ` · Valable jusqu’au ${formatShortDate(content.expireAt)}`}
          </p>
          <p>Retrouvez aussi cette information dans « Mon espace résidence ».</p>
          <p className="poster__demo">Prototype exploratoire — données fictives</p>
        </footer>
      </article>
    </main>
  )
}
