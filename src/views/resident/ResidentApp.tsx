// Vue résident : conçue d'abord pour smartphone (navigation basse),
// puis élargie pour l'ordinateur (navigation horizontale). Interface en quatre langues.

import type { Residence } from '../../data/types'
import { href, type Route } from '../../lib/router'
import { useStore } from '../../lib/store'
import { today } from '../../lib/dates'
import { residentAlerts, residentEvents, residentNews } from '../../lib/visibility'
import { LANGS, useI18n } from '../../i18n'
import type { StringKey } from '../../i18n/strings'
import { Button, Callout, EmptyState, Icon, PageTitle, type IconName } from '../../components/ui'
import { Avatar } from '../../components/Avatar'
import { ResidenceCard } from '../../components/ResidenceCard'
import { BrandLogo } from '../../components/BrandLogo'
import { CampaignDetail, ContentDetail } from './details'
import { EventCard, NewsCard } from './cards'
import { ServicesPage } from './ServicesPage'
import { ContactsPage } from './ContactsPage'
import { ProceduresPage } from './ProceduresPage'
import { ReportPage } from './ReportPage'

const SECTIONS: { id: string; label: StringKey; short: StringKey; icon: IconName }[] = [
  { id: 'actualites', label: 'nav.news', short: 'nav.news', icon: 'news' },
  { id: 'agenda', label: 'nav.agenda', short: 'nav.agenda', icon: 'calendar' },
  { id: 'services', label: 'nav.services', short: 'nav.services.short', icon: 'house' },
  { id: 'contacts', label: 'nav.contacts', short: 'nav.contacts.short', icon: 'people' },
  { id: 'demarches', label: 'nav.procedures', short: 'nav.procedures.short', icon: 'doc' },
]

