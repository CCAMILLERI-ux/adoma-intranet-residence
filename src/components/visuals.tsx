// Illustrations vectorielles du prototype, aux couleurs du design system.
// Ce sont des dessins, pas des photos : ils ne représentent aucun bâtiment réel
// ni aucune personne. Ils peuvent être remplacés par des photos libres de droits.

import { useId, type ReactElement } from 'react'
import type { SpaceVisual } from '../data/types'

const INK = '#101828'
const RED = '#e30613'
const MIST = '#f4f6f8'
const LINE = '#dfe3e8'
const GLASS = '#c9d6e3'
const LEAF = '#5f8f57'
const LEAF_LIGHT = '#86ad78'

function Windows({ x, y, cols, rows, w, h, gapX, gapY, fill = INK }: { x: number; y: number; cols: number; rows: number; w: number; h: number; gapX: number; gapY: number; fill?: string }) {
  const cells = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = x + c * (w + gapX)
      const cy = y + r * (h + gapY)
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={cx} y={cy} width={w} height={h} rx={2} fill={fill} opacity={0.88} />
          <rect x={cx + 3} y={cy + 3} width={w / 2 - 4} height={h - 6} rx={1} fill={GLASS} opacity={(r + c) % 3 === 0 ? 0.55 : 0.25} />
        </g>,
      )
    }
  return <>{cells}</>
}

function Tree({ x, y, r, light }: { x: number; y: number; r: number; light?: boolean }) {
  return (
    <g>
      <rect x={x - 4} y={y} width={8} height={r * 0.9} rx={2} fill="#6b4f3a" />
      <circle cx={x} cy={y - r * 0.2} r={r} fill={light ? LEAF_LIGHT : LEAF} />
      <circle cx={x - r * 0.45} cy={y + r * 0.1} r={r * 0.6} fill={light ? LEAF : LEAF_LIGHT} opacity={0.75} />
    </g>
  )
}

/** Résidence sociale : immeuble bas, arbres (tilleuls). */
function TilleulsArt() {
  return (
    <>
      <rect width="600" height="400" fill={MIST} />
      <circle cx="520" cy="40" r="150" fill="none" stroke="#ffd3d6" strokeWidth="1.5" />
      <circle cx="520" cy="40" r="95" fill="#fff1f2" />
      <rect y="338" width="600" height="62" fill={LINE} />
      <path d="M0 338h600" stroke="#c8ced6" strokeWidth="2" />
      {/* Bâtiment principal */}
      <rect x="110" y="96" width="310" height="242" fill="#efe7db" />
      <rect x="102" y="84" width="326" height="14" fill="#d8ccb9" />
      <Windows x={132} y={114} cols={6} rows={4} w={30} h={36} gapX={18} gapY={14} />
      <rect x="236" y="292" width="58" height="46" fill={INK} />
      <rect x="264" y="296" width="2" height="42" fill="#3a4354" />
      <rect x="224" y="282" width="82" height="10" fill={RED} />
      {/* Bâtiment B */}
      <rect x="420" y="168" width="128" height="170" fill="#e4d9c8" />
      <rect x="414" y="158" width="140" height="12" fill="#d0c3ae" />
      <Windows x={438} y={186} cols={3} rows={3} w={26} h={30} gapX={13} gapY={16} />
      {/* Tilleuls */}
      <Tree x={70} y={300} r={46} />
      <Tree x={160} y={318} r={30} light />
      <Tree x={556} y={312} r={34} light />
      <path d="M250 400l14-62h4l14 62" fill="#ccd2da" />
    </>
  )
}

/** Résidence pour jeunes actifs : deux tours reliées par des passerelles. */
function PasserellesArt() {
  return (
    <>
      <rect width="600" height="400" fill="#eef2f7" />
      <circle cx="80" cy="60" r="140" fill="none" stroke="#ffd3d6" strokeWidth="1.5" />
      <circle cx="80" cy="60" r="80" fill="#fff1f2" />
      <rect y="340" width="600" height="60" fill={LINE} />
      <path d="M0 340h600" stroke="#c8ced6" strokeWidth="2" />
      {/* Tour 1 */}
      <rect x="96" y="52" width="170" height="288" fill="#ffffff" stroke={LINE} strokeWidth="2" />
      <Windows x={112} y={70} cols={3} rows={6} w={38} h={30} gapX={13} gapY={14} fill="#2b3446" />
      <rect x="256" y="52" width="10" height="288" fill={RED} />
      {/* Tour 2 */}
      <rect x="350" y="104" width="170" height="236" fill="#f7f8fa" stroke={LINE} strokeWidth="2" />
      <Windows x={366} y={122} cols={3} rows={5} w={38} h={28} gapX={13} gapY={14} fill="#2b3446" />
      <rect x="350" y="104" width="170" height="10" fill={INK} />
      {/* Passerelles */}
      {[176, 252].map((y) => (
        <g key={y}>
          <rect x="266" y={y} width="84" height="28" fill={INK} />
          <rect x="272" y={y + 6} width="72" height="12" rx="2" fill={GLASS} opacity="0.7" />
        </g>
      ))}
      <rect x="160" y="300" width="44" height="40" fill={INK} />
      {/* Végétation et vélos */}
      <Tree x={44} y={318} r={26} light />
      <Tree x={556} y={316} r={30} />
      <g stroke={INK} strokeWidth="3" fill="none">
        <circle cx="400" cy="362" r="12" />
        <circle cx="436" cy="362" r="12" />
        <path d="M400 362l14-18h16l6 18M414 344l8 18h14" />
      </g>
    </>
  )
}

