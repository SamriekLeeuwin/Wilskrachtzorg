import { Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import type { DashboardPeriod } from '../../types/dashboard'

type TopBarProps = {
  period: DashboardPeriod
  onChange: (value: DashboardPeriod) => void
  label: string
  dateRange: string
}

function TopBar({ period, onChange, label, dateRange }: TopBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={1.5}
    >
      <Stack spacing={0.25}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          Dashboard
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label} · {dateRange}
          </Typography>
          <Chip size="small" label="Manager" variant="outlined" sx={{ borderColor: '#e2e8f0', color: '#64748b', height: 20, fontSize: '0.65rem' }} />
        </Stack>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="dashboard-period-select">Periode</InputLabel>
        <Select
          labelId="dashboard-period-select"
          value={period}
          label="Periode"
          onChange={(event) => onChange(event.target.value as DashboardPeriod)}
        >
          <MenuItem value="year">Dit jaar</MenuItem>
          <MenuItem value="12m">Laatste 12 maanden</MenuItem>
          <MenuItem value="quarter">Lopend kwartaal</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  )
}

export default TopBar
