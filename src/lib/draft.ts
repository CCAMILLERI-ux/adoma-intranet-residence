// « Préparer le message » — simulation d'aide à la rédaction.
// Génération locale et déterministe : mêmes champs → même texte.
// Aucune information n'est ajoutée : un champ vide n'apparaît pas dans le texte
// et il est signalé dans la liste « missing ».

import type { LocalTemplate } from '../data/types'

export interface DraftInput {
  template: LocalTemplate
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  description: string
  consequences: string
  participation: string
  contact: string
}

export interface DraftResult {
  text: string
  /** Libellés des champs utiles restés vides. */
  missing: string[]
}

/** Majuscule initiale et point final, sans toucher au contenu. */
function sentence(value: string): string {
  const v = value.trim().replace(/\s+\n/g, '\n')
  if (!v) return ''
  const first = v.charAt(0).toUpperCase() + v.slice(1)
  return /[.!?…:»)]$/.test(first) ? first : `${first}.`
}

const FIELD_LABELS = {
  location: 'lieu',
  startDate: 'date',
  time: 'horaires',
  description: 'description',
  consequences: 'conséquences pratiques',
  participation: 'modalités de participation',
  contact: 'contact utile',
} as const

const REQUIRED: Record<LocalTemplate, (keyof typeof FIELD_LABELS)[]> = {
  travaux: ['location', 'startDate', 'time', 'description', 'consequences', 'contact'],
  pratique: ['description', 'consequences', 'contact'],
  evenement: ['location', 'startDate', 'time', 'description', 'participation', 'contact'],
}

export function generateDraft(input: DraftInput): DraftResult {
  // La date, les horaires, le lieu et le contact sont affichés à part (fiche, affiche) :
  // le message ne les répète pas et se concentre sur les faits et leurs conséquences.
  const lines: string[] = []

  switch (input.template) {
    case 'travaux':
      lines.push('Une intervention est prévue dans la résidence.')
      if (input.description.trim()) lines.push(`Ce qui est fait : ${sentence(input.description)}`)
      if (input.consequences.trim()) lines.push(`Ce que cela change pour vous : ${sentence(input.consequences)}`)
      if (input.contact.trim()) lines.push('Une question ? Contactez la personne indiquée ci-dessous.')
      if (lines.length > 1) lines.push('Merci de votre compréhension.')
      break
    case 'pratique':
      if (input.description.trim()) lines.push(sentence(input.description))
      if (input.consequences.trim()) lines.push(`À retenir : ${sentence(input.consequences)}`)
      if (input.contact.trim()) lines.push('Une question ? Contactez la personne indiquée ci-dessous.')
      break
    case 'evenement':
      if (input.description.trim()) lines.push(sentence(input.description))
      if (input.participation.trim()) lines.push(`Pour participer : ${sentence(input.participation)}`)
      break
  }

  const missing = REQUIRED[input.template]
    .filter((key) => {
      if (key === 'time') return !input.startTime && !input.endTime
      return !String(input[key]).trim()
    })
    .map((key) => FIELD_LABELS[key])

  return { text: lines.join('\n\n'), missing }
}
