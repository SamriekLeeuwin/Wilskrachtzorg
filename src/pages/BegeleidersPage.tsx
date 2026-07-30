import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  TableRow,
  TableCell,
} from '@mui/material'
import SectionCard from '../components/ui/SectionCard'
import StyledTable from '../components/ui/StyledTable'

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [locatie, setLocatie] = useState<'Tilburg' | 'Breda'>('Tilburg')
  const [actief, setActief] = useState(true)
  const [formError, setFormError] = useState('')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      const matchesStatus = statusFilter === 'Alle' || (statusFilter === 'Actief' && row.actief) || (statusFilter === 'Inactief' && !row.actief)
      return matchesLocatie && matchesStatus
    })
  }, [rows, locatieFilter, statusFilter])

  const hasActiveFilters = locatieFilter !== 'Alle' || statusFilter !== 'Alle'

  const resetFilters = () => {
    setLocatieFilter('Alle')
    setStatusFilter('Alle')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!naam || !email) {
      setFormError('Vul naam en e-mailadres in.')
      return
    }
    const newRow: BegeleiderRow = { id: `B-${String(rows.length + 1).padStart(3, '0')}`, naam, email, locatie, actief }
    setRows((prev) => [newRow, ...prev])
    setNaam('')
    setEmail('')
    setLocatie('Tilburg')
    setActief(true)
    setFormError('')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionCard
        title="Begeleiders"
        subtitle={`${filteredRows.length} van ${rows.length} begeleiders gevonden`}
        action={
          <Button variant="outlined" size="small" onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset filters
          </Button>
        }
      >
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Locatie</InputLabel>
              <Select value={locatieFilter} label="Locatie" onChange={(e) => setLocatieFilter(e.target.value as 'Alle' | 'Tilburg' | 'Breda')}>
                <MenuItem value="Alle">Alle locaties</MenuItem>
                <MenuItem value="Tilburg">Tilburg</MenuItem>
                <MenuItem value="Breda">Breda</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as 'Alle' | 'Actief' | 'Inactief')}>
                <MenuItem value="Alle">Alle statussen</MenuItem>
                <MenuItem value="Actief">Actief</MenuItem>
                <MenuItem value="Inactief">Inactief</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button variant="text" size="small" onClick={() => setShowAdvancedFilters((p) => !p)} sx={{ height: '100%' }}>
              {showAdvancedFilters ? 'Minder filters' : 'Meer filters'}
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showAdvancedFilters}>
          <Box sx={{ mb: 2 }}>
            <Button variant="text" size="small" onClick={() => setShowAdvancedFilters(false)}>
              Filters verbergen
            </Button>
          </Box>
        </Collapse>

        <StyledTable headers={['ID', 'Naam', 'E-mail', 'Locatie', 'Status']} empty={filteredRows.length === 0}>
          {filteredRows.map((row) => (
            <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#334155' }}>{row.id}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a' }}>{row.naam}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                <Link href={`mailto:${row.email}`} underline="hover" sx={{ fontSize: '0.82rem' }}>{row.email}</Link>
              </TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#334155' }}>{row.locatie}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                <Chip
                  size="small"
                  label={row.actief ? 'Actief' : 'Inactief'}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: row.actief ? '#ecfdf5' : '#f1f5f9',
                    color: row.actief ? '#059669' : '#64748b',
                    border: `1px solid ${row.actief ? '#b9f0d1' : '#e2e8f0'}`,
                    borderRadius: 1,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>
      </SectionCard>

      <SectionCard title="Nieuwe begeleider toevoegen">
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField size="small" fullWidth label="Naam" value={naam} onChange={(e) => setNaam(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField size="small" fullWidth type="email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Locatie</InputLabel>
                <Select value={locatie} label="Locatie" onChange={(e) => setLocatie(e.target.value as 'Tilburg' | 'Breda')}>
                  <MenuItem value="Tilburg">Tilburg</MenuItem>
                  <MenuItem value="Breda">Breda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControlLabel control={<Checkbox checked={actief} onChange={(e) => setActief(e.target.checked)} />} label="Actief" sx={{ height: '100%', m: 0 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button type="submit" variant="contained">Toevoegen</Button>
            </Grid>
          </Grid>
        </Box>
      </SectionCard>
    </Box>
  )
}

export default BegeleidersPage
