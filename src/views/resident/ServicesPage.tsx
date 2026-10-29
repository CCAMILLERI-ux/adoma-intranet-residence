import { useEffect } from 'react'
import type { Residence } from '../../data/types'
import { useStore } from '../../lib/store'
import { Callout, Icon, PageTitle, type IconName } from '../../components/ui'
import { SERVICE_PHOTOS, type Photo } from '../../components/photos'

const PARTS: { id: string; label: string; icon: IconName }[] = [
  { id: 'laverie', label: 'Laverie', icon: 'wash' },
  { id: 'dechets', label: 'Déchets et tri', icon: 'recycle' },
  { id: 'equipements', label: 'Équipements du logement', icon: 'house' },
  { id: 'espaces-communs', label: 'Espaces communs', icon: 'people' },
  { id: 'probleme-technique', label: 'Un problème technique ?', icon: 'tool' },
]

export function ServicesPage({
  residence,
  section,
  link,
}: {
  residence: Residence
  section?: string
  link: (...path: string[]) => string
}) {
  const { data } = useStore()
  const tech = data.contacts.find((c) => c.id === residence.technical.contactId)

  // Ouverture directe d'une rubrique (accès rapides de l'accueil).
  useEffect(() => {
    if (!section) return
    const heading = document.getElementById(`titre-${section}`)
    if (heading) {
      // On montre l'encart entier, photo comprise, puis on place le focus sur son titre.
      ;(heading.closest('section') ?? heading).scrollIntoView({ block: 'start' })
      heading.focus({ preventScroll: true })
    }
  }, [section])

  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead="Le fonctionnement de la résidence au quotidien.">
        Logement & services
      </PageTitle>

      <nav aria-label="Rubriques de la page" className="toc">
        <ul>
          {PARTS.map((p) => (
            <li key={p.id}>
              <a href={link('services', p.id)} aria-current={section === p.id ? 'true' : undefined}>
                <Icon name={p.icon} size={18} />
                {p.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="card card--padded stack-sm" aria-labelledby="titre-laverie">
        <SectionPhoto photo={SERVICE_PHOTOS.laverie} />
        <h2 id="titre-laverie" tabIndex={-1} className="card__title">
          <Icon name="wash" />
          Laverie
        </h2>
        <dl className="hours">
          <div>
            <dt>Lieu</dt>
            <dd>{residence.laundry.place}</dd>
          </div>
          {residence.laundry.hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.hours}</dd>
            </div>
          ))}
        </dl>
        <h3>Comment ça marche ?</h3>
        <ol className="steps">
          {residence.laundry.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="muted">{residence.laundry.pricing}</p>
      </section>

      <section className="card card--padded stack-sm" aria-labelledby="titre-dechets">
        <SectionPhoto photo={SERVICE_PHOTOS.dechets} />
        <h2 id="titre-dechets" tabIndex={-1} className="card__title">
          <Icon name="recycle" />
          Déchets et tri
        </h2>
        <p>
          <strong>Où ?</strong> {residence.waste.place}
        </p>
        <p>
          <strong>Collectes :</strong> {residence.waste.collectionDays}
        </p>
        <table className="table">
          <caption className="visually-hidden">Que mettre dans chaque bac ?</caption>
          <thead>
            <tr>
              <th scope="col">Bac</th>
              <th scope="col">Ce que l’on y met</th>
            </tr>
          </thead>
          <tbody>
            {residence.waste.rules.map((r) => (
              <tr key={r.bin}>
                <th scope="row">{r.bin}</th>
                <td>{r.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card card--padded stack-sm" aria-labelledby="titre-equipements">
        <SectionPhoto photo={SERVICE_PHOTOS.equipements} />
        <h2 id="titre-equipements" tabIndex={-1} className="card__title">
          <Icon name="house" />
          Équipements du logement
        </h2>
        <ul className="check-list">
          {residence.equipment.map((e) => (
            <li key={e}>
              <Icon name="check" size={18} />
              {e}
            </li>
          ))}
        </ul>
      </section>

      <section className="card card--padded stack-sm" aria-labelledby="titre-espaces-communs">
        <SectionPhoto photo={SERVICE_PHOTOS.espacesCommuns} />
        <h2 id="titre-espaces-communs" tabIndex={-1} className="card__title">
          <Icon name="people" />
          Espaces communs
        </h2>
        <div className="mini-grid">
          {residence.commonSpaces.map((s) => (
            <div key={s.name} className="mini-card">
              <h3>{s.name}</h3>
              <p className="mini-card__hours">
                <Icon name="clock" size={16} />
                {s.hours}
              </p>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card card--padded stack-sm" aria-labelledby="titre-probleme-technique">
        <h2 id="titre-probleme-technique" tabIndex={-1} className="card__title">
          <Icon name="tool" />
          Un problème technique ?
        </h2>
        <p>Une fuite, une panne, un équipement abîmé ? Voici la démarche à suivre.</p>
        <ol className="steps">
          {residence.technical.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {tech && (
          <div className="contact-box">
            <p className="contact-box__label">Contact technique (fictif)</p>
            <p className="contact-role">{tech.role}</p>
            <p>
              {tech.name} <span className="fictive">(nom fictif)</span> — {tech.hours}
            </p>
            <p>
              <a href={`tel:${tech.phone.replace(/\s/g, '')}`}>
                <Icon name="phone" size={18} />
                {tech.phone}
              </a>{' '}
              <span className="fictive">(numéro fictif)</span>
            </p>
          </div>
        )}
        <Callout tone="warning" title="En cas d’urgence">
          <p>{residence.technical.emergency}</p>
        </Callout>
        <p className="muted small">
          Ce prototype n’envoie aucune demande d’intervention : il indique seulement qui contacter.
        </p>
      </section>
    </div>
  )
}

function SectionPhoto({ photo }: { photo: Photo }) {
  return (
    <figure className="card__visual card__visual--photo">
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      <figcaption aria-hidden="true">Photo d’illustration</figcaption>
    </figure>
  )
}
