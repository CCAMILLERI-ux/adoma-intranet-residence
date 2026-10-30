import type { Residence } from '../../data/types'
import { useI18n } from '../../i18n'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/Avatar'
import { Callout, Icon, PageTitle } from '../../components/ui'

export function ContactsPage({ residence }: { residence: Residence }) {
  const { t } = useI18n()
  const { data } = useStore()
  const contacts = data.contacts.filter((c) => c.residenceId === residence.id)
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead={t('contacts.lead')}>
        {t('nav.contacts')}
      </PageTitle>
      <Callout tone="neutral" title={t('contacts.fictive.title')}>
        <p>{t('contacts.fictive.text')}</p>
      </Callout>

      <section aria-labelledby="accueil-title" className="card card--padded stack-sm">
        <h2 id="accueil-title" className="card__title">
          <Icon name="clock" />
          {t('contacts.reception')}
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
        <h2 id="team-title">{t('contacts.team')}</h2>
        <ul className="card-grid plain-list">
          {contacts.map((c) => (
            <li key={c.id} className="card card--padded contact-card">
              <div className="contact-card__head">
                <Avatar contact={c} />
                <div>
                  <h3 className="contact-card__role">{c.role}</h3>
                  <p className="contact-name">
                    {c.name} <span className="fictive">({t('fictive.name')})</span>
                  </p>
                </div>
              </div>
              <p>{c.mission}</p>
              <dl className="contact-card__info">
                <div>
                  <dt>
                    <Icon name="pin" size={16} />
                    {t('contacts.place')}
                  </dt>
                  <dd>{c.place}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="clock" size={16} />
                    {t('contacts.hours')}
                  </dt>
                  <dd>{c.hours}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="phone" size={16} />
                    {t('contacts.phone')}
                  </dt>
                  <dd>
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} dir="ltr">
                      {c.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="mail" size={16} />
                    {t('contacts.email')}
                  </dt>
                  <dd>
                    <a href={`mailto:${c.email}`} dir="ltr">
                      {c.email}
                    </a>
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
