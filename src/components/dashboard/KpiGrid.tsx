import type { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ScheduleIcon from '@mui/icons-material/Schedule'
import type { DashboardData, Metric } from '../../types/dashboard'

type KpiGridProps = {
  kpis: DashboardData['kpis']
}

type KpiItemProps = {
  label: string
  metric: Metric
  icon: ReactNode
  accent: string
}

function formatDelta(delta: number) {
  const abs = Math.abs(delta)
  const isInt = abs % 1 < 0.05 || abs % 1 > 0.95
  return `${delta > 0 ? '+' : ''}${isInt ? Math.round(abs) : abs.toFixed(1)}`
}

function KpiItem({ label, metric, icon, accent }: KpiItemProps) {
  const up = metric.delta >= 0
  const good = label === 'Gem. trajectduur' ? !up : up
  const color = good ? '#059669' : '#dc2626'
  const arrow = up ? '↑' : '↓'
  const value = typeof metric.value === 'string' ? metric.value : String(metric.value)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${accent}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '0.68rem' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.15, mt: 0.25 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: '0.72rem' }}>
          {arrow} {formatDelta(metric.delta)} vs vorige periode
        </Typography>
      </Box>
    </Box>
  )
}

function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      <KpiItem label="Actieve jongeren" metric={kpis.activeYouth} icon={<GroupIcon sx={{ fontSize: 20 }} />} accent="#07346a" />
      <KpiItem label="Uitstroom" metric={kpis.outflowYear} icon={<ExitToAppIcon sx={{ fontSize: 20 }} />} accent="#1d4ed8" />
      <KpiItem label="Succespercentage" metric={kpis.successRate} icon={<TrendingUpIcon sx={{ fontSize: 20 }} />} accent="#059669" />
      <KpiItem label="Gem. trajectduur" metric={kpis.avgDuration} icon={<ScheduleIcon sx={{ fontSize: 20 }} />} accent="#f97316" />
    </Box>
  )
}

export default KpiGrid
