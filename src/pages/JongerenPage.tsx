import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

type JongereRecord = {
  id: string
  naam: string
  startdatum: string
  einddatum: string
  locatie: string
  begeleider: string
  trajectStatus: 'Actief' | 'Afgerond'
}

const initialRows: JongereRecord[] = [
  {
    id: 'J-001',
    naam: 'Client-001',
    startdatum: '2025-02-12',
    einddatum: '',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    trajectStatus: 'Actief',
  },
  {
    id: 'J-002',
    naam: 'Client-002',
    startdatum: '2024-11-03',
    einddatum: '2025-12-14',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    trajectStatus: 'Afgerond',
  },
  {
    id: 'J-003',
    naam: 'Client-003',
    startdatum: '2025-05-19',
    einddatum: '',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    trajectStatus: 'Actief',
  },
]

function JongerenPage() {
  const [rows, setRows] = useState<JongereRecord[]>(initialRows)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Alle' | 'Actief' | 'Afgerond'>('Alle')
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')

  const [naam, setNaam] = useState('')
  const [startdatum, setStartdatum] = useState('')
  const [einddatum, setEinddatum] = useState('')
  const [locatie, setLocatie] = useState<'Tilburg' | 'Breda'>('Tilburg')
  const [begeleider, setBegeleider] = useState('')
  const [trajectStatus, setTrajectStatus] = useState<'Actief' | 'Afgerond'>('Actief')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.naam.toLowerCase().includes(searchText.toLowerCase()) || row.id.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter === 'Alle' || row.trajectStatus === statusFilter
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      return matchesSearch && matchesStatus && matchesLocatie
    })
  }, [rows, searchText, statusFilter, locatieFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!naam || !startdatum || !begeleider) {
      return
    }

    const newRow: JongereRecord = {
      id: `J-${String(rows.length + 1).padStart(3, '0')}`,
      naam,
      startdatum,
      einddatum,
      locatie,
      begeleider,
      trajectStatus,
    }

    setRows((previous) => [newRow, ...previous])
    setNaam('')
    setStartdatum('')
    setEinddatum('')
    setLocatie('Tilburg')
    setBegeleider('')
    setTrajectStatus('Actief')
  }

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Jongeren Overzicht
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
            Zoek en filter op trajectstatus en locatie.
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                size="small"
                fullWidth
                label="Zoek op client-ID of naam"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(event) => setStatusFilter(event.target.value as 'Alle' | 'Actief' | 'Afgerond')}
                >
                  <MenuItem value="Alle">Alle statussen</MenuItem>
                  <MenuItem value="Actief">Actief</MenuItem>
                  <MenuItem value="Afgerond">Afgerond</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="locatie-filter-label">Locatie</InputLabel>
                <Select
                  labelId="locatie-filter-label"
                  value={locatieFilter}
                  label="Locatie"
                  onChange={(event) => setLocatieFilter(event.target.value as 'Alle' | 'Tilburg' | 'Breda')}
                >
                  <MenuItem value="Alle">Alle locaties</MenuItem>
                  <MenuItem value="Tilburg">Tilburg</MenuItem>
                  <MenuItem value="Breda">Breda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Naam</TableCell>
                  <TableCell>Startdatum</TableCell>
                  <TableCell>Einddatum</TableCell>
                  <TableCell>Locatie</TableCell>
                  <TableCell>Begeleider</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.naam}</TableCell>
                    <TableCell>{row.startdatum}</TableCell>
                    <TableCell>{row.einddatum || '-'}</TableCell>
                    <TableCell>{row.locatie}</TableCell>
                    <TableCell>{row.begeleider}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.trajectStatus} color={row.trajectStatus === 'Actief' ? 'warning' : 'success'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
            Nieuwe jongere toevoegen
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" fullWidth label="Naam" value={naam} onChange={(event) => setNaam(event.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" fullWidth type="date" label="Startdatum" value={startdatum} onChange={(event) => setStartdatum(event.target.value)} InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" fullWidth type="date" label="Einddatum" value={einddatum} onChange={(event) => setEinddatum(event.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="locatie-input-label">Locatie</InputLabel>
                  <Select labelId="locatie-input-label" value={locatie} label="Locatie" onChange={(event) => setLocatie(event.target.value as 'Tilburg' | 'Breda')}>
                    <MenuItem value="Tilburg">Tilburg</MenuItem>
                    <MenuItem value="Breda">Breda</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" fullWidth label="Begeleider" value={begeleider} onChange={(event) => setBegeleider(event.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-input-label">Trajectstatus</InputLabel>
                  <Select
                    labelId="status-input-label"
                    value={trajectStatus}
                    label="Trajectstatus"
                    onChange={(event) => setTrajectStatus(event.target.value as 'Actief' | 'Afgerond')}
                  >
                    <MenuItem value="Actief">Actief</MenuItem>
                    <MenuItem value="Afgerond">Afgerond</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button type="submit" variant="contained">Opslaan</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default JongerenPage
