import type { Contact } from '../data/types'
import { teamPhoto } from './photos'

/** Portrait d'illustration, ou initiales si aucun portrait n'est associé. Décoratif : le nom est écrit à côté. */
export function Avatar({ contact, size = 72 }: { contact: Contact; size?: number }) {
  const photo = teamPhoto(contact.id)
  if (photo) return <img className="avatar" src={photo} alt="" width={size} height={size} loading="lazy" />
  const initials = contact.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <span className="avatar avatar--initials" style={{ width: size, height: size }} aria-hidden="true">
      {initials}
    </span>
  )
}
