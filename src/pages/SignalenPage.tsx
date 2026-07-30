import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Chip, Divider, FormControl, MenuItem, Select, Stack, Typography,
} from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Link as RouterLink } from 'react-router-dom'
import { loadTrajectories, loadWorkQueue } from '../data/demoStore'
import { workItems } from '../data/careInsights'
import { deriveSignals, type CareSignal } from '../data/signals'
import { useWorkspaceRole } from '../context/RoleContext'

const priorityTone = {
  Kritiek: { bg: '#fbecea', color: '#a44539' },
  Hoog: { bg: '#fff3e5', color: '#925b1d' },
  Normaal: { bg: '#edf4fa', color: '#376b95' },
}

function roleAllows(signal: CareSignal, role: string) {
  if (role === 'Directie') return signal.priority !== 'Normaal'
  if (role === 'Gedragswetenschapper') return signal.type === 'Veiligheid' || signal.priority === 'Kritiek'
  if (role === 'Begeleider') return signal.owner !== 'Nog toe te wijzen'
  return true
}

export default function SignalenPage() {
  const { role } = useWorkspaceRole()
  const [type, setType] = useState('Alle typen')
  const [priority, setPriority] = useState('Alle prioriteiten')
  const signals = useMemo(() => deriveSignals(
    loadTrajectories(),
    loadWorkQueue(workItems.map((item) => ({ ...item, status: 'Open' as const }))).filter((item) => item.status === 'Open'),
  ), [])

  const visible = signals.filter((signal) =>
    roleAllows(signal, role) &&
    (type === 'Alle typen' || signal.type === type) &&
    (priority === 'Alle prioriteiten' || signal.priority === priority)
  )

  return (
    <Stack spacing={2.5}>
      <Alert icon={<AutoAwesomeRoundedIcon />} severity="info" sx={{ border: '1px solid #cfe0ed', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 760 }}>Automatisch signaalcentrum voor {role.toLowerCase()}</Typography>
        <Typography sx={{ fontSize: 11.2 }}>
          Signalen worden afgeleid uit trajectdata, incidentopvolging, vervolgplekken en evaluaties. Dit is een configureerbare demo; regels moeten vóór productie formeel worden vastgesteld.
        </Typography>
      </Alert>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={1.5} sx={{ p: 2.2 }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 780, color: '#172c42' }}>{visible.length} open signalen</Typography>
            <Typography sx={{ mt: .25, fontSize: 10.8, color: '#8492a2' }}>
              {visible.filter((item) => item.priority === 'Kritiek').length} kritiek · gesorteerd op risico
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={type} onChange={(event) => setType(event.target.value)} inputProps={{ 'aria-label': 'Signaaltype' }}>
                {['Alle typen', 'Doorstroom', 'Veiligheid', 'Evaluatie', 'Datakwaliteit'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select value={priority} onChange={(event) => setPriority(event.target.value)} inputProps={{ 'aria-label': 'Prioriteit' }}>
                {['Alle prioriteiten', 'Kritiek', 'Hoog', 'Normaal'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
        <Divider />

        <Stack divider={<Divider flexItem />}>
          {visible.map((signal) => {
            const tone = priorityTone[signal.priority]
            return (
              <Box key={signal.id} sx={{ p: 2.2 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} gap={1.7} alignItems={{ lg: 'center' }}>
                  <Stack spacing={.7} sx={{ minWidth: 125 }}>
                    <Typography component={RouterLink} to={`/jongeren/${signal.clientCode}`} sx={{ color: '#376b95', fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>{signal.clientCode}</Typography>
                    <Stack direction="row" spacing={.6}>
                      <Chip label={signal.priority} size="small" sx={{ height: 20, bgcolor: tone.bg, color: tone.color, fontSize: 9.5 }} />
                      <Chip label={signal.type} size="small" sx={{ height: 20, bgcolor: '#f0f3f6', color: '#637689', fontSize: 9.5 }} />
                    </Stack>
                  </Stack>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 760, color: '#294157' }}>{signal.title}</Typography>
                    <Typography sx={{ mt: .35, fontSize: 10.7, color: '#718497' }}>{signal.reason}</Typography>
                    <Typography sx={{ mt: .65, fontSize: 10.5, fontWeight: 650, color: '#526b7f' }}>Volgende stap: {signal.nextAction}</Typography>
                    <Typography sx={{ mt: .45, fontSize: 9.5, color: '#96a1ac' }}>Bron: {signal.source}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 145 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 720, color: '#526a7e' }}>{signal.owner}</Typography>
                    <Typography sx={{ mt: .2, fontSize: 10, color: tone.color }}>{signal.due}</Typography>
                  </Box>
                  <Stack direction="row" spacing={.8}>
                    <Button component={RouterLink} to={`/jongeren/${signal.clientCode}`} size="small" variant="outlined" endIcon={<OpenInNewRoundedIcon />}>Dossier</Button>
                    <Button
                      component={RouterLink}
                      to={`/acties/nieuw?client=${signal.clientCode}&type=${signal.title.includes('UVO') ? 'UVO' : signal.type === 'Veiligheid' ? 'Herstelgesprek' : signal.type === 'Doorstroom' ? 'Vervolgplek' : 'Evaluatie'}&source=${encodeURIComponent(signal.reason)}`}
                      size="small"
                      variant="contained"
                      startIcon={<AddTaskRoundedIcon />}
                    >
                      Maak taak
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )
          })}
          {!visible.length && <Box sx={{ py: 6, textAlign: 'center' }}><Typography sx={{ color: '#5b9b83', fontSize: 24 }}>✓</Typography><Typography sx={{ mt: .6, color: '#6f8293', fontSize: 11.5 }}>Geen open signalen binnen deze selectie.</Typography></Box>}
        </Stack>
      </Box>
    </Stack>
  )
}
