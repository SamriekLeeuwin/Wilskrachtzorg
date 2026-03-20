import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/ui/MetricCard'
import SectionCard from '../components/ui/SectionCard'

type HeatmapData = {
  phase: string
  ORDER_DISTURBANCE: number
  AVOIDANCE: number
  HYGIENE: number
  AGGRESSION: number
  SUBSTANCE_USE: number
  BORDER_CROSSING: number
}

const mockHeatmapData: HeatmapData[] = [
  { phase: 'Stabilisatie', ORDER_DISTURBANCE: 8, AVOIDANCE: 6, HYGIENE: 4, AGGRESSION: 3, SUBSTANCE_USE: 2, BORDER_CROSSING: 1 },
  { phase: 'Verantwoordelijkheid', ORDER_DISTURBANCE: 5, AVOIDANCE: 3, HYGIENE: 2, AGGRESSION: 2, SUBSTANCE_USE: 1, BORDER_CROSSING: 2 },
  { phase: 'Onafhankelijkheid', ORDER_DISTURBANCE: 2, AVOIDANCE: 1, HYGIENE: 1, AGGRESSION: 1, SUBSTANCE_USE: 0, BORDER_CROSSING: 1 },
  { phase: 'Voorbereiding uitstroom', ORDER_DISTURBANCE: 1, AVOIDANCE: 0, HYGIENE: 0, AGGRESSION: 0, SUBSTANCE_USE: 0, BORDER_CROSSING: 0 },
]

const categoryLabels: Record<string, string> = {
  ORDER_DISTURBANCE: 'Ordeverzoeken',
  AVOIDANCE: 'Ontwijking',
  HYGIENE: 'Hygiene',
  AGGRESSION: 'Agressie',
  SUBSTANCE_USE: 'Middelengebruik',
  BORDER_CROSSING: 'Grensoverschrijding',
}

const categories = ['ORDER_DISTURBANCE', 'AVOIDANCE', 'HYGIENE', 'AGGRESSION', 'SUBSTANCE_USE', 'BORDER_CROSSING'] as const
const ACTIVE_YOUTH_COUNT = 34

const getHeatmapCellKey = (phase: string, category: typeof categories[number]) => `${phase}::${category}`

type Severity = 'low' | 'elevated' | 'high'

const getSeverity = (value: number, maxValue: number): Severity => {
  if (value === 0) return 'low'
  const intensity = value / maxValue
  if (intensity >= 0.85) return 'high'
  if (intensity >= 0.55) return 'elevated'
  return 'low'
}

const severityConfig: Record<Severity, { bg: string; text: string; border: string }> = {
  low: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  elevated: { bg: '#fff7ed', text: '#9a3412', border: '#fdba74' },
  high: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
}

type GedragAnalysePageProps = {
  forceDemoMode?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        p: 1.2,
        boxShadow: '0 6px 20px rgba(15,23,42,0.12)',
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: '#475569' }}>
        <Box component="span" sx={{ fontWeight: 700, color: '#b91c1c' }}>{payload[0].value}</Box> incidenten
      </Typography>
    </Box>
  )
}

