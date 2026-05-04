/* built by twelve. */
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BuildsPage from './pages/BuildsPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import WikiPage from './pages/WikiPage.jsx'
import WikiArticlePage from './pages/WikiArticlePage.jsx'
import SubmitBuildPage from './pages/SubmitBuildPage.jsx'
import SubmitWikiPage from './pages/SubmitWikiPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BuildEditPage from './pages/BuildEditPage.jsx'
import WikiEditPage from './pages/WikiEditPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import SuggestionsPage from './pages/SuggestionsPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/builds" element={<BuildsPage />} />
      <Route path="/builds/:slug" element={<DetailsPage />} />
      <Route path="/builds/:slug/edit" element={<ProtectedRoute><BuildEditPage /></ProtectedRoute>} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="/wiki/:slug" element={<WikiArticlePage />} />
      <Route path="/wiki/:slug/edit" element={<ProtectedRoute><WikiEditPage /></ProtectedRoute>} />
      <Route path="/submit" element={<ProtectedRoute><SubmitBuildPage /></ProtectedRoute>} />
      <Route path="/submit-wiki" element={<ProtectedRoute><SubmitWikiPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/suggestions" element={<SuggestionsPage />} />
      <Route path="/community" element={<CommunityPage />} />
    </Routes>
  )
}
