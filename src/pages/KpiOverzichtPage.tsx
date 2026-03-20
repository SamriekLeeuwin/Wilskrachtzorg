import {
  Alert,
  Box,
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
import PageHeader from '../components/ui/PageHeader'
import MetricCard from '../components/ui/MetricCard'
import SectionCard from '../components/ui/SectionCard'

type InsightCard = {
  title: string
  metric: string
  action: string
  priority?: 'high' | 'default'
}

const insightCards: InsightCard[] = [
  {
    title: 'Actie nodig · Stabilisatie',
    metric: '24 incidenten',
    action: 'Voer extra checks uit in de dagstart en avondoverdracht.',
    priority: 'high',
  },
  {
    title: 'Laagste druk · Uitstroom',
    metric: '1 incident',
    action: 'Gebruik deze aanpak als standaard voor vergelijkbare casussen.',
  },
  {
    title: 'Trend · Fase 3-4',
    metric: '18% daling',
    action: 'Borg de daling met wekelijkse teamreview op risicosignalen.',
  },
]

const kpiCards = [
  { label: 'Totaal incidenten', value: '49' },
  { label: 'Gem. per jongere', value: '1.4' },
  { label: 'Hoge ernst', value: '7' },
  { label: 'Actieve fases', value: '4' },
]

const heatmapColumns = ['Orde', 'Ontwijking', 'Hygiene', 'Agressie']

const heatmapRows = [
  { phase: 'Stabilisatie', values: [8, 6, 4, 3] },
  { phase: 'Verantwoordelijkheid', values: [5, 3, 2, 2] },
  { phase: 'Onafhankelijkheid', values: [2, 1, 1, 1] },
  { phase: 'Uitstroom', values: [1, 0, 0, 0] },
]

const maxHeatmapValue = Math.max(...heatmapRows.flatMap((row) => row.values))

const getHeatmapCellStyles = (value: number) => {
  if (value === 0) {
    return {
      bgcolor: '#f8fafc',
      color: '#94a3b8',
      opacity: 0.75,
    }
  }

  const ratio = value / maxHeatmapValue
  if (ratio >= 0.75) {
    return {
      bgcolor: '#fee2e2',
      color: '#7f1d1d',
      border: '2px solid rgba(185, 28, 28, 0.24)',
      fontWeight: 700,
    }
  }

  return {
    bgcolor: '#eff6ff',
    color: '#334155',
  }
}

function KpiOverzichtPage() {
  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="KPI Overzicht"
        subtitle="Dagelijks beslisoverzicht voor prioritering van zorgacties."
      />

      <Grid container spacing={1.5}>
        {insightCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: card.priority === 'high' ? 6 : 3 }}>
            <Card
              elevation={0}
              sx={{
                border: card.priority === 'high' ? '2px solid #b91c1c' : '1px solid #e5e7eb',
                background: card.priority === 'high'
                  ? 'linear-gradient(150deg, #fff5f5 0%, #fff 45%)'
                  : '#fff',
                minHeight: card.priority === 'high' ? 168 : 148,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: card.priority === 'high' ? '#b91c1c' : '#64748b',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: card.priority === 'high' ? 34 : 28,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: card.priority === 'high' ? '#b91c1c' : '#0f172a',
                    mt: 0.5,
                  }}
                >
                  {card.metric}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, color: '#475569' }}>
                  {card.action}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          Overzicht cijfers
        </Typography>
        <Grid container spacing={1.25} sx={{ mt: 0.25 }}>
          {kpiCards.map((card) => (
            <Grid key={card.label} size={{ xs: 6, md: 3 }}>
              <MetricCard label={card.label} value={card.value} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <SectionCard title="Waar concentreert risico zich?" subtitle="Hoogste risico in Stabilisatie fase">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fase</TableCell>
                {heatmapColumns.map((column) => (
                  <TableCell key={column} align="center">
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {heatmapRows.map((row) => (
                <TableRow key={row.phase} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.phase}</TableCell>
                  {row.values.map((value, idx) => (
                    <TableCell key={`${row.phase}-${heatmapColumns[idx]}`} align="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          minWidth: 38,
                          height: 30,
                          borderRadius: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...getHeatmapCellStyles(value),
                        }}
                      >
                        {value}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
                Aanbevolen acties
              </Typography>
              <Stack spacing={1}>
                {[
                  { phase: 'Stabilisatie', action: 'Voer dagelijks extra checks uit op ordeverzoeken.', priority: 'Hoog' },
                  { phase: 'Verantwoordelijkheid', action: 'Plan wekelijks coaching op ontwijkgedrag in.', priority: 'Midden' },
                  { phase: 'Onafhankelijkheid', action: 'Borg succesvolle interventies in teamoverdracht.', priority: 'Laag' },
                ].map((item) => (
                  <Box
                    key={item.phase}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      p: 1.25,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.phase}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.action}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={item.priority}
                      color={item.priority === 'Hoog' ? 'error' : item.priority === 'Midden' ? 'warning' : 'success'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Alert severity="info" sx={{ border: '1px solid #bfdbfe' }}>
            Richt vandaag capaciteit op Stabilisatie en monitor agressie en middelengebruik apart voor snellere escalatie.
          </Alert>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default KpiOverzichtPage