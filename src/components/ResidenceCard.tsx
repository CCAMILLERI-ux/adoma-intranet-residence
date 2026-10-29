// « Carte résidence » — composant 04 du design system.

import type { ReactNode } from 'react'
import type { Residence } from '../data/types'
import { Icon } from './ui'
import { ResidenceVisual } from './visuals'

export function ResidenceCard({
  residence,
  highlight,
  headingLevel = 2,
  children,
}: {
  residence: Residence
  /** Mention verte en tête de carte, calculée à partir des données. */
  highlight?: string
  headingLevel?: 2 | 3
  children?: ReactNode
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className="residence-card">
      <div className="residence-card__image">
        <ResidenceVisual residenceId={residence.id} label={`Illustration de la ${residence.name}`} />
        <span className="residence-card__tag">{residence.kind}</span>
        <span className="residence-card__credit" aria-hidden="true">
          Illustration
        </span>
      </div>
      <div className="residence-card__body">
        {highlight && <p className="residence-card__highlight">{highlight}</p>}
        <H className="residence-card__title">{residence.name}</H>
        <p className="residence-card__location">
          <Icon name="pin" size={16} />
          {residence.address}
        </p>
        {children}
      </div>
    </article>
  )
}
