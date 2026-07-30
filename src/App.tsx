import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import JongerenPage from './pages/JongerenPage'
import KpiOverzichtPage from './pages/KpiOverzichtPage'
import LocatiesPage from './pages/LocatiesPage'
import RapportagesPage from './pages/RapportagesPage'
import UitstroomRegistratiePage from './pages/UitstroomRegistratiePage'
import GedragAnalysePage from './pages/GedragAnalysePage'
import JongereDossierPage from './pages/JongereDossierPage'
import WerkvoorraadPage from './pages/WerkvoorraadPage'
import SignalenPage from './pages/SignalenPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="acties" element={<WerkvoorraadPage />} />
        <Route path="signalen" element={<SignalenPage />} />
        <Route path="jongeren" element={<JongerenPage />} />
        <Route path="jongeren/:clientCode" element={<JongereDossierPage />} />
        <Route path="uitstroom-registratie" element={<UitstroomRegistratiePage />} />
        <Route path="rapportages" element={<RapportagesPage />} />
        <Route path="kpi-overzicht" element={<KpiOverzichtPage />} />
        <Route path="gedrag-analyse" element={<GedragAnalysePage />} />
        <Route path="demo/gedrag-analyse" element={<GedragAnalysePage />} />
        <Route path="locaties" element={<LocatiesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