export function ResidentApp({ route }: { route: Route }) {
  const { data } = useStore()
  const { t, lang, setLang, dir } = useI18n()
  const residence = data.residences.find((r) => r.id === route.residenceId)!
  const link = (...path: string[]) => href({ residenceId: residence.id, view: 'resident', path })
  const [section = '', sub] = route.path

  let page
  switch (section) {
    case 'actualites':
      page = sub ? <NewsDetailPage residence={residence} id={sub} link={link} /> : <NewsPage residence={residence} link={link} />
      break
    case 'agenda':
      page = sub ? <EventDetailPage residence={residence} id={sub} link={link} /> : <AgendaPage residence={residence} link={link} />
      break
    case 'services':
      page = <ServicesPage residence={residence} section={sub} link={link} />
      break
    case 'contacts':
      page = <ContactsPage residence={residence} />
      break
    case 'demarches':
      page = <ProceduresPage residence={residence} link={link} />
      break
    case 'signaler':
      page = <ReportPage residence={residence} />
      break
    default:
      page = <HomePage residence={residence} link={link} />
  }

  return (
    <div className="resident" lang={lang === 'ar' ? 'ar' : lang} dir={dir}>
      <header className="resident-header">
        <div className="resident-topbar">
          <div className="container resident-topbar__inner">
            <div className="lang-switch" role="group" aria-label={t('lang.label')}>
              <Icon name="globe" size={16} />
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  lang={l.code}
                  aria-pressed={lang === l.code}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="container resident-header__inner">
          <a className="resident-brand" href={link()} aria-current={section === '' ? 'page' : undefined}>
            <BrandLogo />
            <span className="resident-brand__text">
              <span className="resident-brand__product">{t('product')}</span>
              <span className="resident-brand__name">{residence.name}</span>
            </span>
          </a>
          <nav className="resident-nav" aria-label={t('nav.main')}>
            <ul>
              <li className="resident-nav__home">
                <a href={link()} aria-current={section === '' ? 'page' : undefined}>
                  <Icon name="home" size={20} />
                  <span>{t('nav.home')}</span>
                </a>
              </li>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={link(s.id)} aria-current={section === s.id ? (sub ? 'true' : 'page') : undefined}>
                    <Icon name={s.icon} size={20} />
                    <span className="resident-nav__long">{t(s.label)}</span>
                    <span className="resident-nav__short" aria-hidden="true">
                      {t(s.short)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {lang !== 'fr' && (
        <p className="lang-note">
          <span className="container">
            <Icon name="info" size={16} />
            {t('lang.note')}
          </span>
        </p>
      )}
      <main id="contenu" className="resident-main" tabIndex={-1}>
        {page}
      </main>
      <footer className="resident-footer">
        <div className="container">
          <p>
            {residence.name} — {residence.address}
          </p>
          <p>{t('footer.fictive')}</p>
        </div>
      </footer>
    </div>
  )
}

type Link = (...path: string[]) => string

/* ---------------- Accueil ---------------- */

function HomePage({ residence, link }: { residence: Residence; link: Link }) {
  const { data } = useStore()
  const { t, tn } = useI18n()
  const now = today()
  const alerts = residentAlerts(data, residence.id, now)
  const news = residentNews(data, residence.id, now).slice(0, 3)
  const upcoming = residentEvents(data, residence.id, now)
  const events = upcoming.slice(0, 3)
  const contact = data.contacts.find((c) => c.id === residence.proximityContactId)

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="container">
          <p className="hero__tag">
            {t('product')} · {residence.kind}
          </p>
          <h1 id="page-title" tabIndex={-1}>
            {residence.name.startsWith('Résidence ') ? (
              <>
                Résidence <em>{residence.name.slice('Résidence '.length)}</em>
              </>
            ) : (
              residence.name
            )}
          </h1>
          <p className="hero__lead">{residence.welcome}</p>
          <div className="hero__actions">
            <Button href={link('signaler')} variant="inverse" icon="tool">
              {t('report.title')}
            </Button>
          </div>
        </div>
      </section>

      <div className="container stack-lg home">
        {alerts.length > 0 && (
          <section aria-label={t('home.alerts')} className="stack-sm">
            {alerts.map((a) => (
              <div className="alert-banner" key={a.id}>
                <span className="alert-banner__icon">
                  <Icon name="alert" />
                </span>
                <div>
                  <p className="alert-banner__label">{t('home.alert.label')}</p>
                  <p className="alert-banner__title">{a.title}</p>
                </div>
                <a className="alert-banner__link" href={link('actualites', a.id)}>
                  {t('home.alert.read')}
                  <span className="visually-hidden"> : {a.title}</span>
                  <Icon name="arrow" size={18} />
                </a>
              </div>
            ))}
          </section>
        )}

        <section className="quick-links" aria-labelledby="quick-title">
          <h2 id="quick-title" className="visually-hidden">
            {t('home.quick')}
          </h2>
          <a className="quick-link" href={link('services', 'laverie')}>
            <Icon name="wash" size={24} />
            <span>{t('services.laundry')}</span>
          </a>
          <a className="quick-link" href={link('signaler')}>
            <Icon name="tool" size={24} />
            <span>{t('report.title')}</span>
          </a>
          <a className="quick-link" href={link('demarches')}>
            <Icon name="doc" size={24} />
            <span>{t('nav.procedures')}</span>
          </a>
        </section>

        <div className="home-grid">
          <section aria-labelledby="home-news" className="stack-md">
            <div className="section-head">
              <h2 id="home-news">{t('home.news')}</h2>
              <a href={link('actualites')} className="text-link">
                {t('home.news.all')}
              </a>
            </div>
            {news.length ? (
              <div className="stack-sm">
                {news.map((n) => (
                  <NewsCard key={n.id} item={n} to={link('actualites', n.id)} listen />
                ))}
              </div>
            ) : (
              <EmptyState title={t('empty.news')} />
            )}
          </section>

          <section aria-labelledby="home-events" className="stack-md">
            <div className="section-head">
              <h2 id="home-events">{t('home.events')}</h2>
              <a href={link('agenda')} className="text-link">
                {t('home.events.all')}
              </a>
            </div>
            {events.length ? (
              <div className="stack-sm">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} to={link('agenda', e.id)} registration />
                ))}
              </div>
            ) : (
              <EmptyState title={t('empty.events')} />
            )}
          </section>
        </div>

        <ResidenceCard residence={residence} highlight={tn('home.events.count', upcoming.length)}>
          <p className="residence-card__text">{t('home.residence.text')}</p>
          <Button href={link('services')} iconAfter="arrow">
            {t('nav.services')}
          </Button>
        </ResidenceCard>

        <section className="home-grid" aria-label={`${t('home.hours')} · ${t('home.contact')}`}>
          <div className="card card--padded">
            <h2 className="card__title">
              <Icon name="clock" />
              {t('home.hours')}
            </h2>
            <dl className="hours">
              {residence.receptionHours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="muted small">{residence.receptionPlace}</p>
          </div>
          {contact && (
            <div className="card card--padded card--dark">
              <h2 className="card__title">
                <Icon name="people" />
                {t('home.contact')}
              </h2>
              <div className="contact-card__head">
                <Avatar contact={contact} size={64} />
                <div>
                  <p className="contact-role">{contact.role}</p>
                  <p className="contact-name">
                    {contact.name} <span className="fictive">({t('fictive.name')})</span>
                  </p>
                </div>
              </div>
              <p>{contact.mission}</p>
              <p>
                <a className="inverse-link" href={`tel:${contact.phone.replace(/\s/g, '')}`} dir="ltr">
                  <Icon name="phone" size={18} />
                  {contact.phone}
                </a>{' '}
                <span className="fictive">({t('fictive.phone')})</span>
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

/* ---------------- Actualités ---------------- */

function NewsPage({ residence, link }: { residence: Residence; link: Link }) {
  const { data } = useStore()
  const { t } = useI18n()
  const news = residentNews(data, residence.id, today())
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead={t('news.lead')}>
        {t('nav.news')}
      </PageTitle>
      <Callout tone="neutral" title={t('news.howto.title')}>
        <p>{t('news.howto.text')}</p>
      </Callout>
      {news.length ? (
        <div className="card-grid">
          {news.map((n) => (
            <NewsCard key={n.id} item={n} to={link('actualites', n.id)} listen />
          ))}
        </div>
      ) : (
        <EmptyState title={t('empty.news')} />
      )}
    </div>
  )
}

function NotAvailable({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const { t } = useI18n()
  return (
    <div className="container stack-md reading">
      <PageTitle>{t('unavailable.title')}</PageTitle>
      <p>{t('unavailable.text')}</p>
      <Button href={backHref} variant="secondary" icon="back">
        {backLabel}
      </Button>
    </div>
  )
}

function NewsDetailPage({ residence, id, link }: { residence: Residence; id: string; link: Link }) {
  const { data } = useStore()
  const { t } = useI18n()
  const item = residentNews(data, residence.id, today()).find((n) => n.id === id)
  // Une alerte importante peut aussi pointer vers un événement : on le cherche dans l'agenda.
  const event = !item ? residentEvents(data, residence.id, today()).find((e) => e.id === id) : undefined
  if (!item && !event) return <NotAvailable backHref={link('actualites')} backLabel={t('back.news')} />
  return (
    <div className="container reading stack-lg">
      <a className="back-link" href={link('actualites')}>
        <Icon name="back" size={18} />
        {t('back.news')}
      </a>
      {item?.kind === 'national' ? (
        <CampaignDetail campaign={item.campaign} listen />
      ) : (
        <ContentDetail content={item ? item.content : event!} listen registration />
      )}
    </div>
  )
}

/* ---------------- Agenda ---------------- */

function AgendaPage({ residence, link }: { residence: Residence; link: Link }) {
  const { data } = useStore()
  const { t } = useI18n()
  const events = residentEvents(data, residence.id, today())
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead={t('agenda.lead')}>
        {t('nav.agenda')}
      </PageTitle>
      {events.length ? (
        <>
          <ol className="plain-list stack-sm" aria-label={t('agenda.list')}>
            {events.map((e) => (
              <li key={e.id}>
                <EventCard event={e} to={link('agenda', e.id)} registration />
              </li>
            ))}
          </ol>
          <p className="small muted">{t('reg.note')}</p>
        </>
      ) : (
        <EmptyState title={t('empty.events')}>
          <p>{t('empty.events.more')}</p>
        </EmptyState>
      )}
    </div>
  )
}

function EventDetailPage({ residence, id, link }: { residence: Residence; id: string; link: Link }) {
  const { data } = useStore()
  const { t } = useI18n()
  const event = residentEvents(data, residence.id, today()).find((e) => e.id === id)
  if (!event) return <NotAvailable backHref={link('agenda')} backLabel={t('back.agenda')} />
  return (
    <div className="container reading stack-lg">
      <a className="back-link" href={link('agenda')}>
        <Icon name="back" size={18} />
        {t('back.agenda')}
      </a>
      <ContentDetail content={event} listen registration />
    </div>
  )
}
