import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import BegeleidersPage from './pages/BegeleidersPage'
import GebruikersbeheerPage from './pages/GebruikersbeheerPage'
import JongerenPage from './pages/JongerenPage'
import KpiOverzichtPage from './pages/KpiOverzichtPage'
import LocatiesPage from './pages/LocatiesPage'
import RapportagesPage from './pages/RapportagesPage'
import SysteeminstellingenPage from './pages/SysteeminstellingenPage'
import UitstroomRegistratiePage from './pages/UitstroomRegistratiePage'
import FaseOverzichtPage from './pages/FaseOverzichtPage'
import JongereTimelinePage from './pages/JongereTimelinePage'
import GedragAnalysePage from './pages/GedragAnalysePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="jongeren" element={<JongerenPage />} />
        <Route path="uitstroom-registratie" element={<UitstroomRegistratiePage />} />
        <Route path="rapportages" element={<RapportagesPage />} />
        <Route path="kpi-overzicht" element={<KpiOverzichtPage />} />
        <Route path="fase-overzicht" element={<FaseOverzichtPage />} />
        <Route path="jongere-timeline" element={<JongereTimelinePage />} />
        <Route path="gedrag-analyse" element={<GedragAnalysePage />} />
        <Route path="demo/gedrag-analyse" element={<GedragAnalysePage forceDemoMode />} />
        <Route path="begeleiders" element={<BegeleidersPage />} />
        <Route path="locaties" element={<LocatiesPage />} />
        <Route path="gebruikersbeheer" element={<GebruikersbeheerPage />} />
        <Route path="systeeminstellingen" element={<SysteeminstellingenPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
