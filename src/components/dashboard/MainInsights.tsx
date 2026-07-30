import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'

type SuccessPoint = {
  year: number
  value: number
}

type DurationPoint = {
  period: string
  value: number
}

type MainInsightsProps = {
  successTrend: SuccessPoint[]
  durationTrend?: DurationPoint[]
}

const chartHeight = 260

const SuccessTrendChart = memo(function SuccessTrendChart({ data }: { data: SuccessPoint[] }) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
          Succestrend per jaar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
          Ontwikkeling in succesvol afgeronde trajecten.
        </Typography>
        <Stack sx={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value}%`} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" fill="#07346a" radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  )
})

const DurationTrendChart = memo(function DurationTrendChart({ data }: { data: DurationPoint[] }) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
          Trajectduur trend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
          Gemiddelde trajectduur in maanden per periode.
        </Typography>
        <Stack sx={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value} mnd`} cursor={{ stroke: '#94a3b8' }} />
              <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  )
})

function InsightPanel() {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
          Inzicht
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Trajectduur fluctueert beperkt in deze periode.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Focus op instroomkwaliteit en vroegsignalering levert naar verwachting meer effect op dan extra duursturing.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

function MainInsights({ successTrend, durationTrend }: MainInsightsProps) {
  const hasDurationVariance = useMemo(() => {
    if (!durationTrend || durationTrend.length <= 1) {
      return false
    }

    const values = durationTrend.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)

    return max - min >= 0.4
  }, [durationTrend])

  const hasNegativeDeviation = useMemo(() => {
    if (successTrend.length < 2) {
      return false
    }

    const current = successTrend[successTrend.length - 1].value
    const previous = successTrend[successTrend.length - 2].value
    return current - previous <= -4
  }, [successTrend])

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={1}>
          {hasNegativeDeviation && (
            <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
              Signaal: succespercentage daalt sterk ten opzichte van vorige meetperiode.
            </Typography>
          )}
          <SuccessTrendChart data={successTrend} />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        {hasDurationVariance && durationTrend ? <DurationTrendChart data={durationTrend} /> : <InsightPanel />}
      </Grid>
    </Grid>
  )
}

export default MainInsights