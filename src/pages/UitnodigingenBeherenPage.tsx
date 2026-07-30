import { useState } from 'react'
import { Alert, Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { defaultAppointments, type CareAppointment } from '../data/appointments'
import { loadAppointments, saveAppointments } from '../data/demoStore'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'

type InvitationStatus = 'Concept' | 'Verzonden' | 'Geaccepteerd' | 'Afgewezen'

const tones: Record<InvitationStatus, { bg: string; color: string }> = {
  Concept: { bg: '#f0f3f6', color: '#637689' },
  Verzonden: { bg: '#edf4fa', color: '#376b95' },
  Geaccepteerd: { bg: '#eaf6f1', color: '#28745d' },
  Afgewezen: { bg: '#fbecea', color: '#a34d41' },
}

export default function UitnodigingenBeherenPage() {
  const { clientCode = '', appointmentId = '' } = useParams()
  const stored = loadAppointments<CareAppointment>(clientCode, defaultAppointments(clientCode))
  const appointment = stored.find((item) => item.id === appointmentId)
  const [invitations, setInvitations] = useState(appointment?.invitations ?? [])
  const [savedInvitations, setSavedInvitations] = useState(appointment?.invitations ?? [])
  const [saved, setSaved] = useState(false)
  useUnsavedChangesWarning(JSON.stringify(invitations) !== JSON.stringify(savedInvitations))

  if (!appointment) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">Deze afspraak kon niet worden gevonden. Er is niets gewijzigd.</Alert>
        <Button component={RouterLink} to={clientCode ? `/jongeren/${clientCode}` : '/jongeren'} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
          Terug naar dossier
        </Button>
      </Stack>
    )
  }

  const update = (id: string, status: InvitationStatus) => {
    setInvitations((current) => current.map((item) => item.id === id ? { ...item, status, statusUpdatedAt: new Date().toISOString() } : item))
    setSaved(false)
  }
  const save = () => {
    saveAppointments(clientCode, stored.map((item) => item.id === appointment.id ? { ...item, invitations } : item))
    setSavedInvitations(invitations)
    setSaved(true)
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to={`/jongeren/${clientCode}`} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar dossier</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Uitnodigingen beheren</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>{appointment.subject} · {new Date(`${appointment.date}T12:00:00`).toLocaleDateString('nl-NL')}</Typography>
      </Box>
      <Alert severity="info">In deze demo wordt geen echte e-mail of sms verzonden. Statussen worden handmatig geregistreerd en zijn geen technisch verzend- of ontvangstbewijs.</Alert>
      {saved && <Alert severity="success">De uitnodigingsstatussen zijn in het dossier bijgewerkt.</Alert>}
      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ p: 2.3 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760 }}>Genodigden en reacties</Typography><Typography sx={{ mt: .25, fontSize: 10.5, color: '#8492a2' }}>Controleer contactkanaal en werk de reactie bij.</Typography></Box>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {invitations.map((item) => {
            const tone = tones[item.status]
            return <Stack key={item.id} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} gap={1.5} sx={{ p: 2.2 }}>
              <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 12, fontWeight: 740 }}>{item.name}</Typography><Typography sx={{ mt: .25, fontSize: 10.3, color: '#718395' }}>{item.role} · {item.channel}: {item.contact}</Typography>{item.statusUpdatedAt && <Typography sx={{ mt: .25, fontSize: 9.3, color: '#94a0ab' }}>Handmatig bijgewerkt op {new Date(item.statusUpdatedAt).toLocaleString('nl-NL')}</Typography>}</Box>
              <Chip label={item.status} sx={{ bgcolor: tone.bg, color: tone.color }} />
              <TextField select size="small" label="Handmatig registreren als" value={item.status} onChange={(event) => update(item.id, event.target.value as InvitationStatus)} sx={{ minWidth: 210 }}>
                <MenuItem value="Concept" disabled={item.status !== 'Concept'}>Concept</MenuItem>
                <MenuItem value="Verzonden" disabled={item.status === 'Geaccepteerd' || item.status === 'Afgewezen'}>Handmatig verzonden</MenuItem>
                <MenuItem value="Geaccepteerd" disabled={item.status === 'Concept'}>Deelname bevestigd</MenuItem>
                <MenuItem value="Afgewezen" disabled={item.status === 'Concept'}>Deelname afgezegd</MenuItem>
              </TextField>
            </Stack>
          })}
          {!invitations.length && <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ fontSize: 11, color: '#718395' }}>Voor deze afspraak zijn geen afzonderlijke uitnodigingen vastgelegd.</Typography></Box>}
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}><Button variant="contained" onClick={save} disabled={!invitations.length}>Statussen opslaan</Button></Stack>
      </Box>
    </Stack>
  )
}
