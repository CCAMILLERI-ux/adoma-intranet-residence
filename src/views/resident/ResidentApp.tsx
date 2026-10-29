// Vue résident : conçue d'abord pour smartphone (navigation basse),
// puis élargie pour l'ordinateur (navigation horizontale).

import type { Residence } from '../../data/types'
import { href, type Route } from '../../lib/router'
import { useStore } from '../../lib/store'
import { today } from '../../lib/dates'
import { residentAlerts, residentEvents, residentNews } from '../../lib/visibility'
import { Button, Callout, EmptyState, Icon, PageTitle, type IconName } from '../../components/ui'
import { CampaignDetail, ContentDetail } from './details'
import { EventCard, NewsCard } from './cards'
import { ServicesPage } from './ServicesPage'
import { ContactsPage } from './ContactsPage'
import { ResidenceCard } from '../../components/ResidenceCard'
import { BrandLogo } from '../../components/BrandLogo'
import { ProceduresPage } from './ProceduresPage'

const SECTIONS: { id: string; label: string; short: string; icon: IconName }[] = [
  { id: 'actualites', label: 'Actualités', short: 'Actualités', icon: 'news' },
  { id: 'agenda', label: 'Agenda', short: 'Agenda', icon: 'calendar' },
  { id: 'services', label: 'Logement & services', short: 'Logement', icon: 'house' },
  { id: 'contacts', label: 'Équipe & contacts', short: 'Contacts', icon: 'people' },
  { id: 'demarches', label: 'Démarches utiles', short: 'Démarches', icon: 'doc' },
]

export function ResidentApp({ route }: { route: Route }) {
  const { data } = useStore()
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
    default:
      page = <HomePage residence={residence} link={link} />
  }

  return (
    <div className="resident">
      <header className="resident-header">
        <div className="container resident-header__inner">
          <a className="resident-brand" href={link()} aria-current={section === '' ? 'page' : undefined}>
            <BrandLogo />
            <span className="resident-brand__text">
              <span className="resident-brand__product">Mon espace résidence</span>
              <span className="resident-brand__name">{residence.name}</span>
            </span>
          </a>
          <nav className="resident-nav" aria-label="Navigation principale">
            <ul>
              <li className="resident-nav__home">
                <a href={link()} aria-current={section === '' ? 'page' : undefined}>
                  <Icon name="home" size={20} />
                  <span>Accueil</span>
                </a>
              </li>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={link(s.id)} aria-current={section === s.id ? (sub ? 'true' : 'page') : undefined}>
                    <Icon name={s.icon} size={20} />
                    <span className="resident-nav__long">{s.label}</span>
                    <span className="resident-nav__short" aria-hidden="true">
                      {s.short}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="contenu" className="resident-main" tabIndex={-1}>
        {page}
      </main>
      <footer className="resident-footer">
        <div className="container">
          <p>
            {residence.name} — {residence.address}
          </p>
          <p>Prototype exploratoire. Toutes les informations affichées sont fictives.</p>
        </div>
      </footer>
    </div>
  )
}

type Link = (...path: string[]) => string

/* ---------------- Accueil ---------------- */

