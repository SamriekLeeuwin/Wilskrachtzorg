import { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import InsightFilters from '../components/insights/InsightFilters'
import KpiCard from '../components/insights/KpiCard'
import {
  dataCompleteness, filterTrajectories, formatMonths, getDataQualityIssues, median, monthsBetween, type Filters,
} from '../data/careInsights'
import { loadTrajectories } from '../data/demoStore'

function RapportagesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const allTrajectories = useMemo(() => loadTrajectories(), [])
  const filtered = useMemo(() => filterTrajectories(filters, allTrajectories), [allTrajectories, filters])
  const completeness = dataCompleteness(filtered)
  const qualityIssues = getDataQualityIssues(filtered)
  const blockingIssues = qualityIssues.filter((issue) => issue.severity === 'Blokkerend').length

  const originRows = useMemo(() => {
    const origins = ['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'] as const
    return origins.map((origin) => {
      const rows = filtered.filter((item) => item.originMunicipality === origin)
      const closed = rows.filter((item) => item.endDate)
      const closedDurations = closed.map((item) => monthsBetween(item.startDate, item.endDate!))
      const active = rows.filter((item) => !item.endDate)
      const placementsNeeded = rows.filter((item) => item.followUpPlace !== 'Niet nodig')
      const placementArranged = placementsNeeded.filter((item) => ['Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))
      return {
        origin,
        total: rows.length,
        active: active.length,
        completed: closed.length,
        average: closedDurations.length ? closedDurations.reduce((sum, value) => sum + value, 0) / closedDurations.length : 0,
        median: median(closedDurations),
        longStay: rows.filter((item) => monthsBetween(item.startDate, item.endDate ?? '2026-07-28') > 12).length,
        placementRate: placementsNeeded.length ? Math.round((placementArranged.length / placementsNeeded.length) * 100) : 0,
      }
    }).filter((row) => row.total > 0)
  }, [filtered])

  const closedDurations = filtered.filter((item) => item.endDate).map((item) => monthsBetween(item.startDate, item.endDate!))
  const active = filtered.filter((item) => !item.endDate)
  const placementNeeded = filtered.filter((item) => item.followUpPlace !== 'Niet nodig')
  const placementArranged = placementNeeded.filter((item) => ['Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))

  const durationBands = [
    { label: '< 6 mnd', value: filtered.filter((item) => monthsBetween(item.startDate, item.endDate ?? '2026-07-28') < 6).length },
    { label: '6–9 mnd', value: filtered.filter((item) => { const value = monthsBetween(item.startDate, item.endDate ?? '2026-07-28'); return value >= 6 && value < 9 }).length },
    { label: '9–12 mnd', value: filtered.filter((item) => { const value = monthsBetween(item.startDate, item.endDate ?? '2026-07-28'); return value >= 9 && value <= 12 }).length },
    { label: '> 12 mnd', value: filtered.filter((item) => monthsBetween(item.startDate, item.endDate ?? '2026-07-28') > 12).length },
  ]

  return (
    <Stack spacing={2.5}>
      <Alert
        severity="warning"
        action={<Button component={RouterLink} to="/kpi-overzicht" size="small">Controleer data</Button>}
        sx={{ border: '1px solid #f1d6a9', borderRadius: 2.5 }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 760 }}>
          Prototypecijfers — niet extern delen
        </Typography>
        <Typography sx={{ fontSize: 11 }}>
          {completeness}% compleet · {blockingIssues} blokkerende controles · {filtered.length} trajecten in de huidige selectie
        </Typography>
      </Alert>

      <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#edf5fb', border: '1px solid #d9e8f3' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 760, color: '#214969' }}>Wat laat dit overzicht zien?</Typography>
            <Typography sx={{ mt: .35, maxWidth: 760, fontSize: 11.5, lineHeight: 1.55, color: '#567188' }}>
              Verblijfsduur wordt berekend per afgesloten traject. Voor actieve jongeren tonen we de huidige verblijfsduur apart. Gemeenten worden bepaald op basis van woonplaats vóór instroom.
            </Typography>
          </Box>
          <Chip label="Prototype · fictieve data" size="small" sx={{ bgcolor: '#fff', color: '#54728b', border: '1px solid #d5e2ec', fontSize: 10.5 }} />
        </Stack>
      </Box>

      <InsightFilters value={filters} onChange={setFilters} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
        <KpiCard label="Trajecten in selectie" value={String(filtered.length)} context={`${active.length} actief · ${filtered.length - active.length} afgesloten`} icon={<RouteRoundedIcon />} />
        <KpiCard label="Mediane verblijfsduur" value={formatMonths(median(closedDurations))} context={`Gebaseerd op ${closedDurations.length} afgesloten trajecten`} icon={<AccessTimeRoundedIcon />} tone="green" />
        <KpiCard label="Langer dan 12 maanden" value={String(filtered.filter((item) => monthsBetween(item.startDate, item.endDate ?? '2026-07-28') > 12).length)} context="Actieve en afgesloten trajecten in selectie" icon={<QueryStatsRoundedIcon />} tone="amber" />
        <KpiCard label="Vervolgplek geregeld" value={`${placementNeeded.length ? Math.round((placementArranged.length / placementNeeded.length) * 100) : 0}%`} context={`${placementArranged.length} van ${placementNeeded.length} trajecten waarbij een plek nodig is`} icon={<HomeWorkRoundedIcon />} tone="blue" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Verblijfsduur per herkomstgemeente</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Mediaan en gemiddelde van afgesloten trajecten</Typography>
          <Box sx={{ height: 270, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originRows} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#edf1f4" />
                <XAxis dataKey="origin" tick={{ fill: '#708294', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b99a7', fontSize: 10 }} axisLine={false} tickLine={false} unit=" m" />
                <Tooltip cursor={{ fill: '#f7f9fb' }} contentStyle={{ border: '1px solid #dfe6ec', borderRadius: 10, fontSize: 11 }} formatter={(value, name) => [`${Number(value).toFixed(1)} maanden`, name === 'median' ? 'Mediaan' : 'Gemiddeld']} />
                <Bar dataKey="median" fill="#2f76ae" radius={[4, 4, 0, 0]} maxBarSize={34} />
                <Bar dataKey="average" fill="#a8c5db" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Verdeling verblijfsduur</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Actieve en afgesloten trajecten · peildatum 28 juli 2026</Typography>
          <Box sx={{ height: 270, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationBands} margin={{ top: 8, right: 6, left: -28, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#edf1f4" />
                <XAxis dataKey="label" tick={{ fill: '#708294', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#8b99a7', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f7f9fb' }} contentStyle={{ border: '1px solid #dfe6ec', borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="value" name="Trajecten" fill="#5c91ba" radius={[5, 5, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Vergelijking per herkomstgemeente</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Toon altijd aantallen naast percentages om kleine groepen herkenbaar te maken</Typography>
        </Box>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {['Gemeente', 'Trajecten', 'Actief', 'Afgesloten', 'Mediaan', 'Gemiddeld', '> 12 mnd', 'Vervolgplek'].map((header) => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {originRows.map((row) => (
                <TableRow key={row.origin} hover onClick={() => navigate(`/jongeren?origin=${encodeURIComponent(row.origin)}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#274158' }}>{row.origin}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.active}</TableCell>
                  <TableCell>{row.completed}</TableCell>
                  <TableCell>{row.completed ? formatMonths(row.median) : '–'}</TableCell>
                  <TableCell>{row.completed ? formatMonths(row.average) : '–'}</TableCell>
                  <TableCell>{row.longStay}</TableCell>
                  <TableCell><Chip label={`${row.placementRate}%`} size="small" sx={{ height: 21, bgcolor: row.placementRate >= 75 ? '#eaf6f1' : '#fbf2e7', color: row.placementRate >= 75 ? '#24745d' : '#946020', fontSize: 10 }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography sx={{ fontSize: 10.5, color: '#8a98a6' }}>
        Bron: fictieve Zilliz-demodata · Peildatum 28 juli 2026 · Verblijfsduur afgesloten trajecten = uitstroomdatum minus instroomdatum.
      </Typography>
    </Stack>
  )
}

export default RapportagesPage
