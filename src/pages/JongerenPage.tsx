import { useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Stack, Step, StepLabel, Stepper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { monthsBetween, type Trajectory } from '../data/careInsights'
import { loadTrajectories, saveTrajectories } from '../data/demoStore'

type Intake = {
  clientCode: string
  originCity: string
  originMunicipality: string
  startDate: string
  expectedEndDate: string
  location: string
  supervisor: string
}

const emptyIntake: Intake = {
  clientCode: '',
  originCity: '',
  originMunicipality: '',
  startDate: '',
  expectedEndDate: '',
  location: '',
  supervisor: '',
}

function JongerenPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<Trajectory[]>(loadTrajectories)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Actief')
  const [location, setLocation] = useState('Alle locaties')
  const [origin, setOrigin] = useState(searchParams.get('origin') ?? 'Alle gemeenten')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [intake, setIntake] = useState<Intake>(emptyIntake)
  const [error, setError] = useState('')

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesSearch = `${row.clientCode} ${row.originCity} ${row.supervisor}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === 'Alle trajecten' || (status === 'Actief' ? !row.endDate : Boolean(row.endDate))
    const matchesLocation = location === 'Alle locaties' || row.location === location
    const matchesOrigin = origin === 'Alle gemeenten' || row.originMunicipality === origin
    return matchesSearch && matchesStatus && matchesLocation && matchesOrigin
  }), [rows, search, status, location, origin])

  const nextStep = () => {
    if (step === 0 && (!intake.clientCode || !intake.originCity || !intake.originMunicipality)) {
      setError('Vul de cliëntcode, woonplaats en gemeente vóór instroom in.')
      return
    }
    if (step === 1 && (!intake.startDate || !intake.expectedEndDate || !intake.location || !intake.supervisor)) {
      setError('Vul alle trajectgegevens in.')
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, 2))
  }

  const saveIntake = () => {
    const newTrajectory: Trajectory = {
      id: `T-${String(rows.length + 1).padStart(3, '0')}`,
      clientCode: intake.clientCode,
      originCity: intake.originCity as Trajectory['originCity'],
      originMunicipality: intake.originMunicipality as Trajectory['originMunicipality'],
      location: intake.location as Trajectory['location'],
      startDate: intake.startDate,
      expectedEndDate: intake.expectedEndDate,
      currentPhase: 'Stabilisatie',
      supervisor: intake.supervisor,
      incidents90d: 0,
      activeNotes: 0,
      followUpPlace: 'Niet nodig',
    }
    setRows((current) => {
      const next = [newTrajectory, ...current]
      saveTrajectories(next)
      return next
    })
    setDialogOpen(false)
    setStep(0)
    setIntake(emptyIntake)
    navigate(`/jongeren/${newTrajectory.clientCode}`)
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 720, color: '#314b61' }}>{filtered.length} trajecten zichtbaar</Typography>
          <Typography sx={{ mt: .2, fontSize: 10.8, color: '#8492a2' }}>Open een jongere voor afspraken, ontwikkeling, incidenten en vervolgplek.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>Nieuwe jongere</Button>
      </Stack>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} sx={{ p: 2 }}>
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op cliëntcode, woonplaats of begeleider"
            slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#8a99a7', fontSize: 19 }} /> } }}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <FormControl size="small" sx={{ minWidth: 155 }}>
            <Select value={status} onChange={(event) => setStatus(event.target.value)} inputProps={{ 'aria-label': 'Trajectstatus' }}>
              <MenuItem value="Actief">Actieve trajecten</MenuItem>
              <MenuItem value="Afgerond">Afgeronde trajecten</MenuItem>
              <MenuItem value="Alle trajecten">Alle trajecten</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={location} onChange={(event) => setLocation(event.target.value)} inputProps={{ 'aria-label': 'Locatiefilter' }}>
              {['Alle locaties', 'Tilburg', 'Breda', 'Eindhoven'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={origin} onChange={(event) => setOrigin(event.target.value)} inputProps={{ 'aria-label': 'Herkomstgemeente' }}>
              {['Alle gemeenten', 'Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 920 }}>
            <TableHead>
              <TableRow>
                {['Jongere', 'Herkomst', 'Locatie', 'Begeleider', 'Incidenten 90 dagen', 'Verblijfsduur', 'Vervolgplek', ''].map((header) => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  tabIndex={0}
                  onClick={() => navigate(`/jongeren/${row.clientCode}`)}
                  onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/jongeren/${row.clientCode}`) }}
                  sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid #2f76ae', outlineOffset: -2 } }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#eaf2f8', color: '#356b97', fontSize: 10, fontWeight: 800 }}>{row.clientCode.slice(-2)}</Avatar>
                      <Box>
                        <Typography component={RouterLink} to={`/jongeren/${row.clientCode}`} onClick={(event) => event.stopPropagation()} sx={{ fontSize: 11.5, fontWeight: 750, color: '#27455e', textDecoration: 'none' }}>{row.clientCode}</Typography>
                        <Typography sx={{ fontSize: 9.5, color: '#8e9daa' }}>{row.endDate ? 'Afgerond' : 'Actief traject'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.originCity}<Typography sx={{ fontSize: 9.5, color: '#93a0ac' }}>{row.originMunicipality}</Typography></TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.supervisor}</TableCell>
                  <TableCell><Chip label={row.incidents90d} size="small" sx={{ height: 21, bgcolor: row.incidents90d > 0 ? '#fff3e7' : '#eaf6f1', color: row.incidents90d > 0 ? '#965b20' : '#28745d', fontSize: 9.5 }} /></TableCell>
                  <TableCell>{monthsBetween(row.startDate, row.endDate ?? '2026-07-28').toLocaleString('nl-NL', { maximumFractionDigits: 1 })} mnd</TableCell>
                  <TableCell><Chip label={row.followUpPlace} size="small" sx={{ height: 21, bgcolor: ['Definitief akkoord', 'Geplaatst'].includes(row.followUpPlace) ? '#eaf6f1' : '#f5f2ed', color: ['Definitief akkoord', 'Geplaatst'].includes(row.followUpPlace) ? '#28745d' : '#7b6955', fontSize: 9.5 }} /></TableCell>
                  <TableCell><ArrowForwardRoundedIcon sx={{ fontSize: 17, color: '#91a1af' }} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} sx={{ py: 6, textAlign: 'center', color: '#8492a2' }}>Geen trajecten gevonden. Pas de zoekterm of filters aan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>Nieuwe jongere en traject</Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>Alleen de gegevens die nodig zijn om het traject correct te starten.</Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} sx={{ pt: 1.5, pb: 3 }}>
            {['Herkomst', 'Traject', 'Controleren'].map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {step === 0 && (
            <Stack spacing={2}>
              <TextField label="Cliëntcode" value={intake.clientCode} onChange={(event) => setIntake({ ...intake, clientCode: event.target.value })} helperText="Gebruik de bestaande code uit Zilliz, geen volledige naam." autoFocus />
              <TextField label="Woonplaats vóór instroom" value={intake.originCity} onChange={(event) => setIntake({ ...intake, originCity: event.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Gemeente vóór instroom</InputLabel>
                <Select label="Gemeente vóór instroom" value={intake.originMunicipality} onChange={(event) => setIntake({ ...intake, originMunicipality: event.target.value })}>
                  {['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          )}

          {step === 1 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth type="date" label="Startdatum" value={intake.startDate} onChange={(event) => setIntake({ ...intake, startDate: event.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth type="date" label="Verwachte einddatum" value={intake.expectedEndDate} onChange={(event) => setIntake({ ...intake, expectedEndDate: event.target.value })} InputLabelProps={{ shrink: true }} />
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Startlocatie</InputLabel>
                <Select label="Startlocatie" value={intake.location} onChange={(event) => setIntake({ ...intake, location: event.target.value })}>
                  {['Tilburg', 'Breda', 'Eindhoven'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Hoofdbegeleider</InputLabel>
                <Select label="Hoofdbegeleider" value={intake.supervisor} onChange={(event) => setIntake({ ...intake, supervisor: event.target.value })}>
                  {['N. Janssen', 'S. Vermeer', 'A. de Wit', 'M. van Dijk', 'R. de Groot'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          )}

          {step === 2 && (
            <Box sx={{ border: '1px solid #e1e7ed', borderRadius: 2, overflow: 'hidden' }}>
              {[
                ['Cliëntcode', intake.clientCode],
                ['Herkomst', `${intake.originCity}, ${intake.originMunicipality}`],
                ['Trajectperiode', `${new Date(intake.startDate).toLocaleDateString('nl-NL')} – ${new Date(intake.expectedEndDate).toLocaleDateString('nl-NL')}`],
                ['Locatie', intake.location],
                ['Hoofdbegeleider', intake.supervisor],
                ['Startfase', 'Stabilisatie'],
              ].map(([label, value], index) => (
                <Stack key={label} direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.3, bgcolor: index % 2 ? '#f8fafb' : '#fff' }}>
                  <Typography sx={{ fontSize: 11, color: '#7b8b99' }}>{label}</Typography>
                  <Typography sx={{ fontSize: 11.2, fontWeight: 680, color: '#30485d', textAlign: 'right' }}>{value}</Typography>
                </Stack>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => step === 0 ? setDialogOpen(false) : setStep((current) => current - 1)}>{step === 0 ? 'Annuleren' : 'Terug'}</Button>
          <Button variant="contained" onClick={step === 2 ? saveIntake : nextStep}>{step === 2 ? 'Traject starten' : 'Volgende'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default JongerenPage
