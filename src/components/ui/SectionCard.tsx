import { Card, CardContent, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.25 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export default SectionCard
