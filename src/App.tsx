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
import AfspraakAfrondenPage from './pages/AfspraakAfrondenPage'
import NieuweJongerePage from './pages/NieuweJongerePage'
import VervolgplekBijwerkenPage from './pages/VervolgplekBijwerkenPage'
import MeldenPage from './pages/MeldenPage'
import UitnodigingenBeherenPage from './pages/UitnodigingenBeherenPage'
import RoleGate from './components/auth/RoleGate'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="acties" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><WerkvoorraadPage /></RoleGate>} />
        <Route path="acties/nieuw" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><NieuweTaakPage /></RoleGate>} />
        <Route path="acties/:taskId/bewerken" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><NieuweTaakPage /></RoleGate>} />
        <Route path="signalen" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><SignalenPage /></RoleGate>} />
        <Route path="melden" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><MeldenPage /></RoleGate>} />
        <Route path="jongeren" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider', 'Administratie']}><JongerenPage /></RoleGate>} />
        <Route path="jongeren/nieuw" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Locatieleider', 'Administratie']}><NieuweJongerePage /></RoleGate>} />
        <Route path="jongeren/:clientCode" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider', 'Administratie']}><JongereDossierPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/nieuw" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><NieuweAfspraakPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/:appointmentId/afronden" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><AfspraakAfrondenPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/:appointmentId/uitnodigingen" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider']}><UitnodigingenBeherenPage /></RoleGate>} />
        <Route path="uitstroom-registratie" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Locatieleider', 'Administratie']}><UitstroomRegistratiePage /></RoleGate>} />
        <Route path="uitstroom-registratie/bijwerken" element={<RoleGate roles={['Woonbegeleider', 'Ambulant begeleider', 'Locatieleider', 'Administratie']}><VervolgplekBijwerkenPage /></RoleGate>} />
        <Route path="rapportages" element={<RoleGate roles={['Locatieleider', 'Management', 'Directie']}><RapportagesPage /></RoleGate>} />
        <Route path="kpi-overzicht" element={<RoleGate roles={['Locatieleider', 'Management', 'Administratie', 'Directie']}><KpiOverzichtPage /></RoleGate>} />
        <Route path="gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Locatieleider']}><GedragAnalysePage /></RoleGate>} />
        <Route path="demo/gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Locatieleider']}><GedragAnalysePage /></RoleGate>} />
        <Route path="locaties" element={<RoleGate roles={['Locatieleider', 'Management', 'Directie']}><LocatiesPage /></RoleGate>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