function HomePage({ residence, link }: { residence: Residence; link: Link }) {
  const { data } = useStore()
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
          <p className="hero__tag">Mon espace résidence · {residence.kind}</p>
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
        </div>
      </section>

      <div className="container stack-lg home">
        {alerts.length > 0 && (
          <section aria-label="Informations importantes" className="stack-sm">
            {alerts.map((a) => (
              <div className="alert-banner" key={a.id}>
                <span className="alert-banner__icon">
                  <Icon name="alert" />
                </span>
                <div>
                  <p className="alert-banner__label">Information importante</p>
                  <p className="alert-banner__title">{a.title}</p>
                </div>
                <a className="alert-banner__link" href={link('actualites', a.id)}>
                  Lire l’information<span className="visually-hidden"> : {a.title}</span>
                  <Icon name="arrow" size={18} />
                </a>
              </div>
            ))}
          </section>
        )}

        <section className="quick-links" aria-labelledby="quick-title">
          <h2 id="quick-title" className="visually-hidden">
            Accès rapides
          </h2>
          <a className="quick-link" href={link('services', 'laverie')}>
            <Icon name="wash" size={24} />
            <span>Laverie</span>
          </a>
          <a className="quick-link" href={link('services', 'probleme-technique')}>
            <Icon name="tool" size={24} />
            <span>Un problème technique ?</span>
          </a>
          <a className="quick-link" href={link('demarches')}>
            <Icon name="doc" size={24} />
            <span>Démarches utiles</span>
          </a>
        </section>

        <div className="home-grid">
          <section aria-labelledby="home-news" className="stack-md">
            <div className="section-head">
              <h2 id="home-news">Dernières actualités</h2>
              <a href={link('actualites')} className="text-link">
                Toutes les actualités
              </a>
            </div>
            {news.length ? (
              <div className="stack-sm">
                {news.map((n) => (
                  <NewsCard key={n.id} item={n} to={link('actualites', n.id)} />
                ))}
              </div>
            ) : (
              <EmptyState title="Aucune actualité pour le moment." />
            )}
          </section>

          <section aria-labelledby="home-events" className="stack-md">
            <div className="section-head">
              <h2 id="home-events">Prochains événements</h2>
              <a href={link('agenda')} className="text-link">
                Tout l’agenda
              </a>
            </div>
            {events.length ? (
              <div className="stack-sm">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} to={link('agenda', e.id)} />
                ))}
              </div>
            ) : (
              <EmptyState title="Aucun événement prévu pour le moment." />
            )}
          </section>
        </div>

        <ResidenceCard
          residence={residence}
          highlight={`${upcoming.length} événement${upcoming.length > 1 ? 's' : ''} à venir`}
        >
          <p className="residence-card__text">
            Laverie, tri des déchets, espaces communs, problème technique : tout le fonctionnement de votre résidence.
          </p>
          <Button href={link('services')} iconAfter="arrow">
            Logement & services
          </Button>
        </ResidenceCard>

        <section className="home-grid" aria-label="Accueil et contact">
          <div className="card card--padded">
            <h2 className="card__title">
              <Icon name="clock" />
              Horaires d’accueil
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
                Votre contact de proximité
              </h2>
              <p className="contact-role">{contact.role}</p>
              <p className="contact-name">
                {contact.name} <span className="fictive">(nom fictif)</span>
              </p>
              <p>{contact.mission}</p>
              <p>
                <a className="inverse-link" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                  <Icon name="phone" size={18} />
                  {contact.phone}
                </a>{' '}
                <span className="fictive">(numéro fictif)</span>
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
  const news = residentNews(data, residence.id, today())
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead="Les informations de votre résidence et les campagnes nationales d’Adoma.">
        Actualités
      </PageTitle>
      <Callout tone="neutral" title="Comment lire ces informations ?">
        <p>
          « Information de la résidence » : rédigée par l’équipe de votre résidence. « Campagne nationale » : diffusée
          dans plusieurs résidences.
        </p>
      </Callout>
      {news.length ? (
        <div className="card-grid">
          {news.map((n) => (
            <NewsCard key={n.id} item={n} to={link('actualites', n.id)} />
          ))}
        </div>
      ) : (
        <EmptyState title="Aucune actualité pour le moment." />
      )}
    </div>
  )
}

function NotAvailable({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <div className="container stack-md reading">
      <PageTitle>Cette information n’est plus disponible</PageTitle>
      <p>Elle a peut-être été retirée ou elle est arrivée à expiration.</p>
      <Button href={backHref} variant="secondary" icon="back">
        {backLabel}
      </Button>
    </div>
  )
}

function NewsDetailPage({ residence, id, link }: { residence: Residence; id: string; link: Link }) {
  const { data } = useStore()
  const item = residentNews(data, residence.id, today()).find((n) => n.id === id)
  // Une alerte importante peut aussi pointer vers un événement : on le cherche dans l'agenda.
  const event = !item ? residentEvents(data, residence.id, today()).find((e) => e.id === id) : undefined
  if (!item && !event) return <NotAvailable backHref={link('actualites')} backLabel="Retour aux actualités" />
  return (
    <div className="container reading stack-lg">
      <a className="back-link" href={link('actualites')}>
        <Icon name="back" size={18} />
        Retour aux actualités
      </a>
      {item?.kind === 'national' ? (
        <CampaignDetail campaign={item.campaign} />
      ) : (
        <ContentDetail content={item ? item.content : event!} />
      )}
    </div>
  )
}

/* ---------------- Agenda ---------------- */

function AgendaPage({ residence, link }: { residence: Residence; link: Link }) {
  const { data } = useStore()
  const events = residentEvents(data, residence.id, today())
  return (
    <div className="container stack-lg">
      <PageTitle eyebrow={residence.name} lead="Les activités et rendez-vous à venir dans votre résidence.">
        Agenda
      </PageTitle>
      {events.length ? (
        <ol className="plain-list stack-sm" aria-label="Événements à venir">
          {events.map((e) => (
            <li key={e.id}>
              <EventCard event={e} to={link('agenda', e.id)} />
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title="Aucun événement prévu pour le moment.">
          <p>L’équipe de la résidence publiera ici les prochaines activités.</p>
        </EmptyState>
      )}
    </div>
  )
}

function EventDetailPage({ residence, id, link }: { residence: Residence; id: string; link: Link }) {
  const { data } = useStore()
  const event = residentEvents(data, residence.id, today()).find((e) => e.id === id)
  if (!event) return <NotAvailable backHref={link('agenda')} backLabel="Retour à l’agenda" />
  return (
    <div className="container reading stack-lg">
      <a className="back-link" href={link('agenda')}>
        <Icon name="back" size={18} />
        Retour à l’agenda
      </a>
      <ContentDetail content={event} />
    </div>
  )
}
