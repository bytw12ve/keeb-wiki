/* built by twelve. */
import KeebArt from './KeebArt.jsx'
import { getArt, getLayoutCode } from '../lib/supabase.js'

function firstPhoto(build) {
  return (build?.photos || []).filter(Boolean)[0]
}

export default function BuildVisual({ build, seed = 0, style }) {
  const photo = firstPhoto(build)
  const name = build?.name || 'keyboard build'

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', background: 'transparent', ...style }}>
      {photo ? (
        <img
          src={photo}
          alt={`${name} photo`}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <KeebArt palette={getArt(build)} layout={getLayoutCode(build?.layout)} seed={seed} />
      )}
    </div>
  )
}
