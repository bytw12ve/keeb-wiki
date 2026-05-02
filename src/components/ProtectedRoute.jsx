/* built by twelve. — bytw12ve */
import { Navigate, useLocation } from 'react-router-dom'
import { KW } from '../tokens.js'
import { useAuth } from '../lib/auth.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ background: KW.bg, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ font: '400 11px var(--kw-mono)', color: KW.text4 }}>checking session...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
