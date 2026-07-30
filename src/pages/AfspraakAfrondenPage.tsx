import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Divider, FormControlLabel, MenuItem, Stack,
  TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { defaultAppointments, type CareAppointment } from '../data/appointments'
import { loadAppointments, loadTrajectories, loadWorkQueue, saveAppointments, saveWorkQueue } from '../data/demoStore'
import { workItems, type WorkItem } from '../data/careInsights'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'

const followUpTypes: WorkItem['type'][] = ['UVO', 'Herstelgesprek', 'Evaluatie', 'Vervolgplek']

export default function AfspraakAfrondenPage() {
  const { clientCode = '', appointmentId = '' } = useParams()
  const navigate = useNavigate()
  const trajectory = useMemo(() => loadTrajectories().find((item) => item.clientCode === clientCode), [clientCode])
  const appointments = loadAppointments<CareAppointment>(clientCode, defaultAppointments(clientCode))
  const appointment = appointments.find((item) => item.id === appointmentId)
  const [meetingOutcome, setMeetingOutcome] = useState<NonNullable<CareAppointment['outcome']>>('Gehouden')
  const [attendees, setAttendees] = useState(appointment?.participants ?? '')
  const [summary, setSummary] = useState('')
  const [decision, setDecision] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [createTask, setCreateTask] = useState(false)
  const [taskType, setTaskType] = useState<WorkItem['type']>('Evaluatie')
  const [taskOwner, setTaskOwner] = useState(appointment?.owner ?? trajectory?.supervisor ?? '')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const owners = Array.from(new Set(loadTrajectories().map((item) => item.supervisor)))
  const canCompleteNow = Boolean(appointment && appointment.date <= new Date().toISOString().slice(0, 10))
  const valid = Boolean(
    canCompleteNow &&
    (meetingOutcome !== 'Gehouden' || attendees.trim()) &&
    summary.trim() && decision.trim() &&
    (!createTask || (followUp.trim() && taskOwner && taskDueDate))
  )
  useUnsavedChangesWarning(
    meetingOutcome !== 'Gehouden' || attendees !== (appointment?.participants ?? '') || Boolean(summary.trim() || decision.trim() || followUp.trim() || createTask || taskDueDate)
  )

  if (!appointment) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">Deze afspraak kon niet worden gevonden. Er is niets gewijzigd.</Alert>
        <Button component={RouterLink} to={trajectory ? `/jongeren/${clientCode}` : '/jongeren'} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
          {trajectory ? 'Terug naar dossier' : 'Terug naar jongeren'}
        </Button>
      </Stack>
    )
  }

  if (appointment.status === 'Afgerond') {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="info">Deze afspraak is al afgerond. Open de dossierhistorie om het vastgelegde besluit te bekijken.</Alert>
        <Button component={RouterLink} to={`/jongeren/${clientCode}`} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Terug naar dossier</Button>
      </Stack>
    )
  }

  const save = () => {
    setSubmitted(true)
    if (!valid) return
    const completed: CareAppointment = {
      ...appointment,
      status: 'Afgerond',
      outcome: meetingOutcome,
      attendees: attendees.trim(),
      summary: summary.trim(),
      decision: decision.trim(),
      followUp: followUp.trim(),
      completedAt: new Date().toISOString(),
    }
    saveAppointments(clientCode, appointments.map((item) => item.id === appointment.id ? completed : item))

    const queue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
    let nextQueue = appointment.relatedTaskId && meetingOutcome === 'Gehouden'
      ? queue.map((item): WorkItem => item.id === appointment.relatedTaskId ? {
        ...item,
        status: 'Afgerond',
        completionNote: `${appointment.type}: ${meetingOutcome.toLowerCase()} op ${new Date(`${appointment.date}T12:00:00`).toLocaleDateString('nl-NL')}. Uitkomst, samenvatting en besluit zijn vastgelegd.`,
        completedAt: completed.completedAt,
        updatedAt: completed.completedAt,
      } : item)
      : queue

    if (createTask) {
      const dueLabel = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(`${taskDueDate}T12:00:00`))
      nextQueue = [{
        id: `A-V${queue.length + 1}-${appointment.id}`,
        clientCode,
        type: taskType,
        title: followUp.trim(),
        detail: `Vervolg uit ${appointment.type} van ${new Date(`${appointment.date}T12:00:00`).toLocaleDateString('nl-NL')}`,
        due: dueLabel,
        dueDate: taskDueDate,
        urgency: 'Deze week',
        owner: taskOwner,
        status: 'Open',
        policyReason: `Vervolgactie uit vastgelegd ${appointment.type}.`,
        responsibleRoles: ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'],
        updatedAt: completed.completedAt,
      }, ...nextQueue]
    }
    if ((appointment.relatedTaskId && meetingOutcome === 'Gehouden') || createTask) saveWorkQueue(nextQueue)
    navigate(`/jongeren/${clientCode}?meeting=completed`)
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to={`/jongeren/${clientCode}`} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar dossier</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>{appointment.type} afronden</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>{clientCode} · {new Date(`${appointment.date}T12:00:00`).toLocaleDateString('nl-NL')} · {appointment.time}</Typography>
      </Box>
      {submitted && !valid && <Alert severity="warning">Leg aanwezigen, samenvatting en besluit vast. Vul ook de vervolgtaak volledig in als u die toevoegt.</Alert>}
      {!canCompleteNow && <Alert severity="warning">Deze afspraak staat in de toekomst en kan nog niet worden afgerond. Verplaats of annuleer de afspraak via de toekomstige agendakoppeling.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760 }}>Geplande afspraak</Typography>
            <Typography sx={{ mt: .8, fontSize: 12, fontWeight: 700, color: '#30485d' }}>{appointment.subject}</Typography>
            <Typography sx={{ mt: .4, fontSize: 10.7, color: '#718395' }}>{appointment.purpose ?? 'Geen afzonderlijk doel vastgelegd.'}</Typography>
            {appointment.agenda?.length ? <Stack component="ul" sx={{ mt: 1, mb: 0, pl: 2.2 }}>{appointment.agenda.map((item) => <Typography component="li" key={item} sx={{ fontSize: 10.5, color: '#61778a' }}>{item}</Typography>)}</Stack> : null}
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>1. Wat is besproken en besloten?</Typography>
            <Stack spacing={1.7}>
              <TextField select required label="Uitkomst afspraak" value={meetingOutcome} onChange={(event) => setMeetingOutcome(event.target.value as NonNullable<CareAppointment['outcome']>)}><MenuItem value="Gehouden">Gehouden</MenuItem><MenuItem value="Niet verschenen">Jongere / genodigde niet verschenen</MenuItem><MenuItem value="Geannuleerd">Geannuleerd</MenuItem></TextField>
              <TextField required={meetingOutcome === 'Gehouden'} multiline minRows={2} label="Wie waren daadwerkelijk aanwezig?" value={attendees} onChange={(event) => setAttendees(event.target.value)} helperText={meetingOutcome === 'Gehouden' ? 'Noteer ook wie afwezig was als dat relevant is voor het besluit.' : 'Optioneel bij niet verschenen of geannuleerd.'} />
              <TextField required multiline minRows={4} label="Samenvatting van het gesprek" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Beschrijf de belangrijkste feiten en perspectieven, zonder onnodige details." />
              <TextField required multiline minRows={3} label="Besluit en gemaakte afspraken" value={decision} onChange={(event) => setDecision(event.target.value)} helperText="Maak duidelijk wie waarmee heeft ingestemd en wat vanaf nu geldt." />
            </Stack>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760 }}>2. Is vervolg nodig?</Typography>
            <FormControlLabel control={<Checkbox checked={createTask} onChange={(event) => setCreateTask(event.target.checked)} />} label="Maak direct een vervolgtaak" />
            {createTask && (
              <Stack spacing={1.7} sx={{ mt: 1 }}>
                <TextField required label="Concrete vervolgactie" value={followUp} onChange={(event) => setFollowUp(event.target.value)} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                  <TextField select label="Type" value={taskType} onChange={(event) => setTaskType(event.target.value as WorkItem['type'])}>{followUpTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
                  <TextField select label="Eigenaar" value={taskOwner} onChange={(event) => setTaskOwner(event.target.value)}>{owners.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
                  <TextField type="date" label="Deadline" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>
              </Stack>
            )}
          </Box>
        </Stack>

        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 770 }}>Dossiercontrole</Typography>
          <Typography sx={{ mt: 1.3, fontSize: 10.6, lineHeight: 1.6, color: '#657a8c' }}>Na opslaan wordt de afspraak afgesloten. Samenvatting en besluit blijven zichtbaar in de dossierhistorie.</Typography>
          <Divider sx={{ my: 1.7 }} />
          <Typography sx={{ fontSize: 10.5 }}>{createTask ? '✓ Besluit + vervolgtaak' : '✓ Besluit zonder vervolgtaak'}</Typography>
          <Typography sx={{ mt: .6, fontSize: 10.5 }}>✓ Eigenaar: {appointment.owner}</Typography>
          <Button fullWidth size="large" variant="contained" startIcon={<TaskAltRoundedIcon />} onClick={save} disabled={!canCompleteNow} sx={{ mt: 2 }}>Afronden en vastleggen</Button>
          <Button fullWidth component={RouterLink} to={`/jongeren/${clientCode}`} sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
