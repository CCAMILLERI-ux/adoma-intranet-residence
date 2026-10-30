// Données de démonstration — entièrement fictives.
// Les dates sont calculées à partir du jour d'ouverture du prototype,
// pour que l'agenda et les actualités ne soient jamais vides.
// Les numéros en 01 99 00 xx xx sont réservés aux œuvres de fiction ;
// les adresses en .example ne peuvent pas recevoir de courriel.

import { addDays, today } from '../lib/dates'
import { generateDraft } from '../lib/draft'
import type { AppData, Campaign, Contact, LocalContent, Report, Residence } from './types'

export const DATA_VERSION = 3

export function createSeed(base: string = today()): AppData {
  const d = (n: number) => addDays(base, n)
  const stamp = `${base}T09:00:00`

  const residences: Residence[] = [
    {
      id: 'tilleuls',
      name: 'Résidence Les Tilleuls',
      kind: 'Résidence sociale',
      city: 'Ville fictive',
      address: '12 allée des Tilleuls, 00000 Ville fictive',
      welcome:
        'Bienvenue dans votre espace. Vous y trouvez les informations de la résidence, l’agenda et les contacts utiles.',
      receptionHours: [
        { days: 'Lundi, mardi, jeudi', hours: '9 h – 12 h et 14 h – 17 h' },
        { days: 'Mercredi', hours: '9 h – 12 h' },
        { days: 'Vendredi', hours: '14 h – 16 h 30' },
      ],
      receptionPlace: 'Bureau d’accueil, rez-de-chaussée du bâtiment A',
      proximityContactId: 'til-resp',
      laundry: {
        place: 'Rez-de-chaussée du bâtiment B, porte 4',
        hours: [{ days: 'Tous les jours', hours: '7 h – 22 h' }],
        steps: [
          'Choisissez une machine libre.',
          'Payez avec votre carte de laverie au boîtier près de l’entrée.',
          'Retirez votre linge dès la fin du cycle.',
          'Signalez une machine en panne à l’accueil.',
        ],
        pricing: 'La carte de laverie se recharge à l’accueil, aux horaires d’ouverture.',
      },
      waste: {
        place: 'Local poubelles, côté parking, accès par le badge',
        collectionDays: 'Ordures ménagères : lundi et jeudi. Tri : mercredi.',
        rules: [
          { bin: 'Bac jaune', items: 'Emballages, bouteilles en plastique, cartons, papiers.' },
          { bin: 'Bac vert', items: 'Bouteilles et bocaux en verre, sans bouchon.' },
          { bin: 'Bac gris', items: 'Ordures ménagères, en sac fermé.' },
          { bin: 'Encombrants', items: 'Ne pas déposer dans le local. Demander à l’accueil.' },
        ],
      },
      equipment: [
        'Plaque de cuisson deux feux et réfrigérateur.',
        'Détecteur de fumée : ne pas le débrancher ni le couvrir.',
        'Radiateur avec robinet thermostatique.',
        'Ventilation : laisser les bouches d’aération dégagées.',
      ],
      commonSpaces: [
        { name: 'Salle commune', hours: 'Tous les jours, 9 h – 20 h', description: 'Lieu de rencontre et d’activités. Réservation à l’accueil pour un usage privé.' },
        { name: 'Jardin partagé', hours: 'D’avril à octobre, 8 h – 20 h', description: 'Parcelles attribuées sur demande à l’accueil.' },
        { name: 'Local vélos', hours: 'Accès permanent avec badge', description: 'Attachez votre vélo et indiquez votre numéro de logement.' },
      ],
      technical: {
        steps: [
          'Vérifiez si le problème concerne seulement votre logement ou tout l’étage.',
          'Pendant les horaires d’accueil, venez au bureau ou appelez l’accueil.',
          'Décrivez le problème : lieu, depuis quand, ce que vous avez constaté.',
          'En dehors des horaires, appelez l’astreinte uniquement en cas d’urgence.',
        ],
        contactId: 'til-maint',
        emergency:
          'Urgence (fuite importante, panne électrique générale, personne bloquée dans l’ascenseur) : astreinte au 01 99 00 10 99 (numéro fictif).',
      },
    },
    {
      id: 'passerelles',
      name: 'Résidence Les Passerelles',
      kind: 'Résidence pour jeunes actifs',
      city: 'Ville fictive',
      address: '3 rue des Passerelles, 00000 Ville fictive',
      welcome:
        'Bienvenue aux Passerelles. Retrouvez ici les nouvelles de la résidence, les activités et les bons contacts.',
      receptionHours: [
        { days: 'Du lundi au vendredi', hours: '8 h 30 – 10 h et 17 h – 19 h 30' },
        { days: 'Samedi', hours: '10 h – 12 h' },
      ],
      receptionPlace: 'Accueil, hall d’entrée',
      proximityContactId: 'pas-resp',
      laundry: {
        place: 'Sous-sol, accès par l’ascenseur ou l’escalier C',
        hours: [{ days: 'Tous les jours', hours: '6 h 30 – 23 h' }],
        steps: [
          'Réservez un créneau sur le tableau à l’entrée de la laverie.',
          'Payez par carte bancaire sans contact au terminal.',
          'Retirez votre linge dans les 15 minutes après la fin du cycle.',
          'Nettoyez le filtre du sèche-linge après usage.',
        ],
        pricing: 'Tarifs affichés à l’entrée de la laverie.',
      },
      waste: {
        place: 'Local tri, à droite de l’entrée principale',
        collectionDays: 'Ordures ménagères : mardi et vendredi. Tri : jeudi.',
        rules: [
          { bin: 'Bac jaune', items: 'Emballages, bouteilles en plastique, cartons, papiers.' },
          { bin: 'Bac vert', items: 'Verre, sans bouchon.' },
          { bin: 'Bac marron', items: 'Déchets alimentaires, dans les sacs fournis à l’accueil.' },
          { bin: 'Bac gris', items: 'Ordures ménagères, en sac fermé.' },
        ],
      },
      equipment: [
        'Kitchenette équipée : plaques, micro-ondes, réfrigérateur.',
        'Connexion Wi-Fi incluse : identifiants remis à l’arrivée.',
        'Détecteur de fumée : ne pas le débrancher ni le couvrir.',
        'Volets roulants électriques.',
      ],
      commonSpaces: [
        { name: 'Espace de coworking', hours: 'Tous les jours, 7 h – 23 h', description: 'Postes de travail et imprimante. Badge nécessaire.' },
        { name: 'Salle de sport', hours: 'Tous les jours, 6 h – 22 h', description: 'Accès après signature du règlement à l’accueil.' },
        { name: 'Terrasse', hours: 'De mai à septembre, 9 h – 22 h', description: 'Merci de respecter le calme après 21 h.' },
      ],
      technical: {
        steps: [
          'Vérifiez le disjoncteur de votre logement en cas de coupure d’électricité.',
          'Pour le Wi-Fi, redémarrez votre appareil avant de signaler une panne.',
          'Signalez le problème à l’accueil, sur place ou par téléphone.',
          'En dehors des horaires, appelez l’astreinte uniquement en cas d’urgence.',
        ],
        contactId: 'pas-maint',
        emergency:
          'Urgence (fuite importante, panne électrique générale, personne bloquée dans l’ascenseur) : astreinte au 01 99 00 20 99 (numéro fictif).',
      },
    },
  ]

  const contacts: Contact[] = [
    { id: 'til-resp', residenceId: 'tilleuls', role: 'Responsable de résidence', name: 'Claire Morel', mission: 'Vie de la résidence, questions sur le logement, informations générales.', place: 'Bureau d’accueil, bâtiment A', hours: 'Aux horaires d’accueil', phone: '01 99 00 10 01', email: 'accueil.tilleuls@residence.example' },
    { id: 'til-maint', residenceId: 'tilleuls', role: 'Ouvrier de maintenance', name: 'Youssef Amrani', mission: 'Petites réparations, équipements du logement, parties communes.', place: 'Atelier, sous-sol du bâtiment B', hours: 'Du lundi au vendredi, 8 h – 16 h', phone: '01 99 00 10 02', email: 'maintenance.tilleuls@residence.example' },
    { id: 'til-social', residenceId: 'tilleuls', role: 'Médiatrice sociale (partenaire)', name: 'Sophie Lambert', mission: 'Orientation vers les services d’accès aux droits et de santé.', place: 'Salle commune', hours: 'Mardi, 14 h – 17 h', phone: '01 99 00 10 03', email: 'mediation.tilleuls@residence.example' },
    { id: 'pas-resp', residenceId: 'passerelles', role: 'Responsable de résidence', name: 'Thomas Girard', mission: 'Accueil, vie de la résidence, questions sur le logement.', place: 'Accueil, hall d’entrée', hours: 'Aux horaires d’accueil', phone: '01 99 00 20 01', email: 'accueil.passerelles@residence.example' },
    { id: 'pas-maint', residenceId: 'passerelles', role: 'Ouvrière de maintenance', name: 'Inès Carvalho', mission: 'Réparations, Wi-Fi, équipements des logements.', place: 'Local technique, rez-de-chaussée', hours: 'Du lundi au vendredi, 9 h – 17 h', phone: '01 99 00 20 02', email: 'maintenance.passerelles@residence.example' },
    { id: 'pas-anim', residenceId: 'passerelles', role: 'Animateur vie collective', name: 'Malik Diallo', mission: 'Activités, ateliers, accueil des nouveaux résidents.', place: 'Espace de coworking', hours: 'Mercredi et jeudi, 17 h – 20 h', phone: '01 99 00 20 03', email: 'animation.passerelles@residence.example' },
  ]

  const base0 = {
    location: '', startDate: '', endDate: '', startTime: '', endTime: '',
    consequences: '', participation: '', important: false,
    createdAt: stamp, updatedAt: stamp,
  }

  const contents: LocalContent[] = [
    // --- Les Tilleuls
    {
      ...base0, id: 'til-c1', residenceId: 'tilleuls', template: 'travaux', important: true,
      title: 'Coupure d’eau chaude au bâtiment A',
      location: 'Bâtiment A, tous les étages',
      startDate: d(2), endDate: d(2), startTime: '09:00', endTime: '13:00',
      description: 'Remplacement d’une vanne sur le circuit d’eau chaude.',
      consequences: 'Pas d’eau chaude au bâtiment A pendant l’intervention. L’eau froide reste disponible.',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message: '',
      publishAt: d(-1), expireAt: d(2), status: 'publie',
    },
    {
      ...base0, id: 'til-c2', residenceId: 'tilleuls', template: 'pratique',
      title: 'Nouveaux horaires de nettoyage des parties communes',
      location: 'Couloirs et escaliers des bâtiments A et B',
      description: 'Le nettoyage des couloirs a lieu désormais le mardi et le vendredi matin.',
      consequences: 'Merci de ne pas laisser d’objets dans les couloirs ces jours-là.',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message:
        'Le nettoyage des couloirs a lieu désormais le mardi et le vendredi matin, dans les bâtiments A et B.\n\nMerci de ne pas laisser d’objets dans les couloirs ces jours-là.\n\nUne question ? Accueil — 01 99 00 10 01 (numéro fictif).',
      publishAt: d(-6), expireAt: d(30), status: 'publie',
    },
    {
      ...base0, id: 'til-c3', residenceId: 'tilleuls', template: 'travaux',
      title: 'Traitement contre les nuisibles au bâtiment B',
      location: 'Bâtiment B, logements du 1er étage',
      startDate: d(8), endDate: d(8), startTime: '08:30', endTime: '12:00',
      description: 'Une entreprise passe dans chaque logement du 1er étage pour un traitement préventif.',
      consequences: 'Merci d’être présent ou de déposer votre clé à l’accueil la veille. Prévoir 15 minutes par logement.',
      contact: 'Youssef Amrani, maintenance — 01 99 00 10 02 (numéro fictif)',
      message:
        'Une entreprise passe dans chaque logement du 1er étage du bâtiment B pour un traitement préventif.\n\nMerci d’être présent ou de déposer votre clé à l’accueil la veille. Prévoir 15 minutes par logement.\n\nUne question ? Youssef Amrani, maintenance — 01 99 00 10 02 (numéro fictif).',
      publishAt: d(-2), expireAt: d(8), status: 'publie',
    },
    {
      ...base0, id: 'til-c4', residenceId: 'tilleuls', template: 'pratique',
      title: 'Rappel : dépôt des encombrants',
      description: 'Les encombrants ne doivent pas être déposés dans le local poubelles.',
      consequences: 'Demandez un rendez-vous de collecte à l’accueil.',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message: '',
      publishAt: d(3), expireAt: d(40), status: 'brouillon',
    },
    {
      ...base0, id: 'til-c5', residenceId: 'tilleuls', template: 'pratique',
      title: 'Vérification des détecteurs de fumée',
      description: 'Contrôle annuel des détecteurs de fumée dans tous les logements.',
      consequences: 'Contrôle terminé. Merci pour votre accueil.',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message: 'Le contrôle annuel des détecteurs de fumée est terminé. Merci pour votre accueil.',
      publishAt: d(-40), expireAt: d(-10), status: 'publie',
    },
    {
      ...base0, id: 'til-e1', participants: 8, residenceId: 'tilleuls', template: 'evenement',
      title: 'Café d’accueil des nouveaux résidents',
      location: 'Salle commune',
      startDate: d(3), endDate: d(3), startTime: '10:00', endTime: '11:30',
      description: 'Un moment convivial pour rencontrer l’équipe et les autres résidents. Café et thé offerts.',
      participation: 'Ouvert à tous. Pour venir, prévenez l’accueil ou appelez le 01 99 00 10 01 (numéro fictif).',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message: 'Un moment convivial pour rencontrer l’équipe et les autres résidents. Café et thé offerts.',
      publishAt: d(-5), expireAt: d(3), status: 'publie',
    },
    {
      ...base0, id: 'til-e2', participants: 4, residenceId: 'tilleuls', template: 'evenement',
      title: 'Permanence d’accès aux droits',
      location: 'Salle commune',
      startDate: d(9), endDate: d(9), startTime: '14:00', endTime: '17:00',
      description: 'Une médiatrice répond à vos questions sur vos démarches administratives et vous oriente vers les bons services.',
      participation: 'Sur rendez-vous. Inscription auprès de Sophie Lambert, 01 99 00 10 03 (numéro fictif).',
      contact: 'Sophie Lambert — 01 99 00 10 03 (numéro fictif)',
      message: 'Une médiatrice répond à vos questions sur vos démarches administratives et vous oriente vers les bons services.',
      publishAt: d(-3), expireAt: d(9), status: 'publie',
    },
    {
      ...base0, id: 'til-e3', participants: 12, residenceId: 'tilleuls', template: 'evenement',
      title: 'Atelier : bien trier ses déchets',
      location: 'Salle commune',
      startDate: d(16), endDate: d(16), startTime: '15:00', endTime: '16:00',
      description: 'Atelier pratique avec démonstration des bacs de tri de la résidence.',
      participation: 'Ouvert à tous, sans inscription.',
      contact: 'Accueil — 01 99 00 10 01 (numéro fictif)',
      message: 'Atelier pratique avec démonstration des bacs de tri de la résidence.',
      publishAt: d(-1), expireAt: d(16), status: 'publie',
    },

    // --- Les Passerelles
    {
      ...base0, id: 'pas-c1', residenceId: 'passerelles', template: 'travaux',
      title: 'Maintenance du réseau Wi-Fi',
      location: 'Tous les logements',
      startDate: d(4), endDate: d(4), startTime: '23:00', endTime: '',
      description: 'Mise à jour des équipements Wi-Fi de la résidence.',
      consequences: 'Le Wi-Fi peut être coupé pendant environ une heure à partir de 23 h.',
      contact: 'Inès Carvalho, maintenance — 01 99 00 20 02 (numéro fictif)',
      message: '',
      publishAt: d(-1), expireAt: d(5), status: 'publie',
    },
    {
      ...base0, id: 'pas-c2', residenceId: 'passerelles', template: 'pratique',
      title: 'La salle de sport ouvre plus tôt',
      location: 'Salle de sport, rez-de-chaussée',
      description: 'La salle de sport ouvre désormais à 6 h tous les jours.',
      consequences: 'Le règlement de la salle reste à signer à l’accueil avant la première utilisation.',
      contact: 'Accueil — 01 99 00 20 01 (numéro fictif)',
      message:
        'La salle de sport ouvre désormais à 6 h tous les jours.\n\nLe règlement de la salle reste à signer à l’accueil avant la première utilisation.',
      publishAt: d(-4), expireAt: d(25), status: 'publie',
    },
    {
      ...base0, id: 'pas-c3', residenceId: 'passerelles', template: 'pratique',
      title: 'Boîtes aux lettres : étiquettes à vérifier',
      description: 'Plusieurs boîtes aux lettres n’ont pas d’étiquette à jour.',
      consequences: 'Vérifiez votre étiquette. L’accueil en fournit gratuitement.',
      contact: 'Accueil — 01 99 00 20 01 (numéro fictif)',
      message: '',
      publishAt: d(1), expireAt: d(20), status: 'brouillon',
    },
    {
      ...base0, id: 'pas-e1', participants: 9, residenceId: 'passerelles', template: 'evenement',
      title: 'Soirée jeux de société',
      location: 'Espace de coworking',
      startDate: d(5), endDate: d(5), startTime: '19:00', endTime: '22:00',
      description: 'Une soirée pour se rencontrer entre résidents. Jeux fournis, chacun peut apporter le sien.',
      participation: 'Sans inscription. Renseignements auprès de Malik Diallo, 01 99 00 20 03 (numéro fictif).',
      contact: 'Malik Diallo — 01 99 00 20 03 (numéro fictif)',
      message: 'Une soirée pour se rencontrer entre résidents. Jeux fournis, chacun peut apporter le sien.',
      publishAt: d(-4), expireAt: d(5), status: 'publie',
    },
    {
      ...base0, id: 'pas-e2', participants: 5, residenceId: 'passerelles', template: 'evenement',
      title: 'Atelier CV et préparation aux entretiens',
      location: 'Espace de coworking',
      startDate: d(11), endDate: d(11), startTime: '18:00', endTime: '20:00',
      description: 'Un intervenant partenaire relit votre CV et vous aide à préparer un entretien d’embauche.',
      participation: '8 places. Inscription à l’accueil ou au 01 99 00 20 01 (numéro fictif). Apportez votre CV, imprimé ou sur téléphone.',
      contact: 'Accueil — 01 99 00 20 01 (numéro fictif)',
      message: 'Un intervenant partenaire relit votre CV et vous aide à préparer un entretien d’embauche.',
      publishAt: d(-2), expireAt: d(11), status: 'publie',
    },
    {
      ...base0, id: 'pas-e3', participants: 6, residenceId: 'passerelles', template: 'evenement',
      title: 'Atelier réparation de vélos',
      location: 'Local vélos, cour intérieure',
      startDate: d(18), endDate: d(18), startTime: '10:00', endTime: '12:30',
      description: 'Apprenez à régler vos freins, changer une chambre à air et entretenir votre vélo.',
      participation: 'Sans inscription. Venez avec votre vélo.',
      contact: 'Malik Diallo — 01 99 00 20 03 (numéro fictif)',
      message: 'Apprenez à régler vos freins, changer une chambre à air et entretenir votre vélo.',
      publishAt: d(0), expireAt: d(18), status: 'publie',
    },
  ]

  const campaigns: Campaign[] = [
    {
      id: 'camp-incendie', residenceIds: ['tilleuls', 'passerelles'],
      category: 'Sécurité',
      title: 'Incendie : les bons réflexes',
      summary: 'Trois gestes simples pour se protéger en cas de fumée ou de feu.',
      message:
        'En cas de fumée ou de feu :\n\n1. Appelez le 18 ou le 112.\n2. Si la fumée est dans le couloir, restez dans votre logement, fermez la porte et mettez un linge mouillé en bas.\n3. N’utilisez jamais l’ascenseur.\n\nVérifiez que votre détecteur de fumée fonctionne : appuyez sur le bouton test.',
      contact: 'Accueil de votre résidence',
      publishAt: d(-5), expireAt: d(60), status: 'publie',
      createdAt: stamp, updatedAt: stamp,
    },
    {
      id: 'camp-enquete', residenceIds: ['tilleuls', 'passerelles'],
      category: 'Information',
      title: 'Enquête annuelle de satisfaction',
      summary: 'L’enquête est terminée. Merci pour vos réponses.',
      message: 'L’enquête annuelle de satisfaction est terminée. Merci à toutes les personnes qui ont répondu.',
      contact: 'Accueil de votre résidence',
      publishAt: d(-45), expireAt: d(-15), status: 'publie',
      createdAt: stamp, updatedAt: stamp,
    },
  ]

  // Les messages publiés laissés vides sont préparés avec la même aide à la rédaction que l'administration.
  for (const c of contents) {
    if (c.status === 'publie' && !c.message) c.message = generateDraft(c).text
  }

  const at = (days: number, time: string) => `${d(days)}T${time}:00`
  const reports: Report[] = [
    {
      id: 'sig-til-1', reference: 'SIG-0412', residenceId: 'tilleuls', category: 'plomberie', unit: 'A-204',
      description: 'Léger goutte-à-goutte sous le lavabo de la salle de bain.', urgent: false,
      status: 'en-cours', mine: false, createdAt: at(-2, '09:15'), updatedAt: at(-1, '10:30'),
    },
    {
      id: 'sig-til-2', reference: 'SIG-0415', residenceId: 'tilleuls', category: 'parties-communes', unit: 'B-1er étage',
      description: 'L’éclairage du couloir reste éteint côté escalier.', urgent: false,
      status: 'recu', mine: false, createdAt: at(0, '08:40'), updatedAt: at(0, '08:40'),
    },
    {
      id: 'sig-pas-1', reference: 'SIG-0409', residenceId: 'passerelles', category: 'equipement', unit: '312',
      description: 'Le volet roulant électrique ne descend plus.', urgent: false,
      status: 'resolu', mine: false, createdAt: at(-5, '18:05'), updatedAt: at(-3, '11:20'),
    },
  ]

  return { version: DATA_VERSION, seededOn: base, residences, contacts, contents, campaigns, reports, registrations: {} }
}
