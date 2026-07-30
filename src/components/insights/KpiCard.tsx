import { Box, Chip, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string
  context: string
  icon: ReactNode
  tone?: 'blue' | 'green' | 'amber' | 'red'
  benchmark?: string
}

const tones = {
  blue: { color: '#1b5c96', bg: '#eaf3fb' },
  green: { color: '#24745d', bg: '#eaf6f1' },
  amber: { color: '#a46324', bg: '#fbf2e7' },
  red: { color: '#a94f42', bg: '#fbecea' },
}

export default function KpiCard({ label, value, context, icon, tone = 'blue', benchmark }: Props) {
  const palette = tones[tone]
  return (
    <Box sx={{ p: 2.25, border: '1px solid #e3e9ef', borderRadius: 2.5, bgcolor: '#fff', minHeight: 142 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#65788c' }}>{label}</Typography>
          {benchmark && <Chip label={benchmark} size="small" sx={{ mt: .7, height: 19, bgcolor: palette.bg, color: palette.color, fontSize: 9.2 }} />}
        </Box>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: palette.bg, color: palette.color, display: 'grid', placeItems: 'center', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      </Stack>
      <Typography sx={{ mt: 1.3, fontSize: 27, lineHeight: 1.15, letterSpacing: '-.035em', fontWeight: 780, color: '#152a40' }}>{value}</Typography>
      <Typography sx={{ mt: .65, fontSize: 10.8, lineHeight: 1.45, color: '#8593a3' }}>{context}</Typography>
    </Box>
  )
}
