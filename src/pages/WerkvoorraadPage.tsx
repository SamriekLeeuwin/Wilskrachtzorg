import { useMemo, useState } from 'react'
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
import { workItems, type WorkItem } from '../data/careInsights'
import { loadWorkQueue, saveWorkQueue } from '../data/demoStore'
import { useWorkspaceRole } from '../context/RoleContext'

type ActionStatus = 'Open' | 'Afgerond'
type ActionRow = WorkItem & { status: ActionStatus; policyReason: string; completionNote?: string; completedAt?: string }

const policyReasons: Record<WorkItem['type'], string> = {
  UVO: 'Pedagogisch beleid: bij 3 aantekeningen binnen circa 2–3 weken wordt het netwerk uitgenodigd voor een UVO.',
  Herstelgesprek: 'Pedagogisch beleid: herstelgesprek is verplicht na een zwaar incident, time-out of officiële waarschuwing.',
  Vervolgplek: 'Doorstroom: besluit, deelnemers, actiehouder en deadline moeten controleerbaar zijn vastgelegd.',
  Evaluatie: 'Medewerkershandboek: zorgplan bijhouden en zorg periodiek evalueren.',
}

const urgencyTone = {
  Vandaag: { bg: '#fff5e8', color: '#965b20' },
  'Deze week': { bg: '#edf4fa', color: '#376b95' },
  'Te laat': { bg: '#fbecea', color: '#a34d41' },
}

function WerkvoorraadPage() {
  const { role } = useWorkspaceRole()
  const [searchParams] = useSearchParams()
  const defaultActions = workItems.map((item): ActionRow => ({ ...item, status: 'Open', policyReason: policyReasons[item.type] }))
  const [actions, setActions] = useState<ActionRow[]>(() => loadWorkQueue(defaultActions))
  const [typeFilter, setTypeFilter] = useState('Alle typen')
  const [ownerFilter, setOwnerFilter] = useState('Alle eigenaren')
  const [selected, setSelected] = useState<ActionRow | null>(null)
  const [completionNote, setCompletionNote] = useState('')

  const visible = useMemo(() => actions.filter((item) => {
    const roleMatches =
      role === 'Gedragswetenschapper' ? ['UVO', 'Herstelgesprek'].includes(item.type) :
      role === 'Directie' ? ['Vandaag', 'Te laat'].includes(item.urgency) :
      true
    return item.status === 'Open' &&
      roleMatches &&
      (typeFilter === 'Alle typen' || item.type === typeFilter) &&
      (ownerFilter === 'Alle eigenaren' || item.owner === ownerFilter)
  }), [actions, ownerFilter, role, typeFilter])

  const completeAction = () => {
    if (!selected || !completionNote.trim()) return
    setActions((current) => {
      const completedAt = new Date().toISOString()
      const next = current.map((item): ActionRow => item.id === selected.id ? { ...item, status: 'Afgerond', completionNote: completionNote.trim(), completedAt } : item)
      saveWorkQueue(next)
      return next
    })
    setSelected(null)
    setCompletionNote('')
  }

  return (
    <Stack spacing={2.5}>
      {searchParams.get('created') === '1' && <Alert severity="success">De taak is toegevoegd en staat nu in de werkvoorraad.</Alert>}
      {searchParams.get('updated') === '1' && <Alert severity="success">De taak, eigenaar en deadline zijn bijgewerkt.</Alert>}
      <Box sx={{ p: 2.3, bgcolor: '#edf5fb', border: '1px solid #d9e8f3', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 750, color: '#214969' }}>Eén gezamenlijke werkvoorraad</Typography>
        <Typography sx={{ mt: .4, maxWidth: 850, fontSize: 10.9, lineHeight: 1.55, color: '#567188' }}>
          Deze werkvoorraad is afgestemd op de rol {role.toLowerCase()}. Iedere actie bevat de beleidsaanleiding, eigenaar, deadline en een controleerbaar resultaat.
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1.4} sx={{ p: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>{visible.length} open acties</Typography>
            <Typography sx={{ mt: .2, fontSize: 10.5, color: '#8492a2' }}>{visible.filter((item) => item.urgency === 'Te laat').length} te laat · {visible.filter((item) => item.urgency === 'Vandaag').length} vandaag</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/acties/nieuw" variant="contained" startIcon={<AddRoundedIcon />}>Nieuwe taak</Button>
            <FormControl size="small" sx={{ minWidth: 155 }}><Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} inputProps={{ 'aria-label': 'Actietype' }}>{['Alle typen', 'UVO', 'Herstelgesprek', 'Vervolgplek', 'Evaluatie'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}><Select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} inputProps={{ 'aria-label': 'Actiehouder' }}>{['Alle eigenaren', ...Array.from(new Set(actions.map((item) => item.owner)))].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
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
                    <Button component={RouterLink} to={`/acties/${item.id}/bewerken`} size="small" variant="outlined" startIcon={<EditRoundedIcon />} sx={{ fontSize: 10.5 }}>Wijzigen</Button>
                    <Button size="small" variant="contained" startIcon={<CheckRoundedIcon />} onClick={() => setSelected(item)} disabled={role === 'Directie'} sx={{ fontSize: 10.5 }}>Afronden</Button>
                  </Stack>
                </Stack>
              </Box>
            )
          })}
          {visible.length === 0 && <Box sx={{ py: 6, textAlign: 'center' }}><CheckRoundedIcon sx={{ color: '#62a087' }} /><Typography sx={{ mt: .7, fontSize: 11.5, color: '#6e8192' }}>Geen open acties binnen deze filters.</Typography></Box>}
        </Stack>
      </Box>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Actie afronden</Typography>
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
