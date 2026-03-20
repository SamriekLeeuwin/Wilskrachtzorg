import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import {
  Card,
  CardContent,
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
  {
    name: 'Stabilisatie',
    order: 1,
    activeYouth: 12,
    completedYouth: 8,
    incidentCount: 24,
    successRate: 67,
    avgDuration: 95,
  },
  {
    name: 'Verantwoordelijkheid',
    order: 2,
    activeYouth: 8,
    completedYouth: 14,
    incidentCount: 18,
    successRate: 76,
    avgDuration: 120,
  },
  {
    name: 'Onafhankelijkheid',
    order: 3,
    activeYouth: 5,
    completedYouth: 18,
    incidentCount: 12,
    successRate: 82,
    avgDuration: 100,
  },
  {
    name: 'Voorbereiding uitstroom',
    order: 4,
    activeYouth: 2,
    completedYouth: 12,
    incidentCount: 6,
    successRate: 92,
    avgDuration: 60,
  },
]

const COLORS = ['#07346a', '#1d4ed8', '#059669', '#f97316']

function FaseOverzichtPage() {
  const youthPerPhase = useMemo(
    () => mockPhaseData.map((p) => ({ name: p.name, active: p.activeYouth, completed: p.completedYouth })),
    []
  )

  const incidentTrend = useMemo(
    () => mockPhaseData.map((p) => ({ phase: p.name, incidents: p.incidentCount })),
    []
  )

  const successRatio = useMemo(
    () => mockPhaseData.map((p) => ({ name: p.name, value: p.successRate })),
    []
  )

  const totals = useMemo(() => {
    const activeTotal = mockPhaseData.reduce((sum, p) => sum + p.activeYouth, 0)
    const completedTotal = mockPhaseData.reduce((sum, p) => sum + p.completedYouth, 0)
    const totalIncidents = mockPhaseData.reduce((sum, p) => sum + p.incidentCount, 0)
    const avgSucces = Math.round(mockPhaseData.reduce((sum, p) => sum + p.successRate, 0) / mockPhaseData.length)

    return { activeTotal, completedTotal, totalIncidents, avgSucces }
  }, [])

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}>
            Fase Overzicht KPI's
          </Typography>
          <Grid container spacing={1.25}>
            <Grid size={{ xs: 6, md: 3 }}><Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Actieve Jongeren</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: 'primary.main' }}>{totals.activeTotal}</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Afgeronde Fases</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: '#059669' }}>{totals.completedTotal}</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Totale Incidenten</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: '#dc2626' }}>{totals.totalIncidents}</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Gem. Succesrate</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: 'secondary.main' }}>{totals.avgSucces}%</Typography></CardContent></Card></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>Jongeren per Fase</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={youthPerPhase} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="2 8" stroke="#e9eef5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} labelStyle={{ color: '#334155', fontWeight: 600 }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="active" fill="#07346a" radius={[8, 8, 0, 0]} name="Actief" />
                  <Bar dataKey="completed" fill="#059669" radius={[8, 8, 0, 0]} name="Afgerond" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>Incidenten per Fase</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incidentTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="2 8" stroke="#e9eef5" />
                  <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} labelStyle={{ color: '#334155', fontWeight: 600 }} />
                  <Line type="monotone" dataKey="incidents" stroke="#1d4ed8" strokeWidth={3.5} dot={{ r: 3, fill: '#1d4ed8', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>Succesrate per Fase (%)</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successRatio}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => `${props.name}: ${props.value}%`}
                outerRadius={100}
                innerRadius={54}
                paddingAngle={2}
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>Fase Details</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fase</TableCell>
                  <TableCell>Actief</TableCell>
                  <TableCell>Afgerond</TableCell>
                  <TableCell>Incidenten</TableCell>
                  <TableCell>Succesrate</TableCell>
                  <TableCell>Gem. Duur (dagen)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPhaseData.map((phase) => (
                  <TableRow key={phase.order} hover>
                    <TableCell>{phase.name}</TableCell>
                    <TableCell>{phase.activeYouth}</TableCell>
                    <TableCell>{phase.completedYouth}</TableCell>
                    <TableCell>{phase.incidentCount}</TableCell>
                    <TableCell>
                      <Typography component="span" sx={{ color: phase.successRate >= 75 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                        {phase.successRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>{phase.avgDuration}</TableCell>
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

export default FaseOverzichtPage
