import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import RoleGate from './components/auth/RoleGate'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const JongerenPage = lazy(() => import('./pages/JongerenPage'))
const KpiOverzichtPage = lazy(() => import('./pages/KpiOverzichtPage'))
const LocatiesPage = lazy(() => import('./pages/LocatiesPage'))
const RapportagesPage = lazy(() => import('./pages/RapportagesPage'))
const UitstroomRegistratiePage = lazy(() => import('./pages/UitstroomRegistratiePage'))
const GedragAnalysePage = lazy(() => import('./pages/GedragAnalysePage'))
const JongereDossierPage = lazy(() => import('./pages/JongereDossierPage'))
const WerkvoorraadPage = lazy(() => import('./pages/WerkvoorraadPage'))
const SignalenPage = lazy(() => import('./pages/SignalenPage'))
const BeoordelingenPage = lazy(() => import('./pages/BeoordelingenPage'))
const NieuweTaakPage = lazy(() => import('./pages/NieuweTaakPage'))
const NieuweAfspraakPage = lazy(() => import('./pages/NieuweAfspraakPage'))
const AfspraakAfrondenPage = lazy(() => import('./pages/AfspraakAfrondenPage'))
const NieuweJongerePage = lazy(() => import('./pages/NieuweJongerePage'))
const VervolgplekBijwerkenPage = lazy(() => import('./pages/VervolgplekBijwerkenPage'))
const MeldenPage = lazy(() => import('./pages/MeldenPage'))
const UitnodigingenBeherenPage = lazy(() => import('./pages/UitnodigingenBeherenPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="acties" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><WerkvoorraadPage /></RoleGate>} />
        <Route path="acties/nieuw" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweTaakPage /></RoleGate>} />
        <Route path="acties/:taskId/bewerken" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweTaakPage /></RoleGate>} />
        <Route path="signalen" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><SignalenPage /></RoleGate>} />
        <Route path="beoordelingen" element={<RoleGate roles={['Gedragswetenschapper', 'Zorgmanager']}><BeoordelingenPage /></RoleGate>} />
        <Route path="melden" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><MeldenPage /></RoleGate>} />
        <Route path="jongeren" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><JongerenPage /></RoleGate>} />
        <Route path="jongeren/nieuw" element={<RoleGate roles={['Zorgmanager']}><NieuweJongerePage /></RoleGate>} />
        <Route path="jongeren/:clientCode" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><JongereDossierPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/nieuw" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><NieuweAfspraakPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/:appointmentId/afronden" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><AfspraakAfrondenPage /></RoleGate>} />
        <Route path="jongeren/:clientCode/afspraak/:appointmentId/uitnodigingen" element={<RoleGate roles={['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']}><UitnodigingenBeherenPage /></RoleGate>} />
        <Route path="uitstroom-registratie" element={<RoleGate roles={['Begeleider', 'Zorgmanager']}><UitstroomRegistratiePage /></RoleGate>} />
        <Route path="uitstroom-registratie/bijwerken" element={<RoleGate roles={['Zorgmanager']}><VervolgplekBijwerkenPage /></RoleGate>} />
        <Route path="rapportages" element={<RoleGate roles={['Zorgmanager', 'Directie']}><RapportagesPage /></RoleGate>} />
        <Route path="kpi-overzicht" element={<RoleGate roles={['Zorgmanager', 'Directie']}><KpiOverzichtPage /></RoleGate>} />
        <Route path="gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Zorgmanager', 'Directie']}><GedragAnalysePage /></RoleGate>} />
        <Route path="demo/gedrag-analyse" element={<RoleGate roles={['Gedragswetenschapper', 'Zorgmanager', 'Directie']}><GedragAnalysePage /></RoleGate>} />
        <Route path="locaties" element={<RoleGate roles={['Zorgmanager', 'Directie']}><LocatiesPage /></RoleGate>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
