import { useMemo } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Box, Chip, Typography, TableRow, TableCell } from '@mui/material'
import SectionCard from '../components/ui/SectionCard'
import StyledTable from '../components/ui/StyledTable'

type PhaseData = {
  name: string
  order: number
  activeYouth: number
  completedYouth: number
  incidentCount: number
  successRate: number
  avgDuration: number
}

const mockPhaseData: PhaseData[] = [
  { name: 'Stabilisatie', order: 1, activeYouth: 12, completedYouth: 8, incidentCount: 24, successRate: 67, avgDuration: 95 },
  { name: 'Verantwoordelijkheid', order: 2, activeYouth: 8, completedYouth: 14, incidentCount: 18, successRate: 76, avgDuration: 120 },
  { name: 'Onafhankelijkheid', order: 3, activeYouth: 5, completedYouth: 18, incidentCount: 12, successRate: 82, avgDuration: 100 },
  { name: 'Voorbereiding uitstroom', order: 4, activeYouth: 2, completedYouth: 12, incidentCount: 6, successRate: 92, avgDuration: 60 },
]

const previousTotals = { activeTotal: 25, completedTotal: 48, totalIncidents: 66, avgSucces: 76 }

function FaseOverzichtPage() {
  const incidentPerPhase = useMemo(() => mockPhaseData.map((p) => ({ phase: p.name, incidents: p.incidentCount })), [])

  const totals = useMemo(() => {
    const activeTotal = mockPhaseData.reduce((sum, p) => sum + p.activeYouth, 0)
    const completedTotal = mockPhaseData.reduce((sum, p) => sum + p.completedYouth, 0)
    const totalIncidents = mockPhaseData.reduce((sum, p) => sum + p.incidentCount, 0)
    const avgSucces = Math.round(mockPhaseData.reduce((sum, p) => sum + p.successRate, 0) / mockPhaseData.length)
    return { activeTotal, completedTotal, totalIncidents, avgSucces }
  }, [])

  const insights = useMemo(() => {
    const highestIncidentPhase = [...mockPhaseData].sort((a, b) => b.incidentCount - a.incidentCount)[0]
    const bestPhase = [...mockPhaseData].sort((a, b) => b.successRate - a.successRate)[0]
    const earlyPhaseIncidents = mockPhaseData[0].incidentCount + mockPhaseData[1].incidentCount
    const riskSignal = earlyPhaseIncidents >= totals.totalIncidents * 0.6 ? 'Incidentdruk blijft hoog in de eerste fases.' : 'Incidentdruk is redelijk verdeeld.'
    return { highestIncidentPhase, bestPhase, riskSignal }
  }, [totals.totalIncidents])

  const deltas = useMemo(() => ({
    active: totals.activeTotal - previousTotals.activeTotal,
    completed: totals.completedTotal - previousTotals.completedTotal,
    incidents: totals.totalIncidents - previousTotals.totalIncidents,
    success: totals.avgSucces - previousTotals.avgSucces,
  }), [totals])

  const metricCards = [
    { label: 'Actieve jongeren', value: totals.activeTotal, delta: deltas.active, good: true },
    { label: 'Afgeronde fases', value: totals.completedTotal, delta: deltas.completed, good: true },
    { label: 'Totale incidenten', value: totals.totalIncidents, delta: deltas.incidents, good: false },
    { label: 'Gem. succesrate', value: `${totals.avgSucces}%`, delta: deltas.success, good: true, suffix: '%' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {metricCards.map((m) => {
          const up = m.delta >= 0
          const isGood = m.good ? up : !up
          return (
            <Box key={m.label} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2, borderLeft: '3px solid #07346a' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>{m.label}</Typography>
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', mt: 0.5 }}>{m.value}</Typography>
              <Typography variant="caption" sx={{ color: isGood ? '#059669' : '#dc2626', fontWeight: 600, fontSize: '0.72rem' }}>
                {up ? '↑' : '↓'} {m.delta > 0 ? '+' : ''}{m.delta}{m.suffix || ''} vs vorige periode
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* Insights */}
      <SectionCard title="Fase-inzichten" subtitle={insights.riskSignal}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Hoogste incidentfase</Typography>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>{insights.highestIncidentPhase.name}</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Beste fase (succes)</Typography>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>{insights.bestPhase.name}</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip size="small" label="Actie" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
              Extra begeleiding op {insights.highestIncidentPhase.name}
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Chart */}
      <SectionCard title="Incidenten per fase">
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incidentPerPhase} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="incidents" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {incidentPerPhase.map((item) => (
                  <Cell key={item.phase} fill={item.phase === insights.highestIncidentPhase.name ? '#dc2626' : '#1d4ed8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SectionCard>

      {/* Details table */}
      <SectionCard title="Fase-details">
        <StyledTable headers={['Fase', 'Actief', 'Afgerond', 'Incidenten', 'Succesrate', 'Gem. duur (dgn)']}>
          {mockPhaseData.map((phase) => (
            <TableRow key={phase.order} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a' }}>{phase.name}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{phase.activeYouth}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{phase.completedYouth}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{phase.incidentCount}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                <Typography sx={{ color: phase.successRate >= 75 ? '#059669' : '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
                  {phase.successRate}%
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{phase.avgDuration}</TableCell>
            </TableRow>
          ))}
        </StyledTable>
      </SectionCard>
    </Box>
  )
}

export default FaseOverzichtPage
