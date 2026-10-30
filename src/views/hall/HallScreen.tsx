// Simulation de l'écran d'information du hall (TV) : reprend automatiquement les contenus
// publiés pour la résidence (alertes, actualités, agenda) et les fait défiler.
// Le défilement peut être mis en pause, et les écrans parcourus un par un.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Residence } from '../../data/types'
import { useStore } from '../../lib/store'
import { formatDayMonth, formatLongDate, formatTimeRange, formatDateRange, today } from '../../lib/dates'
import { residentAlerts, residentEvents, residentNews, TEMPLATE_LABELS } from '../../lib/visibility'
import { BrandLogo } from '../../components/BrandLogo'
import { Icon } from '../../components/ui'
import { excerpt } from '../resident/cards'

const DURATION = 10_000

type Slide =
  | { key: string; kind: 'alert'; title: string; when: string; place: string; text: string }
  | { key: string; kind: 'news'; label: string; national: boolean; title: string; text: string }
  | { key: string; kind: 'agenda' }
  | { key: string; kind: 'welcome' }

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

export function HallScreen({ residenceId }: { residenceId: string }) {
  const { data } = useStore()
  const residence = data.residences.find((r) => r.id === residenceId) as Residence
  const now = useClock()
  const day = today()
  const alerts = residentAlerts(data, residence.id, day)
  const news = residentNews(data, residence.id, day).filter((n) => !(n.kind === 'local' && n.content.important))
  const events = residentEvents(data, residence.id, day).slice(0, 4)
  const contact = data.contacts.find((c) => c.id === residence.proximityContactId)

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = alerts.map((a) => ({
      key: a.id,
      kind: 'alert',
      title: a.title,
      when: [formatDateRange(a.startDate, a.endDate), formatTimeRange(a.startTime, a.endTime)].filter(Boolean).join(', '),
      place: a.location,
      text: excerpt(a.consequences || a.message, 220),
    }))
    for (const n of news.slice(0, 4)) {
      list.push(
        n.kind === 'national'
          ? { key: n.id, kind: 'news', label: n.campaign.category, national: true, title: n.campaign.title, text: n.campaign.summary }
          : {
              key: n.id,
              kind: 'news',
              label: TEMPLATE_LABELS[n.content.template],
              national: false,
              title: n.content.title,
              text: excerpt(n.content.description || n.content.message, 220),
            },
      )
    }
    if (events.length) list.push({ key: 'agenda', kind: 'agenda' })
    list.push({ key: 'welcome', kind: 'welcome' })
    return list
    // Les contenus ne changent qu'avec les données.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, residence.id, day])

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [cycle, setCycle] = useState(0) // relance la barre de progression
  const safeIndex = index % slides.length
  const go = (i: number) => {
    setIndex((i + slides.length) % slides.length)
    setCycle((c) => c + 1)
  }

  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => go(safeIndex + 1), DURATION)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, safeIndex, cycle, slides.length])

  const screen = useRef<HTMLDivElement>(null)
  const slide = slides[safeIndex]

  return (
    <main id="contenu" className="hall" tabIndex={-1}>
      <h1 id="page-title" tabIndex={-1} className="visually-hidden">
        Simulation de l’écran d’information du hall — {residence.name}
      </h1>
      <div className="hall__screen" ref={screen}>
        <header className="hall__top">
          <div className="hall__brand">
            <span className="hall__logo">
              <BrandLogo />
            </span>
            <div>
              <p className="hall__residence">{residence.name}</p>
              <p className="hall__subtitle">Informations de la résidence</p>
            </div>
          </div>
          <div className="hall__clock" aria-hidden="true">
            <p className="hall__time">{now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="hall__date">{formatLongDate(day)}</p>
          </div>
        </header>

        <section className="hall__stage" aria-roledescription="carrousel" aria-label="Informations affichées">
          <div className="hall__slide" key={slide.key} aria-live={playing ? 'off' : 'polite'}>
            {slide.kind === 'alert' && (
              <div className="hall-card hall-card--alert">
                <p className="hall-card__label">
                  <Icon name="alert" size={28} /> Information importante
                </p>
                <h2 className="hall-card__title">{slide.title}</h2>
                {(slide.when || slide.place) && (
                  <p className="hall-card__facts">
                    {slide.when && <span>{slide.when.charAt(0).toUpperCase() + slide.when.slice(1)}</span>}
                    {slide.place && <span>{slide.place}</span>}
                  </p>
                )}
                <p className="hall-card__text">{slide.text}</p>
              </div>
            )}
            {slide.kind === 'news' && (
              <div className={`hall-card ${slide.national ? 'hall-card--national' : ''}`}>
                <p className="hall-card__label">
                  <Icon name={slide.national ? 'globe' : 'news'} size={28} />
                  {slide.national ? 'Campagne nationale' : 'Information de la résidence'} · {slide.label}
                </p>
                <h2 className="hall-card__title">{slide.title}</h2>
                <p className="hall-card__text">{slide.text}</p>
              </div>
            )}
            {slide.kind === 'agenda' && (
              <div className="hall-card">
                <p className="hall-card__label">
                  <Icon name="calendar" size={28} /> Prochains événements
                </p>
                <ul className="hall-agenda">
                  {events.map((e) => {
                    const { day: d, month } = formatDayMonth(e.startDate)
                    return (
                      <li key={e.id}>
                        <span className="hall-agenda__date">
                          <b>{d}</b>
                          {month}
                        </span>
                        <span>
                          <span className="hall-agenda__title">{e.title}</span>
                          <span className="hall-agenda__meta">
                            {formatTimeRange(e.startTime, e.endTime)}
                            {e.location && ` · ${e.location}`}
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {slide.kind === 'welcome' && (
              <div className="hall-card hall-card--welcome">
                <p className="hall-card__label">
                  <Icon name="home" size={28} /> Bienvenue
                </p>
                <h2 className="hall-card__title">{residence.name}</h2>
                <p className="hall-card__text">
                  Retrouvez toutes ces informations sur votre téléphone, dans « Mon espace résidence ».
                </p>
              </div>
            )}
          </div>
          {playing && <div className="hall__progress" key={`p-${safeIndex}-${cycle}`} aria-hidden="true" />}
        </section>

        <footer className="hall__bottom">
          <p>
            <Icon name="clock" size={22} /> Accueil : {residence.receptionHours.map((h) => `${h.days} ${h.hours}`).join(' · ')}
          </p>
          {contact && (
            <p>
              <Icon name="phone" size={22} /> {contact.role} : {contact.phone}
            </p>
          )}
        </footer>
      </div>

      <div className="hall__controls">
        <p className="hall__demo">Simulation de l’écran du hall — contenus publiés pour cette résidence, données fictives.</p>
        <div className="hall__buttons">
          <button type="button" className="hall-btn" onClick={() => go(safeIndex - 1)}>
            <Icon name="prev" size={18} />
            <span>Précédent</span>
          </button>
          <button type="button" className="hall-btn" onClick={() => setPlaying((p) => !p)}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
            <span>{playing ? 'Mettre en pause' : 'Reprendre le défilement'}</span>
          </button>
          <button type="button" className="hall-btn" onClick={() => go(safeIndex + 1)}>
            <span>Suivant</span>
            <Icon name="next" size={18} />
          </button>
          <button
            type="button"
            className="hall-btn"
            onClick={() => screen.current?.requestFullscreen?.()}
            hidden={!document.fullscreenEnabled}
          >
            <Icon name="tv" size={18} />
            <span>Plein écran</span>
          </button>
        </div>
        <ol className="hall__dots" aria-label="Écrans">
          {slides.map((s, i) => (
            <li key={s.key}>
              <button type="button" aria-current={i === safeIndex ? 'true' : undefined} onClick={() => go(i)}>
                <span className="visually-hidden">
                  Écran {i + 1} sur {slides.length}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
