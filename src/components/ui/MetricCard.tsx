import { Card, CardContent, Typography } from '@mui/material'

type MetricCardProps = {
  label: string
  value: string | number
  emphasize?: boolean
}

function MetricCard({ label, value, emphasize = false }: MetricCardProps) {
  return (
    <Card sx={{ bgcolor: emphasize ? '#fff7f7' : '#fcfdff', border: emphasize ? '2px solid #fecaca' : undefined }}>
      <CardContent sx={{ p: 1.75 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: emphasize ? 28 : 24, fontWeight: 700, mt: 0.3, color: emphasize ? '#b91c1c' : '#0f172a' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default MetricCard
