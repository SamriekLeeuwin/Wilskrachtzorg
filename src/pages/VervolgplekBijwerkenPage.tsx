import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Divider, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import type { PlacementConversation, Trajectory, WorkItem } from '../data/careInsights'
import { workItems } from '../data/careInsights'
import {
  loadPlacementConversations, loadTrajectories, loadWorkQueue,
  savePlacementConversations, saveTrajectories, saveWorkQueue,
} from '../data/demoStore'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'

export default function VervolgplekBijwerkenPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const trajectories = useMemo(() => loadTrajectories().filter((item) => !item.endDate), [])
  const requestedCode = searchParams.get('client')
  const initialCode = requestedCode ?? trajectories[0]?.clientCode ?? ''
  const initialTrajectory = trajectories.find((item) => item.clientCode === initialCode)
  const [values, setValues] = useState({
    clientCode: initialCode,
    status: initialTrajectory?.followUpPlace ?? 'Nog niet gestart',
    followUpType: initialTrajectory?.followUpType ?? '',
    provider: initialTrajectory?.followUpProvider ?? '',
    plannedOutflow: initialTrajectory?.plannedOutflow ?? '',
    date: new Date().toISOString().slice(0, 10),
    subject: 'Voortgang vervolgplek',
    participants: 'Jongere, mentor / begeleider, gemeente / verwijzer',
    decision: '',
    decisionBy: '',
    evidenceReference: '',
    nextAction: '',
    owner: initialTrajectory?.supervisor ?? '',
    dueDate: '',
    actualOutflowDate: '',
    outcome: '' as '' | 'Gepland' | 'Ongepland',
  })
  const [submitted, setSubmitted] = useState(false)
  const requiresProvider = ['Definitief akkoord', 'Geplaatst'].includes(values.status)
  const isPlaced = values.status === 'Geplaatst'
  const formDirty = Boolean(
    values.decision.trim() || values.decisionBy.trim() || values.evidenceReference.trim() ||
    values.nextAction.trim() || values.dueDate || values.actualOutflowDate || values.outcome ||
    values.clientCode !== initialCode || values.status !== (initialTrajectory?.followUpPlace ?? 'Nog niet gestart') ||
    values.followUpType !== (initialTrajectory?.followUpType ?? '') ||
    values.provider !== (initialTrajectory?.followUpProvider ?? '') ||
    values.plannedOutflow !== (initialTrajectory?.plannedOutflow ?? '')
  )
  useUnsavedChangesWarning(formDirty)
  const valid = Boolean(
    values.clientCode && values.status && values.plannedOutflow && values.date &&
    values.subject.trim() && values.participants.trim() && values.decision.trim() &&
    values.decisionBy.trim() && values.evidenceReference.trim() &&
    values.nextAction.trim() && values.owner && values.dueDate &&
    (!requiresProvider || (values.followUpType.trim() && values.provider.trim())) &&
    (!isPlaced || (values.actualOutflowDate && values.outcome))
  )

  const selectClient = (clientCode: string) => {
    const row = trajectories.find((item) => item.clientCode === clientCode)
    if (!row) return
    setValues({
      ...values,
      clientCode,
      status: row.followUpPlace,
      followUpType: row.followUpType ?? '',
      provider: row.followUpProvider ?? '',
      plannedOutflow: row.plannedOutflow ?? '',
      owner: row.supervisor,
    })
  }

  const save = () => {
    setSubmitted(true)
    if (!valid) return
    const all = loadTrajectories()
    saveTrajectories(all.map((item): Trajectory => item.clientCode === values.clientCode ? {
      ...item,
      followUpPlace: values.status as Trajectory['followUpPlace'],
      followUpType: values.followUpType.trim() || undefined,
      followUpProvider: values.provider.trim() || undefined,
      plannedOutflow: values.plannedOutflow,
      ...(isPlaced ? { endDate: values.actualOutflowDate, outcome: values.outcome as NonNullable<Trajectory['outcome']> } : {}),
    } : item))

    const conversations = loadPlacementConversations()
    const conversation: PlacementConversation = {
      id: `G-${String(conversations.length + 1).padStart(2, '0')}`,
      clientCode: values.clientCode,
      date: values.date,
      subject: values.subject.trim(),
      participants: values.participants.split(',').map((item) => item.trim()).filter(Boolean),
      decision: values.decision.trim(),
      nextAction: values.nextAction.trim(),
      owner: values.owner,
      dueDate: values.dueDate,
      status: 'Open',
      decisionBy: values.decisionBy.trim(),
      evidenceReference: values.evidenceReference.trim(),
    }
    savePlacementConversations([conversation, ...conversations])

    const queue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
    const dueLabel = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(`${values.dueDate}T12:00:00`))
    const task: WorkItem = {
      id: `A-VP-${values.clientCode}`,
      clientCode: values.clientCode,
      type: 'Vervolgplek',
      title: values.nextAction.trim(),
      detail: `Vervolg uit besluit “${values.subject.trim()}”`,
      due: dueLabel,
      dueDate: values.dueDate,
      urgency: 'Deze week',
      owner: values.owner,
      status: 'Open',
      policyReason: 'Doorstroom: ieder besluit heeft een concrete vervolgtaak, taakverantwoordelijke en deadline.',
      responsibleRoles: ['Begeleider', 'Zorgmanager'],
      updatedAt: new Date().toISOString(),
    }
    const existingTask = queue.find((item) => item.id === task.id)
    saveWorkQueue(existingTask ? queue.map((item) => item.id === task.id ? task : item) : [task, ...queue])
    navigate(`/jongeren/${values.clientCode}?placement=updated`)
  }

  const selected = trajectories.find((item) => item.clientCode === values.clientCode)

  if ((requestedCode && !initialTrajectory) || !trajectories.length) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">{requestedCode ? `Het cliëntdossier “${requestedCode}” bestaat niet of is niet actief.` : 'Er zijn geen actieve dossiers om bij te werken.'} Er is niets gewijzigd.</Alert>
        <Button component={RouterLink} to="/uitstroom-registratie" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Terug naar uitstroom en vervolgplek</Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to="/uitstroom-registratie" startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar uitstroom en vervolgplek</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Vervolgplek en besluit bijwerken</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>Eén invoer werkt de monitor, het dossier en de werkvoorraad samen bij.</Typography>
      </Box>
      {submitted && !valid && <Alert severity="warning">Vul status, datum, besluitnemer, bewijs, vervolgtaak, taakverantwoordelijke en deadline volledig in. Definitief akkoord of plaatsing vereist ook een type en aanbieder.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>1. Jongere en actuele status</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField select label="Jongere / dossier" value={values.clientCode} onChange={(event) => selectClient(event.target.value)}>
                {trajectories.map((item) => <MenuItem key={item.id} value={item.clientCode}>{item.clientCode} · {item.location} · {item.supervisor}</MenuItem>)}
              </TextField>
              <TextField select label="Status vervolgplek" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as Trajectory['followUpPlace'] })}>
                {['Niet nodig', 'Nog niet gestart', 'Zoeken', 'Wachtlijst', 'Definitief akkoord', 'Geplaatst'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField label="Type vervolgplek" value={values.followUpType} onChange={(event) => setValues({ ...values, followUpType: event.target.value })} />
              <TextField label="Aanbieder" value={values.provider} onChange={(event) => setValues({ ...values, provider: event.target.value })} />
              <TextField required type="date" label="Gewenste uitstroomdatum" value={values.plannedOutflow} onChange={(event) => setValues({ ...values, plannedOutflow: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              {isPlaced && <TextField required type="date" label="Werkelijke uitstroomdatum" value={values.actualOutflowDate} onChange={(event) => setValues({ ...values, actualOutflowDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />}
              {isPlaced && <TextField select required label="Uitstroomresultaat" value={values.outcome} onChange={(event) => setValues({ ...values, outcome: event.target.value as 'Gepland' | 'Ongepland' })}><MenuItem value="Gepland">Gepland</MenuItem><MenuItem value="Ongepland">Ongepland</MenuItem></TextField>}
            </Box>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>2. Gesprek en besluit</Typography>
            <Stack spacing={1.7}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
                <TextField required type="date" label="Gespreksdatum" value={values.date} onChange={(event) => setValues({ ...values, date: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField required label="Onderwerp" value={values.subject} onChange={(event) => setValues({ ...values, subject: event.target.value })} />
              </Box>
              <TextField required label="Aanwezigen" value={values.participants} onChange={(event) => setValues({ ...values, participants: event.target.value })} helperText="Scheid aanwezigen met een komma." />
              <TextField required multiline minRows={3} label="Besluit" value={values.decision} onChange={(event) => setValues({ ...values, decision: event.target.value })} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
                <TextField required label="Besluit genomen door" value={values.decisionBy} onChange={(event) => setValues({ ...values, decisionBy: event.target.value })} helperText="Naam en rol van de bevoegde besluitnemer." />
                <TextField required label="Bewijs- of bronreferentie" value={values.evidenceReference} onChange={(event) => setValues({ ...values, evidenceReference: event.target.value })} helperText="Bijvoorbeeld besluit-ID of documentreferentie; upload volgt later." />
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>3. Verplichte vervolgactie</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 1.7 }}>
              <TextField required label="Volgende actie" value={values.nextAction} onChange={(event) => setValues({ ...values, nextAction: event.target.value })} />
              <TextField select required label="Taakverantwoordelijke" value={values.owner} onChange={(event) => setValues({ ...values, owner: event.target.value })}>
                {Array.from(new Set(trajectories.map((item) => item.supervisor))).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required type="date" label="Deadline" value={values.dueDate} onChange={(event) => setValues({ ...values, dueDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
          </Box>
        </Stack>

        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <HomeWorkRoundedIcon sx={{ color: '#4f7899' }} />
          <Typography sx={{ mt: .8, fontSize: 13.5, fontWeight: 770 }}>Controleer de update</Typography>
          <Stack spacing={1.1} sx={{ mt: 1.4 }}>
            <Typography sx={{ fontSize: 10.8 }}>{values.clientCode} · {selected?.location}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Status: {values.status}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Uitstroom: {values.plannedOutflow || '—'}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Taakverantwoordelijke: {values.owner || '—'}</Typography>
          </Stack>
          <Divider sx={{ my: 1.7 }} />
          <Button fullWidth size="large" variant="contained" onClick={save}>Besluit en actie opslaan</Button>
          <Button fullWidth component={RouterLink} to="/uitstroom-registratie" sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
