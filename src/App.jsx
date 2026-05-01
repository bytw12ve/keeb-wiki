import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BuildsPage from './pages/BuildsPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/builds" element={<BuildsPage />} />
      <Route path="/builds/:slug" element={<DetailsPage />} />
    </Routes>
  )
}
