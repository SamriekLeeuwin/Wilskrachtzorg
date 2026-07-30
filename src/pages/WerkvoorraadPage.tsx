import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { workItems, workItemVisibleForRole, type WorkItem } from '../data/careInsights'
import { loadWorkQueue, saveWorkQueue } from '../data/demoStore'
import { useWorkspaceRole } from '../context/RoleContext'

type ActionStatus = 'Open' | 'Afgerond'
type ActionRow = WorkItem & { status: ActionStatus; policyReason: string; completionNote?: string; completedAt?: string }

const policyReasons: Record<WorkItem['type'], string> = {
  UVO: 'Pedagogisch beleid: bij 3 aantekeningen binnen circa 2–3 weken wordt het netwerk uitgenodigd voor een UVO.',
  Herstelgesprek: 'Pedagogisch beleid: na ieder incident wordt herstelopvolging beoordeeld en aantoonbaar vastgelegd.',
  Vervolgplek: 'Doorstroom: besluit, deelnemers, actiehouder en deadline moeten controleerbaar zijn vastgelegd.',
  Evaluatie: 'Medewerkershandboek: zorgplan bijhouden en zorg periodiek evalueren.',
  Gemeentecontact: 'Externe afspraak: reactie, eigenaar en deadline moeten controleerbaar worden opgevolgd.',
}

const urgencyTone = {
  Vandaag: { bg: '#fff5e8', color: '#965b20' },
  'Deze week': { bg: '#edf4fa', color: '#376b95' },
  'Te laat': { bg: '#fbecea', color: '#a34d41' },
}

