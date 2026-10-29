import type { Residence } from '../../data/types'
import { Callout, Icon, PageTitle } from '../../components/ui'

const GUIDE = [
  {
    title: 'Les premiers jours',
    items: [
      'Faites l’état des lieux d’entrée avec l’équipe. Gardez votre exemplaire.',
      'Récupérez vos clés, votre badge et, si besoin, votre carte de laverie.',
      'Lisez le règlement intérieur remis à votre arrivée.',
    ],
  },
  {
    title: 'Votre logement',
    items: [
      'Souscrivez une assurance habitation et remettez l’attestation à l’accueil.',
      'Vérifiez que votre nom figure sur la boîte aux lettres.',
      'Signalez tout problème technique à l’accueil, sans attendre.',
    ],
  },
  {
    title: 'Vos démarches administratives',
    items: [
      'Indiquez votre nouvelle adresse aux organismes qui vous suivent (CAF, France Travail, caisse d’assurance maladie…).',
      'Selon votre situation, une aide au logement peut être demandée auprès de la CAF.',
      'Besoin d’aide pour une démarche ? Demandez à l’accueil qui peut vous orienter.',
    ],
  },
]

const EXTERNAL = [
  {
    name: 'Site d’Adoma',
    url: 'https://www.adoma.cdc-habitat.fr/',
    text: 'Site officiel d’Adoma. Il donne accès à l’espace client.',
  },
  {
    name: 'CAF — Caisse d’allocations familiales',
    url: 'https://www.caf.fr/',
    text: 'Aides au logement, simulations et démarches en ligne.',
  },
  {
    name: 'France Travail',
    url: 'https://www.francetravail.fr/',
    text: 'Recherche d’emploi, inscription et accompagnement.',
  },
]

export function ProceduresPage({ residence, link }: { residence: Residence; link: (...p: string[]) => string }) {
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead="Le guide d’accueil et les liens vers les services en ligne existants.">
        Démarches utiles
      </PageTitle>

      <section aria-labelledby="guide-title" className="stack-md">
        <h2 id="guide-title">Guide d’accueil</h2>
        <div className="accordion">
          {GUIDE.map((g, i) => (
            <details key={g.title} open={i === 0}>
              <summary>{g.title}</summary>
              <ul className="check-list">
                {g.items.map((it) => (
                  <li key={it}>
                    <Icon name="check" size={18} />
                    {it}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <p>
          Une question sur la résidence ? <a href={link('contacts')}>Voir l’équipe et les contacts</a>.
        </p>
      </section>

      <section aria-labelledby="ext-title" className="stack-md">
        <h2 id="ext-title">Services en ligne</h2>
        <p>Ces liens ouvrent des sites externes, dans un nouvel onglet. Ils ne font pas partie du prototype.</p>
        <ul className="card-grid plain-list">
          {EXTERNAL.map((e) => (
            <li key={e.url} className="card card--padded external-card">
              <h3>{e.name}</h3>
              <p>{e.text}</p>
              <a className="btn btn--secondary btn--md" href={e.url} target="_blank" rel="noopener noreferrer">
                <span>Ouvrir le site</span>
                <Icon name="external" size={18} />
                <span className="visually-hidden"> {e.name} (site externe, nouvel onglet)</span>
              </a>
              <p className="external-card__url">{e.url.replace(/^https:\/\//, '').replace(/\/$/, '')}</p>
            </li>
          ))}
        </ul>
        <Callout tone="neutral" title="Ce que ce prototype ne fait pas">
          <p>Aucun paiement, aucun suivi de dossier, aucune connexion à un compte.</p>
        </Callout>
      </section>
    </div>
  )
}
