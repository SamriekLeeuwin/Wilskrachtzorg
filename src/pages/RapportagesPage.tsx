import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
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
  Typography,
} from '@mui/material'

type RapportRow = {
  id: string
  jaar: string
  locatie: 'Tilburg' | 'Breda'
  begeleider: string
  uitstroomTotaal: number
  succesvolPct: number
  doorverwezenPct: number
  werkOfSchoolPct: number
}

const rapportRows: RapportRow[] = [
  {
    id: 'R-001',
    jaar: '2025',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    uitstroomTotaal: 14,
    succesvolPct: 78,
    doorverwezenPct: 22,
    werkOfSchoolPct: 71,
  },
  {
    id: 'R-002',
    jaar: '2025',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    uitstroomTotaal: 10,
    succesvolPct: 67,
    doorverwezenPct: 30,
    werkOfSchoolPct: 63,
  },
  {
    id: 'R-003',
    jaar: '2024',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    uitstroomTotaal: 12,
    succesvolPct: 62,
    doorverwezenPct: 35,
    werkOfSchoolPct: 58,
  },
]

function RapportagesPage() {
  const [jaarFilter, setJaarFilter] = useState<'Alle' | '2025' | '2024'>('Alle')
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')
  const [begeleiderFilter, setBegeleiderFilter] = useState<'Alle' | 'N. Janssen' | 'S. Vermeer' | 'A. de Wit'>('Alle')
  const [exportMessage, setExportMessage] = useState('')

  const filteredRows = useMemo(() => {
    return rapportRows.filter((row) => {
      const matchesYear = jaarFilter === 'Alle' || row.jaar === jaarFilter
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      const matchesBegeleider = begeleiderFilter === 'Alle' || row.begeleider === begeleiderFilter
      return matchesYear && matchesLocatie && matchesBegeleider
    })
  }, [jaarFilter, locatieFilter, begeleiderFilter])

  const totaalUitstroom = filteredRows.reduce((sum, row) => sum + row.uitstroomTotaal, 0)
  const gemiddeldSucces =
    filteredRows.length > 0 ? Math.round(filteredRows.reduce((sum, row) => sum + row.succesvolPct, 0) / filteredRows.length) : 0

  const handleExport = () => {
    const timestamp = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    setExportMessage(`Mock export gestart om ${timestamp} (CSV/PDF volgt in backend-fase).`)
  }

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Rapportages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
            Filter op jaar, locatie en begeleider.
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="jaar-filter-label">Jaar</InputLabel>
                <Select labelId="jaar-filter-label" value={jaarFilter} label="Jaar" onChange={(event) => setJaarFilter(event.target.value as 'Alle' | '2025' | '2024')}>
                  <MenuItem value="Alle">Alle jaren</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="locatie-filter-label">Locatie</InputLabel>
                <Select labelId="locatie-filter-label" value={locatieFilter} label="Locatie" onChange={(event) => setLocatieFilter(event.target.value as 'Alle' | 'Tilburg' | 'Breda')}>
                  <MenuItem value="Alle">Alle locaties</MenuItem>
                  <MenuItem value="Tilburg">Tilburg</MenuItem>
                  <MenuItem value="Breda">Breda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="begeleider-filter-label">Begeleider</InputLabel>
                <Select
                  labelId="begeleider-filter-label"
                  value={begeleiderFilter}
                  label="Begeleider"
                  onChange={(event) => setBegeleiderFilter(event.target.value as 'Alle' | 'N. Janssen' | 'S. Vermeer' | 'A. de Wit')}
                >
                  <MenuItem value="Alle">Alle begeleiders</MenuItem>
                  <MenuItem value="N. Janssen">N. Janssen</MenuItem>
                  <MenuItem value="S. Vermeer">S. Vermeer</MenuItem>
                  <MenuItem value="A. de Wit">A. de Wit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button variant="contained" onClick={handleExport} sx={{ height: '100%', minHeight: 40 }}>
                Export
              </Button>
            </Grid>
          </Grid>

          {exportMessage && <Alert severity="info" sx={{ mb: 1.25 }}>{exportMessage}</Alert>}

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Totaal uitstroom (selectie)
                  </Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'primary.main' }}>{totaalUitstroom}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Gemiddeld succespercentage
                  </Typography>
                  <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'primary.main' }}>{gemiddeldSucces}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Jaar</TableCell>
                  <TableCell>Locatie</TableCell>
                  <TableCell>Begeleider</TableCell>
                  <TableCell>Uitstroom</TableCell>
                  <TableCell>Succes %</TableCell>
                  <TableCell>Doorverwezen %</TableCell>
                  <TableCell>Werk/School %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.jaar}</TableCell>
                    <TableCell>{row.locatie}</TableCell>
                    <TableCell>{row.begeleider}</TableCell>
                    <TableCell>{row.uitstroomTotaal}</TableCell>
                    <TableCell>{row.succesvolPct}%</TableCell>
                    <TableCell>{row.doorverwezenPct}%</TableCell>
                    <TableCell>{row.werkOfSchoolPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default RapportagesPage
