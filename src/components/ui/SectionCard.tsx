import { Card, CardContent, Typography, Box } from '@mui/material'

type SectionCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  sx?: object
}

export default function SectionCard({ title, subtitle, children, action, sx }: SectionCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, ...sx }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: subtitle || action ? 1.5 : 2, gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
        {children}
      </CardContent>
    </Card>
  )
}
