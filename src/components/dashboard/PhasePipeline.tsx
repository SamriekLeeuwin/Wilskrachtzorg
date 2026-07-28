import { Box, Typography } from '@mui/material'
import type { PhaseDistribution } from '../../types/dashboard'

type PhasePipelineProps = {
  phases: PhaseDistribution[]
}

export default function PhasePipeline({ phases }: PhasePipelineProps) {
  const totalActive = phases.reduce((sum, p) => sum + p.activeYouth, 0)

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', mb: 0.25 }}>
        Faseverdeling
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 2.5 }}>
        {totalActive} jongeren actief in traject
      </Typography>

      {/* Stacked bar */}
      <Box sx={{ display: 'flex', height: 36, borderRadius: 1.5, overflow: 'hidden', mb: 2 }}>
        {phases.map((phase) => {
          const pct = totalActive > 0 ? (phase.activeYouth / totalActive) * 100 : 0
          return (
            <Box
              key={phase.order}
              sx={{
                width: `${pct}%`,
                bgcolor: phase.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                transition: 'width 500ms ease',
                minWidth: pct > 8 ? 'auto' : 0,
              }}
            >
              {pct > 12 ? `${phase.activeYouth}` : ''}
            </Box>
          )
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, md: 2 } }}>
        {phases.map((phase) => {
          const pct = totalActive > 0 ? (phase.activeYouth / totalActive) * 100 : 0
          return (
            <Box key={phase.order} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: phase.color, flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.75rem', display: 'block' }}>
                  {phase.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8a93a3', fontSize: '0.7rem' }}>
                  {phase.activeYouth} ({pct.toFixed(0)}%) · ~{phase.avgDurationDays} dgn
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
