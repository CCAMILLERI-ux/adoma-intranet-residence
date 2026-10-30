import { useEffect } from 'react'
import type { Residence } from '../../data/types'
import { useStore } from '../../lib/store'
import { Button, Callout, Icon, PageTitle, type IconName } from '../../components/ui'
import { useI18n } from '../../i18n'
import type { StringKey } from '../../i18n/strings'
import { SERVICE_PHOTOS, type Photo } from '../../components/photos'

const PARTS: { id: string; label: StringKey; icon: IconName }[] = [
  { id: 'laverie', label: 'services.laundry', icon: 'wash' },
  { id: 'dechets', label: 'services.waste', icon: 'recycle' },
  { id: 'equipements', label: 'services.equipment', icon: 'house' },
  { id: 'espaces-communs', label: 'services.common', icon: 'people' },
  { id: 'probleme-technique', label: 'services.tech', icon: 'tool' },
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
  const { t } = useI18n()
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
      <PageTitle eyebrow={residence.name} lead={t('services.lead')}>
        {t('nav.services')}
      </PageTitle>

      <nav aria-label={t('services.toc')} className="toc">
        <ul>
          {PARTS.map((p) => (
            <li key={p.id}>
              <a href={link('services', p.id)} aria-current={section === p.id ? 'true' : undefined}>
                <Icon name={p.icon} size={18} />
                {t(p.label)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="card card--padded stack-sm" aria-labelledby="titre-laverie">
        <SectionPhoto photo={SERVICE_PHOTOS.laverie} />
        <h2 id="titre-laverie" tabIndex={-1} className="card__title">
          <Icon name="wash" />
          {t('services.laundry')}
        </h2>
        <dl className="hours">
          <div>
            <dt>{t('detail.where')}</dt>
            <dd>{residence.laundry.place}</dd>
          </div>
          {residence.laundry.hours.map((h) => (
            <div key={h.days}>
              <dt>{h.days}</dt>
              <dd>{h.hours}</dd>
            </div>
          ))}
        </dl>
        <h3>{t('services.how')}</h3>
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
          {t('services.waste')}
        </h2>
        <p>
          <strong>{t('services.where')}</strong> {residence.waste.place}
        </p>
        <p>
          <strong>{t('services.collections')}</strong> {residence.waste.collectionDays}
        </p>
        <table className="table">
          <caption className="visually-hidden">{t('services.bins.caption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('services.bin')}</th>
              <th scope="col">{t('services.binItems')}</th>
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
          {t('services.equipment')}
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
          {t('services.common')}
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
          {t('services.tech')}
        </h2>
        <p>{t('services.tech.intro')}</p>
        <div>
          <Button href={link('signaler')} icon="tool">
            {t('report.title')}
          </Button>
        </div>
        <ol className="steps">
          {residence.technical.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {tech && (
          <div className="contact-box">
            <p className="contact-box__label">{t('services.tech.contact')}</p>
            <p className="contact-role">{tech.role}</p>
            <p>
              {tech.name} <span className="fictive">({t('fictive.name')})</span> — {tech.hours}
            </p>
            <p>
              <a href={`tel:${tech.phone.replace(/\s/g, '')}`} dir="ltr">
                <Icon name="phone" size={18} />
                {tech.phone}
              </a>{' '}
              <span className="fictive">({t('fictive.phone')})</span>
            </p>
          </div>
        )}
        <Callout tone="warning" title={t('services.emergency')}>
          <p>{residence.technical.emergency}</p>
        </Callout>
      </section>
    </div>
  )
}

function SectionPhoto({ photo }: { photo: Photo }) {
  const { t } = useI18n()
  return (
    <figure className="card__visual card__visual--photo">
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      <figcaption aria-hidden="true">{t('photo.caption')}</figcaption>
    </figure>
  )
}
