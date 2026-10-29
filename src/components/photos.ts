// Photos d'illustration fournies pour le prototype.
// Elles ne représentent pas les résidences fictives Les Tilleuls et Les Passerelles :
// elles sont toujours accompagnées de la mention « Photo d'illustration ».
// Les détails identifiants (panneau nominatif, plaques d'immatriculation) ont été floutés.
// Elles sont importées depuis le code (et non stockées dans les données) pour que
// Vite gère leur chemin sous /adoma-intranet-residence/.

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

export const LAUNDRY_PHOTO: Photo = {
  src: laverie,
  alt: 'Photo d’illustration : laverie équipée de machines à laver numérotées et d’un terminal de paiement.',
}

export function residencePhoto(residenceId: string): Photo | undefined {
  return RESIDENCE_PHOTOS[residenceId]
}
