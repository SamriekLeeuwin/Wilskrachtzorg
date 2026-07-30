import { useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, MenuItem, Select, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import {
  incidentCount90d, incidents, workItems, workItemVisibleForRole, type Trajectory, type WorkItem,
} from '../data/careInsights'
import { loadAppointments, loadNetworkContacts, loadPlacementConversations, loadReports, loadTrajectories, loadWorkQueue, saveTrajectories } from '../data/demoStore'
import { appointmentCanBeCompletedByRole, defaultAppointments, type CareAppointment } from '../data/appointments'
import { useWorkspaceRole } from '../context/RoleContext'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'
import { normalizeCareReport, type CareReport } from '../data/reports'
import { contactNeedsAttention, contactsForClient } from '../data/networkContacts'

const dossierHistoryByClient: Record<string, Array<{ date: string; isoDate: string; type: string; title: string; detail: string; tone: string }>> = {
  'WKZ-001': [
    { date: '24 jul 2026', isoDate: '2026-07-24T12:00:00.000Z', type: 'Vervolgplek', title: 'Definitief plaatsingsbesluit', detail: 'Kompas Wonen heeft plaatsing per 18 augustus bevestigd.', tone: '#2d7a62' },
    { date: '18 jul 2026', isoDate: '2026-07-18T12:00:00.000Z', type: 'Evaluatie', title: 'Doelevaluatie afgerond', detail: 'Doelen zelfstandigheid grotendeels behaald; voorbereiding op uitstroom voortzetten.', tone: '#3c79a6' },
    { date: '02 jul 2026', isoDate: '2026-07-02T12:00:00.000Z', type: 'Incident', title: 'Aantekening ordeverstoring', detail: 'Besproken met mentor. Nieuwe afspraak over rustmomenten vastgelegd.', tone: '#b66b37' },
    { date: '12 jun 2026', isoDate: '2026-06-12T12:00:00.000Z', type: 'Doorstroom', title: 'Voorbereiding op uitstroom gestart', detail: 'Zoekprofiel en gewenste uitstroomdatum samen vastgesteld.', tone: '#765b9a' },
  ],
}

const goalsByClient: Record<string, Array<{ label: string; progress: number; status: string; evaluation: string }>> = {
  'WKZ-001': [
    { label: 'Zelfstandig dagritme', progress: 85, status: 'Op koers', evaluation: '18 jul 2026' },
    { label: 'Financiën en administratie', progress: 70, status: 'Aandacht', evaluation: '18 jul 2026' },
    { label: 'Sociaal netwerk onderhouden', progress: 80, status: 'Op koers', evaluation: '18 jul 2026' },
  ],
}

const documentsByClient: Record<string, Array<{ id: string; title: string; type: string; version: string; date: string; source: string; status: string }>> = {
  'WKZ-001': [
    { id: 'DOC-001', title: 'Zorgplan – actuele samenvatting', type: 'Zorgplan', version: 'v3', date: '2026-07-18', source: 'Zilliz (demoreferentie)', status: 'Geldig' },
    { id: 'DOC-002', title: 'Beschikking jeugdhulp', type: 'Beschikking', version: 'v2', date: '2026-06-30', source: 'Gemeente (demoreferentie)', status: 'Geldig tot 31 dec 2026' },
  ],
}

function InfoField({ label, value }: { label: string; value: string }) {
  return <Box><Typography sx={{ fontSize: 11.5, fontWeight: 760, letterSpacing: '.04em', color: '#748594', textTransform: 'uppercase' }}>{label}</Typography><Typography sx={{ mt: .35, fontSize: 14, fontWeight: 650, color: '#30485d' }}>{value}</Typography></Box>
}

function DossierContent({ initialTrajectory }: { initialTrajectory: Trajectory }) {
  const [searchParams] = useSearchParams()
  const { role } = useWorkspaceRole()
  const canManageTrajectory = role === 'Zorgmanager'
  const canPlanAppointments = ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'].includes(role)
  const canManageFollowUp = role === 'Zorgmanager'
  const canCreateNetworkContact = ['Gedragswetenschapper', 'Zorgmanager'].includes(role)
  const canViewIncidentAnalysis = ['Gedragswetenschapper', 'Zorgmanager'].includes(role)
  const [trajectory, setTrajectory] = useState(initialTrajectory)
  const requestedTab = searchParams.get('tab')
  const [tab, setTab] = useState(requestedTab === 'work' ? 1 : requestedTab === 'development' ? 2 : requestedTab === 'network' ? 3 : requestedTab === 'documents' ? 4 : requestedTab === 'history' ? 5 : 0)
  const [historyType, setHistoryType] = useState('Alles')
  const [historyQuery, setHistoryQuery] = useState('')
  const [appointments] = useState<CareAppointment[]>(() => loadAppointments(initialTrajectory.clientCode, defaultAppointments(initialTrajectory.clientCode)))
  const [editOpen, setEditOpen] = useState(canManageTrajectory && searchParams.get('edit') === '1')
  const [editError, setEditError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [editValues, setEditValues] = useState({ expectedEndDate: trajectory.expectedEndDate, location: trajectory.location, supervisor: trajectory.supervisor, changeReason: '' })
  const trajectoryEditChanged = (
    editValues.expectedEndDate !== trajectory.expectedEndDate ||
    editValues.location !== trajectory.location ||
    editValues.supervisor !== trajectory.supervisor
  )
  useUnsavedChangesWarning(editOpen && (trajectoryEditChanged || Boolean(editValues.changeReason.trim())))
  const relatedActions = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' }))).filter((item) => item.clientCode === trajectory.clientCode)
  const openActions = relatedActions.filter((item) => item.status !== 'Afgerond')
  const completedActions = relatedActions.filter((item) => item.status === 'Afgerond')
  const plannedAppointments = appointments.filter((item) => item.status !== 'Afgerond')
  const completedAppointments = appointments.filter((item) => item.status === 'Afgerond')
  const placementRows = loadPlacementConversations().filter((item) => item.clientCode === trajectory.clientCode)
  const conversation = placementRows[0]
  const overExpected = !trajectory.endDate && new Date(trajectory.expectedEndDate) < new Date('2026-07-28')
  const linkedIncidents = incidents.filter((item) => item.clientCode === trajectory.clientCode)
  const dossierReports = loadReports<CareReport>([]).map(normalizeCareReport).filter((item) => item.clientCode === trajectory.clientCode)
  const dossierHistory = (dossierHistoryByClient[trajectory.clientCode] ?? [])
    .filter((event) => !placementRows.some((placement) => placement.subject === event.title))
  const goalRows = goalsByClient[trajectory.clientCode] ?? []
  const networkRows = contactsForClient(trajectory.clientCode, loadNetworkContacts())
  const latestNetworkContact = networkRows.find((item) => !item.correctedAt)
  const networkAttention = networkRows.filter((item) => contactNeedsAttention(item))
  const attentionItems = role === 'Gedragswetenschapper'
    ? [
      networkAttention.length ? `${networkAttention.length} gemeentelijke reactie${networkAttention.length === 1 ? '' : 's'} of aanvulling vraagt opvolging` : '',
      linkedIncidents.some((item) => item.recoveryRequired && !item.recoveryCompleted) ? 'Herstelopvolging na incident is nog open' : '',
      openActions.some((item) => item.type === 'UVO') ? 'UVO staat open en moet aan overleg en besluit worden gekoppeld' : '',
    ].filter(Boolean)
    : role === 'Zorgmanager'
      ? [
        overExpected ? 'Verwachte einddatum is overschreden; herbeoordeel planning en reden' : '',
        networkAttention.length ? `${networkAttention.length} externe afhankelijkheid${networkAttention.length === 1 ? '' : 'en'} vraagt sturing` : '',
        ['Zoeken', 'Wachtlijst', 'Nog niet gestart'].includes(trajectory.followUpPlace) ? `Vervolgplek staat op “${trajectory.followUpPlace}”` : '',
      ].filter(Boolean)
      : [
        openActions.filter((item) => workItemVisibleForRole(item, role)).length ? 'Er staat uitvoerbaar werk open voor dit dossier' : '',
        plannedAppointments.length ? `Eerstvolgende afspraak: ${new Date(`${plannedAppointments[0].date}T12:00:00`).toLocaleDateString('nl-NL')}` : '',
        linkedIncidents.some((item) => item.recoveryRequired && !item.recoveryCompleted) ? 'Herstelafspraak is nog niet afgerond' : '',
      ].filter(Boolean)
  const documentRows = documentsByClient[trajectory.clientCode] ?? []

  const timelineEvents = [
    ...plannedAppointments.filter((event) => event.createdAt).map((event) => ({
      id: `appointment-created-${event.id}`,
      timestamp: event.createdAt!,
      type: 'Afspraak gepland',
      title: event.subject,
      detail: `${event.type} op ${new Date(`${event.date}T12:00:00`).toLocaleDateString('nl-NL')} om ${event.time}.`,
      meta: `${event.owner} · aangemaakt door ${(event.createdByRole ?? 'onbekende rol').toLowerCase()}`,
      tone: '#6c8aa2',
    })),
    ...openActions.filter((event) => event.updatedAt && event.updatedAt !== 'demo-v1').map((event) => ({
      id: `task-open-${event.id}`,
      timestamp: event.updatedAt!,
      type: 'Taak bijgewerkt',
      title: event.title,
      detail: event.detail,
      meta: `${event.owner} · ${event.status ?? 'Open'} · deadline ${event.dueDate ?? event.due}`,
      tone: '#72936f',
    })),
    ...completedAppointments.map((event) => ({
      id: `appointment-${event.id}`,
      timestamp: event.completedAt ?? `${event.date}T12:00:00`,
      type: event.type,
      title: event.subject,
      detail: `${event.summary ?? 'Gesprek afgerond.'}${event.decision ? ` Besluit: ${event.decision}` : ''}`,
      meta: `Afspraak · ${event.owner}`,
      tone: '#3f7fa9',
    })),
    ...completedActions.map((event) => ({
      id: `task-${event.id}`,
      timestamp: event.completedAt ?? event.updatedAt ?? '2026-01-01',
      type: 'Afgeronde taak',
      title: event.title,
      detail: event.completionNote ?? 'Taak afgerond.',
      meta: `Taak · ${event.owner}`,
      tone: '#4d9378',
    })),
    ...dossierReports.map((event) => ({
      id: `report-${event.id}`,
      timestamp: event.decidedAt ?? event.reviewedAt ?? event.updatedAt,
      type: event.kind,
      title: event.subject,
      detail: [
        event.description,
        event.recommendation ? `Advies: ${event.recommendation}` : '',
        event.managerDecision ? `Besluit zorgmanager: ${event.managerDecision}. ${event.managerDecisionNote ?? ''}` : '',
      ].filter(Boolean).join(' '),
      meta: `${event.status} · gestart door ${event.createdByRole.toLowerCase()} · lokaal prototypeconcept`,
      tone: '#b66b37',
    })),
    ...networkRows.map((event) => ({
      id: `network-${event.id}`,
      timestamp: event.createdAt.startsWith(event.contactDate) ? event.createdAt : `${event.contactDate}T12:00:00`,
      type: 'Gemeente / verwijzer',
      title: event.subject,
      detail: `${event.agreement}${event.nextAction ? ` Vervolg: ${event.nextAction}` : ''} Gedeeld: ${event.sharedDataScope}${event.correctionReason ? ` Correctiereden: ${event.correctionReason}` : ''}`,
      meta: `${event.organisation} · ${event.correctedAt ? 'gecorrigeerde oorspronkelijke versie' : event.resolvedAt ? 'opgevolgd' : event.status} · ${event.owner} · geregistreerd door ${event.createdByRole.toLowerCase()} · grondslag: ${event.sharingBasis}`,
      tone: '#4d7899',
    })),
    ...placementRows.map((event) => ({
      id: `placement-${event.id}`,
      timestamp: `${event.date}T12:00:00`,
      type: 'Vervolgplekbesluit',
      title: event.subject,
      detail: `${event.decision} Vervolg: ${event.nextAction}`,
      meta: `${event.owner} · besluit door ${event.decisionBy ?? 'niet vastgelegd'} · bron ${event.evidenceReference ?? 'niet vastgelegd'}`,
      tone: '#567f68',
    })),
    ...dossierHistory.map((event) => ({
      id: `seed-${event.isoDate}-${event.title}`,
      timestamp: event.isoDate,
      type: event.type,
      title: event.title,
      detail: event.detail,
      meta: event.date,
      tone: event.tone,
    })),
    ...(trajectory.changeHistory?.length ? trajectory.changeHistory : trajectory.lastChangedAt ? [{
      changedAt: trajectory.lastChangedAt,
      changedByRole: trajectory.lastChangedByRole ?? 'Zorgmanager',
      reason: trajectory.lastChangeReason ?? 'Trajectgegevens zijn gewijzigd.',
      previousExpectedEndDate: trajectory.previousExpectedEndDate,
    }] : []).map((change) => ({
      id: `trajectory-${change.changedAt}`,
      timestamp: change.changedAt,
      type: 'Trajectwijziging',
      title: 'Trajectgegevens bijgewerkt',
      detail: change.reason,
      meta: `${change.changedByRole} · vorige verwachte einddatum ${change.previousExpectedEndDate ? new Date(`${change.previousExpectedEndDate}T12:00:00`).toLocaleDateString('nl-NL') : 'ongewijzigd'}`,
      tone: '#765b9a',
    })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const historyTypes = ['Alles', ...Array.from(new Set(timelineEvents.map((event) => event.type)))]
  const visibleTimelineEvents = timelineEvents.filter((event) => {
    const matchesType = historyType === 'Alles' || event.type === historyType
    const query = historyQuery.trim().toLowerCase()
    const matchesQuery = !query || `${event.title} ${event.detail} ${event.meta} ${event.type}`.toLowerCase().includes(query)
    return matchesType && matchesQuery
  })

  const saveTrajectoryChanges = () => {
    if (!trajectoryEditChanged) {
      setEditError('Er is nog niets gewijzigd.')
      return
    }
    const dateChanged = editValues.expectedEndDate !== trajectory.expectedEndDate
    if (!editValues.changeReason.trim()) {
      setEditError('Vul een reden in voor deze trajectwijziging.')
      return
    }
    if (!editValues.expectedEndDate || editValues.expectedEndDate < trajectory.startDate) {
      setEditError('De verwachte einddatum mag niet vóór de startdatum van het traject liggen.')
      return
    }
    const all = loadTrajectories()
    const latestTrajectory = all.find((item) => item.clientCode === trajectory.clientCode)
    if (!latestTrajectory || latestTrajectory.lastChangedAt !== trajectory.lastChangedAt) {
      setEditError('Dit traject is intussen gewijzigd. Vernieuw het dossier en controleer de actuele gegevens voordat u opnieuw opslaat.')
      return
    }
    const changedAt = new Date().toISOString()
    const changedFields = [
      dateChanged ? `verwachte einddatum van ${trajectory.expectedEndDate} naar ${editValues.expectedEndDate}` : '',
      editValues.location !== trajectory.location ? `locatie van ${trajectory.location} naar ${editValues.location}` : '',
      editValues.supervisor !== trajectory.supervisor ? `begeleider van ${trajectory.supervisor} naar ${editValues.supervisor}` : '',
    ].filter(Boolean)
    const changeReason = `${changedFields.join('; ')}${editValues.changeReason.trim() ? `. Reden: ${editValues.changeReason.trim()}` : ''}`
    const updated = {
      ...trajectory,
      expectedEndDate: editValues.expectedEndDate,
      location: editValues.location,
      supervisor: editValues.supervisor,
      ...(dateChanged ? { previousExpectedEndDate: trajectory.expectedEndDate, expectedEndDateReason: editValues.changeReason.trim() } : {}),
      lastChangedAt: changedAt,
      lastChangedByRole: role,
      lastChangeReason: changeReason,
      changeHistory: [
        ...(trajectory.changeHistory ?? []),
        {
          changedAt,
          changedByRole: role,
          reason: changeReason,
          previousExpectedEndDate: dateChanged ? trajectory.expectedEndDate : undefined,
        },
      ],
    }
    setTrajectory(updated)
    saveTrajectories(all.map((item) => item.clientCode === updated.clientCode ? updated : item))
    setEditValues({ expectedEndDate: updated.expectedEndDate, location: updated.location, supervisor: updated.supervisor, changeReason: '' })
    setEditOpen(false)
    setEditError('')
    setSavedMessage('Trajectgegevens zijn bijgewerkt.')
  }

  return (
    <Stack spacing={2.3} className="dossier-page">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.3}>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start', color: '#5b7185' }}>Terug naar jongeren</Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {canManageTrajectory && <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setEditOpen(true)}>Trajectgegevens wijzigen</Button>}
          {canPlanAppointments && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/nieuw`} variant="contained" startIcon={<AddRoundedIcon />}>Afspraak inplannen</Button>}
        </Stack>
      </Stack>

      {(savedMessage || searchParams.get('appointment') === 'created' || searchParams.get('meeting') === 'completed' || searchParams.get('intake') === 'created' || searchParams.get('placement') === 'updated' || searchParams.get('contact') || searchParams.get('task')) && <Alert severity="success" onClose={() => setSavedMessage('')}>{savedMessage || (searchParams.get('contact') === 'corrected' ? 'De correctie is als nieuwe versie vastgelegd. De oorspronkelijke registratie blijft zichtbaar in de historie.' : searchParams.get('contact') === 'created' ? 'Het gemeente-/verwijzercontact, de uitkomst en de eventuele vervolgtaak zijn in het dossier vastgelegd.' : searchParams.get('task') === 'created' ? 'De taak is toegevoegd en blijft binnen dit cliëntdossier terug te vinden.' : searchParams.get('task') === 'updated' ? 'De taak is bijgewerkt en blijft gekoppeld aan dit cliëntdossier.' : searchParams.get('placement') === 'updated' ? 'De vervolgplekstatus, het besluit en de vervolgtaak zijn samen bijgewerkt.' : searchParams.get('intake') === 'created' ? 'Het dossier en traject zijn gestart. Controleer nu de eerste afspraken en acties.' : searchParams.get('meeting') === 'completed' ? 'Het gesprek, besluit en eventuele vervolgtaak zijn vastgelegd in het dossier.' : 'De afspraak, deelnemers en agenda zijn opgeslagen. De gekoppelde taak is bijgewerkt.')}</Alert>}

      <Box sx={{ p: 2, bgcolor: attentionItems.length ? '#fff8ec' : '#edf7f2', border: `1px solid ${attentionItems.length ? '#f0d8ad' : '#cfe6da'}`, borderRadius: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.2}>
          <Box>
            <Stack direction="row" spacing={.8} alignItems="center">
              <WarningAmberRoundedIcon sx={{ fontSize: 18, color: attentionItems.length ? '#9c651f' : '#36765f' }} />
              <Typography sx={{ fontSize: 16, fontWeight: 780, color: '#294157' }}>Aandacht en volgende stap</Typography>
            </Stack>
            {attentionItems.length ? (
              <Stack component="ul" spacing={.35} sx={{ mt: .8, mb: 0, pl: 2.2 }}>
                {attentionItems.slice(0, 3).map((item) => <Typography component="li" key={item} sx={{ fontSize: 13.5, color: '#5f7180' }}>{item}</Typography>)}
              </Stack>
            ) : <Typography sx={{ mt: .6, fontSize: 13.5, color: '#567568' }}>Geen urgente uitzondering gevonden voor deze rol.</Typography>}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignSelf: { md: 'center' } }}>
            {role === 'Gedragswetenschapper' && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/netwerkcontact/nieuw`} variant="contained" size="small">Gemeente-/verwijzercontact vastleggen</Button>}
            {role === 'Zorgmanager' && overExpected && <Button variant="contained" size="small" onClick={() => setEditOpen(true)}>Planning herbeoordelen</Button>}
            {attentionItems.length > 0 && <Button variant="outlined" size="small" onClick={() => setTab(role === 'Gedragswetenschapper' && networkAttention.length ? 3 : 1)}>Open relevante opvolging</Button>}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.2} sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ minWidth: 220 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#dfeefa', color: '#315f83', fontSize: 14, fontWeight: 800 }}>{trajectory.clientCode.slice(-2)}</Avatar>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 760, color: '#718395' }}>Demodossier</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>{trajectory.clientCode}</Typography>
              <Stack direction="row" spacing={.7} sx={{ mt: .6 }}>
                <Chip label={trajectory.endDate ? 'Afgerond' : 'Actief'} size="small" sx={{ height: 20, bgcolor: trajectory.endDate ? '#eef1f4' : '#eaf6f1', color: trajectory.endDate ? '#687887' : '#28745d', fontSize: 9.5 }} />
                {overExpected && <Chip label="Verwachte einddatum overschreden" size="small" sx={{ height: 20, bgcolor: '#fbecea', color: '#a34d41', fontSize: 9.5 }} />}
              </Stack>
            </Box>
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 2.2, flex: 1 }}>
            <InfoField label="Locatie" value={trajectory.location} />
            <InfoField label="Hoofdbegeleider" value={trajectory.supervisor} />
            <InfoField label="Trajectfase" value={trajectory.currentPhase ?? 'Niet vastgelegd'} />
            <InfoField label="Veiligheid" value={linkedIncidents.some((item) => item.recoveryRequired && !item.recoveryCompleted) ? 'Opvolging open' : `${incidentCount90d(trajectory.clientCode)} incident(en) · 90 dagen`} />
            <InfoField label="Verwachte einddatum" value={new Date(`${trajectory.expectedEndDate}T12:00:00`).toLocaleDateString('nl-NL')} />
            <InfoField label="In zorg sinds" value={new Date(trajectory.startDate).toLocaleDateString('nl-NL')} />
          </Box>
        </Stack>
        <Divider />
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1.5, minHeight: 48, '& .MuiTab-root': { minHeight: 48, fontSize: 13, textTransform: 'none', fontWeight: 700 } }}>
          <Tab label="Overzicht" />
          <Tab label={`Afspraken & taken (${plannedAppointments.length + openActions.length})`} />
          <Tab label="Doelen & evaluaties" />
          <Tab label={`Netwerk (${networkRows.length})`} />
          <Tab label={`Documenten (${documentRows.length})`} />
          <Tab label="Historie" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.25fr) minmax(340px, .75fr)' }, gap: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <HandshakeRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Samenwerking & verwijzing</Typography>
              </Stack>
              <Box sx={{ mt: 1.7, display: 'grid', gap: 1.3 }}>
                <InfoField label="Verantwoordelijke gemeente" value={trajectory.responsibleMunicipality ?? 'Nog niet vastgelegd'} />
                <InfoField label="Verwijzer" value={trajectory.referrer ?? 'Nog niet vastgelegd'} />
                <InfoField label="Verwijsvraag" value={trajectory.referralQuestion ?? 'Nog niet vastgelegd'} />
                <InfoField label="Laatste externe status" value={latestNetworkContact ? `${latestNetworkContact.status} · ${latestNetworkContact.organisation}` : 'Nog geen contactmoment'} />
                <InfoField label="Volgende deadline" value={latestNetworkContact?.dueDate ? `${new Date(`${latestNetworkContact.dueDate}T12:00:00`).toLocaleDateString('nl-NL')} · ${latestNetworkContact.owner}` : 'Geen open deadline'} />
              </Box>
              <Button fullWidth variant="outlined" size="small" onClick={() => setTab(3)} sx={{ mt: 2 }}>Open netwerk en contacthistorie</Button>
              {canCreateNetworkContact && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/netwerkcontact/nieuw`} fullWidth variant="contained" size="small" sx={{ mt: 1 }}>Gemeente-/verwijzercontact vastleggen</Button>}
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Eerstvolgende afspraken</Typography>
              </Stack>
              <Stack spacing={1.1} sx={{ mt: 1.8 }}>
                {plannedAppointments.slice(0, 3).map((appointment) => (
                  <Stack key={appointment.id} direction="row" spacing={1.3} sx={{ p: 1.35, bgcolor: '#f8fafb', borderRadius: 1.8 }}>
                    <Box sx={{ width: 50, textAlign: 'center', py: .3 }}>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6e8496', textTransform: 'uppercase' }}>{new Date(appointment.date).toLocaleDateString('nl-NL', { month: 'short' })}</Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 780, color: '#2e4b63' }}>{new Date(appointment.date).getDate()}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{appointment.subject}</Typography>
                      <Typography sx={{ mt: .25, fontSize: 10.2, color: '#8492a2' }}>{appointment.time} · {appointment.type} · {appointment.participants}</Typography>
                      {appointment.invitations?.length ? <Typography sx={{ mt: .3, fontSize: 9.7, color: '#557b99' }}>{appointment.invitations.length} uitnodiging(en) klaargezet · {appointment.invitations.filter((item) => item.status === 'Geaccepteerd').length} geaccepteerd</Typography> : null}
                    </Box>
                    {canPlanAppointments && appointmentCanBeCompletedByRole(appointment, role) && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/${appointment.id}/afronden`} size="small">Afronden</Button>}
                    {canPlanAppointments && appointment.invitations?.length ? <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/${appointment.id}/uitnodigingen`} size="small">Uitnodigingen</Button> : null}
                  </Stack>
                ))}
                {!plannedAppointments.length && <Typography sx={{ fontSize: 10.8, color: '#718496' }}>Geen geplande afspraken.</Typography>}
              </Stack>
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AssignmentTurnedInRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Openstaande taken</Typography>
              </Stack>
              {openActions.length ? (
                <Stack spacing={1.1} sx={{ mt: 1.8 }}>
                  {openActions.map((action) => (
                    <Stack key={action.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1} sx={{ p: 1.45, border: '1px solid #e7ebef', borderRadius: 1.8 }}>
                      <Box><Typography sx={{ fontSize: 11.5, fontWeight: 720, color: '#30485d' }}>{action.title}</Typography><Typography sx={{ mt: .2, fontSize: 10.2, color: '#8492a2' }}>{action.detail} · {action.owner}</Typography></Box>
                      <Stack direction="row" spacing={.7} alignItems="center">
                        <Chip label={action.due} size="small" sx={{ height: 21, bgcolor: action.urgency === 'Te laat' ? '#fbecea' : '#fbf2e7', color: action.urgency === 'Te laat' ? '#a34d41' : '#936020', fontSize: 9.5 }} />
                        {workItemVisibleForRole(action, role) && <Button component={RouterLink} to={`/acties/${action.id}/bewerken?returnTo=${encodeURIComponent(`/jongeren/${trajectory.clientCode}?tab=work`)}`} size="small">Wijzigen</Button>}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : <Typography sx={{ mt: 2, fontSize: 11, color: '#718496' }}>Geen openstaande taken voor deze jongere.</Typography>}
              <Button component={RouterLink} to={`/acties/nieuw?client=${trajectory.clientCode}&returnTo=${encodeURIComponent(`/jongeren/${trajectory.clientCode}?tab=work`)}`} startIcon={<AddRoundedIcon />} size="small" sx={{ mt: 1.5 }}>Taak aanmaken</Button>
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <HomeWorkRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Vervolgplek</Typography>
              </Stack>
              <Chip label={trajectory.followUpPlace} size="small" sx={{ mt: 1.7, bgcolor: ['Definitief akkoord', 'Geplaatst'].includes(trajectory.followUpPlace) ? '#eaf6f1' : '#fbf2e7', color: ['Definitief akkoord', 'Geplaatst'].includes(trajectory.followUpPlace) ? '#28745d' : '#946020' }} />
              <Box sx={{ mt: 1.7, display: 'grid', gap: 1.3 }}>
                <InfoField label="Gewenst type" value={trajectory.followUpType ?? 'Nog te bepalen'} />
                <InfoField label="Aanbieder" value={trajectory.followUpProvider ?? 'Nog niet bekend'} />
                <InfoField label="Gewenste uitstroom" value={trajectory.plannedOutflow ? new Date(trajectory.plannedOutflow).toLocaleDateString('nl-NL') : 'Nog niet vastgesteld'} />
                <InfoField label="Laatste besluit" value={conversation?.decision ?? 'Nog geen besluit vastgelegd'} />
              </Box>
              {trajectory.followUpPlace !== 'Niet nodig' && <Button component={RouterLink} to={`/uitstroom-registratie?client=${trajectory.clientCode}`} fullWidth variant="outlined" size="small" sx={{ mt: 2 }}>Bekijk uitstroom en vervolgplek</Button>}
              {canManageFollowUp && trajectory.followUpPlace !== 'Niet nodig' && <Button component={RouterLink} to={`/uitstroom-registratie/bijwerken?client=${trajectory.clientCode}`} fullWidth variant="contained" size="small" sx={{ mt: 1 }}>Status en besluit bijwerken</Button>}
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FactCheckRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Incidenten en herstelopvolging</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 1.7 }}>
                <Box sx={{ p: 1.4, bgcolor: '#f8fafb', borderRadius: 1.5 }}><Typography sx={{ fontSize: 20, fontWeight: 780, color: '#2c485f' }}>{linkedIncidents.filter((item) => item.date >= '2026-04-29').length}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>incidenten · 90 dagen</Typography></Box>
                <Box sx={{ p: 1.4, bgcolor: '#f8fafb', borderRadius: 1.5 }}><Typography sx={{ fontSize: 20, fontWeight: 780, color: '#2c485f' }}>{linkedIncidents.filter((item) => item.measure === 'Aantekening' && item.date >= '2026-04-29').length}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>actieve aantekeningen</Typography></Box>
              </Box>
              <Typography sx={{ mt: 1.2, fontSize: 9.8, color: '#8192a1' }}>Alleen-lezen uit Zilliz · laatste synchronisatie 28 juli, 08:42</Typography>
              {canViewIncidentAnalysis && <Button component={RouterLink} to={`/gedrag-analyse?client=${trajectory.clientCode}`} fullWidth variant="outlined" size="small" sx={{ mt: 1.4 }}>Bekijk incidentanalyse voor dit dossier</Button>}
            </Box>
          </Stack>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.25fr .75fr' }, gap: 2 }}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Alle afspraken</Typography>
              {canPlanAppointments && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/nieuw`} size="small" startIcon={<AddRoundedIcon />}>Afspraak inplannen</Button>}
            </Stack>
            <Stack spacing={1.1} sx={{ mt: 1.8 }}>
              {appointments.map((appointment) => <Box key={appointment.id} sx={{ p: 1.5, border: '1px solid #e6ebef', borderRadius: 1.8 }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}><Box><Typography sx={{ fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{appointment.subject}</Typography><Typography sx={{ mt: .3, fontSize: 10.2, color: '#8492a2' }}>{appointment.type} · {appointment.participants}</Typography>{appointment.invitations?.length ? <Typography sx={{ mt: .35, fontSize: 9.7, color: '#557b99' }}>Uitnodigingen: {appointment.invitations.map((item) => `${item.name} (${item.status})`).join(' · ')}</Typography> : null}{appointment.status === 'Afgerond' && <Typography sx={{ mt: .5, fontSize: 10.2, color: '#4d806d' }}>Afgerond · {appointment.decision}</Typography>}</Box><Stack alignItems={{ sm: 'flex-end' }} spacing={.5}><Typography sx={{ fontSize: 10.5, fontWeight: 680, color: '#557188', whiteSpace: 'nowrap' }}>{new Date(appointment.date).toLocaleDateString('nl-NL')} · {appointment.time}</Typography>{canPlanAppointments && appointment.status !== 'Afgerond' && appointmentCanBeCompletedByRole(appointment, role) && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/${appointment.id}/afronden`} size="small">Gesprek afronden</Button>}</Stack></Stack></Box>)}
              {!appointments.length && <Alert severity="info">Voor dit dossier zijn nog geen afspraken vastgelegd.</Alert>}
            </Stack>
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Afspraken vastleggen</Typography><Typography sx={{ mt: 1, fontSize: 11, lineHeight: 1.65, color: '#64788a' }}>Leg onderwerp, deelnemers, taakverantwoordelijke en tijd vast. Besluiten en vervolgtaken horen na het gesprek in het dossier, zodat bevoegde medewerkers dezelfde actuele informatie zien.</Typography></Box>
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Ontwikkeldoelen</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>Laatste evaluatie en voortgang per doel</Typography>
          <Stack spacing={1.4} sx={{ mt: 2 }}>
            {goalRows.map((goal) => (
              <Box key={goal.label} sx={{ p: 1.5, border: '1px solid #e6ebef', borderRadius: 1.8 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#30485d' }}>{goal.label}</Typography><Chip label={goal.status} size="small" sx={{ height: 20, bgcolor: goal.status === 'Op koers' ? '#eaf6f1' : '#fbf2e7', color: goal.status === 'Op koers' ? '#28745d' : '#946020', fontSize: 9.5 }} /></Stack>
                <Box sx={{ mt: 1.1, height: 7, bgcolor: '#edf1f4', borderRadius: 10 }}><Box sx={{ width: `${goal.progress}%`, height: '100%', bgcolor: goal.status === 'Op koers' ? '#5a9b84' : '#ca9661', borderRadius: 10 }} /></Box>
                <Typography sx={{ mt: .7, fontSize: 9.8, color: '#8997a4' }}>{goal.progress}% · geëvalueerd op {goal.evaluation}</Typography>
              </Box>
            ))}
            {!goalRows.length && <Alert severity="info">Voor dit dossier bevat de prototypebron nog geen gevalideerde ontwikkeldoelen.</Alert>}
          </Stack>
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.2fr) minmax(320px, .8fr)' }, gap: 2 }}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ p: 2.4 }}>
              <Box>
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Contactmomenten en externe besluiten</Typography>
                <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>Nieuwste eerst · status, deadline en eigenaar blijven bij elkaar</Typography>
              </Box>
              {canCreateNetworkContact && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/netwerkcontact/nieuw`} variant="contained" size="small">Gemeente-/verwijzercontact vastleggen</Button>}
            </Stack>
            <Divider />
            <Stack divider={<Divider flexItem />}>
              {networkRows.map((contact) => {
                const needsAttention = contactNeedsAttention(contact)
                return (
                  <Box key={contact.id} sx={{ p: 2.3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.2}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={.8} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontSize: 12.3, fontWeight: 740, color: '#294157' }}>{contact.subject}</Typography>
                          <Chip label={contact.correctedAt ? 'Gecorrigeerd' : contact.resolvedAt ? 'Opgevolgd' : contact.status} size="small" sx={{ height: 24, bgcolor: contact.correctedAt ? '#eef1f4' : needsAttention ? '#fff1df' : '#eaf6f1', color: contact.correctedAt ? '#5f6d79' : needsAttention ? '#936020' : '#28745d', fontSize: 11.5 }} />
                        </Stack>
                        <Typography sx={{ mt: .35, fontSize: 13, color: '#718395' }}>{new Date(`${contact.contactDate}T12:00:00`).toLocaleDateString('nl-NL')} · {contact.organisation} · {contact.contactPerson} ({contact.contactRole}) · {contact.channel}{contact.direction ? ` · ${contact.direction}` : ''}</Typography>
                        <Typography sx={{ mt: 1, fontSize: 13.5, lineHeight: 1.6, color: '#53697b' }}>{contact.summary}</Typography>
                        <Typography sx={{ mt: .7, fontSize: 12.5, lineHeight: 1.55, color: '#7a8b99' }}>
                          Gegevensdeling: {contact.sharingBasis} · {contact.sharedDataScope} · geregistreerd door {contact.createdByRole.toLowerCase()}
                        </Typography>
                        {contact.correctionReason && <Alert severity="info" sx={{ mt: 1 }}>Correctie op eerdere registratie: {contact.correctionReason}</Alert>}
                        <Box sx={{ mt: 1.1, p: 1.2, bgcolor: '#f7f9fb', borderRadius: 1.5 }}>
                          <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#80909e', letterSpacing: '.06em' }}>AFSPRAAK / BESLUIT</Typography>
                          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#40566a' }}>{contact.agreement}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ minWidth: { md: 235 }, p: 1.3, bgcolor: needsAttention ? '#fff8ec' : '#f4f8fb', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#708598', letterSpacing: '.06em' }}>VERVOLG</Typography>
                        <Typography sx={{ mt: .35, fontSize: 10.8, fontWeight: 650, color: '#3d5970' }}>{contact.resolvedAt ? 'Opgevolgd in een later contactmoment' : contact.nextAction ?? 'Geen vervolgactie open'}</Typography>
                        <Typography sx={{ mt: .5, fontSize: 9.8, color: '#728596' }}>{contact.owner}{!contact.resolvedAt && contact.dueDate ? ` · vóór ${new Date(`${contact.dueDate}T12:00:00`).toLocaleDateString('nl-NL')}` : ''}</Typography>
                        {canCreateNetworkContact && !contact.correctedAt && <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/netwerkcontact/nieuw?corrects=${contact.id}`} size="small" sx={{ mt: 1, px: 0 }}>Correctie toevoegen</Button>}
                      </Box>
                    </Stack>
                  </Box>
                )
              })}
              {!networkRows.length && (
                <Box sx={{ p: 4 }}>
                  <Alert severity="info">Er is nog geen contact met gemeente of verwijzer in deze prototypebron vastgelegd.</Alert>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Actuele samenwerking</Typography>
              <Box sx={{ mt: 1.7, display: 'grid', gap: 1.3 }}>
                <InfoField label="Verantwoordelijke gemeente" value={trajectory.responsibleMunicipality ?? 'Niet vastgelegd'} />
                <InfoField label="Verwijzer" value={trajectory.referrer ?? 'Niet vastgelegd'} />
                <InfoField label="Verwijsvraag" value={trajectory.referralQuestion ?? 'Niet vastgelegd'} />
                <InfoField label="Primaire contactpersoon" value={latestNetworkContact ? `${latestNetworkContact.contactPerson} · ${latestNetworkContact.organisation}` : 'Niet vastgelegd'} />
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Gegevensdeling</Typography>
              {latestNetworkContact ? (
                <Box sx={{ mt: 1.4 }}>
                  <InfoField label="Laatst geregistreerde grondslag" value={latestNetworkContact.sharingBasis} />
                  <Typography sx={{ mt: 1.2, fontSize: 10.8, lineHeight: 1.6, color: '#61778a' }}>{latestNetworkContact.sharedDataScope}</Typography>
                  <Typography sx={{ mt: 1, fontSize: 9.7, color: '#8b98a5' }}>Controleer de grondslag en noodzakelijkheid opnieuw vóór ieder nieuw deelmoment.</Typography>
                </Box>
              ) : <Alert severity="warning" sx={{ mt: 1.4 }}>Geen deelgrondslag of scope geregistreerd.</Alert>}
            </Box>
          </Stack>
        </Box>
      )}

      {tab === 4 && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DescriptionRoundedIcon sx={{ fontSize: 21, color: '#4f7899' }} />
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 760, color: '#172c42' }}>Documenten en bronversies</Typography>
              <Typography sx={{ mt: .25, fontSize: 13, color: '#718395' }}>Alleen gevalideerde documentreferenties; het zorgbronsysteem blijft de bron.</Typography>
            </Box>
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>Dit prototype toont documentmetadata en versies, maar opent of wijzigt geen echte documenten. Productie vereist bronautorisatie, versiebeheer en een goedgekeurde wijzigingsflow.</Alert>
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {documentRows.map((document) => (
              <Stack key={document.id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.2} sx={{ p: 1.7, border: '1px solid #e3e9ef', borderRadius: 1.8 }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 740, color: '#30485d' }}>{document.title}</Typography>
                  <Typography sx={{ mt: .35, fontSize: 12.5, color: '#718395' }}>{document.type} · {document.version} · bijgewerkt {new Date(`${document.date}T12:00:00`).toLocaleDateString('nl-NL')}</Typography>
                  <Typography sx={{ mt: .35, fontSize: 12.5, color: '#718395' }}>Bron: {document.source}</Typography>
                </Box>
                <Chip label={document.status} size="small" sx={{ alignSelf: { sm: 'center' }, bgcolor: '#eaf6f1', color: '#28745d' }} />
              </Stack>
            ))}
            {!documentRows.length && <Alert severity="warning">Voor dit dossier zijn nog geen gevalideerde documentreferenties beschikbaar. Dit betekent niet dat er geen documenten bestaan in het bronsysteem.</Alert>}
          </Stack>
        </Box>
      )}

      {tab === 5 && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}><HistoryRoundedIcon sx={{ fontSize: 21, color: '#4f7899' }} /><Typography sx={{ fontSize: 16, fontWeight: 760, color: '#172c42' }}>Dossierhistorie</Typography></Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: { md: 480 } }}>
              <TextField size="small" fullWidth label="Zoek in historie" value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} />
              <TextField select size="small" label="Type gebeurtenis" value={historyType} onChange={(event) => setHistoryType(event.target.value)} sx={{ minWidth: 190 }}>
                {historyTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
          <Stack sx={{ mt: 2 }}>
            {visibleTimelineEvents.map((event, index) => (
              <Stack key={event.id} direction="row" spacing={1.5}>
                <Stack alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: event.tone, mt: .55 }} />
                  {index < visibleTimelineEvents.length - 1 && <Box sx={{ width: 1, flex: 1, minHeight: 66, bgcolor: '#dfe5ea' }} />}
                </Stack>
                <Box sx={{ pb: index < visibleTimelineEvents.length - 1 ? 2 : 0 }}>
                  <Typography sx={{ fontSize: 12.5, color: '#7a8996' }}>{new Date(event.timestamp).toLocaleString('nl-NL')} · {event.type}</Typography>
                  <Typography sx={{ mt: .25, fontSize: 14, fontWeight: 720, color: '#30485d' }}>{event.title}</Typography>
                  <Typography sx={{ mt: .25, fontSize: 13, lineHeight: 1.55, color: '#65798a' }}>{event.detail}</Typography>
                  <Typography sx={{ mt: .35, fontSize: 12.5, color: '#7a8996' }}>{event.meta}</Typography>
                </Box>
              </Stack>
            ))}
            {!timelineEvents.length && <Alert severity="info">Voor dit dossier bevat de prototypebron nog geen gevalideerde historie.</Alert>}
            {timelineEvents.length > 0 && !visibleTimelineEvents.length && <Alert severity="info">Geen gebeurtenissen gevonden voor deze zoekopdracht en dit type.</Alert>}
          </Stack>
        </Box>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Traject wijzigen</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>{trajectory.clientCode} · wijzigingen worden zichtbaar in managementoverzichten</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editError && <Alert severity="warning">{editError}</Alert>}
            <TextField fullWidth type="date" label="Verwachte einddatum" value={editValues.expectedEndDate} onChange={(event) => setEditValues({ ...editValues, expectedEndDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            {trajectoryEditChanged && (
              <TextField required multiline minRows={2} label="Reden van de wijziging" value={editValues.changeReason} onChange={(event) => setEditValues({ ...editValues, changeReason: event.target.value })} helperText="Leg vast waarom locatie, begeleider of planning wijzigt en wat is afgesproken." />
            )}
            <FormControl fullWidth>
              <Select value={editValues.location} onChange={(event) => setEditValues({ ...editValues, location: event.target.value as typeof editValues.location })} inputProps={{ 'aria-label': 'Locatie' }}>
                {['Tilburg', 'Breda', 'Eindhoven'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Select value={editValues.supervisor} onChange={(event) => setEditValues({ ...editValues, supervisor: event.target.value })} inputProps={{ 'aria-label': 'Hoofdbegeleider' }}>
                {['N. Janssen', 'S. Vermeer', 'A. de Wit', 'M. van Dijk', 'R. de Groot'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditOpen(false)}>Annuleren</Button>
          <Button variant="contained" onClick={saveTrajectoryChanges} disabled={!trajectoryEditChanged}>Wijzigingen opslaan</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

function JongereDossierPage() {
  const { clientCode = '' } = useParams()
  const initialTrajectory = loadTrajectories().find((item) => item.clientCode === clientCode)

  if (!initialTrajectory) {
    return (
      <Stack spacing={2.2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">
          <Typography sx={{ fontWeight: 760 }}>Cliëntdossier niet gevonden</Typography>
          <Typography sx={{ mt: .3, fontSize: 11.2 }}>
            De cliëntcode “{clientCode || 'onbekend'}” bestaat niet in deze prototypewerkruimte. Er is geen ander dossier geopend en niets gewijzigd.
          </Typography>
        </Alert>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
          Terug naar jongeren
        </Button>
      </Stack>
    )
  }

  return <DossierContent initialTrajectory={initialTrajectory} />
}

export default JongereDossierPage
