import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  eyebrow?: string
}

function PageHeader({ title, subtitle, actions, eyebrow }: PageHeaderProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.25}>
      <Box>
        {eyebrow && (
          <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: subtitle ? 0.25 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Stack>
  )
}

export default PageHeader
