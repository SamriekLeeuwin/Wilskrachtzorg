import { useMemo, useState } from 'react'
import { Avatar, Box, Button, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Link as RouterLink } from 'react-router-dom'
import InsightFilters from '../components/insights/InsightFilters'
import KpiCard from '../components/insights/KpiCard'
import {
  dataCompleteness, filterTrajectories, formatMonths, getDataQualityIssues, incidents, median, monthsBetween, workItems,
  type Filters,
} from '../data/careInsights'
import { loadTrajectories, loadWorkQueue } from '../data/demoStore'

const urgencyTone = {
  Vandaag: { bg: '#fff5e8', color: '#9a5a17' },
  'Deze week': { bg: '#eef5fb', color: '#2d618f' },
  'Te laat': { bg: '#fcecea', color: '#a44539' },
}

function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const allTrajectories = useMemo(() => loadTrajectories(), [])
  const filtered = useMemo(() => filterTrajectories(filters, allTrajectories), [allTrajectories, filters])
  const active = filtered.filter((item) => !item.endDate)
  const completed = filtered.filter((item) => item.endDate)
  const completedDurations = completed.map((item) => monthsBetween(item.startDate, item.endDate!))
  const averageDuration = completedDurations.length ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length : 0
  const needsPlacement = active.filter((item) => !['Niet nodig', 'Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))
  const arranged = active.filter((item) => item.followUpPlace === 'Definitief akkoord')
  const overdue = active.filter((item) => new Date(item.expectedEndDate) < new Date('2026-07-28'))
  const qualityIssues = getDataQualityIssues(filtered)
  const completeness = dataCompleteness(filtered)
  const dashboardActions = useMemo(() => loadWorkQueue(workItems.map((item) => ({ ...item, status: 'Open' }))).filter((item) => item.status === 'Open'), [])

  const originSummary = useMemo(() => {
    const all = filtered
    return ['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((origin) => {
      const rows = all.filter((item) => item.originMunicipality === origin)
      const closed = rows.filter((item) => item.endDate)
      const durations = closed.map((item) => monthsBetween(item.startDate, item.endDate!))
      return {
        origin,
        count: rows.length,
        median: durations.length ? median(durations) : rows.reduce((sum, item) => sum + monthsBetween(item.startDate, item.endDate ?? '2026-07-28'), 0) / Math.max(rows.length, 1),
      }
    }).sort((a, b) => b.count - a.count)
  }, [filtered])
  const maxOrigin = Math.max(...originSummary.map((item) => item.count))

  return (
    <Stack spacing={2.5}>
      <InsightFilters value={filters} onChange={setFilters} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
        <KpiCard label="Actieve jongeren" value={String(active.length)} context={`${filtered.length} trajecten in de gekozen selectie`} icon={<Groups2RoundedIcon />} />
        <KpiCard label="Mediane verblijfsduur" value={formatMonths(median(completedDurations))} context={`Gemiddeld ${formatMonths(averageDuration)} · ${completed.length} afgesloten`} icon={<ScheduleRoundedIcon />} tone="green" />
        <KpiCard label="Vervolgplek definitief" value={`${arranged.length}/${active.filter((item) => item.followUpPlace !== 'Niet nodig').length}`} context={`${needsPlacement.length} jongeren nog in zoek- of wachtfase`} icon={<HomeWorkRoundedIcon />} tone="amber" />
        <KpiCard label="Boven verwachte einddatum" value={String(overdue.length)} context="Actieve trajecten die aandacht vragen" icon={<AssignmentLateRoundedIcon />} tone={overdue.length ? 'red' : 'green'} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(340px, .75fr)' }, gap: 2 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2.2 }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Acties die aandacht vragen</Typography>
              <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3 }}>Gesorteerd op urgentie · eigenaar en deadline zichtbaar</Typography>
            </Box>
            <Button component={RouterLink} to="/acties" endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ fontSize: 11.5 }}>Alle acties</Button>
          </Stack>
          <Divider />
          <Box>
            {dashboardActions.slice(0, 4).map((item, index) => {
              const tone = urgencyTone[item.urgency]
              return (
                <Stack key={item.id} direction="row" alignItems="center" spacing={1.5} sx={{ px: 2.5, py: 1.65, borderBottom: index < 3 ? '1px solid #eef1f4' : 0 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: tone.bg, color: tone.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {item.type === 'Vervolgplek' ? <HomeWorkRoundedIcon sx={{ fontSize: 17 }} /> : item.type === 'Evaluatie' ? <CheckCircleRoundedIcon sx={{ fontSize: 17 }} /> : <AssignmentLateRoundedIcon sx={{ fontSize: 17 }} />}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={.8}>
                      <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 720, color: '#21364c' }}>{item.title}</Typography>
                      <Chip label={item.type} size="small" sx={{ height: 18, bgcolor: '#f1f4f7', color: '#65778a', fontSize: 9.5 }} />
                    </Stack>
                    <Typography noWrap sx={{ mt: .25, fontSize: 10.8, color: '#8492a2' }}>
                      <Typography component={RouterLink} to={`/jongeren/${item.clientCode}`} sx={{ color: '#426f94', fontSize: 'inherit', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{item.clientCode}</Typography>
                      {' · '}{item.detail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10.8, fontWeight: 700, color: tone.color }}>{item.due}</Typography>
                    <Typography sx={{ fontSize: 10, color: '#98a3af' }}>{item.owner}</Typography>
                  </Box>
                </Stack>
              )
            })}
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 760, color: '#172c42' }}>Herkomst & verblijfsduur</Typography>
          <Typography sx={{ fontSize: 11, color: '#8492a2', mt: .3, mb: 2.25 }}>Trajecten per verwijzende gemeente</Typography>
          <Stack spacing={2}>
            {originSummary.map((item) => (
              <Box key={item.origin}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: .6 }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 680, color: '#3b5065' }}>{item.origin}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: '#8291a0' }}>{item.count} trajecten · {formatMonths(item.median)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(item.count / maxOrigin) * 100} sx={{ height: 7, borderRadius: 10, bgcolor: '#edf1f5', '& .MuiLinearProgress-bar': { borderRadius: 10, bgcolor: item.origin === 'Zaanstad' ? '#2e78b5' : '#80a9cc' } }} />
              </Box>
            ))}
          </Stack>
          <Button component={RouterLink} to="/rapportages" fullWidth variant="outlined" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, borderColor: '#d7e1ea', color: '#315d82', fontSize: 11.5 }}>Bekijk volledige analyse</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Doorstroom', value: `${arranged.length} plekken definitief`, detail: `${needsPlacement.length} dossiers vragen nog actie`, link: '/uitstroom-registratie' },
          { label: 'Veiligheid', value: `${incidents.filter((item) => item.measure === 'Aantekening' && item.date >= '2026-04-29' && active.some((trajectory) => trajectory.clientCode === item.clientCode)).length} actieve aantekeningen`, detail: `${incidents.filter((item) => item.recoveryRequired && !item.recoveryCompleted && active.some((trajectory) => trajectory.clientCode === item.clientCode)).length} herstelacties open`, link: '/gedrag-analyse' },
          { label: 'Datakwaliteit', value: `${completeness}% compleet`, detail: `${qualityIssues.length} controles vragen aandacht`, link: '/kpi-overzicht' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={1.5} component={RouterLink} to={item.link} sx={{ textDecoration: 'none', p: 2, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, '&:hover': { borderColor: '#b8ccdc', bgcolor: '#fbfdff' } }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#edf4fa', color: '#396d98', fontSize: 12, fontWeight: 800 }}>{item.label.slice(0, 2).toUpperCase()}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 10.5, color: '#8795a4' }}>{item.label}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 730, color: '#263c51' }}>{item.value}</Typography>
              <Typography sx={{ fontSize: 10.5, color: '#8795a4' }}>{item.detail}</Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ color: '#9aabba', fontSize: 18 }} />
          </Stack>
        ))}
      </Box>
    </Stack>
  )
}

export default DashboardPage
