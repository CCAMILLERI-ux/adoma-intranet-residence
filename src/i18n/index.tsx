// Langue de l'interface résident. Les administrations restent en français.
// Le choix est mémorisé sur ce navigateur (simple préférence d'affichage).

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ISODate, Time } from '../data/types'
import { formatDateRange, formatLongDate, formatShortDate, formatTimeRange, parseISODate } from '../lib/dates'
import { STRINGS, type StringKey } from './strings'

export type Lang = 'fr' | 'en' | 'ar' | 'ru'

export const LANGS: { code: Lang; label: string; locale: string; dir: 'ltr' | 'rtl'; index: number }[] = [
  { code: 'fr', label: 'FR', locale: 'fr-FR', dir: 'ltr', index: 0 },
  { code: 'en', label: 'EN', locale: 'en-GB', dir: 'ltr', index: 1 },
  { code: 'ar', label: 'العربية', locale: 'ar-u-nu-latn', dir: 'rtl', index: 2 },
  { code: 'ru', label: 'РУ', locale: 'ru-RU', dir: 'ltr', index: 3 },
]

const STORAGE_KEY = 'mon-espace-residence:langue'

function readLang(): Lang {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (LANGS.some((l) => l.code === v)) return v as Lang
  } catch {
    /* préférence non disponible */
  }
  return 'fr'
}

export interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (lang: Lang) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
  /** Choisit la forme singulier / pluriel. */
  tn: (base: 'home.events.count' | 'reg.count', n: number) => string
  shortDate: (d: ISODate) => string
  longDate: (d: ISODate) => string
  timeRange: (start: Time, end: Time) => string
  dateRange: (start: ISODate, end: ISODate) => string
  dayMonth: (d: ISODate) => { day: string; month: string }
  dateTime: (iso: string) => string
}

function build(lang: Lang, setLang: (l: Lang) => void): I18n {
  const meta = LANGS.find((l) => l.code === lang)!
  const t: I18n['t'] = (key, vars) => {
    let s: string = STRINGS[key][meta.index] || STRINGS[key][0]
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
    return s
  }
  const time = (v: Time) => {
    const [h, m] = v.split(':').map(Number)
    return new Date(2000, 0, 1, h, m).toLocaleTimeString(meta.locale, { hour: 'numeric', minute: '2-digit' })
  }
  const local = (d: ISODate, opts: Intl.DateTimeFormatOptions) => (d ? parseISODate(d).toLocaleDateString(meta.locale, opts) : '')
  const long = (d: ISODate) => local(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return {
    lang,
    dir: meta.dir,
    setLang,
    t,
    tn: (base, n) => t(`${base}.${n > 1 ? 'other' : 'one'}` as StringKey, { n }),
    shortDate: (d) => (lang === 'fr' ? formatShortDate(d) : local(d, { day: 'numeric', month: 'short', year: 'numeric' })),
    longDate: (d) => (lang === 'fr' ? formatLongDate(d) : long(d)),
    timeRange: (start, end) => {
      if (lang === 'fr') return formatTimeRange(start, end)
      if (start && end) return `${time(start)} – ${time(end)}`
      return start ? time(start) : end ? time(end) : ''
    },
    dateRange: (start, end) => {
      if (lang === 'fr') return formatDateRange(start, end)
      if (start && end && end !== start) return `${long(start)} – ${long(end)}`
      return long(start || end)
    },
    dayMonth: (d) => {
      const date = parseISODate(d)
      return {
        day: date.toLocaleDateString(meta.locale, { day: 'numeric' }),
        month: date.toLocaleDateString(meta.locale, { month: 'short' }).replace('.', ''),
      }
    },
    dateTime: (iso) =>
      new Date(iso).toLocaleString(meta.locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
  }
}

const I18nContext = createContext<I18n>(build('fr', () => undefined))

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)
  const value = useMemo(
    () =>
      build(lang, (l) => {
        setLangState(l)
        try {
          window.localStorage.setItem(STORAGE_KEY, l)
        } catch {
          /* préférence non mémorisée */
        }
      }),
    [lang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Fournit le français, quelle que soit la langue choisie (administrations, aperçus). */
export function FrenchOnly({ children }: { children: ReactNode }) {
  const value = useMemo(() => build('fr', () => undefined), [])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  return useContext(I18nContext)
}
