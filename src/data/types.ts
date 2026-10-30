// Modèle de données commun à toutes les résidences.
// Chaque résidence réutilise exactement la même structure : c'est ce modèle
// qui illustre la logique de déploiement multi-résidences.

/** Date au format AAAA-MM-JJ (heure locale du navigateur). */
export type ISODate = string
/** Heure au format HH:MM. */
export type Time = string

export type ResidenceId = string

export interface OpeningSlot {
  days: string
  hours: string
}

export interface CommonSpace {
  name: string
  hours: string
  description: string
}

export interface Residence {
  id: ResidenceId
  name: string
  /** Ex. « Résidence sociale », « Résidence pour jeunes actifs ». */
  kind: string
  /** Ville et adresse fictives. */
  city: string
  address: string
  welcome: string
  receptionHours: OpeningSlot[]
  receptionPlace: string
  /** Contact de proximité mis en avant sur l'accueil. */
  proximityContactId: string
  laundry: {
    place: string
    hours: OpeningSlot[]
    steps: string[]
    pricing: string
  }
  waste: {
    place: string
    collectionDays: string
    rules: { bin: string; items: string }[]
  }
  equipment: string[]
  commonSpaces: CommonSpace[]
  technical: {
    steps: string[]
    contactId: string
    emergency: string
  }
}

export interface Contact {
  id: string
  residenceId: ResidenceId
  role: string
  /** Nom fictif. */
  name: string
  mission: string
  place: string
  hours: string
  phone: string
  email: string
}

/**
 * Modèles proposés à l'administration de résidence.
 * « evenement » alimente l'agenda ; les deux autres alimentent les actualités.
 */
export type LocalTemplate = 'travaux' | 'pratique' | 'evenement'

/** Statut enregistré. « Expiré » et « Programmé » sont calculés à partir des dates. */
export type StoredStatus = 'brouillon' | 'publie' | 'retire'
export type DisplayStatus = 'brouillon' | 'programme' | 'publie' | 'expire' | 'retire'

/** Contenu local : toujours rattaché à une seule résidence. */
export interface LocalContent {
  id: string
  residenceId: ResidenceId
  template: LocalTemplate
  title: string
  location: string
  startDate: ISODate
  endDate: ISODate
  startTime: Time
  endTime: Time
  /** Faits, sans interprétation. */
  description: string
  /** Conséquences pratiques pour les résidents. */
  consequences: string
  /** Modalités de participation (événements). */
  participation: string
  /** Nombre d'inscrits fictifs au départ (événements), hors inscription du visiteur. */
  participants?: number
  contact: string
  /** Texte final affiché aux résidents (modifiable). */
  message: string
  /** Mettre en bandeau sur l'accueil tant que le contenu est visible. */
  important: boolean
  publishAt: ISODate
  expireAt: ISODate
  status: StoredStatus
  createdAt: string
  updatedAt: string
}

/** Campagne nationale : rédigée par l'administration centrale, diffusée à une ou plusieurs résidences. */
export interface Campaign {
  id: string
  residenceIds: ResidenceId[]
  category: string
  title: string
  summary: string
  message: string
  contact: string
  publishAt: ISODate
  expireAt: ISODate
  status: StoredStatus
  createdAt: string
  updatedAt: string
}

/** Signalement de panne déposé par un résident (simulation, stocké sur le navigateur). */
export type ReportCategory = 'plomberie' | 'electricite' | 'chauffage' | 'serrurerie' | 'equipement' | 'parties-communes' | 'autre'
export type ReportStatus = 'recu' | 'en-cours' | 'resolu'

export interface Report {
  id: string
  /** Référence lisible, ex. SIG-0427. */
  reference: string
  residenceId: ResidenceId
  category: ReportCategory
  /** Numéro de logement saisi par le résident (fictif dans la démonstration). */
  unit: string
  description: string
  urgent: boolean
  status: ReportStatus
  /** Créé depuis ce navigateur pendant la démonstration (et non un exemple). */
  mine: boolean
  createdAt: string
  updatedAt: string
}

export interface AppData {
  version: number
  /** Date de génération des exemples (pour information). */
  seededOn: ISODate
  residences: Residence[]
  contacts: Contact[]
  contents: LocalContent[]
  campaigns: Campaign[]
  reports: Report[]
  /** Inscriptions du visiteur aux événements (identifiant de l'événement → inscrit). */
  registrations: Record<string, boolean>
}
