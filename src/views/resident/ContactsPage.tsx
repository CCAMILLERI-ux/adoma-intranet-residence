import type { Residence } from '../../data/types'
import { useStore } from '../../lib/store'
import { Callout, Icon, PageTitle } from '../../components/ui'

export function ContactsPage({ residence }: { residence: Residence }) {
  const { data } = useStore()
  const contacts = data.contacts.filter((c) => c.residenceId === residence.id)
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead="Qui fait quoi dans votre résidence, et quand trouver chaque personne.">
        Équipe & contacts
      </PageTitle>
      <Callout tone="neutral" title="Données fictives">
        <p>Les noms, numéros et adresses électroniques de cette page sont inventés pour la démonstration.</p>
      </Callout>

      <section aria-labelledby="accueil-title" className="card card--padded stack-sm">
        <h2 id="accueil-title" className="card__title">
          <Icon name="clock" />
          Accueil de la résidence
        </h2>
        <p>
          <Icon name="pin" size={18} /> {residence.receptionPlace}
        </p>
        <dl className="hours">
          {residence.receptionHours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.hours}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="team-title" className="stack-md">
        <h2 id="team-title">L’équipe</h2>
        <ul className="card-grid plain-list">
          {contacts.map((c) => (
            <li key={c.id} className="card card--padded contact-card">
              <h3 className="contact-card__role">{c.role}</h3>
              <p className="contact-name">
                {c.name} <span className="fictive">(nom fictif)</span>
              </p>
              <p>{c.mission}</p>
              <dl className="contact-card__info">
                <div>
                  <dt>
                    <Icon name="pin" size={16} />
                    Lieu de permanence
                  </dt>
                  <dd>{c.place}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="clock" size={16} />
                    Horaires
                  </dt>
                  <dd>{c.hours}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="phone" size={16} />
                    Téléphone
                  </dt>
                  <dd>
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="mail" size={16} />
                    Courriel
                  </dt>
                  <dd>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
