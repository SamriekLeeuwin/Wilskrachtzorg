import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'

type DistributionRow = {
  label: string
  count: number
  percentage: number
}

type DistributionSectionProps = {
  data: DistributionRow[]
}

function DistributionSection({ data }: DistributionSectionProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
          Verdeling woonstatus
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
          Spreiding van woonstatus binnen de geselecteerde periode.
        </Typography>

        <Grid container spacing={1.1}>
          {data.map((item) => (
            <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
              <Stack spacing={0.45} sx={{ p: 1.1, borderRadius: 1.5, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.percentage}%
                  </Typography>
                </Box>
                <Box sx={{ height: 8, borderRadius: 999, bgcolor: '#eef2f7', overflow: 'hidden' }}>
                  <Box sx={{ width: `${item.percentage}%`, height: '100%', bgcolor: '#07346a' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.count} jongeren
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DistributionSection