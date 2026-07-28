import { useMemo, useState } from 'react'
import {
  Avatar, Box, Button, Chip, Divider, FormControl, MenuItem, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import KpiCard from '../components/insights/KpiCard'
import { type PlacementConversation } from '../data/careInsights'
import { loadPlacementConversations, loadTrajectories, savePlacementConversations } from '../data/demoStore'

const statusTone: Record<string, { bg: string; color: string }> = {
  'Nog niet gestart': { bg: '#f1f3f5', color: '#657383' },
  Zoeken: { bg: '#edf4fa', color: '#376b95' },
  Wachtlijst: { bg: '#fbf2e7', color: '#976225' },
  'Definitief akkoord': { bg: '#eaf6f1', color: '#28745d' },
  Geplaatst: { bg: '#eaf6f1', color: '#28745d' },
}

function UitstroomRegistratiePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const clientFilter = searchParams.get('client')
  const candidates = useMemo(() => loadTrajectories().filter((item) => !item.endDate && item.followUpPlace !== 'Niet nodig'), [])
  const [status, setStatus] = useState('Alle statussen')
  const [conversations, setConversations] = useState<PlacementConversation[]>(loadPlacementConversations)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conversation, setConversation] = useState({ clientCode: candidates[0]?.clientCode ?? '', date: '', subject: '', participants: '', decision: '', nextAction: '', owner: '', dueDate: '' })
  const rows = useMemo(() => candidates.filter((item) =>
    (!clientFilter || item.clientCode === clientFilter) &&
    (status === 'Alle statussen' || item.followUpPlace === status)
  ), [status, candidates, clientFilter])
  const arranged = candidates.filter((item) => item.followUpPlace === 'Definitief akkoord')
  const atRisk = candidates.filter((item) => ['Nog niet gestart', 'Zoeken', 'Wachtlijst'].includes(item.followUpPlace) && item.plannedOutflow && new Date(item.plannedOutflow) < new Date('2026-10-01'))
  const saveConversation = () => {
    if (!conversation.clientCode || !conversation.date || !conversation.subject || !conversation.decision || !conversation.nextAction || !conversation.owner || !conversation.dueDate) return
    setConversations((current) => {
      const next: PlacementConversation[] = [{
        id: `G-${String(current.length + 1).padStart(2, '0')}`,
        clientCode: conversation.clientCode,
        date: conversation.date,
        subject: conversation.subject,
        participants: conversation.participants.split(',').map((item) => item.trim()).filter(Boolean),
        decision: conversation.decision,
        nextAction: conversation.nextAction,
        owner: conversation.owner,
        dueDate: conversation.dueDate,
        status: 'Open',
      }, ...current]
      savePlacementConversations(next)
      return next
    })
    setDialogOpen(false)
    setConversation({ clientCode: candidates[0]?.clientCode ?? '', date: '', subject: '', participants: '', decision: '', nextAction: '', owner: '', dueDate: '' })
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
        <KpiCard label="Vervolgplek nodig" value={String(candidates.length)} context="Actieve trajecten met uitstroomvoorbereiding" icon={<HomeWorkRoundedIcon />} />
        <KpiCard label="Definitief geregeld" value={String(arranged.length)} context={`${Math.round((arranged.length / candidates.length) * 100)}% van de benodigde vervolgplekken`} icon={<TaskAltRoundedIcon />} tone="green" />
        <KpiCard label="Zoeken of wachtlijst" value={String(candidates.length - arranged.length)} context="Nog geen definitief akkoord ontvangen" icon={<PendingActionsRoundedIcon />} tone="amber" />
        <KpiCard label="Risico op vertraging" value={String(atRisk.length)} context="Uitstroom binnen 2 maanden, plek niet definitief" icon={<WarningAmberRoundedIcon />} tone={atRisk.length ? 'red' : 'green'} />
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5} sx={{ px: 2.5, py: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Vervolgplekmonitor</Typography>
            <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Van zoekstart tot plaatsing, inclusief eigenaar en gewenste uitstroomdatum</Typography>
            {clientFilter && <Chip label={`Gefilterd op ${clientFilter} ×`} onClick={() => setSearchParams({})} size="small" sx={{ mt: 1, height: 21, bgcolor: '#edf4fa', color: '#376b95', fontSize: 9.5 }} />}
          </Box>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={status} onChange={(event) => setStatus(event.target.value)} inputProps={{ 'aria-label': 'Filter op vervolgplekstatus' }} sx={{ fontSize: 11.5 }}>
                {['Alle statussen', 'Nog niet gestart', 'Zoeken', 'Wachtlijst', 'Definitief akkoord'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)} sx={{ fontSize: 11.5 }}>Nieuw gesprek</Button>
          </Stack>
        </Stack>
        <Divider />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {['Jongere', 'Herkomst', 'Vervolgplek', 'Type', 'Gewenste uitstroom', 'Eigenaar', 'Volgende stap'].map((header) => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => {
                const tone = statusTone[item.followUpPlace] ?? statusTone.Zoeken
                return (
                  <TableRow key={item.id} hover onClick={() => navigate(`/jongeren/${item.clientCode}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#eaf2f8', color: '#356b97', fontSize: 9.5, fontWeight: 800 }}>{item.clientCode.slice(-2)}</Avatar>
                        <Box><Typography sx={{ fontSize: 11.5, fontWeight: 720, color: '#294157' }}>{item.clientCode}</Typography><Typography sx={{ fontSize: 9.5, color: '#91a0ad' }}>{item.location}</Typography></Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.originCity}<Typography component="span" sx={{ display: 'block', fontSize: 9.5, color: '#91a0ad' }}>{item.originMunicipality}</Typography></TableCell>
                    <TableCell><Chip label={item.followUpPlace} size="small" sx={{ height: 22, bgcolor: tone.bg, color: tone.color, fontSize: 10 }} /></TableCell>
                    <TableCell>{item.followUpType ?? 'Nog te bepalen'}</TableCell>
                    <TableCell sx={{ color: item.plannedOutflow && new Date(item.plannedOutflow) < new Date('2026-09-01') && item.followUpPlace !== 'Definitief akkoord' ? '#a44539' : 'inherit', fontWeight: 650 }}>{item.plannedOutflow ? new Date(item.plannedOutflow).toLocaleDateString('nl-NL') : '–'}</TableCell>
                    <TableCell>{item.supervisor}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={.5}>
                        <Typography sx={{ maxWidth: 210, fontSize: 10.5, color: '#53677a' }}>{conversations.find((entry) => entry.clientCode === item.clientCode)?.nextAction ?? 'Zoekprofiel opstellen'}</Typography>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 15, color: '#91a1af' }} />
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Recente gesprekken & besluiten</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Wie waren aanwezig, wat is besloten en wie pakt de volgende actie op?</Typography>
        </Box>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {conversations.map((conversation) => (
            <Box key={conversation.id} sx={{ px: 2.5, py: 2 }}>
              <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems={{ lg: 'flex-start' }}>
                <Box sx={{ minWidth: 132 }}>
                  <Typography sx={{ fontSize: 10.5, color: '#8795a4' }}>{new Date(conversation.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}</Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 750, color: '#2a4359', mt: .25 }}>{conversation.clientCode}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 720, color: '#263e53' }}>{conversation.subject}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: '#7d8d9c', mt: .4 }}>{conversation.participants.join(' · ')}</Typography>
                  <Box sx={{ mt: 1.2, p: 1.3, bgcolor: '#f7f9fb', borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: '#8a98a5' }}>BESLUIT</Typography>
                    <Typography sx={{ fontSize: 11.2, color: '#3c5367', mt: .3 }}>{conversation.decision}</Typography>
                  </Box>
                </Box>
                <Box sx={{ width: { lg: 270 }, p: 1.3, bgcolor: '#eef5fa', borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: '#698297' }}>VOLGENDE ACTIE</Typography>
                  <Typography sx={{ fontSize: 11.2, fontWeight: 650, color: '#31536f', mt: .3 }}>{conversation.nextAction}</Typography>
                  <Typography sx={{ fontSize: 10, color: '#71879a', mt: .5 }}>{conversation.owner} · vóór {new Date(conversation.dueDate).toLocaleDateString('nl-NL')}</Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Gesprek en besluit vastleggen</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>De afspraak en eigenaar worden direct zichtbaar in de vervolgplekmonitor.</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth><Select value={conversation.clientCode} onChange={(event) => setConversation({ ...conversation, clientCode: event.target.value })} inputProps={{ 'aria-label': 'Jongere' }}>{candidates.map((item) => <MenuItem key={item.clientCode} value={item.clientCode}>{item.clientCode}</MenuItem>)}</Select></FormControl>
              <TextField fullWidth type="date" label="Gespreksdatum" value={conversation.date} onChange={(event) => setConversation({ ...conversation, date: event.target.value })} InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Onderwerp" value={conversation.subject} onChange={(event) => setConversation({ ...conversation, subject: event.target.value })} />
            <TextField label="Deelnemers" value={conversation.participants} onChange={(event) => setConversation({ ...conversation, participants: event.target.value })} helperText="Scheid deelnemers met een komma, bijvoorbeeld: jongere, mentor, gemeente" />
            <TextField label="Besluit" multiline minRows={2} value={conversation.decision} onChange={(event) => setConversation({ ...conversation, decision: event.target.value })} />
            <TextField label="Volgende actie" value={conversation.nextAction} onChange={(event) => setConversation({ ...conversation, nextAction: event.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Actiehouder" value={conversation.owner} onChange={(event) => setConversation({ ...conversation, owner: event.target.value })} />
              <TextField fullWidth type="date" label="Deadline" value={conversation.dueDate} onChange={(event) => setConversation({ ...conversation, dueDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Annuleren</Button>
          <Button variant="contained" onClick={saveConversation} disabled={!conversation.date || !conversation.subject || !conversation.decision || !conversation.nextAction || !conversation.owner || !conversation.dueDate}>Opslaan</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default UitstroomRegistratiePage
