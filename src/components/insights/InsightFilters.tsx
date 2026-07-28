import { Box, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import type { Filters, LocationKey, OriginKey, PeriodKey } from '../../data/careInsights'

type Props = {
  value: Filters
  onChange: (value: Filters) => void
  compact?: boolean
}

const selectSx = {
  minWidth: 154,
  bgcolor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dfe5ec' },
  '& .MuiSelect-select': { py: 1.05, fontSize: 12.5, fontWeight: 600, color: '#30445a' },
}

export default function InsightFilters({ value, onChange, compact = false }: Props) {
  return (
    <Box sx={{ px: compact ? 0 : 2, py: compact ? 0 : 1.4, bgcolor: compact ? 'transparent' : '#fff', border: compact ? 0 : '1px solid #e4e9ef', borderRadius: 2.5 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between" gap={1.2}>
        {!compact && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarMonthRoundedIcon sx={{ color: '#67809a', fontSize: 19 }} />
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 750, color: '#21364c' }}>Rapportagefilters</Typography>
              <Typography sx={{ fontSize: 10.5, color: '#8795a5' }}>Alle cijfers reageren op deze selectie</Typography>
            </Box>
          </Stack>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <FormControl size="small" sx={selectSx}>
            <Select value={value.period} onChange={(event) => onChange({ ...value, period: event.target.value as PeriodKey })} inputProps={{ 'aria-label': 'Rapportageperiode' }}>
              <MenuItem value="12m">Laatste 12 maanden</MenuItem>
              <MenuItem value="2026">Kalenderjaar 2026</MenuItem>
              <MenuItem value="2025">Kalenderjaar 2025</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={selectSx}>
            <Select value={value.location} onChange={(event) => onChange({ ...value, location: event.target.value as LocationKey })} inputProps={{ 'aria-label': 'Locatie' }}>
              {['Alle locaties', 'Tilburg', 'Breda', 'Eindhoven'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={selectSx}>
            <Select value={value.origin} onChange={(event) => onChange({ ...value, origin: event.target.value as OriginKey })} inputProps={{ 'aria-label': 'Herkomstgemeente' }}>
              {['Alle gemeenten', 'Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  )
}
