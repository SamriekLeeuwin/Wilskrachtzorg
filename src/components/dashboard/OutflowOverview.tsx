import { Box, Typography } from '@mui/material'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { OutflowMonth } from '../../types/dashboard'

type OutflowOverviewProps = {
  monthly: OutflowMonth[]
  totalSuccessful: number
  totalUnsuccessful: number
  totalReferred: number
}

export default function OutflowOverview({ monthly, totalSuccessful, totalUnsuccessful, totalReferred }: OutflowOverviewProps) {
  const total = totalSuccessful + totalUnsuccessful + totalReferred
  const successRate = total > 0 ? Math.round((totalSuccessful / total) * 100) : 0

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
          Uitstroom
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: successRate >= 70 ? '#059669' : '#dc2626',
            bgcolor: successRate >= 70 ? '#ecfdf5' : '#fef2f2',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: '0.72rem',
          }}
        >
          {successRate}% succesvol
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 2 }}>
        {total} uitstromen · {totalSuccessful} succesvol · {totalUnsuccessful} niet succesvol · {totalReferred} doorverwezen
      </Typography>

      <Box sx={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="successful" name="Succesvol" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="unsuccessful" name="Niet" fill="#dc2626" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
