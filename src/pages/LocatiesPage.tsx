import { useMemo } from 'react'
import { Box, Button, Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded'
import KpiCard from '../components/insights/KpiCard'
import { incidents } from '../data/careInsights'
import { loadTrajectories } from '../data/demoStore'
import { Link as RouterLink } from 'react-router-dom'
import { useWorkspaceRole } from '../context/RoleContext'

const capacities = { Tilburg: 12, Breda: 10, Eindhoven: 8 } as const

function LocatiesPage() {
  const { role } = useWorkspaceRole()
  const canOpenOperationalDetails = role === 'Zorgmanager'
  const trajectories = useMemo(() => loadTrajectories(), [])
  const rows = Object.entries(capacities).map(([location, capacity]) => {
    const active = trajectories.filter((item) => !item.endDate && item.location === location)
    const locationIncidents = incidents.filter((item) => item.location === location && item.date >= '2026-04-29')
    const overdue = active.filter((item) => item.expectedEndDate < '2026-07-28').length
    const occupancy = Math.round((active.length / capacity) * 100)
    return { location, capacity, active: active.length, available: Math.max(0, capacity - active.length), occupancy, incidents: locationIncidents.length, overdue }
  })
  const totalCapacity = rows.reduce((sum, row) => sum + row.capacity, 0)
  const totalActive = rows.reduce((sum, row) => sum + row.active, 0)

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.3, bgcolor: '#edf5fb', border: '1px solid #d9e8f3', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 750, color: '#214969' }}>Capaciteit en zorgdruk in één vergelijking</Typography>
        <Typography sx={{ mt: .4, fontSize: 10.9, color: '#567188' }}>Bezetting komt uit actieve trajecten; incidentdruk uit de fictieve Zilliz-synchronisatie. Capaciteit is organisatieconfiguratie.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.7 }}>
        <KpiCard label="Totale capaciteit" value={String(totalCapacity)} context="Geconfigureerde plaatsen over 3 locaties" icon={<ApartmentRoundedIcon />} />
        <KpiCard label="Actieve plaatsingen" value={String(totalActive)} context={`${Math.round((totalActive / totalCapacity) * 100)}% organisatiebrede bezetting`} icon={<Groups2RoundedIcon />} tone="green" />
        <KpiCard label="Beschikbare plaatsen" value={String(totalCapacity - totalActive)} context="Theoretische ruimte; exclusief matchingsvoorwaarden" icon={<MeetingRoomRoundedIcon />} tone="blue" />
      </Box>
      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Vergelijking per locatie</Typography><Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Bezetting, beschikbare ruimte, incidentdruk en vertraagde trajecten</Typography></Box>
        <TableContainer><Table size="small" sx={{ minWidth: 760 }}><TableHead><TableRow>{['Locatie', 'Bezetting', 'Actief', 'Beschikbaar', 'Incidenten 90 dgn', 'Einddatum overschreden', 'Signaal', ...(canOpenOperationalDetails ? ['Opvolging'] : [])].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{rows.map((row) => <TableRow key={row.location} hover>
            <TableCell sx={{ fontWeight: 750 }}>{row.location}</TableCell>
            <TableCell sx={{ minWidth: 150 }}><Stack direction="row" spacing={1} alignItems="center"><LinearProgress variant="determinate" value={Math.min(row.occupancy, 100)} sx={{ width: 80, height: 7, borderRadius: 8 }} /><Typography sx={{ fontSize: 10.5 }}>{row.occupancy}%</Typography></Stack></TableCell>
            <TableCell>{row.active}</TableCell><TableCell>{row.available}</TableCell><TableCell>{row.incidents}</TableCell><TableCell>{row.overdue}</TableCell>
            <TableCell><Chip label={row.occupancy >= 90 || row.overdue >= 2 ? 'Aandacht' : 'Stabiel'} size="small" sx={{ height: 21, fontSize: 10, bgcolor: row.occupancy >= 90 || row.overdue >= 2 ? '#fff3e5' : '#eaf6f1', color: row.occupancy >= 90 || row.overdue >= 2 ? '#925b1d' : '#28745d' }} /></TableCell>
            {canOpenOperationalDetails && <TableCell><Button component={RouterLink} to={`/jongeren?location=${encodeURIComponent(row.location)}`} size="small">Open dossiers</Button></TableCell>}
          </TableRow>)}</TableBody>
        </Table></TableContainer>
      </Box>
    </Stack>
  )
}

export default LocatiesPage
