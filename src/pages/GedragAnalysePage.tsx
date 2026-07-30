import { useMemo, useState } from 'react'
import { Alert, Box, Chip, Divider, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import GppMaybeRoundedIcon from '@mui/icons-material/GppMaybeRounded'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import { Link as RouterLink } from 'react-router-dom'
import KpiCard from '../components/insights/KpiCard'
import InsightFilters from '../components/insights/InsightFilters'
import { incidents, type Filters } from '../data/careInsights'
import { loadTrajectories } from '../data/demoStore'

function GedragAnalysePage() {
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const trajectoryByClient = useMemo(() => new Map(loadTrajectories().map((item) => [item.clientCode, item])), [])
  const filtered = useMemo(() => incidents.filter((incident) =>
    (filters.location === 'Alle locaties' || incident.location === filters.location) &&
    (filters.origin === 'Alle gemeenten' || trajectoryByClient.get(incident.clientCode)?.originMunicipality === filters.origin) &&
    (filters.period === '12m' || incident.date.startsWith(filters.period))
  ), [filters, trajectoryByClient])
  const categories = useMemo(() => Array.from(new Set(incidents.map((item) => item.category))).map((name) => {
    const count = filtered.filter((item) => item.category === name).length
    return { name, count, rate: filtered.length ? Math.round((count / filtered.length) * 100) : 0 }
  }).sort((a, b) => b.count - a.count), [filtered])
  const heavy = filtered.filter((item) => item.severity === 'Zwaar')
  const recoveryOpen = filtered.filter((item) => item.recoveryRequired && !item.recoveryCompleted)
  const officialWarnings = filtered.filter((item) => item.measure === 'Officiële waarschuwing')
  const phaseRows = useMemo(() => ['Stabilisatie', 'Verantwoordelijkheid', 'Onafhankelijkheid', 'Voorbereiding uitstroom'].map((phase) => {
    const rows = filtered.filter((item) => item.phase === phase)
    return { phase, count: rows.length, heavy: rows.filter((item) => item.severity === 'Zwaar').length, clients: new Set(rows.map((item) => item.clientCode)).size }
  }), [filtered])

  return (
    <Stack spacing={2.5}>
      <Alert severity="info" sx={{ border: '1px solid #cfe0ed', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 760 }}>Alleen-lezen managementweergave uit Zilliz</Typography>
        <Typography sx={{ fontSize: 11 }}>Incidenten worden door begeleiders in Zilliz geregistreerd. Hier worden ze geanalyseerd voor zorgmanager, gedragswetenschapper en directie.</Typography>
      </Alert>
      <InsightFilters value={filters} onChange={setFilters} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
        <KpiCard label="Incidenten" value={String(filtered.length)} context={`${new Set(filtered.map((item) => item.clientCode)).size} jongeren · geselecteerde periode`} icon={<FactCheckRoundedIcon />} />
        <KpiCard label="Zware incidenten" value={String(heavy.length)} context={`${filtered.length ? Math.round((heavy.length / filtered.length) * 100) : 0}% van alle incidenten`} icon={<GppMaybeRoundedIcon />} tone="red" />
        <KpiCard label="Herstelgesprek open" value={String(recoveryOpen.length)} context={`${filtered.filter((item) => item.recoveryRequired).length} herstelgesprekken vereist`} icon={<ForumRoundedIcon />} tone={recoveryOpen.length ? 'amber' : 'green'} />
        <KpiCard label="Officiële waarschuwingen" value={String(officialWarnings.length)} context="Binnen de geselecteerde rapportageperiode" icon={<EventBusyRoundedIcon />} tone="amber" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Verdeling naar gedragscategorie</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3, mb: 2 }}>Teller en aandeel reageren op periode en locatie</Typography>
          <Stack spacing={1.55}>{categories.map((category) => (
            <Box key={category.name}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: .5 }}>
                <Typography sx={{ fontSize: 11.2, fontWeight: 650, color: '#43586b' }}>{category.name}</Typography>
                <Typography sx={{ fontSize: 10.5, color: '#7f8e9c' }}>{category.count} · {category.rate}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={category.rate} sx={{ height: 6, borderRadius: 8, bgcolor: '#eef1f4', '& .MuiLinearProgress-bar': { bgcolor: category.name === 'Agressie' || category.name === 'Grensoverschrijdend' ? '#c66a59' : '#5a8fb8', borderRadius: 8 } }} />
            </Box>
          ))}</Stack>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Incidentdruk per fase</Typography><Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Helpt bepalen waar extra pedagogische ondersteuning nodig is</Typography></Box>
          <Divider />
          <TableContainer><Table size="small"><TableHead><TableRow>{['Fase', 'Incidenten', 'Zwaar', 'Jongeren'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
            <TableBody>{phaseRows.map((row) => <TableRow key={row.phase}><TableCell sx={{ fontWeight: 700 }}>{row.phase}</TableCell><TableCell>{row.count}</TableCell><TableCell>{row.heavy}</TableCell><TableCell>{row.clients}</TableCell></TableRow>)}</TableBody>
          </Table></TableContainer>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}><Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Zware incidenten en opvolging</Typography><Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Drill-down naar het dossier; bronregistratie blijft in Zilliz</Typography></Box>
        <Divider />
        <TableContainer><Table size="small" sx={{ minWidth: 760 }}><TableHead><TableRow>{['Datum', 'Dossier', 'Locatie', 'Categorie', 'Maatregel', 'Herstel'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{heavy.map((item) => <TableRow key={item.id} hover>
            <TableCell>{new Date(item.date).toLocaleDateString('nl-NL')}</TableCell>
            <TableCell><Typography component={RouterLink} to={`/jongeren/${item.clientCode}`} sx={{ fontSize: 11, fontWeight: 750, color: '#376b95', textDecoration: 'none' }}>{item.clientCode}</Typography></TableCell>
            <TableCell>{item.location}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.measure}</TableCell>
            <TableCell><Chip label={item.recoveryCompleted ? 'Afgerond' : 'Open'} size="small" sx={{ height: 21, fontSize: 10, bgcolor: item.recoveryCompleted ? '#eaf6f1' : '#fff3e5', color: item.recoveryCompleted ? '#28745d' : '#925b1d' }} /></TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer>
      </Box>

      <Typography sx={{ fontSize: 10.5, color: '#8a98a6' }}>Bron: fictieve Zilliz-synchronisatie · peildatum 28 juli 2026 · incidentniveau, alleen-lezen.</Typography>
    </Stack>
  )
}

export default GedragAnalysePage
