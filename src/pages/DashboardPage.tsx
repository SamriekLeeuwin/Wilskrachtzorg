import { useMemo, useState, type ReactNode } from 'react'
import { Alert, Avatar, Box, Button, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import { Link as RouterLink } from 'react-router-dom'
import InsightFilters from '../components/insights/InsightFilters'
import KpiCard from '../components/insights/KpiCard'
import {
  formatMonths, incidents, median, monthsBetween, workItems,
  workItemVisibleForRole, type Filters,
} from '../data/careInsights'
import { loadNetworkContacts, loadReports, loadTrajectories, loadWorkQueue } from '../data/demoStore'
import { deriveSignals } from '../data/signals'
import { useWorkspaceRole, type WorkspaceRole } from '../context/RoleContext'
import { normalizeCareReport, type CareReport } from '../data/reports'
import { contactNeedsAttention } from '../data/networkContacts'
import { buildReportingSnapshot } from '../data/reporting'

const roleFocus = {
  Begeleider: 'Registreer wat u waarneemt en ziet direct welke dossiers, signalen, afspraken en taken opvolging nodig hebben.',
  Gedragswetenschapper: 'Start bij veiligheid, inhoudelijke beoordelingen en afspraken of reacties van gemeenten en verwijzers.',
  Zorgmanager: 'Controleer operationele opvolging en stuur op achterstanden, doorstroom en betrouwbaarheid van de vastgelegde data.',
  Directie: 'Volg de belangrijkste uitkomsten, afwijkingen ten opzichte van de norm en de onderliggende oorzaken.',
}

const urgencyTone = {
  Vandaag: { bg: '#fff5e8', color: '#9a5a17' },
  'Deze week': { bg: '#eef5fb', color: '#2d618f' },
  'Te laat': { bg: '#fcecea', color: '#a44539' },
}

function DashboardPage() {
  const { role } = useWorkspaceRole()
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const allTrajectories = useMemo(() => loadTrajectories(), [])
  const reports = useMemo(() => loadReports<CareReport>([]).map(normalizeCareReport), [])
  const reporting = useMemo(() => buildReportingSnapshot(filters, allTrajectories), [allTrajectories, filters])
  const incidentRowsInPeriod = useMemo(() => incidents.filter((incident) => {
    const trajectory = allTrajectories.find((item) => item.clientCode === incident.clientCode)
    return incident.date >= reporting.window.start &&
      incident.date <= reporting.window.end &&
      (filters.location === 'Alle locaties' || incident.location === filters.location) &&
      (filters.origin === 'Alle gemeenten' || trajectory?.originMunicipality === filters.origin)
  }), [allTrajectories, filters.location, filters.origin, reporting.window.end, reporting.window.start])
  const filtered = reporting.trajectoriesInPeriod
  const active = reporting.activeAtPeriodEnd
  const completed = reporting.exitsInPeriod
  const needsPlacement = reporting.placementNeeded.filter((item) => !['Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))
  const arranged = reporting.placementArranged
  const overdue = reporting.overdueAtPeriodEnd
  const qualityIssues = reporting.qualityIssues
  const completeness = reporting.completeness
  const sourceReconciliationOk = !reporting.incidentReconciliation.available || reporting.incidentReconciliation.matches
  const plannedExitRate = reporting.exitsInPeriod.length
    ? Math.round((reporting.plannedExits.length / reporting.exitsInPeriod.length) * 100)
    : null
  const networkAttention = useMemo(() => loadNetworkContacts().filter((item) => contactNeedsAttention(item)), [])
  const allDashboardActions = useMemo(() => loadWorkQueue(workItems.map((item) => ({ ...item, status: 'Open' as const }))), [])
  const dashboardActions = allDashboardActions.filter((item) => item.status === 'Open')
  const signals = useMemo(() => deriveSignals(allTrajectories, allDashboardActions), [allTrajectories, allDashboardActions])
  const showManagement = ['Zorgmanager', 'Directie'].includes(role)
  const showOperationalWork = role !== 'Directie'
  const isGuidanceRole = role === 'Begeleider'
  const visibleDashboardActions = dashboardActions.filter((item) => workItemVisibleForRole(item, role))
  const roleSignals = role === 'Gedragswetenschapper'
    ? signals.filter((item) => item.type === 'Veiligheid')
    : role === 'Begeleider'
      ? signals.filter((item) => item.owner !== 'Nog toe te wijzen')
      : signals

  const originSummary = useMemo(() => {
    const all = filtered
    return ['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((origin) => {
      const rows = all.filter((item) => item.originMunicipality === origin)
      const closed = completed.filter((item) => item.originMunicipality === origin)
      const durations = closed.map((item) => monthsBetween(item.startDate, item.endDate!))
      return {
        origin,
        count: rows.length,
        median: durations.length ? median(durations) : null,
        exits: closed.length,
      }
    }).sort((a, b) => b.count - a.count)
  }, [completed, filtered])
  const maxOrigin = Math.max(1, ...originSummary.map((item) => item.count))
  const careActionRoles: WorkspaceRole[] = ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']
  const dashboardShortcuts: Array<{ label: string; detail: string; to: string; icon: ReactNode; roles: WorkspaceRole[] }> = [
    { label: 'Melding registreren', detail: 'Veiligheids-, zorg- of datamelding', to: '/melden', icon: <CampaignRoundedIcon />, roles: careActionRoles },
    { label: 'Taak aanmaken', detail: 'Verantwoordelijke en deadline vastleggen', to: '/acties/nieuw', icon: <AddTaskRoundedIcon />, roles: careActionRoles },
    { label: 'Afspraak plannen', detail: 'Genodigden en contactgegevens', to: '/jongeren?actie=afspraak', icon: <EventAvailableRoundedIcon />, roles: careActionRoles },
    { label: 'Beoordelingen en besluiten', detail: 'Van registratie naar advies en besluit', to: '/beoordelingen', icon: <CheckCircleRoundedIcon />, roles: ['Gedragswetenschapper', 'Zorgmanager'] },
    { label: 'Gemeentecontact vastleggen', detail: 'Contact, reactie en deadline registreren', to: '/jongeren?actie=netwerkcontact', icon: <Groups2RoundedIcon />, roles: ['Gedragswetenschapper', 'Zorgmanager'] },
    { label: 'Cliëntdossier openen', detail: 'Dossier zoeken en inzien', to: '/jongeren', icon: <FolderOpenRoundedIcon />, roles: careActionRoles },
    { label: 'Dossiergegevens wijzigen', detail: 'Wijziging met reden vastleggen', to: '/jongeren?actie=wijzigen', icon: <EditNoteRoundedIcon />, roles: ['Zorgmanager'] },
    { label: 'Nieuwe intake', detail: 'Dossier en traject starten', to: '/jongeren/nieuw', icon: <Groups2RoundedIcon />, roles: ['Zorgmanager'] },
    { label: 'Uitstroom en vervolgplek', detail: 'Voortgang bekijken of verwerken', to: '/uitstroom-registratie', icon: <HomeWorkRoundedIcon />, roles: ['Begeleider', 'Zorgmanager'] },
    { label: 'Rapportage openen', detail: 'Uitkomsten en afwijkingen', to: '/rapportages', icon: <ArrowForwardRoundedIcon />, roles: ['Zorgmanager', 'Directie'] },
    { label: 'Data controleren', detail: 'Definities en ontbrekende data', to: '/kpi-overzicht', icon: <CheckCircleRoundedIcon />, roles: ['Zorgmanager', 'Directie'] },
  ]
  const shortcutOrder: Record<WorkspaceRole, string[]> = {
    Begeleider: ['Melding registreren', 'Taak aanmaken', 'Afspraak plannen', 'Cliëntdossier openen'],
    Gedragswetenschapper: ['Beoordelingen en besluiten', 'Gemeentecontact vastleggen', 'Afspraak plannen', 'Taak aanmaken', 'Cliëntdossier openen'],
    Zorgmanager: ['Beoordelingen en besluiten', 'Cliëntdossier openen', 'Uitstroom en vervolgplek', 'Data controleren', 'Nieuwe intake'],
    Directie: ['Rapportage openen', 'Data controleren'],
  }
  const visibleShortcuts = shortcutOrder[role]
    .map((label) => dashboardShortcuts.find((item) => item.label === label))
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.roles.includes(role)))

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={1.5} sx={{ p: 2.2, bgcolor: '#edf5fb', border: '1px solid #d9e8f3', borderRadius: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 780, color: '#214969' }}>Werkruimte voor {role.toLowerCase()}</Typography>
          <Typography sx={{ mt: .35, maxWidth: 760, fontSize: 11.2, lineHeight: 1.55, color: '#567188' }}>{roleFocus[role]}</Typography>
        </Box>
        {careActionRoles.includes(role) && (
          <Button component={RouterLink} to="/signalen" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ whiteSpace: 'nowrap' }}>
            {roleSignals.filter((item) => item.priority === 'Kritiek').length} kritieke signalen
          </Button>
        )}
      </Stack>

      {role === 'Directie' && (
        <Alert severity="warning">
          Bestuurlijke besluiten over ernstige of meldplichtige incidenten en eventuele IGJ-opvolging zijn nog niet als formele workflow gekoppeld. Dit prototype toont alleen aggregaten.
        </Alert>
      )}

      {visibleShortcuts.length > 0 && (
        <Box sx={{ p: 2.2, bgcolor: '#fff', border: '1px solid #dfe6ec', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 780, color: '#172c42' }}>Directe acties</Typography>
          <Typography sx={{ mt: .25, mb: 1.5, fontSize: 10.7, color: '#8492a2' }}>Selecteer de handeling die u wilt uitvoeren.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' }, gap: 1 }}>
            {visibleShortcuts.map((action) => (
              <Button key={action.label} component={RouterLink} to={action.to} variant="outlined" sx={{ p: 1.35, justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ color: '#3e7199', display: 'flex', '& svg': { fontSize: 20 } }}>{action.icon}</Box>
                  <Box><Typography sx={{ fontSize: 11.2, fontWeight: 750 }}>{action.label}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>{action.detail}</Typography></Box>
                </Stack>
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {role !== 'Directie' && <Box sx={{ p: 2.2, bgcolor: '#fff', border: '1px solid #dfe6ec', borderRadius: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 780, color: '#172c42' }}>Dataketen van registratie tot besluit</Typography>
            <Typography sx={{ mt: .3, fontSize: 10.7, color: '#8492a2' }}>
              Iedere stap heeft een status, rol en tijdstip en blijft terug te vinden in het dossier.
            </Typography>
          </Box>
          {['Gedragswetenschapper', 'Zorgmanager'].includes(role) && <Button component={RouterLink} to="/beoordelingen" size="small" endIcon={<ArrowForwardRoundedIcon />}>Open werkvoorraad</Button>}
        </Stack>
        <Box sx={{ mt: 1.6, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 1 }}>
          {[
            { label: 'Geregistreerd', value: reports.length },
            { label: 'Te beoordelen', value: reports.filter((item) => ['Ter beoordeling', 'Herbeoordeling nodig'].includes(item.status)).length },
            { label: 'Advies gereed', value: reports.filter((item) => item.status === 'Advies gereed').length },
            { label: 'Besluit vastgelegd', value: reports.filter((item) => item.status === 'Besluit vastgelegd').length },
          ].map((item) => (
            <Box key={item.label} sx={{ p: 1.4, bgcolor: '#f7f9fb', borderRadius: 1.7 }}>
              <Typography sx={{ fontSize: 9.8, color: '#7f8f9e' }}>{item.label}</Typography>
              <Typography sx={{ mt: .2, fontSize: 20, fontWeight: 780, color: '#29465f' }}>{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>}

      {showManagement && <InsightFilters value={filters} onChange={setFilters} periodOnly={role === 'Directie'} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: role === 'Directie' ? 'repeat(3, 1fr)' : undefined, xl: role === 'Directie' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)' }, gap: 1.7 }}>
        {role === 'Directie' ? (
          <>
            <KpiCard label="Actief op periode-einde" value={String(active.length)} context={`${reporting.window.label} · vorige gelijke periode: ${reporting.previous.activeAtPeriodEnd.length}`} benchmark="organisatiecapaciteit: 30" icon={<Groups2RoundedIcon />} />
            <KpiCard label="Geplande uitstroom" value={plannedExitRate === null ? '–' : `${plannedExitRate}%`} context={`${plannedExitRate === null ? 'Geen uitstroom; niet van toepassing' : `${reporting.plannedExits.length} van ${reporting.exitsInPeriod.length}`} · vorige: ${reporting.previous.plannedExitRate === null ? 'n.v.t.' : `${reporting.previous.plannedExitRate}%`}`} benchmark="conceptdoel ≥ 80%" icon={<HomeWorkRoundedIcon />} tone={plannedExitRate === null ? 'blue' : plannedExitRate >= 80 ? 'green' : 'red'} />
            <KpiCard label="Mediane duur bij uitstroom" value={reporting.medianDuration === null ? '–' : formatMonths(reporting.medianDuration)} context={`${reporting.medianDuration === null ? 'Geen uitstroom in deze periode' : `${completed.length} uitstroomtrajecten`} · vorige: ${reporting.previous.medianDuration === null ? 'n.v.t.' : formatMonths(reporting.previous.medianDuration)}`} benchmark="conceptdoel ≤ 12 mnd" icon={<ScheduleRoundedIcon />} tone={reporting.medianDuration === null ? 'blue' : reporting.medianDuration <= 12 ? 'green' : 'red'} />
          </>
        ) : showManagement ? (
          <>
            <KpiCard label="Boven verwachte einddatum" value={String(overdue.length)} context="Actieve trajecten die aandacht vragen" benchmark="doel: 0" icon={<AssignmentLateRoundedIcon />} tone={overdue.length ? 'red' : 'green'} />
            <KpiCard label="Vervolgplek geregeld" value={reporting.placementSnapshotAvailable ? `${arranged.length}/${reporting.placementNeeded.length}` : '–'} context={reporting.placementSnapshotAvailable ? `${needsPlacement.length} dossiers nog in zoek- of wachtfase` : 'Historische vervolgplekstatus niet beschikbaar'} benchmark="conceptdoel ≥ 80%" icon={<HomeWorkRoundedIcon />} tone={reporting.placementNeeded.length && arranged.length / reporting.placementNeeded.length >= .8 ? 'green' : 'amber'} />
            <KpiCard label="Open acties" value={String(visibleDashboardActions.length)} context={`${visibleDashboardActions.filter((item) => ['Vandaag', 'Te laat'].includes(item.urgency)).length} vandaag of te laat`} icon={<CheckCircleRoundedIcon />} tone="blue" />
            <KpiCard label="Datakwaliteit" value={`${completeness}%`} context={`${qualityIssues.length} veldcontroles · bronreconciliatie ${reporting.incidentReconciliation.available ? reporting.incidentReconciliation.matches ? 'akkoord' : 'vraagt aandacht' : 'historisch niet beschikbaar'}`} benchmark="vrijgave ≥95% en 0 blokkades" icon={<AssignmentLateRoundedIcon />} tone={completeness >= 95 && !reporting.blockingIssues.length && sourceReconciliationOk ? 'green' : 'amber'} />
          </>
        ) : isGuidanceRole ? (
          <>
            <KpiCard label="Mijn open acties" value={String(visibleDashboardActions.length)} context="Uitvoeren of van een resultaat voorzien" icon={<CheckCircleRoundedIcon />} tone="blue" />
            <KpiCard label="Vandaag of te laat" value={String(visibleDashboardActions.filter((item) => ['Vandaag', 'Te laat'].includes(item.urgency)).length)} context="Heeft als eerste aandacht nodig" icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="Actieve dossiers" value={String(active.length)} context="Democase: dossiers binnen de werkruimte" icon={<Groups2RoundedIcon />} tone="green" />
            <KpiCard label="Doorstroomsignalen" value={String(roleSignals.filter((item) => item.type === 'Doorstroom').length)} context="Vervolgplek of einddatum vraagt opvolging" icon={<HomeWorkRoundedIcon />} tone="amber" />
          </>
        ) : (
          <>
            <KpiCard label="Open veiligheidssignalen" value={String(roleSignals.length)} context="Inhoudelijke beoordeling of herstelopvolging nodig" icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="Herstelopvolging open" value={String(roleSignals.filter((item) => item.title.includes('Herstel')).length)} context="Herstelgesprek of vervolgmaatregel ontbreekt" icon={<CheckCircleRoundedIcon />} tone="amber" />
            <KpiCard label="Zware incidenten" value={String(incidentRowsInPeriod.filter((item) => item.severity === 'Zwaar').length)} context={reporting.window.label} icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="Gemeentelijke opvolging" value={String(networkAttention.length)} context="Reactie, aanvulling of deadline vraagt actie" icon={<Groups2RoundedIcon />} tone={networkAttention.length ? 'amber' : 'green'} />
          </>
        )}
      </Box>

      {role === 'Gedragswetenschapper' && networkAttention.length > 0 && (
        <Button component={RouterLink} to="/acties?type=Gemeentecontact" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
          Open gemeentelijke opvolging ({networkAttention.length})
        </Button>
      )}

      {showOperationalWork && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: showManagement ? 'minmax(0, 1.45fr) minmax(340px, .75fr)' : '1fr' }, gap: 2 }}>
        {showOperationalWork && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2.2 }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Taken die aandacht vragen</Typography>
              <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3 }}>Gesorteerd op urgentie · verantwoordelijke en deadline zichtbaar</Typography>
            </Box>
            <Button component={RouterLink} to="/acties" endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ fontSize: 11.5 }}>Alle taken</Button>
          </Stack>
          <Divider />
          <Box>
            {visibleDashboardActions.slice(0, 4).map((item, index) => {
              const tone = urgencyTone[item.urgency]
              return (
                <Stack key={item.id} direction="row" alignItems="center" spacing={1.5} sx={{ px: 2.5, py: 1.65, borderBottom: index < 3 ? '1px solid #eef1f4' : 0 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: tone.bg, color: tone.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {item.type === 'Vervolgplek' ? <HomeWorkRoundedIcon sx={{ fontSize: 17 }} /> : item.type === 'Evaluatie' ? <CheckCircleRoundedIcon sx={{ fontSize: 17 }} /> : <AssignmentLateRoundedIcon sx={{ fontSize: 17 }} />}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={.8}>
                      <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 720, color: '#21364c' }}>{item.title}</Typography>
                      <Chip label={item.type} size="small" sx={{ height: 18, bgcolor: '#f1f4f7', color: '#65778a', fontSize: 9.5 }} />
                    </Stack>
                    <Typography noWrap sx={{ mt: .25, fontSize: 10.8, color: '#8492a2' }}>
                      <Typography component={RouterLink} to={`/jongeren/${item.clientCode}`} sx={{ color: '#426f94', fontSize: 'inherit', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{item.clientCode}</Typography>
                      {' · '}{item.detail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10.8, fontWeight: 700, color: tone.color }}>{item.due}</Typography>
                    <Typography sx={{ fontSize: 10, color: '#98a3af' }}>{item.owner}</Typography>
                  </Box>
                </Stack>
              )
            })}
            {!visibleDashboardActions.length && (
              <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
                <CheckCircleRoundedIcon sx={{ color: '#4f9278' }} />
                <Typography sx={{ mt: .7, fontSize: 11.5, color: '#6e8192' }}>Geen openstaande taken voor deze rol.</Typography>
                <Typography sx={{ mt: .25, fontSize: 10, color: '#93a0ab' }}>Dit betekent niet dat de bron onbereikbaar is; de prototypewerkvoorraad is geladen.</Typography>
              </Box>
            )}
          </Box>
        </Box>
        )}

        {role === 'Zorgmanager' && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Herkomst & verblijfsduur</Typography>
          <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3, mb: 2.25 }}>Trajecten per gemeente vóór instroom</Typography>
          <Stack spacing={2}>
            {originSummary.map((item) => (
              <Box key={item.origin}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: .6 }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 680, color: '#3b5065' }}>{item.origin}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: '#8291a0' }}>{item.count} trajecten · {item.exits ? `${item.exits} uitstroom · ${formatMonths(item.median!)}` : 'geen uitstroom in periode'}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(item.count / maxOrigin) * 100} sx={{ height: 7, borderRadius: 10, bgcolor: '#edf1f5', '& .MuiLinearProgress-bar': { borderRadius: 10, bgcolor: item.origin === 'Zaanstad' ? '#2e78b5' : '#80a9cc' } }} />
              </Box>
            ))}
          </Stack>
          <Button component={RouterLink} to="/rapportages" fullWidth variant="outlined" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, borderColor: '#d7e1ea', color: '#315d82', fontSize: 11.5 }}>Bekijk volledige analyse</Button>
        </Box>
        )}
      </Box>}

      {showManagement && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Doorstroom', value: reporting.placementSnapshotAvailable ? `${arranged.length} plekken definitief` : 'Geen historische snapshot', detail: reporting.placementSnapshotAvailable ? `${needsPlacement.length} dossiers vragen nog actie` : 'Bekijk uitstroomuitkomsten in de rapportage', link: role === 'Directie' ? '/rapportages' : '/uitstroom-registratie' },
          { label: 'Veiligheid', value: `${incidentRowsInPeriod.length} incidentregels`, detail: `${incidentRowsInPeriod.filter((item) => item.severity === 'Zwaar').length} zwaar · ${incidentRowsInPeriod.filter((item) => item.recoveryRequired && !item.recoveryCompleted).length} herstel open`, link: '/gedrag-analyse' },
          { label: 'Datakwaliteit', value: `${completeness}% compleet`, detail: `${qualityIssues.length} controles vragen aandacht`, link: '/kpi-overzicht' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={1.5} component={RouterLink} to={item.link} sx={{ textDecoration: 'none', p: 2, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, '&:hover': { borderColor: '#b8ccdc', bgcolor: '#fbfdff' } }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#edf4fa', color: '#396d98', fontSize: 12, fontWeight: 800 }}>{item.label.slice(0, 2).toUpperCase()}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 10.5, color: '#8795a4' }}>{item.label}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 730, color: '#263c51' }}>{item.value}</Typography>
              <Typography sx={{ fontSize: 10.5, color: '#8795a4' }}>{item.detail}</Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ color: '#9aabba', fontSize: 18 }} />
          </Stack>
        ))}
      </Box>}
    </Stack>
  )
}

export default DashboardPage
