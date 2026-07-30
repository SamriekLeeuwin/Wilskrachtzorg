import { useMemo, useState, type ReactNode } from 'react'
import { Avatar, Box, Button, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material'
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
  dataCompleteness, filterTrajectories, formatMonths, getDataQualityIssues, incidents, median, monthsBetween, workItems,
  type Filters,
} from '../data/careInsights'
import { loadTrajectories, loadWorkQueue } from '../data/demoStore'
import { deriveSignals } from '../data/signals'
import { useWorkspaceRole, type WorkspaceRole } from '../context/RoleContext'

const roleFocus = {
  Woonbegeleider: 'Start bij de jongeren, afspraken en acties die tijdens jouw dienst direct opvolging nodig hebben.',
  'Ambulant begeleider': 'Start bij jouw afspraken, open acties en informatie die je vóór een bezoek nodig hebt.',
  Begeleider: 'Start bij jouw open acties, afspraken en jongeren die vandaag opvolging nodig hebben.',
  Gedragswetenschapper: 'Start bij kritieke veiligheidssignalen, herstelopvolging en patronen in incidenten.',
  Locatieleider: 'Start bij urgente opvolging, taakverdeling, veiligheid en achterstanden op jouw locatie.',
  Zorgmanager: 'Stuur op achterstanden, doorstroom, werkvoorraad en betrouwbaarheid van de brondata.',
  Management: 'Volg uitkomsten, afwijkingen ten opzichte van de norm en de oorzaken die bijsturing vragen.',
  Administratie: 'Start bij instroom, uitstroom, ontbrekende gegevens en correcties die verwerking vragen.',
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
  const filtered = useMemo(() => filterTrajectories(filters, allTrajectories), [allTrajectories, filters])
  const active = filtered.filter((item) => !item.endDate)
  const completed = filtered.filter((item) => item.endDate)
  const completedDurations = completed.map((item) => monthsBetween(item.startDate, item.endDate!))
  const averageDuration = completedDurations.length ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length : 0
  const needsPlacement = active.filter((item) => !['Niet nodig', 'Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))
  const arranged = active.filter((item) => item.followUpPlace === 'Definitief akkoord')
  const overdue = active.filter((item) => new Date(item.expectedEndDate) < new Date('2026-07-28'))
  const qualityIssues = getDataQualityIssues(filtered)
  const completeness = dataCompleteness(filtered)
  const dashboardActions = useMemo(() => loadWorkQueue(workItems.map((item) => ({ ...item, status: 'Open' as const }))).filter((item) => item.status === 'Open'), [])
  const signals = useMemo(() => deriveSignals(allTrajectories, dashboardActions), [allTrajectories, dashboardActions])
  const showManagement = ['Zorgmanager', 'Locatieleider', 'Management', 'Directie'].includes(role)
  const showOperationalWork = !['Directie', 'Management', 'Administratie'].includes(role)
  const isGuidanceRole = ['Begeleider', 'Woonbegeleider', 'Ambulant begeleider'].includes(role)
  const visibleDashboardActions = role === 'Gedragswetenschapper'
    ? dashboardActions.filter((item) => ['UVO', 'Herstelgesprek'].includes(item.type))
    : dashboardActions
  const roleSignals = role === 'Gedragswetenschapper'
    ? signals.filter((item) => item.type === 'Veiligheid')
    : signals

  const originSummary = useMemo(() => {
    const all = filtered
    return ['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((origin) => {
      const rows = all.filter((item) => item.originMunicipality === origin)
      const closed = rows.filter((item) => item.endDate)
      const durations = closed.map((item) => monthsBetween(item.startDate, item.endDate!))
      return {
        origin,
        count: rows.length,
        median: durations.length ? median(durations) : rows.reduce((sum, item) => sum + monthsBetween(item.startDate, item.endDate ?? '2026-07-28'), 0) / Math.max(rows.length, 1),
      }
    }).sort((a, b) => b.count - a.count)
  }, [filtered])
  const maxOrigin = Math.max(...originSummary.map((item) => item.count))
  const careActionRoles: WorkspaceRole[] = ['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider', 'Begeleider', 'Zorgmanager']
  const dashboardShortcuts: Array<{ label: string; detail: string; to: string; icon: ReactNode; roles: WorkspaceRole[] }> = [
    { label: 'Iets melden', detail: 'Incident of dataprobleem', to: '/melden', icon: <CampaignRoundedIcon />, roles: careActionRoles },
    { label: 'Taak maken', detail: 'Eigenaar en deadline', to: '/acties/nieuw', icon: <AddTaskRoundedIcon />, roles: careActionRoles },
    { label: 'Iemand uitnodigen', detail: 'Afspraak en contact', to: '/jongeren?actie=afspraak', icon: <EventAvailableRoundedIcon />, roles: careActionRoles },
    { label: 'Dossier bekijken', detail: 'Zoeken en inzage', to: '/jongeren', icon: <FolderOpenRoundedIcon />, roles: [...careActionRoles, 'Administratie'] },
    { label: 'Gegevens wijzigen', detail: 'Met reden vastleggen', to: '/jongeren?actie=wijzigen', icon: <EditNoteRoundedIcon />, roles: [...careActionRoles, 'Administratie'] },
    { label: 'Nieuwe intake', detail: 'Dossier en traject starten', to: '/jongeren/nieuw', icon: <Groups2RoundedIcon />, roles: ['Woonbegeleider', 'Ambulant begeleider', 'Locatieleider', 'Administratie'] },
    { label: 'Uitstroom verwerken', detail: 'Status, besluit en actie', to: '/uitstroom-registratie', icon: <HomeWorkRoundedIcon />, roles: ['Woonbegeleider', 'Ambulant begeleider', 'Locatieleider', 'Administratie'] },
    { label: 'Rapportage openen', detail: 'Uitkomsten en afwijkingen', to: '/rapportages', icon: <ArrowForwardRoundedIcon />, roles: ['Locatieleider', 'Management', 'Directie'] },
    { label: 'Data controleren', detail: 'Definities en ontbrekende data', to: '/kpi-overzicht', icon: <CheckCircleRoundedIcon />, roles: ['Locatieleider', 'Management', 'Administratie', 'Directie'] },
  ]
  const visibleShortcuts = dashboardShortcuts.filter((item) => item.roles.includes(role))

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

      {visibleShortcuts.length > 0 && (
        <Box sx={{ p: 2.2, bgcolor: '#fff', border: '1px solid #dfe6ec', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 780, color: '#172c42' }}>Wat wil je doen?</Typography>
          <Typography sx={{ mt: .25, mb: 1.5, fontSize: 10.7, color: '#8492a2' }}>Start direct bij je handeling. Het systeem vraagt daarna alleen de benodigde gegevens.</Typography>
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

      {showManagement && <InsightFilters value={filters} onChange={setFilters} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
        {showManagement ? (
          <>
            <KpiCard label="Actieve jongeren" value={String(active.length)} context={`${filtered.length} trajecten in de gekozen selectie`} benchmark="capaciteit: 10" icon={<Groups2RoundedIcon />} />
            <KpiCard label="Mediane verblijfsduur" value={formatMonths(median(completedDurations))} context={`Gemiddeld ${formatMonths(averageDuration)} · ${completed.length} afgesloten`} benchmark="streefwaarde ≤ 12 mnd" icon={<ScheduleRoundedIcon />} tone="green" />
            <KpiCard label="Vervolgplek definitief" value={`${arranged.length}/${active.filter((item) => item.followUpPlace !== 'Niet nodig').length}`} context={`${needsPlacement.length} jongeren nog in zoek- of wachtfase`} benchmark="doel ≥ 80%" icon={<HomeWorkRoundedIcon />} tone="amber" />
            <KpiCard label="Boven verwachte einddatum" value={String(overdue.length)} context="Actieve trajecten die aandacht vragen" benchmark="doel: 0" icon={<AssignmentLateRoundedIcon />} tone={overdue.length ? 'red' : 'green'} />
          </>
        ) : isGuidanceRole ? (
          <>
            <KpiCard label="Mijn open acties" value={String(visibleDashboardActions.length)} context="Uitvoeren of van een resultaat voorzien" icon={<CheckCircleRoundedIcon />} tone="blue" />
            <KpiCard label="Vandaag of te laat" value={String(visibleDashboardActions.filter((item) => ['Vandaag', 'Te laat'].includes(item.urgency)).length)} context="Heeft als eerste aandacht nodig" icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="Actieve dossiers" value={String(active.length)} context="Democase: dossiers binnen de werkruimte" icon={<Groups2RoundedIcon />} tone="green" />
            <KpiCard label="Doorstroomsignalen" value={String(roleSignals.filter((item) => item.type === 'Doorstroom').length)} context="Vervolgplek of einddatum vraagt opvolging" icon={<HomeWorkRoundedIcon />} tone="amber" />
          </>
        ) : role === 'Administratie' ? (
          <>
            <KpiCard label="Actieve dossiers" value={String(active.length)} context="Beschikbaar voor administratieve verwerking" icon={<Groups2RoundedIcon />} tone="blue" />
            <KpiCard label="Datacontroles" value={String(qualityIssues.length)} context="Ontbrekende of conflicterende velden" icon={<AssignmentLateRoundedIcon />} tone={qualityIssues.length ? 'amber' : 'green'} />
            <KpiCard label="Datacompleetheid" value={`${completeness}%`} context="Verplichte trajectvelden gevuld" icon={<CheckCircleRoundedIcon />} tone="green" />
            <KpiCard label="Uitstroomdossiers" value={String(needsPlacement.length)} context="Vervolgplek of besluit vraagt verwerking" icon={<HomeWorkRoundedIcon />} tone="amber" />
          </>
        ) : (
          <>
            <KpiCard label="Open veiligheidssignalen" value={String(roleSignals.length)} context="Inhoudelijke beoordeling of herstelopvolging nodig" icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="Herstelopvolging open" value={String(roleSignals.filter((item) => item.title.includes('Herstel')).length)} context="Herstelgesprek of vervolgmaatregel ontbreekt" icon={<CheckCircleRoundedIcon />} tone="amber" />
            <KpiCard label="Zware incidenten" value={String(incidents.filter((item) => item.severity === 'Zwaar' && item.date >= '2026-04-29').length)} context="Laatste 90 dagen in de demodata" icon={<AssignmentLateRoundedIcon />} tone="red" />
            <KpiCard label="UVO-acties" value={String(visibleDashboardActions.filter((item) => item.type === 'UVO').length)} context="Netwerkoverleg vraagt inhoudelijke voorbereiding" icon={<Groups2RoundedIcon />} tone="blue" />
          </>
        )}
      </Box>

      {(showOperationalWork || showManagement) && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: showManagement ? 'minmax(0, 1.45fr) minmax(340px, .75fr)' : '1fr' }, gap: 2 }}>
        {showOperationalWork && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2.2 }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Acties die aandacht vragen</Typography>
              <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3 }}>Gesorteerd op urgentie · eigenaar en deadline zichtbaar</Typography>
            </Box>
            <Button component={RouterLink} to="/acties" endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ fontSize: 11.5 }}>Alle acties</Button>
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
          </Box>
        </Box>
        )}

        {showManagement && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Herkomst & verblijfsduur</Typography>
          <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3, mb: 2.25 }}>Trajecten per verwijzende gemeente</Typography>
          <Stack spacing={2}>
            {originSummary.map((item) => (
              <Box key={item.origin}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: .6 }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 680, color: '#3b5065' }}>{item.origin}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: '#8291a0' }}>{item.count} trajecten · {formatMonths(item.median)}</Typography>
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
          { label: 'Doorstroom', value: `${arranged.length} plekken definitief`, detail: `${needsPlacement.length} dossiers vragen nog actie`, link: '/uitstroom-registratie' },
          { label: 'Veiligheid', value: `${incidents.filter((item) => item.measure === 'Aantekening' && item.date >= '2026-04-29' && active.some((trajectory) => trajectory.clientCode === item.clientCode)).length} actieve aantekeningen`, detail: `${incidents.filter((item) => item.recoveryRequired && !item.recoveryCompleted && active.some((trajectory) => trajectory.clientCode === item.clientCode)).length} herstelacties open`, link: '/gedrag-analyse' },
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
