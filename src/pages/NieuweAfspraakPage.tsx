import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Chip, Divider, FormControlLabel, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { workItems, type WorkItem } from '../data/careInsights'
import { loadAppointments, loadTrajectories, loadWorkQueue, saveAppointments, saveWorkQueue } from '../data/demoStore'
import { defaultAppointments, type CareAppointment } from '../data/appointments'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'
import { useWorkspaceRole, type WorkspaceRole } from '../context/RoleContext'

const templates: Record<string, { subject: string; purpose: string; participants: string[]; agenda: string[] }> = {
  UVO: {
    subject: 'UVO over gedrag en vervolgstappen',
    purpose: 'Met de jongere en het netwerk afspraken maken over gewenst gedrag, ondersteuning en opvolging.',
    participants: ['Jongere', 'Mentor / begeleider', 'Gedragswetenschapper', 'Ouder / netwerk', 'Gemeente / verwijzer'],
    agenda: ['Aanleiding en feiten', 'Perspectief jongere', 'Gedragsverwachtingen', 'Ondersteuningsbehoefte', 'Afspraken en evaluatiedatum'],
  },
  Herstelgesprek: {
    subject: 'Herstelgesprek na incident',
    purpose: 'Beide perspectieven bespreken, herstel bevorderen en nieuwe afspraken vastleggen.',
    participants: ['Jongere', 'Betrokken medewerker', 'Mentor / begeleider', 'Gedragswetenschapper / locatieleider'],
    agenda: ['Wat is er gebeurd?', 'Gevolgen', 'Wat is nodig voor herstel?', 'Nieuwe afspraken', 'Moment van controle'],
  },
  Evaluatie: {
    subject: 'Evaluatie zorg en voortgang',
    purpose: 'Doelen, voortgang, ondersteuningsbehoefte en vervolgafspraken gezamenlijk beoordelen.',
    participants: ['Jongere', 'Mentor / begeleider', 'Gedragswetenschapper', 'Ouder / netwerk', 'Gemeente / verwijzer'],
    agenda: ['Voortgang doelen', 'Wat gaat goed?', 'Wat vraagt aandacht?', 'Nieuwe afspraken', 'Nieuwe evaluatiedatum'],
  },
  Mentorgesprek: {
    subject: 'Mentorgesprek',
    purpose: 'Voortgang en actuele aandachtspunten met de jongere bespreken.',
    participants: ['Jongere', 'Mentor / begeleider'],
    agenda: ['Welbevinden', 'Voortgang afspraken', 'Actuele hulpvraag', 'Nieuwe acties'],
  },
}

const tomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export default function NieuweAfspraakPage() {
  const { role } = useWorkspaceRole()
  const { clientCode = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const trajectory = useMemo(() => loadTrajectories().find((item) => item.clientCode === clientCode), [clientCode])
  const relatedTaskId = searchParams.get('task') ?? ''
  const queue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
  const linkedTask = queue.find((item) => item.id === relatedTaskId)
  const requestedType = searchParams.get('type') ?? linkedTask?.type ?? 'Mentorgesprek'
  const initial = templates[requestedType] ?? templates.Mentorgesprek
  const [type, setType] = useState(requestedType)
  const [date, setDate] = useState(tomorrow())
  const [time, setTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [subject, setSubject] = useState(initial.subject)
  const [purpose, setPurpose] = useState(initial.purpose)
  const [owner, setOwner] = useState(linkedTask?.owner ?? trajectory?.supervisor ?? '')
  const [participants, setParticipants] = useState(initial.participants)
  const [agenda, setAgenda] = useState(initial.agenda)
  const [invitations, setInvitations] = useState<NonNullable<CareAppointment['invitations']>>([])
  const [invite, setInvite] = useState({ name: '', role: '', contact: '', channel: 'E-mail' as 'E-mail' | 'Telefoon' })
  const [inviteError, setInviteError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const owners = Array.from(new Set(loadTrajectories().map((item) => item.supervisor)))
  const invitationRequired = type !== 'Mentorgesprek'
  const activeTemplate = templates[type] ?? templates.Mentorgesprek
  const requiredParticipantRoles = type === 'UVO'
    ? ['Jongere', 'Mentor / begeleider', 'Gedragswetenschapper']
    : type === 'Herstelgesprek'
      ? ['Jongere', 'Betrokken medewerker']
      : []
  const requiredRolesSelected = requiredParticipantRoles.every((requiredRole) => participants.includes(requiredRole))
  const existingAppointments = loadAppointments<CareAppointment>(clientCode, defaultAppointments(clientCode))
  const today = new Date().toISOString().slice(0, 10)
  const validDate = Boolean(date && date >= today)
  const validTimes = Boolean(time && endTime && endTime > time)
  const scheduleConflict = existingAppointments.some((item) =>
    item.status !== 'Afgerond' &&
    item.date === date &&
    time < (item.endTime ?? item.time) &&
    endTime > item.time
  )
  const valid = Boolean(
    trajectory && validDate && subject.trim() && purpose.trim() && owner &&
    participants.length && requiredRolesSelected && agenda.length && validTimes && !scheduleConflict &&
    (!invitationRequired || invitations.length)
  )
  const formDirty = type !== requestedType || date !== tomorrow() || time !== '10:00' || endTime !== '11:00' ||
    subject !== initial.subject || purpose !== initial.purpose || owner !== (linkedTask?.owner ?? trajectory?.supervisor ?? '') ||
    JSON.stringify(participants) !== JSON.stringify(initial.participants) ||
    JSON.stringify(agenda) !== JSON.stringify(initial.agenda) || invitations.length > 0
  useUnsavedChangesWarning(formDirty)

  const changeType = (next: string) => {
    const template = templates[next] ?? templates.Mentorgesprek
    setType(next); setSubject(template.subject); setPurpose(template.purpose)
    setParticipants(template.participants); setAgenda(template.agenda)
  }
  const toggle = (value: string, values: string[], setter: (next: string[]) => void) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const addInvite = () => {
    const contact = invite.contact.trim()
    const validContact = invite.channel === 'E-mail'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
      : /^[+\d][\d\s()-]{7,}$/.test(contact)
    if (!invite.name.trim() || !invite.role.trim() || !contact) {
      setInviteError('Vul naam, rol en contactgegeven volledig in.')
      return
    }
    if (!validContact) {
      setInviteError(invite.channel === 'E-mail' ? 'Vul een geldig e-mailadres in.' : 'Vul een geldig telefoonnummer in.')
      return
    }
    if (invitations.some((item) => item.contact.toLowerCase() === contact.toLowerCase())) {
      setInviteError('Deze contactpersoon staat al bij de uitnodigingen.')
      return
    }
    setInvitations((current) => [...current, { id: `I-${current.length + 1}`, name: invite.name.trim(), role: invite.role.trim(), contact: invite.contact.trim(), channel: invite.channel, status: 'Concept' }])
    setInviteError('')
    setInvite({ name: '', role: '', contact: '', channel: 'E-mail' })
  }

  const save = () => {
    setSubmitted(true)
    if (!valid || !trajectory) return
    const createdAt = new Date().toISOString()
    const appointmentId = `AP-${Date.now()}`
    const taskType = type === 'Mentorgesprek' ? undefined : type as WorkItem['type']
    const newTaskId = !linkedTask && taskType ? `A-${appointmentId}` : undefined
    const requiredWorkspaceRoles: WorkspaceRole[] = type === 'Mentorgesprek'
      ? ['Begeleider']
      : type === 'UVO'
        ? ['Begeleider', 'Gedragswetenschapper']
        : ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']
    const appointment: CareAppointment = {
      id: appointmentId, date, time, endTime, type, subject: subject.trim(), purpose: purpose.trim(),
      participants: participants.join(', '), agenda, owner, relatedTaskId: linkedTask?.id ?? newTaskId,
      status: 'Gepland', invitations, createdByRole: role, requiredRoles: requiredWorkspaceRoles,
    }
    saveAppointments(clientCode, [...existingAppointments, appointment].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)))
    if (newTaskId && taskType) {
      const responsibleRoles: WorkspaceRole[] = taskType === 'UVO'
        ? ['Gedragswetenschapper', 'Zorgmanager']
        : taskType === 'Vervolgplek'
          ? ['Begeleider', 'Zorgmanager']
          : ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']
      const dueLabel = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
      saveWorkQueue([{
        id: newTaskId,
        clientCode,
        type: taskType,
        title: `${type} voorbereiden en afronden`,
        detail: `Afspraak gepland op ${new Date(`${date}T12:00:00`).toLocaleDateString('nl-NL')} om ${time}.`,
        due: `${dueLabel}, ${time}`,
        dueDate: date,
        dueTime: time,
        urgency: date === today ? 'Vandaag' : 'Deze week',
        owner,
        status: 'Open',
        policyReason: `Geplande ${type}: voorbereiding, besluit en opvolging moeten controleerbaar worden vastgelegd.`,
        responsibleRoles,
        sourceAppointmentId: appointmentId,
        createdByRole: role,
        updatedAt: createdAt,
      }, ...queue])
    }
    navigate(`/jongeren/${clientCode}?appointment=created`)
  }

  if (!trajectory) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">Het cliëntdossier “{clientCode || 'onbekend'}” bestaat niet. Er is geen afspraak aangemaakt.</Alert>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Terug naar jongeren</Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to={`/jongeren/${clientCode}`} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar dossier</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>{requestedType} inplannen</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>{clientCode} · {trajectory?.location} · {trajectory?.supervisor}</Typography>
      </Box>
      {submitted && !valid && <Alert severity="warning">{!validDate ? 'De afspraakdatum mag niet in het verleden liggen.' : scheduleConflict ? 'Deze afspraak overlapt met een andere geplande afspraak in dit dossier. Kies een ander tijdstip.' : !validTimes ? 'De eindtijd moet na de starttijd liggen.' : !requiredRolesSelected ? `Selecteer de verplichte deelnemerrollen: ${requiredParticipantRoles.join(', ')}.` : 'Vul datum, tijd, onderwerp, doel, verantwoordelijke en agenda in. Voeg voor dit afspraaktype minimaal één echte genodigde met contactgegevens toe.'}</Alert>}
      {linkedTask && <Alert severity="info">Gekoppeld aan taak “{linkedTask.title}”. De afspraak kan deze taak met bewijs afronden.</Alert>}
      {type === 'UVO' && <Alert severity="info">UVO-werkafspraak in dit prototype: de gedragswetenschapper plant samen met de mentor; de mentor verzorgt de berichtgeving aan jongere en netwerk.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>1. Afspraak en doel</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField select label="Type afspraak" value={type} onChange={(event) => changeType(event.target.value)}>
                {Object.keys(templates).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required label="Onderwerp" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </Box>
            <TextField required fullWidth multiline minRows={2} label="Doel van de afspraak" value={purpose} onChange={(event) => setPurpose(event.target.value)} sx={{ mt: 1.7 }} />
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>2. Wanneer en wie?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.7 }}>
              <TextField required type="date" label="Datum" value={date} onChange={(event) => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select required label="Gespreksverantwoordelijke" value={owner} onChange={(event) => setOwner(event.target.value)}>{owners.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              <TextField required type="time" label="Starttijd" value={time} onChange={(event) => setTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField type="time" label="Eindtijd" value={endTime} onChange={(event) => setEndTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760 }}>3. Deelnemers</Typography>
            <Typography sx={{ mt: .3, mb: 1.1, fontSize: 10.5, color: '#8492a2' }}>Voorgesteld op basis van het afspraaktype. Klik om aan of uit te zetten.</Typography>
            <Stack direction="row" flexWrap="wrap" gap={.8}>{activeTemplate.participants.map((item) => <Chip key={item} label={item} clickable color={participants.includes(item) ? 'primary' : 'default'} variant={participants.includes(item) ? 'filled' : 'outlined'} onClick={() => toggle(item, participants, setParticipants)} />)}</Stack>
            <Divider sx={{ my: 1.8 }} />
            <Typography sx={{ fontSize: 11.2, fontWeight: 750 }}>Wie moet echt een uitnodiging ontvangen?</Typography>
            <Typography sx={{ mt: .25, mb: 1.2, fontSize: 9.8, color: '#8492a2' }}>Contactgegevens worden gebruikt om de uitnodiging klaar te zetten. In deze demo wordt nog niets extern verstuurd.</Typography>
            {inviteError && <Alert severity="warning" sx={{ mb: 1.2 }}>{inviteError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
              <TextField size="small" label="Naam of organisatie" value={invite.name} onChange={(event) => setInvite({ ...invite, name: event.target.value })} />
              <TextField size="small" label="Rol / relatie" value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })} />
              <TextField size="small" label={invite.channel === 'E-mail' ? 'E-mailadres' : 'Telefoonnummer'} value={invite.contact} onChange={(event) => setInvite({ ...invite, contact: event.target.value })} />
              <TextField select size="small" label="Kanaal" value={invite.channel} onChange={(event) => setInvite({ ...invite, channel: event.target.value as 'E-mail' | 'Telefoon' })}><MenuItem value="E-mail">E-mail</MenuItem><MenuItem value="Telefoon">Telefoon</MenuItem></TextField>
            </Box>
            <Button startIcon={<PersonAddAltRoundedIcon />} onClick={addInvite} sx={{ mt: 1 }}>Genodigde toevoegen</Button>
            {invitations.map((item) => <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: .8, p: 1, bgcolor: '#f7f9fb', borderRadius: 1.3 }}><Box><Typography sx={{ fontSize: 10.7, fontWeight: 700 }}>{item.name} · {item.role}</Typography><Typography sx={{ fontSize: 9.5, color: '#8492a2' }}>{item.channel}: {item.contact}</Typography></Box><Stack direction="row" spacing={.5} alignItems="center"><Chip label="Concept" size="small" /><Button aria-label={`Verwijder uitnodiging voor ${item.name}`} onClick={() => setInvitations((current) => current.filter((invitation) => invitation.id !== item.id))} size="small"><DeleteOutlineRoundedIcon fontSize="small" /></Button></Stack></Stack>)}
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760 }}>4. Agenda</Typography>
            <Typography sx={{ mt: .3, mb: .7, fontSize: 10.5, color: '#8492a2' }}>Hiermee kunnen besluit en vervolgactie na afloop goed worden vastgelegd.</Typography>
            {activeTemplate.agenda.map((item) => <FormControlLabel key={item} control={<Checkbox checked={agenda.includes(item)} onChange={() => toggle(item, agenda, setAgenda)} />} label={item} />)}
          </Box>
        </Stack>

        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 770 }}>Controleer de afspraak</Typography>
          <Stack spacing={1.2} sx={{ mt: 1.6 }}>
            <Typography sx={{ fontSize: 11.2 }}><b>{type}</b> · {date}</Typography>
            <Typography sx={{ fontSize: 11.2 }}>{time}–{endTime} · {owner || 'geen verantwoordelijke'}</Typography>
            <Typography sx={{ fontSize: 11.2 }}>{participants.length} deelnemerrollen · {invitations.length} uitnodigingen · {agenda.length} agendapunten</Typography>
          </Stack>
          {linkedTask && <><Divider sx={{ my: 1.7 }} /><Alert severity="info">De gekoppelde taak blijft open. Deze wordt pas afgerond nadat de afspraakuitkomst, samenvatting en het besluit zijn vastgelegd.</Alert></>}
          <Divider sx={{ my: 1.7 }} />
          <Button fullWidth size="large" variant="contained" startIcon={<EventAvailableRoundedIcon />} onClick={save}>Afspraak opslaan</Button>
          <Button fullWidth component={RouterLink} to={`/jongeren/${clientCode}`} sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
