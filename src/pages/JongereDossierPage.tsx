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
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import {
  incidents, monthsBetween, trajectories, workItems, type WorkItem,
} from '../data/careInsights'
import { loadAppointments, loadPlacementConversations, loadTrajectories, loadWorkQueue, saveAppointments, saveTrajectories } from '../data/demoStore'

type Appointment = {
  id: string
  date: string
  time: string
  type: string
  subject: string
  participants: string
  owner: string
}

const initialAppointments: Appointment[] = [
  { id: 'AP-1', date: '2026-07-30', time: '10:00', type: 'Mentorgesprek', subject: 'Voortgang doelen en weekplanning', participants: 'Jongere, mentor', owner: 'N. Janssen' },
  { id: 'AP-2', date: '2026-08-04', time: '14:30', type: 'Netwerkoverleg', subject: 'Vervolgplek en warme overdracht', participants: 'Jongere, mentor, gemeente, aanbieder', owner: 'N. Janssen' },
  { id: 'AP-3', date: '2026-08-11', time: '09:30', type: 'Evaluatie', subject: 'Eindevaluatie traject', participants: 'Jongere, mentor, gedragswetenschapper', owner: 'N. Janssen' },
]

const dossierHistory = [
  { date: '24 jul 2026', type: 'Vervolgplek', title: 'Definitief plaatsingsbesluit', detail: 'Kompas Wonen heeft plaatsing per 18 augustus bevestigd.', tone: '#2d7a62' },
  { date: '18 jul 2026', type: 'Evaluatie', title: 'Fase-evaluatie afgerond', detail: 'Doelen zelfstandigheid grotendeels behaald; voorbereiding uitstroom voortzetten.', tone: '#3c79a6' },
  { date: '02 jul 2026', type: 'Incident', title: 'Aantekening ordeverstoring', detail: 'Besproken met mentor. Nieuwe afspraak over rustmomenten vastgelegd.', tone: '#b66b37' },
  { date: '12 jun 2026', type: 'Fase', title: 'Voorbereiding uitstroom gestart', detail: 'Zoekprofiel en gewenste uitstroomdatum samen vastgesteld.', tone: '#765b9a' },
]

const goalRows = [
  { label: 'Zelfstandig dagritme', progress: 85, status: 'Op koers', evaluation: '18 jul 2026' },
  { label: 'Financiën en administratie', progress: 70, status: 'Aandacht', evaluation: '18 jul 2026' },
  { label: 'Sociaal netwerk onderhouden', progress: 80, status: 'Op koers', evaluation: '18 jul 2026' },
]

function InfoField({ label, value }: { label: string; value: string }) {
  return <Box><Typography sx={{ fontSize: 9.5, fontWeight: 760, letterSpacing: '.06em', color: '#8997a5', textTransform: 'uppercase' }}>{label}</Typography><Typography sx={{ mt: .35, fontSize: 11.5, fontWeight: 650, color: '#30485d' }}>{value}</Typography></Box>
}

