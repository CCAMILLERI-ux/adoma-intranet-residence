// Lecteur vocal : lit une information à voix haute avec la synthèse vocale du navigateur
// (Web Speech API, sans service externe). Les contenus étant rédigés en français,
// la lecture se fait toujours en français. Une seule lecture à la fois.

import { useEffect, useSyncExternalStore } from 'react'
import { useI18n } from '../i18n'
import { Icon } from './ui'

let current: string | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const speechAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function stopSpeaking() {
  if (!speechAvailable()) return
  window.speechSynthesis.cancel()
  current = null
  emit()
}

function speak(id: string, text: string) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('fr'))
  if (voice) u.voice = voice
  u.rate = 0.95
  u.onend = u.onerror = () => {
    if (current === id) {
      current = null
      emit()
    }
  }
  current = id
  emit()
  synth.speak(u)
}

export function ListenButton({ id, title, text, compact }: { id: string; title: string; text: string; compact?: boolean }) {
  const { t, lang } = useI18n()
  const playing = useSyncExternalStore(subscribe, () => current === id)

  // Arrête la lecture si l'on quitte la page qui l'a lancée.
  useEffect(() => () => {
    if (current === id) stopSpeaking()
  }, [id])

  if (!speechAvailable()) return null
  const inFrench = lang === 'fr' ? '' : ` ${t('listen.inFrench')}`
  return (
    <button
      type="button"
      className={`listen-btn ${compact ? 'listen-btn--compact' : ''} ${playing ? 'is-playing' : ''}`}
      onClick={() => (playing ? stopSpeaking() : speak(id, `${title}. ${text}`))}
    >
      <Icon name={playing ? 'stop' : 'speaker'} size={18} />
      <span>
        {playing ? t('listen.stop') : t('listen')}
        {inFrench && <span className="listen-btn__lang">{inFrench}</span>}
      </span>
      <span className="visually-hidden"> : {title}</span>
    </button>
  )
}
