import { Box, Chip, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string
  context: string
  icon: ReactNode
  tone?: 'blue' | 'green' | 'amber' | 'red'
  benchmark?: string
  to?: string
  actionLabel?: string
}

const tones = {
  blue: { color: '#1b5c96', bg: '#eaf3fb' },
  green: { color: '#24745d', bg: '#eaf6f1' },
  amber: { color: '#a46324', bg: '#fbf2e7' },
  red: { color: '#a94f42', bg: '#fbecea' },
}

export default function KpiCard({ label, value, context, icon, tone = 'blue', benchmark, to, actionLabel = 'Bekijk onderbouwing' }: Props) {
  const palette = tones[tone]
  return (
    <Box
      component={to ? RouterLink : 'div'}
      to={to}
      aria-label={to ? `${label}: ${value}. ${actionLabel}` : undefined}
      sx={{
        display: 'block',
        p: 2.25,
        border: '1px solid #e3e9ef',
        borderRadius: 2.5,
        bgcolor: '#fff',
        minHeight: 142,
        color: 'inherit',
        textDecoration: 'none',
        ...(to ? {
          cursor: 'pointer',
          transition: 'border-color .15s ease, box-shadow .15s ease, transform .15s ease',
          '&:hover': { borderColor: '#aac4d8', boxShadow: '0 5px 16px rgba(31,72,105,.08)', transform: 'translateY(-1px)' },
          '&:focus-visible': { outline: '3px solid rgba(47,118,174,.28)', outlineOffset: 2 },
        } : {}),
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#65788c' }}>{label}</Typography>
          {benchmark && <Chip label={benchmark} size="small" sx={{ mt: .7, height: 22, bgcolor: palette.bg, color: palette.color, fontSize: 10.5 }} />}
        </Box>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: palette.bg, color: palette.color, display: 'grid', placeItems: 'center', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      </Stack>
      <Typography sx={{ mt: 1.3, fontSize: 27, lineHeight: 1.15, letterSpacing: '-.035em', fontWeight: 780, color: '#152a40' }}>{value}</Typography>
      <Typography sx={{ mt: .65, fontSize: 12, lineHeight: 1.45, color: '#65788c' }}>{context}</Typography>
      {to && (
        <Stack direction="row" spacing={.45} alignItems="center" sx={{ mt: 1.15, color: palette.color }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 760 }}>{actionLabel}</Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
        </Stack>
      )}
    </Box>
  )
}
