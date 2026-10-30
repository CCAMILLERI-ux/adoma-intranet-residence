import { describe, expect, it } from 'vitest'
import { createSeed } from '../src/data/seed'
import { generateDraft } from '../src/lib/draft'
import { displayStatus, residentEvents, residentNews } from '../src/lib/visibility'

const BASE = '2026-10-28'

describe('règles d’affichage', () => {
  const data = createSeed(BASE)

  it('ne montre que les contenus publiés, actifs et destinés à la résidence', () => {
    const ids = residentNews(data, 'tilleuls', BASE).map((n) => n.id)
    expect(ids).toContain('til-c1')
    expect(ids).toContain('camp-incendie')
    expect(ids).not.toContain('til-c4') // brouillon
    expect(ids).not.toContain('til-c5') // expiré
    expect(ids).not.toContain('camp-enquete') // campagne expirée
    expect(ids.some((id) => id.startsWith('pas-'))).toBe(false) // autre résidence
  })

  it('calcule les statuts à partir des dates', () => {
    const item = { status: 'publie' as const, publishAt: '2026-11-01', expireAt: '2026-11-10' }
    expect(displayStatus(item, '2026-10-31')).toBe('programme')
    expect(displayStatus(item, '2026-11-10')).toBe('publie') // dernier jour inclus
    expect(displayStatus(item, '2026-11-11')).toBe('expire')
    expect(displayStatus({ ...item, status: 'retire' }, '2026-11-05')).toBe('retire')
  })

  it('propose un agenda non vide et trié pour chaque résidence', () => {
    for (const r of data.residences) {
      const events = residentEvents(data, r.id, BASE)
      expect(events.length).toBeGreaterThan(0)
      expect([...events].sort((a, b) => a.startDate.localeCompare(b.startDate))).toEqual(events)
    }
  })
})

describe('Préparer le message', () => {
  const input = {
    template: 'travaux' as const,
    location: 'Laverie, bâtiment B',
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    startTime: '08:00',
    endTime: '17:00',
    description: 'entretien des machines',
    consequences: 'la laverie est fermée',
    participation: '',
    contact: 'Accueil — 01 99 00 10 01',
  }

  it('est déterministe', () => {
    expect(generateDraft(input).text).toBe(generateDraft(input).text)
  })

  it('reprend les champs saisis', () => {
    const { text, missing } = generateDraft(input)
    expect(text).toContain('Entretien des machines.')
    expect(text).toContain('La laverie est fermée.')
    expect(missing).toEqual([])
  })

  it('n’invente rien quand un champ manque', () => {
    const { text, missing } = generateDraft({ ...input, consequences: '', location: '', startTime: '', endTime: '', contact: '' })
    expect(text).not.toContain('Ce que cela change')
    expect(text).not.toContain('Une question ?')
    expect(missing).toEqual(['lieu', 'horaires', 'conséquences pratiques', 'contact utile'])
  })
})

describe('signalements et inscriptions', async () => {
  const { nextReference } = await import('../src/views/resident/ReportPage')
  const { participantCount } = await import('../src/views/resident/cards')
  const data = createSeed(BASE)

  it('numérote les signalements à la suite', () => {
    expect(nextReference(data.reports)).toBe('SIG-0416')
    expect(nextReference([])).toBe('SIG-0401')
  })

  it('ajoute le visiteur au nombre d’inscrits', () => {
    const event = data.contents.find((c) => c.id === 'til-e1')!
    expect(participantCount(event, false)).toBe(8)
    expect(participantCount(event, true)).toBe(9)
  })

  it('chaque signalement d’exemple appartient à une résidence existante', () => {
    const ids = data.residences.map((r) => r.id)
    expect(data.reports.every((r) => ids.includes(r.residenceId))).toBe(true)
  })
})
