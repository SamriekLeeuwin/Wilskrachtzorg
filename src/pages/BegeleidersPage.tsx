import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
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

type BegeleiderRow = {
  id: string
  naam: string
  email: string
  locatie: 'Tilburg' | 'Breda'
  actief: boolean
}

const initialRows: BegeleiderRow[] = [
  { id: 'B-001', naam: 'N. Janssen', email: 'n.janssen@wilskrachtzorg.nl', locatie: 'Tilburg', actief: true },
  { id: 'B-002', naam: 'S. Vermeer', email: 's.vermeer@wilskrachtzorg.nl', locatie: 'Breda', actief: true },
  { id: 'B-003', naam: 'A. de Wit', email: 'a.dewit@wilskrachtzorg.nl', locatie: 'Tilburg', actief: false },
]

function BegeleidersPage() {
  const [rows, setRows] = useState<BegeleiderRow[]>(initialRows)
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')
  const [statusFilter, setStatusFilter] = useState<'Alle' | 'Actief' | 'Inactief'>('Alle')

  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [locatie, setLocatie] = useState<'Tilburg' | 'Breda'>('Tilburg')
  const [actief, setActief] = useState(true)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      const matchesStatus =
        statusFilter === 'Alle' ||
        (statusFilter === 'Actief' && row.actief) ||
        (statusFilter === 'Inactief' && !row.actief)
      return matchesLocatie && matchesStatus
    })
  }, [rows, locatieFilter, statusFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!naam || !email) {
      return
    }

    const newRow: BegeleiderRow = {
      id: `B-${String(rows.length + 1).padStart(3, '0')}`,
      naam,
      email,
      locatie,
      actief,
    }

    setRows((previous) => [newRow, ...previous])
    setNaam('')
    setEmail('')
    setLocatie('Tilburg')
    setActief(true)
  }

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Begeleidersbeheer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
            Overzicht van begeleiders met locatie en status.
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(event) => setStatusFilter(event.target.value as 'Alle' | 'Actief' | 'Inactief')}
                >
                  <MenuItem value="Alle">Alle statussen</MenuItem>
                  <MenuItem value="Actief">Actief</MenuItem>
                  <MenuItem value="Inactief">Inactief</MenuItem>
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
                  <TableCell>E-mail</TableCell>
                  <TableCell>Locatie</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.naam}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.locatie}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.actief ? 'Actief' : 'Inactief'} color={row.actief ? 'success' : 'warning'} />
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
            Nieuwe begeleider toevoegen
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField size="small" label="Naam" value={naam} onChange={(event) => setNaam(event.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField size="small" type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="locatie-input-label">Locatie</InputLabel>
                  <Select
                    labelId="locatie-input-label"
                    value={locatie}
                    label="Locatie"
                    onChange={(event) => setLocatie(event.target.value as 'Tilburg' | 'Breda')}
                  >
                    <MenuItem value="Tilburg">Tilburg</MenuItem>
                    <MenuItem value="Breda">Breda</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={actief} onChange={(event) => setActief(event.target.checked)} />}
                  label="Actief"
                  sx={{ height: '100%', m: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button type="submit" variant="contained">
                  Opslaan
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default BegeleidersPage
