import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BuildsPage from './pages/BuildsPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import WikiPage from './pages/WikiPage.jsx'
import WikiArticlePage from './pages/WikiArticlePage.jsx'
import SubmitBuildPage from './pages/SubmitBuildPage.jsx'
import SubmitWikiPage from './pages/SubmitWikiPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/builds" element={<BuildsPage />} />
      <Route path="/builds/:slug" element={<DetailsPage />} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="/wiki/:slug" element={<WikiArticlePage />} />
      <Route path="/submit" element={<SubmitBuildPage />} />
      <Route path="/submit-wiki" element={<SubmitWikiPage />} />
    </Routes>
  )
}
