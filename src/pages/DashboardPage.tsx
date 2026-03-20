import {
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

type KpiItem = {
  title: string
  value: string
  delta: string
  trend: 'positive' | 'negative'
}

const kpis: KpiItem[] = [
  { title: 'Actieve Jongeren', value: '34', delta: '+4 t.o.v. vorige maand', trend: 'positive' },
  { title: 'Uitstroom dit jaar', value: '18', delta: '+2 sinds vorige kwartaal', trend: 'positive' },
  { title: 'Succespercentage', value: '72%', delta: '+6% op jaarbasis', trend: 'positive' },
  { title: 'Gem. Trajectduur', value: '8.4 mnd', delta: '-0.8 mnd verbetering', trend: 'positive' },
]

const trendData = [
  { year: 2022, value: 58 },
  { year: 2023, value: 64 },
  { year: 2024, value: 69 },
  { year: 2025, value: 72 },
]

const outflowRows = [
  {
    jongere: 'Client-001',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    woonstatus: 'Studio',
    status: 'Succesvol',
  },
  {
    jongere: 'Client-002',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    woonstatus: 'Terug naar ouders',
    status: 'Doorverwezen',
  },
  {
    jongere: 'Client-003',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    woonstatus: 'Kamer',
    status: 'Succesvol',
  },
]

function DashboardPage() {
  return (
    <Stack spacing={2.5}>
      <Grid container spacing={1.25}>
        {kpis.map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', bgcolor: '#fff' }}>
              <CardContent sx={{ p: 1.75 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  {kpi.title}
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 0.3 }}>{kpi.value}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: kpi.trend === 'positive' ? '#059669' : '#dc2626', fontWeight: 600 }}
                >
                  {kpi.delta}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
                Succestrend per jaar
              </Typography>
              <Stack spacing={1.1}>
                {trendData.map((point) => (
                  <Box key={point.year}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {point.year}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {point.value}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 8, borderRadius: 999, bgcolor: '#eef2f7', overflow: 'hidden' }}>
                      <Box sx={{ width: `${point.value}%`, height: '100%', bgcolor: 'primary.main' }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
                Verdeling woonstatus
              </Typography>
              <Stack spacing={0.9}>
                {[
                  { label: 'Studio', value: 42 },
                  { label: 'Kamer', value: 24 },
                  { label: 'Terug naar ouders', value: 20 },
                  { label: 'Crisisopvang', value: 14 },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
            Recente uitstroomregistraties
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Jongere</TableCell>
                  <TableCell>Locatie</TableCell>
                  <TableCell>Begeleider</TableCell>
                  <TableCell>Woonstatus</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outflowRows.map((row) => (
                  <TableRow key={row.jongere} hover>
                    <TableCell>{row.jongere}</TableCell>
                    <TableCell>{row.locatie}</TableCell>
                    <TableCell>{row.begeleider}</TableCell>
                    <TableCell>{row.woonstatus}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={row.status === 'Succesvol' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default DashboardPage
