// Photos d'illustration fournies pour le prototype.
// Elles ne représentent pas les résidences fictives Les Tilleuls et Les Passerelles :
// elles sont toujours accompagnées de la mention « Photo d'illustration ».
// Les détails identifiants (panneau nominatif, plaques d'immatriculation) ont été floutés.
// Elles sont importées depuis le code (et non stockées dans les données) pour que
// Vite gère leur chemin sous /adoma-intranet-residence/.

import dechets from '../assets/photos/dechets-tri.jpg'
import equipements from '../assets/photos/equipements-logement.jpg'
import espacesCommuns from '../assets/photos/espaces-communs.jpg'
import laverie from '../assets/photos/laverie.jpg'
import passerelles from '../assets/photos/residence-passerelles.jpg'
import tilleuls from '../assets/photos/residence-tilleuls.jpg'

export interface Photo {
  src: string
  alt: string
}

const RESIDENCE_PHOTOS: Record<string, Photo> = {
  tilleuls: {
    src: tilleuls,
    alt: 'Photo d’illustration : immeuble de logements en brique claire, avec volets roulants et grille en bord de rue.',
  },
  passerelles: {
    src: passerelles,
    alt: 'Photo d’illustration : résidence contemporaine, façade noire et blanche ponctuée de garde-corps rouges.',
  },
}

/** Une photo par encart de la page « Logement & services ». */
export const SERVICE_PHOTOS = {
  laverie: {
    src: laverie,
    alt: 'Photo d’illustration : laverie avec une rangée de machines à laver numérotées.',
  },
  dechets: {
    src: dechets,
    alt: 'Photo d’illustration : abris fermés pour les conteneurs de déchets, au pied d’immeubles.',
  },
  equipements: {
    src: equipements,
    alt: 'Photo d’illustration : logement vide avec coin cuisine équipé, évier et placards.',
  },
  espacesCommuns: {
    src: espacesCommuns,
    alt: 'Photo d’illustration : couloir d’étage lumineux, portes de logements et ascenseur.',
  },
} satisfies Record<string, Photo>

export function residencePhoto(residenceId: string): Photo | undefined {
  return RESIDENCE_PHOTOS[residenceId]
}
