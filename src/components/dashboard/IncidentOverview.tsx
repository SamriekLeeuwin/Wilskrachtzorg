import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import type { IncidentCategory } from '../../types/dashboard'

type IncidentOverviewProps = {
  categories: IncidentCategory[]
  totalThisPeriod: number
  totalPreviousPeriod: number
}

function SeverityDot({ severity }: { severity: IncidentCategory['severity'] }) {
  const colors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  }
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: colors[severity],
        flexShrink: 0,
      }}
    />
  )
}

function TrendIndicator({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUpIcon sx={{ fontSize: 14, color: '#dc2626' }} />
  if (trend < 0) return <TrendingDownIcon sx={{ fontSize: 14, color: '#059669' }} />
  return <TrendingFlatIcon sx={{ fontSize: 14, color: '#8a93a3' }} />
}

export default function IncidentOverview({ categories, totalThisPeriod, totalPreviousPeriod }: IncidentOverviewProps) {
  const maxCount = Math.max(...categories.map((c) => c.count))
  const delta = totalThisPeriod - totalPreviousPeriod

  return (
    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
              Incidenten per categorie
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Gedragsincidenten volgens het pedagogisch beleid
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#07346a', lineHeight: 1 }}>
              {totalThisPeriod}
            </Typography>
            <Stack alignItems="center" spacing={0.25}>
              <TrendIndicator trend={delta} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: delta > 0 ? '#dc2626' : delta < 0 ? '#059669' : '#8a93a3',
                }}
              >
                {delta > 0 ? '+' : ''}{delta}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Categories with bars */}
        <Stack spacing={2}>
          {categories.map((cat) => {
            const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
            return (
              <Box key={cat.category}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SeverityDot severity={cat.severity} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {cat.category}
                    </Typography>
                    <Chip
                      size="small"
                      label={cat.severity === 'high' ? 'Hoog' : cat.severity === 'medium' ? 'Middel' : 'Laag'}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor:
                          cat.severity === 'high'
                            ? '#fef2f2'
                            : cat.severity === 'medium'
                            ? '#fffbeb'
                            : '#f0fdf4',
                        color:
                          cat.severity === 'high'
                            ? '#dc2626'
                            : cat.severity === 'medium'
                            ? '#f59e0b'
                            : '#22c55e',
                        borderRadius: 1,
                      }}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                      {cat.count}
                    </Typography>
                    <TrendIndicator trend={cat.trend} />
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ flex: 1, height: 10, bgcolor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${pct}%`,
                        height: '100%',
                        bgcolor:
                          cat.severity === 'high'
                            ? '#ef4444'
                            : cat.severity === 'medium'
                            ? '#f59e0b'
                            : '#22c55e',
                        borderRadius: 999,
                        transition: 'width 600ms ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8a93a3', minWidth: 32, textAlign: 'right' }}>
                    {Math.round((cat.count / totalThisPeriod) * 100)}%
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Stack>
      </CardContent>
    </Card>
  )
}