function GedragAnalysePage({ forceDemoMode = false }: GedragAnalysePageProps) {
  const isDemoFromUrl = useMemo(() => {
    if (typeof window === 'undefined') return false
    const hasDemoQuery = new URLSearchParams(window.location.search).get('demo') === '1'
    const hasDemoPath = window.location.pathname.includes('/demo/gedrag-analyse')
    return hasDemoQuery || hasDemoPath || forceDemoMode
  }, [forceDemoMode])

  const [isDemoMode, setIsDemoMode] = useState(isDemoFromUrl)
  const [linkCopied, setLinkCopied] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const maxValue = useMemo(
    () => Math.max(...mockHeatmapData.flatMap((row) => categories.map((cat) => row[cat]))),
    []
  )

  const phaseStats = useMemo(() => {
    return mockHeatmapData.map((phase) => {
      const total = categories.reduce((sum, cat) => sum + phase[cat], 0)
      return { phase: phase.phase, total }
    })
  }, [])

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    categories.forEach((cat) => {
      stats[cat] = mockHeatmapData.reduce((sum, row) => sum + row[cat], 0)
    })
    return stats
  }, [])

  const insights = useMemo(() => {
    const rankedPhases = [...phaseStats].sort((a, b) => b.total - a.total)
    const highest = rankedPhases[0]
    const lowest = rankedPhases[rankedPhases.length - 1]
    const firstHalf = phaseStats.slice(0, 2).reduce((sum, item) => sum + item.total, 0)
    const secondHalf = phaseStats.slice(2).reduce((sum, item) => sum + item.total, 0)
    const trendDirection = secondHalf < firstHalf ? 'improving' : 'worsening'
    const trendPercent = firstHalf > 0 ? Math.round((Math.abs(firstHalf - secondHalf) / firstHalf) * 100) : 0
    return { highest, lowest, trendDirection, trendDelta: Math.abs(firstHalf - secondHalf), trendPercent }
  }, [phaseStats])

  const topCategories = useMemo(() => {
    return categories
      .map((cat) => ({ key: cat, label: categoryLabels[cat], total: categoryStats[cat] }))
      .sort((a, b) => b.total - a.total)
  }, [categoryStats])

  const highestRiskCategory = topCategories[0]
  const totalIncidents = phaseStats.reduce((sum, p) => sum + p.total, 0)
  const highSeverityIncidents = mockHeatmapData.reduce((sum, row) => sum + row.AGGRESSION + row.SUBSTANCE_USE, 0)
  const avgIncidentsPerYouth = ACTIVE_YOUTH_COUNT > 0 ? (totalIncidents / ACTIVE_YOUTH_COUNT).toFixed(1) : '0'

  const criticalHeatmapCells = useMemo(() => {
    const ranked = mockHeatmapData
      .flatMap((row) => categories.map((cat) => ({ phase: row.phase, category: cat, value: row[cat] })))
      .filter((cell) => cell.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    return new Set(ranked.map((cell) => getHeatmapCellKey(cell.phase, cell.category)))
  }, [])

  const selectedData = selectedPhase ? mockHeatmapData.find((d) => d.phase === selectedPhase) : null

  const shareDemoLink = () => {
    if (typeof window === 'undefined') return
    const demoUrl = `${window.location.origin}/demo/gedrag-analyse`
    navigator.clipboard.writeText(demoUrl)
      .then(() => {
        setLinkCopied(true)
        window.setTimeout(() => setLinkCopied(false), 1800)
      })
      .catch(() => setLinkCopied(false))
  }

  return (
    <Stack spacing={2}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid #1e3a5f',
          background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 60%, #1a4d7a 100%)',
          color: '#fff',
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <PageHeader
            eyebrow="Gedragsanalyse"
            title="Inzichten en Risico's"
            subtitle={`Belangrijkste inzicht: ${insights.highest.phase} vraagt directe opvolging. Risicovolste categorie: ${highestRiskCategory.label} (${highestRiskCategory.total}).`}
            actions={
              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} flexWrap="wrap">
                {isDemoMode && <Chip size="small" icon={<VisibilityRoundedIcon />} label="Demo" sx={{ bgcolor: '#78350f', color: '#fde68a' }} />}
                <Chip label="April 2025" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 }} />
                <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => setIsDemoMode((p) => !p)} sx={{ borderColor: '#93c5fd', color: '#dbeafe' }}>
                  {isDemoMode ? 'Demo aan' : 'Demo uit'}
                </Button>
                <Button size="small" variant="outlined" startIcon={<LinkRoundedIcon />} onClick={shareDemoLink} sx={{ borderColor: '#93c5fd', color: '#dbeafe' }}>
                  {linkCopied ? 'Link gekopieerd' : 'Kopieer demo-link'}
                </Button>
              </Stack>
            }
          />
        </CardContent>
      </Card>

      {isDemoMode && <Alert severity="warning">Demo weergave voor klantpresentatie: data en inzichten zijn representatief.</Alert>}

      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '2px solid #dc2626', bgcolor: '#fff7f7' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ color: '#b91c1c', fontWeight: 700 }}>Prioriteit 1</Typography>
              <Typography sx={{ fontSize: 19, fontWeight: 700, color: '#7f1d1d', mb: 1 }}>{insights.highest.phase} is huidige risicohaard</Typography>
              <Stack direction="row" spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Incidenten in fase</Typography>
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#b91c1c', lineHeight: 1 }}>{insights.highest.total}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Dominante categorie</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{highestRiskCategory.label}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ color: '#1d4ed8', fontWeight: 700 }}>Prioriteit 2</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{insights.trendDirection === 'improving' ? 'Dalende druk in latere fases' : 'Stijgende druk in latere fases'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Verschil vroege en late fases: {insights.trendDelta} incidenten ({insights.trendPercent}%).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>Overzicht cijfers</Typography>
        <Grid container spacing={1.25} sx={{ mt: 0.25 }}>
          {[
            { label: 'Totaal incidenten', value: totalIncidents },
            { label: 'Hoge ernst', value: highSeverityIncidents },
            { label: 'Gem. per jongere', value: avgIncidentsPerYouth },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 12, sm: 4 }}>
              <MetricCard label={kpi.label} value={kpi.value} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #fee2e2', bgcolor: '#fff7f7' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#7f1d1d', mb: 1 }}>Aanbevolen actie</Typography>
          <Stack spacing={1}>
            <Alert severity="error" variant="outlined">Start binnen 48 uur interventie in {insights.highest.phase} met focus op {highestRiskCategory.label.toLowerCase()}.</Alert>
            <Alert severity="warning" variant="outlined">Plan wekelijks escalatie-overleg met teamleiders en monitor trendverschil.</Alert>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Incidentverdeling per fase" subtitle="Hoogste risico in Stabilisatie fase">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fase</TableCell>
                    {categories.map((cat) => (
                      <TableCell key={cat} align="center">{categoryLabels[cat]}</TableCell>
                    ))}
                    <TableCell align="center">Totaal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockHeatmapData.map((row) => {
                    const rowTotal = phaseStats.find((p) => p.phase === row.phase)?.total ?? 0
                    const isSelected = selectedPhase === row.phase
                    return (
                      <TableRow key={row.phase} hover selected={isSelected} onClick={() => setSelectedPhase(isSelected ? null : row.phase)} sx={{ cursor: 'pointer' }}>
                        <TableCell sx={{ fontWeight: 600 }}>{row.phase}</TableCell>
                        {categories.map((cat) => {
                          const value = row[cat]
                          const severity = getSeverity(value, maxValue)
                          const cfg = severityConfig[severity]
                          const isCritical = criticalHeatmapCells.has(getHeatmapCellKey(row.phase, cat))
                          return (
                            <TableCell key={cat} align="center">
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 40,
                                  height: 30,
                                  borderRadius: 1,
                                  bgcolor: isCritical ? cfg.bg : '#f8fafc',
                                  color: isCritical ? cfg.text : '#64748b',
                                  border: `1px solid ${isCritical ? cfg.border : '#e2e8f0'}`,
                                  fontWeight: value > 0 ? 700 : 500,
                                  fontSize: 12,
                                }}
                              >
                                {value > 0 ? value : '-'}
                              </Box>
                            </TableCell>
                          )
                        })}
                        <TableCell align="center"><Chip size="small" label={rowTotal} /></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedData && (
              <Alert severity="info" sx={{ mt: 1.25 }}>
                Detail {selectedData.phase}: {categories
                  .filter((cat) => selectedData[cat] > 0)
                  .sort((a, b) => selectedData[b] - selectedData[a])
                  .map((cat) => `${categoryLabels[cat]} (${selectedData[cat]})`)
                  .join(', ')}
              </Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 0.25 }}>Focuscategorieen</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
                Top 3 categorieen op volume
              </Typography>
              <Stack spacing={0.7} sx={{ mb: 1.5 }}>
                {topCategories.slice(0, 3).map((item) => (
                  <Box key={item.key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.total}</Typography>
                  </Box>
                ))}
              </Stack>

              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>Incidenten per behandelfase</Typography>
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseStats} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
                    <XAxis dataKey="phase" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(' ')[0]} />
                    <YAxis tick={false} axisLine={false} tickLine={false} width={0} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {phaseStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.phase === insights.highest.phase ? '#b91c1c' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary">Rode balk = hoogste actuele prioriteit</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default GedragAnalysePage
