import {
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { DashboardData } from '../../types/dashboard'

type RecentTableProps = {
  data: DashboardData['recentActivity']
  locationOptions: string[]
  selectedLocation: string
  onLocationChange: (value: string) => void
  attentionRequiredCount: number
}

function mapStatusColor(status: DashboardData['recentActivity'][number]['status']) {
  if (status === 'Succesvol') {
    return { bg: '#ecfdf5', color: '#065f46' }
  }

  if (status === 'Aandacht vereist') {
    return { bg: '#fef2f2', color: '#991b1b' }
  }

  if (status === 'Doorverwezen') {
    return { bg: '#fff7ed', color: '#9a3412' }
  }

  return { bg: '#eff6ff', color: '#1e3a8a' }
}

function toTimelineId(value: string) {
  const match = value.match(/(\d{3})$/)
  if (match) {
    return `Y-${match[1]}`
  }
  return value
}

function RecentTable({ data, locationOptions, selectedLocation, onLocationChange, attentionRequiredCount }: RecentTableProps) {
  return (
    <Stack spacing={1.25}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Stack direction="row" spacing={0.85} alignItems="center">
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
            Recente activiteit
          </Typography>
          <Chip
            size="small"
            label={`Aandacht vereist: ${attentionRequiredCount}`}
            sx={{ bgcolor: '#fef2f2', color: '#991b1b', fontWeight: 700 }}
          />
        </Stack>

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="location-filter-label">Locatie</InputLabel>
          <Select
            labelId="location-filter-label"
            value={selectedLocation}
            label="Locatie"
            onChange={(event) => onLocationChange(event.target.value)}
          >
            <MenuItem value="all">Alle locaties</MenuItem>
            {locationOptions.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '18%' }}>Jongere</TableCell>
              <TableCell sx={{ width: '18%' }}>Locatie</TableCell>
              <TableCell sx={{ width: '22%' }}>Begeleider</TableCell>
              <TableCell sx={{ width: '22%' }}>Woonstatus</TableCell>
              <TableCell sx={{ width: '20%' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => {
              const statusStyles = mapStatusColor(row.status)
              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/jongere-timeline?y=${toTimelineId(row.id)}`} underline="hover">
                      {row.id}
                    </Link>
                  </TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.supervisor}</TableCell>
                  <TableCell>{row.housingStatus}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.status} sx={{ bgcolor: statusStyles.bg, color: statusStyles.color, fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              )
            })}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Geen activiteiten voor deze selectie.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default RecentTable