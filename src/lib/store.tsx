// Stockage de démonstration : tout est enregistré dans le localStorage de ce navigateur.
// Aucun serveur, aucun compte.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createSeed, DATA_VERSION } from '../data/seed'
import type { AppData, Campaign, LocalContent, StoredStatus } from '../data/types'

const STORAGE_KEY = 'mon-espace-residence:data'

function load(): { data: AppData; persistent: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed.version === DATA_VERSION) return { data: parsed, persistent: true }
      if (parsed.version === 1) {
        // v2 ajoute les illustrations des espaces communs : les fiches résidences sont
        // reprises des exemples, les contenus créés sur ce navigateur sont conservés.
        const data: AppData = { ...parsed, version: DATA_VERSION, residences: createSeed().residences }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        return { data, persistent: true }
      }
    }
    const data = createSeed()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { data, persistent: true }
  } catch {
    // Stockage indisponible (navigation privée stricte…) : on travaille en mémoire.
    return { data: createSeed(), persistent: false }
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface Store {
  data: AppData
  persistent: boolean
  saveContent: (content: LocalContent) => void
  setContentStatus: (id: string, status: StoredStatus) => void
  saveCampaign: (campaign: Campaign) => void
  setCampaignStatus: (id: string, status: StoredStatus) => void
  reset: () => void
  /** Message de confirmation, lu par les lecteurs d'écran. */
  notice: { id: number; text: string } | null
  notify: (text: string) => void
  clearNotice: () => void
}

const StoreContext = createContext<Store | null>(null)

const stamp = () => new Date().toISOString()

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list]
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [{ data: initial, persistent }] = useState(load)
  const [data, setData] = useState<AppData>(initial)
  const [notice, setNotice] = useState<Store['notice']>(null)

  useEffect(() => {
    if (!persistent) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* quota dépassé : la démonstration continue en mémoire */
    }
  }, [data, persistent])

  // Synchronise plusieurs onglets ouverts sur le prototype.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setData(JSON.parse(e.newValue) as AppData)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const notify = useCallback((text: string) => setNotice({ id: Date.now(), text }), [])
  const clearNotice = useCallback(() => setNotice(null), [])

  const store = useMemo<Store>(
    () => ({
      data,
      persistent,
      notice,
      notify,
      clearNotice,
      saveContent: (content) =>
        setData((d) => ({ ...d, contents: upsert(d.contents, { ...content, updatedAt: stamp() }) })),
      setContentStatus: (id, status) =>
        setData((d) => ({
          ...d,
          contents: d.contents.map((c) => (c.id === id ? { ...c, status, updatedAt: stamp() } : c)),
        })),
      saveCampaign: (campaign) =>
        setData((d) => ({ ...d, campaigns: upsert(d.campaigns, { ...campaign, updatedAt: stamp() }) })),
      setCampaignStatus: (id, status) =>
        setData((d) => ({
          ...d,
          campaigns: d.campaigns.map((c) => (c.id === id ? { ...c, status, updatedAt: stamp() } : c)),
        })),
      reset: () => setData(createSeed()),
    }),
    [data, persistent, notice, notify, clearNotice],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return store
}