function JongereDossierPage() {
  const { clientCode } = useParams()
  const [searchParams] = useSearchParams()
  const initialTrajectory = loadTrajectories().find((item) => item.clientCode === clientCode) ?? trajectories[0]
  const [trajectory, setTrajectory] = useState(initialTrajectory)
  const [tab, setTab] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments(initialTrajectory.clientCode, initialAppointments))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [newAppointment, setNewAppointment] = useState({ date: '', time: '', type: 'Mentorgesprek', subject: '', participants: '', owner: trajectory.supervisor })
  const [editValues, setEditValues] = useState({ expectedEndDate: trajectory.expectedEndDate, location: trajectory.location, supervisor: trajectory.supervisor, changeReason: '' })
  const relatedActions = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' }))).filter((item) => item.clientCode === trajectory.clientCode)
  const openActions = relatedActions.filter((item) => item.status !== 'Afgerond')
  const completedActions = relatedActions.filter((item) => item.status === 'Afgerond')
  const conversation = loadPlacementConversations().find((item) => item.clientCode === trajectory.clientCode)
  const currentDuration = monthsBetween(trajectory.startDate, trajectory.endDate ?? '2026-07-28')
  const overExpected = !trajectory.endDate && new Date(trajectory.expectedEndDate) < new Date('2026-07-28')
  const linkedIncidents = incidents.filter((item) => item.clientCode === trajectory.clientCode)

  const saveAppointment = () => {
    if (!newAppointment.date || !newAppointment.time || !newAppointment.subject) return
    setAppointments((current) => {
      const next = [...current, { ...newAppointment, id: `AP-${current.length + 1}` }].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      saveAppointments(trajectory.clientCode, next)
      return next
    })
    setDialogOpen(false)
    setSavedMessage('Afspraak is toegevoegd aan het dossier.')
    setNewAppointment({ date: '', time: '', type: 'Mentorgesprek', subject: '', participants: '', owner: trajectory.supervisor })
  }

  const saveTrajectoryChanges = () => {
    const dateChanged = editValues.expectedEndDate !== trajectory.expectedEndDate
    if (dateChanged && !editValues.changeReason.trim()) {
      setEditError('Vul een reden in voor het wijzigen van de verwachte einddatum.')
      return
    }
    const updated = {
      ...trajectory,
      expectedEndDate: editValues.expectedEndDate,
      location: editValues.location,
      supervisor: editValues.supervisor,
      ...(dateChanged ? { previousExpectedEndDate: trajectory.expectedEndDate, expectedEndDateReason: editValues.changeReason.trim() } : {}),
    }
    setTrajectory(updated)
    const all = loadTrajectories()
    saveTrajectories(all.map((item) => item.clientCode === updated.clientCode ? updated : item))
    setEditOpen(false)
    setEditError('')
    setSavedMessage('Trajectgegevens zijn bijgewerkt.')
  }

  return (
    <Stack spacing={2.3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.3}>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start', color: '#5b7185' }}>Terug naar jongeren</Button>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setEditOpen(true)}>Traject wijzigen</Button>
          <Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/nieuw`} variant="contained" startIcon={<AddRoundedIcon />}>Nieuwe afspraak</Button>
        </Stack>
      </Stack>

      {(savedMessage || searchParams.get('appointment') === 'created') && <Alert severity="success" onClose={() => setSavedMessage('')}>{savedMessage || 'De afspraak, deelnemers en agenda zijn opgeslagen. De gekoppelde taak is bijgewerkt.'}</Alert>}

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.2} sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ minWidth: 220 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#dfeefa', color: '#315f83', fontSize: 14, fontWeight: 800 }}>{trajectory.clientCode.slice(-2)}</Avatar>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 780, color: '#172c42' }}>{trajectory.clientCode}</Typography>
              <Stack direction="row" spacing={.7} sx={{ mt: .6 }}>
                <Chip label={trajectory.endDate ? 'Afgerond' : 'Actief'} size="small" sx={{ height: 20, bgcolor: trajectory.endDate ? '#eef1f4' : '#eaf6f1', color: trajectory.endDate ? '#687887' : '#28745d', fontSize: 9.5 }} />
                {overExpected && <Chip label="Boven einddatum" size="small" sx={{ height: 20, bgcolor: '#fbecea', color: '#a34d41', fontSize: 9.5 }} />}
              </Stack>
            </Box>
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 2.2, flex: 1 }}>
            <InfoField label="Herkomst" value={`${trajectory.originCity}, ${trajectory.originMunicipality}`} />
            <InfoField label="Locatie" value={trajectory.location} />
            <InfoField label="Begeleider" value={trajectory.supervisor} />
            <InfoField label="Incidenten (90 dagen)" value={String(trajectory.incidents90d)} />
            <InfoField label="In zorg sinds" value={new Date(trajectory.startDate).toLocaleDateString('nl-NL')} />
            <InfoField label="Verblijfsduur" value={`${currentDuration.toLocaleString('nl-NL', { maximumFractionDigits: 1 })} maanden`} />
          </Box>
        </Stack>
        <Divider />
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1.5, minHeight: 46, '& .MuiTab-root': { minHeight: 46, fontSize: 11.5, textTransform: 'none', fontWeight: 700 } }}>
          <Tab label="Overzicht" />
          <Tab label={`Afspraken & acties (${appointments.length + openActions.length})`} />
          <Tab label="Ontwikkeling" />
          <Tab label="Historie" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.25fr) minmax(340px, .75fr)' }, gap: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Eerstvolgende afspraken</Typography>
              </Stack>
              <Stack spacing={1.1} sx={{ mt: 1.8 }}>
                {appointments.slice(0, 3).map((appointment) => (
                  <Stack key={appointment.id} direction="row" spacing={1.3} sx={{ p: 1.35, bgcolor: '#f8fafb', borderRadius: 1.8 }}>
                    <Box sx={{ width: 50, textAlign: 'center', py: .3 }}>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6e8496', textTransform: 'uppercase' }}>{new Date(appointment.date).toLocaleDateString('nl-NL', { month: 'short' })}</Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 780, color: '#2e4b63' }}>{new Date(appointment.date).getDate()}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{appointment.subject}</Typography>
                      <Typography sx={{ mt: .25, fontSize: 10.2, color: '#8492a2' }}>{appointment.time} · {appointment.type} · {appointment.participants}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AssignmentTurnedInRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Open acties</Typography>
              </Stack>
              {openActions.length ? (
                <Stack spacing={1.1} sx={{ mt: 1.8 }}>
                  {openActions.map((action) => (
                    <Stack key={action.id} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1} sx={{ p: 1.45, border: '1px solid #e7ebef', borderRadius: 1.8 }}>
                      <Box><Typography sx={{ fontSize: 11.5, fontWeight: 720, color: '#30485d' }}>{action.title}</Typography><Typography sx={{ mt: .2, fontSize: 10.2, color: '#8492a2' }}>{action.detail} · {action.owner}</Typography></Box>
                      <Stack direction="row" spacing={.7} alignItems="center">
                        <Chip label={action.due} size="small" sx={{ height: 21, bgcolor: action.urgency === 'Te laat' ? '#fbecea' : '#fbf2e7', color: action.urgency === 'Te laat' ? '#a34d41' : '#936020', fontSize: 9.5 }} />
                        <Button component={RouterLink} to={`/acties/${action.id}/bewerken`} size="small">Wijzigen</Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : <Typography sx={{ mt: 2, fontSize: 11, color: '#718496' }}>Geen open acties voor deze jongere.</Typography>}
              <Button component={RouterLink} to={`/acties/nieuw?client=${trajectory.clientCode}`} startIcon={<AddRoundedIcon />} size="small" sx={{ mt: 1.5 }}>Taak toevoegen</Button>
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
              <Button component={RouterLink} to={`/uitstroom-registratie?client=${trajectory.clientCode}`} fullWidth variant="outlined" size="small" sx={{ mt: 2 }}>Open vervolgplekmonitor</Button>
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FactCheckRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Gedrag & opvolging</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 1.7 }}>
                <Box sx={{ p: 1.4, bgcolor: '#f8fafb', borderRadius: 1.5 }}><Typography sx={{ fontSize: 20, fontWeight: 780, color: '#2c485f' }}>{linkedIncidents.filter((item) => item.date >= '2026-04-29').length}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>incidenten · 90 dagen</Typography></Box>
                <Box sx={{ p: 1.4, bgcolor: '#f8fafb', borderRadius: 1.5 }}><Typography sx={{ fontSize: 20, fontWeight: 780, color: '#2c485f' }}>{linkedIncidents.filter((item) => item.measure === 'Aantekening' && item.date >= '2026-04-29').length}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>actieve aantekeningen</Typography></Box>
              </Box>
              <Typography sx={{ mt: 1.2, fontSize: 9.8, color: '#8192a1' }}>Alleen-lezen uit Zilliz · laatste synchronisatie 28 juli, 08:42</Typography>
              <Button component={RouterLink} to="/gedrag-analyse" fullWidth variant="outlined" size="small" sx={{ mt: 1.4 }}>Bekijk gedragsanalyse</Button>
            </Box>
          </Stack>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.25fr .75fr' }, gap: 2 }}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Alle afspraken</Typography><Button component={RouterLink} to={`/jongeren/${trajectory.clientCode}/afspraak/nieuw`} size="small" startIcon={<AddRoundedIcon />}>Toevoegen</Button></Stack>
            <Stack spacing={1.1} sx={{ mt: 1.8 }}>{appointments.map((appointment) => <Box key={appointment.id} sx={{ p: 1.5, border: '1px solid #e6ebef', borderRadius: 1.8 }}><Stack direction="row" justifyContent="space-between" gap={1}><Box><Typography sx={{ fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{appointment.subject}</Typography><Typography sx={{ mt: .3, fontSize: 10.2, color: '#8492a2' }}>{appointment.type} · {appointment.participants}</Typography></Box><Typography sx={{ fontSize: 10.5, fontWeight: 680, color: '#557188', whiteSpace: 'nowrap' }}>{new Date(appointment.date).toLocaleDateString('nl-NL')} · {appointment.time}</Typography></Stack></Box>)}</Stack>
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Afspraken vastleggen</Typography><Typography sx={{ mt: 1, fontSize: 11, lineHeight: 1.65, color: '#64788a' }}>Leg onderwerp, deelnemers, eigenaar en tijd vast. Besluiten en vervolgacties horen na het gesprek in het dossier, zodat management en begeleiding dezelfde actuele informatie zien.</Typography></Box>
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
          </Stack>
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.4 }}>
          <Stack direction="row" alignItems="center" spacing={1}><HistoryRoundedIcon sx={{ fontSize: 19, color: '#4f7899' }} /><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Dossierhistorie</Typography></Stack>
          <Stack sx={{ mt: 2 }}>
            {completedActions.map((event) => (
              <Stack key={event.id} direction="row" spacing={1.5}>
                <Stack alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4d9378', mt: .55 }} /><Box sx={{ width: 1, flex: 1, minHeight: 54, bgcolor: '#dfe5ea' }} /></Stack>
                <Box sx={{ pb: 2 }}><Typography sx={{ fontSize: 9.8, color: '#8b99a6' }}>{event.completedAt ? new Date(event.completedAt).toLocaleDateString('nl-NL') : 'Recent'} · Afgeronde taak</Typography><Typography sx={{ mt: .25, fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{event.title}</Typography><Typography sx={{ mt: .25, fontSize: 10.5, color: '#718394' }}>{event.completionNote ?? 'Afgerond'} · door {event.owner}</Typography></Box>
              </Stack>
            ))}
            {dossierHistory.map((event, index) => (
              <Stack key={event.title} direction="row" spacing={1.5}>
                <Stack alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: event.tone, mt: .55 }} />{index < dossierHistory.length - 1 && <Box sx={{ width: 1, flex: 1, minHeight: 54, bgcolor: '#dfe5ea' }} />}</Stack>
                <Box sx={{ pb: index < dossierHistory.length - 1 ? 2 : 0 }}><Typography sx={{ fontSize: 9.8, color: '#8b99a6' }}>{event.date} · {event.type}</Typography><Typography sx={{ mt: .25, fontSize: 11.8, fontWeight: 720, color: '#30485d' }}>{event.title}</Typography><Typography sx={{ mt: .25, fontSize: 10.5, color: '#718394' }}>{event.detail}</Typography></Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle><Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Nieuwe afspraak</Typography><Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>{trajectory.clientCode} · zichtbaar in het jongeredossier</Typography></DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField fullWidth type="date" label="Datum" value={newAppointment.date} onChange={(event) => setNewAppointment({ ...newAppointment, date: event.target.value })} InputLabelProps={{ shrink: true }} /><TextField fullWidth type="time" label="Tijd" value={newAppointment.time} onChange={(event) => setNewAppointment({ ...newAppointment, time: event.target.value })} InputLabelProps={{ shrink: true }} /></Stack>
            <FormControl fullWidth><Select value={newAppointment.type} onChange={(event) => setNewAppointment({ ...newAppointment, type: event.target.value })} inputProps={{ 'aria-label': 'Type afspraak' }}>{['Mentorgesprek', 'Netwerkoverleg', 'Evaluatie', 'Herstelgesprek', 'UVO', 'Warme overdracht'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
            <TextField label="Onderwerp" value={newAppointment.subject} onChange={(event) => setNewAppointment({ ...newAppointment, subject: event.target.value })} />
            <TextField label="Deelnemers" value={newAppointment.participants} onChange={(event) => setNewAppointment({ ...newAppointment, participants: event.target.value })} helperText="Bijvoorbeeld: jongere, mentor, gemeente en aanbieder" />
            <TextField label="Eigenaar" value={newAppointment.owner} onChange={(event) => setNewAppointment({ ...newAppointment, owner: event.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setDialogOpen(false)}>Annuleren</Button><Button variant="contained" onClick={saveAppointment} disabled={!newAppointment.date || !newAppointment.time || !newAppointment.subject}>Afspraak toevoegen</Button></DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Traject wijzigen</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>{trajectory.clientCode} · wijzigingen worden zichtbaar in managementoverzichten</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editError && <Alert severity="warning">{editError}</Alert>}
            <TextField fullWidth type="date" label="Verwachte einddatum" value={editValues.expectedEndDate} onChange={(event) => setEditValues({ ...editValues, expectedEndDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            {editValues.expectedEndDate !== trajectory.expectedEndDate && (
              <TextField required multiline minRows={2} label="Reden wijziging einddatum" value={editValues.changeReason} onChange={(event) => setEditValues({ ...editValues, changeReason: event.target.value })} helperText="Leg vast waarom de planning wijzigt en wat de nieuwe afspraak is." />
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
          <Button variant="contained" onClick={saveTrajectoryChanges}>Wijzigingen opslaan</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default JongereDossierPage
