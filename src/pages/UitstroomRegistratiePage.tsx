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

type UitstroomRecord = {
  id: string
  jongere: string
  datum: string
  reden: string
  doorverwezen: boolean
  organisatie: string
  woonstatus: 'Studio' | 'Kamer' | 'Ouders' | 'Crisisopvang' | 'Onbekend'
  werk: boolean
  school: boolean
  succesvol: boolean
}

const initialRows: UitstroomRecord[] = [
  {
    id: 'U-001',
    jongere: 'Client-001',
    datum: '2025-12-16',
    reden: 'Doelen behaald',
    doorverwezen: false,
    organisatie: '-',
    woonstatus: 'Studio',
    werk: true,
    school: false,
    succesvol: true,
  },
  {
    id: 'U-002',
    jongere: 'Client-002',
    datum: '2025-11-02',
    reden: 'Overdracht specialistische zorg',
    doorverwezen: true,
    organisatie: 'Partnerzorg Noord',
    woonstatus: 'Ouders',
    werk: false,
    school: true,
    succesvol: false,
  },
]

function UitstroomRegistratiePage() {
  const [rows, setRows] = useState<UitstroomRecord[]>(initialRows)
  const [yearFilter, setYearFilter] = useState<'Alle' | '2025' | '2024'>('Alle')
  const [succesFilter, setSuccesFilter] = useState<'Alle' | 'Succesvol' | 'Niet succesvol'>('Alle')

  const [jongere, setJongere] = useState('')
  const [datum, setDatum] = useState('')
  const [reden, setReden] = useState('')
  const [doorverwezen, setDoorverwezen] = useState(false)
  const [organisatie, setOrganisatie] = useState('')
  const [woonstatus, setWoonstatus] = useState<UitstroomRecord['woonstatus']>('Studio')
  const [werk, setWerk] = useState(false)
  const [school, setSchool] = useState(false)
  const [succesvol, setSuccesvol] = useState(true)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesYear = yearFilter === 'Alle' || row.datum.startsWith(yearFilter)
      const matchesSucces =
        succesFilter === 'Alle' ||
        (succesFilter === 'Succesvol' && row.succesvol) ||
        (succesFilter === 'Niet succesvol' && !row.succesvol)
      return matchesYear && matchesSucces
    })
  }, [rows, yearFilter, succesFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!jongere || !datum || !reden) {
      return
    }

    const newRow: UitstroomRecord = {
      id: `U-${String(rows.length + 1).padStart(3, '0')}`,
      jongere,
      datum,
      reden,
      doorverwezen,
      organisatie: doorverwezen && organisatie ? organisatie : '-',
      woonstatus,
      werk,
      school,
      succesvol,
    }

    setRows((previous) => [newRow, ...previous])
    setJongere('')
    setDatum('')
    setReden('')
    setDoorverwezen(false)
    setOrganisatie('')
    setWoonstatus('Studio')
    setWerk(false)
    setSchool(false)
    setSuccesvol(true)
  }

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Uitstroom Registraties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
            Bekijk registraties en filter op jaar en resultaatstatus.
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="jaar-filter-label">Jaar</InputLabel>
                <Select labelId="jaar-filter-label" value={yearFilter} label="Jaar" onChange={(event) => setYearFilter(event.target.value as 'Alle' | '2025' | '2024')}>
                  <MenuItem value="Alle">Alle jaren</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="resultaat-filter-label">Resultaat</InputLabel>
                <Select
                  labelId="resultaat-filter-label"
                  value={succesFilter}
                  label="Resultaat"
                  onChange={(event) => setSuccesFilter(event.target.value as 'Alle' | 'Succesvol' | 'Niet succesvol')}
                >
                  <MenuItem value="Alle">Alle resultaten</MenuItem>
                  <MenuItem value="Succesvol">Succesvol</MenuItem>
                  <MenuItem value="Niet succesvol">Niet succesvol</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Jongere</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Reden</TableCell>
                  <TableCell>Doorverwezen</TableCell>
                  <TableCell>Organisatie</TableCell>
                  <TableCell>Woonstatus</TableCell>
                  <TableCell>Werk/School</TableCell>
                  <TableCell>Resultaat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.jongere}</TableCell>
                    <TableCell>{row.datum}</TableCell>
                    <TableCell>{row.reden}</TableCell>
                    <TableCell>{row.doorverwezen ? 'Ja' : 'Nee'}</TableCell>
                    <TableCell>{row.organisatie}</TableCell>
                    <TableCell>{row.woonstatus}</TableCell>
                    <TableCell>
                      {row.werk ? 'Werk' : ''}
                      {row.werk && row.school ? ' / ' : ''}
                      {row.school ? 'School' : ''}
                      {!row.werk && !row.school ? '-' : ''}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.succesvol ? 'Succesvol' : 'Niet succesvol'} color={row.succesvol ? 'success' : 'warning'} />
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
            Nieuwe uitstroom registreren
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" label="Jongere (Client-ID)" value={jongere} onChange={(event) => setJongere(event.target.value)} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" type="date" label="Datum" value={datum} onChange={(event) => setDatum(event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" label="Reden uitstroom" value={reden} onChange={(event) => setReden(event.target.value)} fullWidth required />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="woonstatus-input-label">Woonstatus</InputLabel>
                  <Select
                    labelId="woonstatus-input-label"
                    value={woonstatus}
                    label="Woonstatus"
                    onChange={(event) => setWoonstatus(event.target.value as UitstroomRecord['woonstatus'])}
                  >
                    <MenuItem value="Studio">Studio</MenuItem>
                    <MenuItem value="Kamer">Kamer</MenuItem>
                    <MenuItem value="Ouders">Ouders</MenuItem>
                    <MenuItem value="Crisisopvang">Crisisopvang</MenuItem>
                    <MenuItem value="Onbekend">Onbekend</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel control={<Checkbox checked={doorverwezen} onChange={(event) => setDoorverwezen(event.target.checked)} />} label="Doorverwezen" sx={{ m: 0 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" label="Doorverwijsorganisatie" value={organisatie} onChange={(event) => setOrganisatie(event.target.value)} fullWidth disabled={!doorverwezen} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel control={<Checkbox checked={werk} onChange={(event) => setWerk(event.target.checked)} />} label="Werk" sx={{ m: 0 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel control={<Checkbox checked={school} onChange={(event) => setSchool(event.target.checked)} />} label="School" sx={{ m: 0 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel control={<Checkbox checked={succesvol} onChange={(event) => setSuccesvol(event.target.checked)} />} label="Succesvol" sx={{ m: 0 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button type="submit" variant="contained">Registreren</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UitstroomRegistratiePage
