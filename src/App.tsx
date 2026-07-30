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
import NieuweTaakPage from './pages/NieuweTaakPage'
import NieuweAfspraakPage from './pages/NieuweAfspraakPage'
import RoleGate from './components/auth/RoleGate'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="acties" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><WerkvoorraadPage /></RoleGate>} />
        <Route path="acties/nieuw" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweTaakPage /></RoleGate>} />
        <Route path="acties/:taskId/bewerken" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweTaakPage /></RoleGate>} />
        <Route path="signalen" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><SignalenPage /></RoleGate>} />
        <Route path="jongeren" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><JongerenPage /></RoleGate>} />
        <Route path="jongeren/:clientCode" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><JongereDossierPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/nieuw" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweAfspraakPage /></RoleGate>} />
        <Route path="uitstroom-registratie" element={<RoleGate roles={['Begeleider', 'Zorgmanager']}><UitstroomRegistratiePage /></RoleGate>} />
        <Route path="rapportages" element={<RoleGate roles={['Zorgmanager', 'Directie']}><RapportagesPage /></RoleGate>} />
        <Route path="kpi-overzicht" element={<RoleGate roles={['Zorgmanager', 'Directie']}><KpiOverzichtPage /></RoleGate>} />
        <Route path="gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Zorgmanager']}><GedragAnalysePage /></RoleGate>} />
        <Route path="demo/gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Zorgmanager']}><GedragAnalysePage /></RoleGate>} />
        <Route path="locaties" element={<RoleGate roles={['Zorgmanager', 'Directie']}><LocatiesPage /></RoleGate>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
