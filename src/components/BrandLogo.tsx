// Logo CDC Habitat Adoma, fourni pour le prototype (fond blanc).
import logo from '../assets/brand/cdc-habitat-adoma.png'

export function BrandLogo({ className = '' }: { className?: string }) {
  return <img className={`brand-logo ${className}`.trim()} src={logo} alt="CDC Habitat Adoma" width={460} height={128} />
}