function WerkvoorraadPage() {
  const { role } = useWorkspaceRole()
  const [searchParams] = useSearchParams()
  const defaultActions = useMemo(() => workItems.map((item): ActionRow => ({ ...item, status: 'Open', policyReason: policyReasons[item.type], updatedAt: 'demo-v1' })), [])
  const loadCurrentActions = () => loadWorkQueue<ActionRow>(defaultActions).map((item) => ({
    ...defaultActions.find((defaultItem) => defaultItem.id === item.id),
    ...item,
  }))
  const [actions, setActions] = useState<ActionRow[]>(loadCurrentActions)
  const requestedType = searchParams.get('type')
  const [typeFilter, setTypeFilter] = useState(
    ['UVO', 'Herstelgesprek', 'Vervolgplek', 'Evaluatie', 'Gemeentecontact'].includes(requestedType ?? '')
      ? requestedType!
      : 'Alle typen',
  )
  const [ownerFilter, setOwnerFilter] = useState('Alle verantwoordelijken')
  const [selected, setSelected] = useState<ActionRow | null>(null)
  const [completionNote, setCompletionNote] = useState('')
  const [conflictMessage, setConflictMessage] = useState('')

  useEffect(() => {
    const refreshFromOtherTab = (event: StorageEvent) => {
      if (event.key?.includes('work-queue')) {
        const latest = loadWorkQueue<ActionRow>(defaultActions).map((item) => ({
          ...defaultActions.find((defaultItem) => defaultItem.id === item.id),
          ...item,
        }))
        setActions(latest)
      }
    }
    window.addEventListener('storage', refreshFromOtherTab)
    return () => window.removeEventListener('storage', refreshFromOtherTab)
  }, [defaultActions])

  const visible = useMemo(() => actions.filter((item) => {
    return item.status === 'Open' &&
      workItemVisibleForRole(item, role) &&
      (typeFilter === 'Alle typen' || item.type === typeFilter) &&
      (ownerFilter === 'Alle verantwoordelijken' || item.owner === ownerFilter)
  }), [actions, ownerFilter, role, typeFilter])

  const completeAction = () => {
    if (!selected || !completionNote.trim()) return
    const latest = loadCurrentActions()
    const latestSelected = latest.find((item) => item.id === selected.id)
    if (!latestSelected || latestSelected.status !== selected.status || latestSelected.updatedAt !== selected.updatedAt) {
      setActions(latest)
      setSelected(null)
      setCompletionNote('')
      setConflictMessage('Deze taak is intussen in een andere sessie gewijzigd. De werkvoorraad is vernieuwd; controleer de actuele status voordat u verdergaat.')
      return
    }
    const completedAt = new Date().toISOString()
    const next = latest.map((item): ActionRow => item.id === selected.id ? {
      ...item,
      status: 'Afgerond',
      completionNote: completionNote.trim(),
      completedAt,
      updatedAt: completedAt,
    } : item)
    saveWorkQueue(next)
    setActions(next)
    setSelected(null)
    setCompletionNote('')
    setConflictMessage('')
  }

  return (
    <Stack spacing={2.5}>
      {searchParams.get('created') === '1' && <Alert severity="success">De taak is toegevoegd en staat nu in de werkvoorraad.</Alert>}
      {searchParams.get('updated') === '1' && <Alert severity="success">De taak, taakverantwoordelijke en deadline zijn bijgewerkt.</Alert>}
      {conflictMessage && <Alert severity="warning" onClose={() => setConflictMessage('')}>{conflictMessage}</Alert>}
      <Box sx={{ p: 2.3, bgcolor: '#edf5fb', border: '1px solid #d9e8f3', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 750, color: '#214969' }}>Werkvoorraad voor {role.toLowerCase()}</Typography>
        <Typography sx={{ mt: .4, maxWidth: 850, fontSize: 10.9, lineHeight: 1.55, color: '#567188' }}>
          Deze prototypeweergave filtert op rol en toont daarna de verantwoordelijke medewerker. Een productieversie moet aanvullend op de ingelogde gebruiker, caseload, locatie en waarneming filteren.
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1.4} sx={{ p: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>{visible.length} openstaande taken</Typography>
            <Typography sx={{ mt: .2, fontSize: 10.5, color: '#8492a2' }}>{visible.filter((item) => item.urgency === 'Te laat').length} te laat · {visible.filter((item) => item.urgency === 'Vandaag').length} vandaag</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/acties/nieuw" variant="contained" startIcon={<AddRoundedIcon />}>Nieuwe taak</Button>
            <FormControl size="small" sx={{ minWidth: 155 }}><Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} inputProps={{ 'aria-label': 'Actietype' }}>{['Alle typen', 'UVO', 'Herstelgesprek', 'Vervolgplek', 'Evaluatie', 'Gemeentecontact'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}><Select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} inputProps={{ 'aria-label': 'Taakverantwoordelijke' }}>{['Alle verantwoordelijken', ...Array.from(new Set(actions.map((item) => item.owner)))].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
          </Stack>
        </Stack>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {visible.map((item) => {
            const tone = urgencyTone[item.urgency]
            return (
              <Box key={item.id} sx={{ p: 2.1 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} gap={1.5} alignItems={{ lg: 'center' }}>
                  <Box sx={{ minWidth: 100 }}>
                    <Typography component={RouterLink} to={`/jongeren/${item.clientCode}`} sx={{ fontSize: 10.5, fontWeight: 800, color: '#426f94', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{item.clientCode}</Typography>
                    <Chip label={item.type} size="small" sx={{ mt: .6, height: 20, bgcolor: '#eef3f7', color: '#5c7387', fontSize: 9.3 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.2, fontWeight: 730, color: '#294157' }}>{item.title}</Typography>
                    <Typography sx={{ mt: .3, fontSize: 10.5, color: '#7d8d9c' }}>{item.detail}</Typography>
                    <Typography sx={{ mt: .6, fontSize: 9.8, color: '#8a98a5' }}>{item.policyReason}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 680, color: '#526a7e' }}>{item.owner}</Typography>
                    <Chip label={item.due} size="small" sx={{ mt: .5, height: 20, bgcolor: tone.bg, color: tone.color, fontSize: 9.3 }} />
                  </Box>
                  <Stack direction="row" spacing={.8}>
                    <Button component={RouterLink} to={`/jongeren/${item.clientCode}`} size="small" variant="outlined" endIcon={<OpenInNewRoundedIcon />} sx={{ fontSize: 10.5 }}>Dossier</Button>
                    {['UVO', 'Herstelgesprek', 'Evaluatie'].includes(item.type) && <Button component={RouterLink} to={`/jongeren/${item.clientCode}/afspraak/nieuw?type=${item.type}&task=${item.id}`} size="small" variant="outlined" startIcon={<CalendarMonthRoundedIcon />} sx={{ fontSize: 10.5 }}>Inplannen</Button>}
                    {item.type === 'Gemeentecontact' && <Button component={RouterLink} to={`/jongeren/${item.clientCode}/netwerkcontact/nieuw?task=${item.id}`} size="small" variant="contained" sx={{ fontSize: 10.5 }}>Contact vastleggen</Button>}
                    <Button component={RouterLink} to={`/acties/${item.id}/bewerken`} size="small" variant="outlined" startIcon={<EditRoundedIcon />} sx={{ fontSize: 10.5 }}>Wijzigen</Button>
                    {item.type === 'Vervolgplek' && <Button size="small" variant="contained" startIcon={<CheckRoundedIcon />} onClick={() => setSelected(item)} sx={{ fontSize: 10.5 }}>Taak afronden</Button>}
                  </Stack>
                </Stack>
              </Box>
            )
          })}
          {visible.length === 0 && <Box sx={{ py: 6, textAlign: 'center' }}><CheckRoundedIcon sx={{ color: '#62a087' }} /><Typography sx={{ mt: .7, fontSize: 11.5, color: '#6e8192' }}>Geen openstaande taken voor deze rol en filters.</Typography></Box>}
        </Stack>
      </Box>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Taak afronden</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>{selected?.clientCode} · {selected?.title}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1.5, bgcolor: '#f7f9fb', borderRadius: 1.7, mb: 2 }}>
            <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#7c8d9b', letterSpacing: '.06em' }}>BELEIDSAANLEIDING</Typography>
            <Typography sx={{ mt: .4, fontSize: 10.8, lineHeight: 1.55, color: '#536a7d' }}>{selected?.policyReason}</Typography>
          </Box>
          <TextField autoFocus fullWidth multiline minRows={3} label="Resultaat of besluit" value={completionNote} onChange={(event) => setCompletionNote(event.target.value)} helperText="Leg vast wat is uitgevoerd of besloten. Dit hoort controleerbaar terug in het dossier." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSelected(null)}>Annuleren</Button>
          <Button component={RouterLink} to={selected ? `/jongeren/${selected.clientCode}` : '/jongeren'} startIcon={<EventRoundedIcon />}>Open dossier</Button>
          <Button variant="contained" onClick={completeAction} disabled={!completionNote.trim()}>Afronden en vastleggen</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default WerkvoorraadPage