export function ResidenceVisual({ residenceId, label }: { residenceId: string; label: string }) {
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className="visual">
      {residenceId === 'passerelles' ? <PasserellesArt /> : <TilleulsArt />}
    </svg>
  )
}

/* ---------- Scènes des espaces communs ---------- */

const SCENES: Record<SpaceVisual, () => ReactElement> = {
  laverie: () => (
    <>
      {[60, 136, 212].map((x, i) => (
        <g key={x}>
          <rect x={x} y="52" width="62" height="92" rx="5" fill="#fff" stroke={INK} strokeWidth="3" />
          <path d={`M${x} 72h62`} stroke={INK} strokeWidth="3" />
          <circle cx={x + 10} cy="62" r="3" fill={i === 1 ? RED : INK} />
          <circle cx={x + 31} cy="106" r="22" fill={GLASS} stroke={INK} strokeWidth="3" />
          <path d={`M${x + 18} 110q13 -10 26 0`} stroke="#fff" strokeWidth="3" fill="none" />
        </g>
      ))}
    </>
  ),
  salle: () => (
    <>
      <path d="M160 20v26" stroke={INK} strokeWidth="3" />
      <path d="M140 60a20 14 0 0 1 40 0z" fill={RED} />
      <rect x="92" y="102" width="136" height="10" rx="3" fill={INK} />
      <path d="M108 112v40M212 112v40" stroke={INK} strokeWidth="5" />
      {[62, 238].map((x) => (
        <g key={x} stroke={INK} strokeWidth="4" fill="none">
          <path d={`M${x} 80v72M${x} 120h22v32`} />
        </g>
      ))}
      <circle cx="138" cy="94" r="7" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="168" y="84" width="20" height="18" rx="3" fill={LEAF_LIGHT} />
    </>
  ),
  jardin: () => (
    <>
      {[48, 168].map((x) => (
        <g key={x}>
          <rect x={x} y="112" width="104" height="36" rx="3" fill="#b9946b" stroke={INK} strokeWidth="3" />
          {[18, 52, 86].map((dx, i) => (
            <g key={dx}>
              <path d={`M${x + dx} 112v-26`} stroke={LEAF} strokeWidth="4" />
              <ellipse cx={x + dx - 9} cy="92" rx="11" ry="6" fill={i === 1 ? LEAF_LIGHT : LEAF} transform={`rotate(-30 ${x + dx - 9} 92)`} />
              <ellipse cx={x + dx + 9} cy="82" rx="11" ry="6" fill={LEAF_LIGHT} transform={`rotate(30 ${x + dx + 9} 82)`} />
            </g>
          ))}
        </g>
      ))}
      <circle cx="268" cy="40" r="16" fill="#ffd3d6" />
    </>
  ),
  velos: () => (
    <g stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="104" cy="118" r="34" />
      <circle cx="216" cy="118" r="34" />
      <path d="M104 118l40-50h52l20 50M144 68l28 50h44M190 56h16M136 56h18" />
      <path d="M172 118l-8-50" stroke={RED} />
    </g>
  ),
  coworking: () => (
    <>
      <rect x="54" y="112" width="212" height="10" rx="3" fill={INK} />
      <path d="M72 122v34M248 122v34" stroke={INK} strokeWidth="5" />
      <rect x="112" y="62" width="76" height="50" rx="4" fill={GLASS} stroke={INK} strokeWidth="3" />
      <path d="M100 112h100" stroke={INK} strokeWidth="5" />
      <path d="M226 112V74l-16-14" stroke={INK} strokeWidth="3" fill="none" />
      <path d="M198 64l18-10 8 14z" fill={RED} />
      <rect x="66" y="92" width="22" height="20" rx="3" fill={LEAF_LIGHT} />
    </>
  ),
  sport: () => (
    <>
      <rect x="60" y="128" width="200" height="14" rx="7" fill="#ffd3d6" />
      <rect x="96" y="84" width="128" height="10" rx="5" fill={INK} />
      {[84, 220].map((x) => (
        <g key={x}>
          <rect x={x} y="62" width="16" height="54" rx="4" fill={RED} />
          <rect x={x + (x < 160 ? -12 : 16)} y="72" width="12" height="34" rx="4" fill={INK} />
        </g>
      ))}
    </>
  ),
  terrasse: () => (
    <>
      <circle cx="258" cy="40" r="18" fill="#ffd3d6" />
      <path d="M160 40v104" stroke={INK} strokeWidth="4" />
      <path d="M96 64q64 -50 128 0z" fill={RED} />
      <path d="M96 64h128" stroke={INK} strokeWidth="3" />
      {[84, 204].map((x) => (
        <path key={x} d={`M${x} 96v48M${x} 118h30v26M${x + 30} 118v-8`} stroke={INK} strokeWidth="4" fill="none" />
      ))}
      <Tree x={40} y={128} r={20} light />
    </>
  ),
}

export function SpaceScene({ visual }: { visual: SpaceVisual }) {
  const id = useId().replace(/:/g, '')
  const Scene = SCENES[visual]
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" className="visual">
      <defs>
        <pattern id={`dots-${id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="#d9dde3" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill="#f7f8fa" />
      <rect width="320" height="180" fill={`url(#dots-${id})`} />
      <Scene />
    </svg>
  )
}
