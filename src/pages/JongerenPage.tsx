import { useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Chip, FormControl, MenuItem, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { incidentCount90d, monthsBetween, type Trajectory } from '../data/careInsights'
import { loadTrajectories } from '../data/demoStore'
import { useWorkspaceRole } from '../context/RoleContext'

function JongerenPage() {
  const navigate = useNavigate()
  const { role } = useWorkspaceRole()
  const [searchParams] = useSearchParams()
  const requestedAction = searchParams.get('actie')
  const attentionFilter = searchParams.get('attention')
  const [rows] = useState<Trajectory[]>(loadTrajectories)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Actief')
  const [location, setLocation] = useState(searchParams.get('location') ?? 'Alle locaties')
  const [origin, setOrigin] = useState(searchParams.get('origin') ?? 'Alle gemeenten')
  const canStartIntake = role === 'Zorgmanager'
  const showClinicalColumns = true

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesSearch = `${row.clientCode} ${row.originCity} ${row.supervisor}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === 'Alle trajecten' || (status === 'Actief' ? !row.endDate : Boolean(row.endDate))
    const matchesLocation = location === 'Alle locaties' || row.location === location
    const matchesOrigin = origin === 'Alle gemeenten' || row.originMunicipality === origin
    const matchesAttention = attentionFilter !== 'overdue' || (!row.endDate && row.expectedEndDate < '2026-07-28')
    return matchesSearch && matchesStatus && matchesLocation && matchesOrigin && matchesAttention
  }), [rows, search, status, location, origin, attentionFilter])

  return (
    <Stack spacing={2.5}>
      {requestedAction && <Alert severity="info">Kies de jongere waarvoor u {requestedAction === 'afspraak' ? 'een afspraak wilt plannen of iemand wilt uitnodigen' : requestedAction === 'netwerkcontact' ? 'contact met gemeente of verwijzer wilt vastleggen' : 'dossiergegevens wilt wijzigen'}.</Alert>}
      {attentionFilter === 'overdue' && <Alert severity="warning">Dashboardselectie actief: alleen actieve trajecten boven de verwachte einddatum worden getoond. <Button component={RouterLink} to="/jongeren" size="small">Toon alle dossiers</Button></Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 720, color: '#314b61' }}>{filtered.length} trajecten zichtbaar</Typography>
          <Typography sx={{ mt: .2, fontSize: 10.8, color: '#8492a2' }}>Open een jongere voor afspraken, ontwikkeling, incidenten en vervolgplek.</Typography>
        </Box>
        {canStartIntake && <Button component={RouterLink} to="/jongeren/nieuw" variant="contained" startIcon={<AddRoundedIcon />}>Nieuwe intake</Button>}
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
                {['Jongere', 'Vóór instroom', 'Locatie', 'Begeleider', ...(showClinicalColumns ? ['Incidenten 90 dagen'] : []), 'Verblijfsduur', 'Vervolgplek', ''].map((header) => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  tabIndex={0}
                  onClick={() => navigate(requestedAction === 'afspraak' ? `/jongeren/${row.clientCode}/afspraak/nieuw` : requestedAction === 'netwerkcontact' ? `/jongeren/${row.clientCode}/netwerkcontact/nieuw` : `/jongeren/${row.clientCode}${requestedAction === 'wijzigen' ? '?edit=1' : ''}`)}
                  onKeyDown={(event) => { if (event.key === 'Enter') navigate(requestedAction === 'afspraak' ? `/jongeren/${row.clientCode}/afspraak/nieuw` : requestedAction === 'netwerkcontact' ? `/jongeren/${row.clientCode}/netwerkcontact/nieuw` : `/jongeren/${row.clientCode}${requestedAction === 'wijzigen' ? '?edit=1' : ''}`) }}
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
                  {showClinicalColumns && <TableCell><Chip label={incidentCount90d(row.clientCode)} size="small" sx={{ height: 21, bgcolor: incidentCount90d(row.clientCode) > 0 ? '#fff3e7' : '#eaf6f1', color: incidentCount90d(row.clientCode) > 0 ? '#965b20' : '#28745d', fontSize: 9.5 }} /></TableCell>}
                  <TableCell>{monthsBetween(row.startDate, row.endDate ?? '2026-07-28').toLocaleString('nl-NL', { maximumFractionDigits: 1 })} mnd</TableCell>
                  <TableCell><Chip label={row.followUpPlace} size="small" sx={{ height: 21, bgcolor: ['Definitief akkoord', 'Geplaatst'].includes(row.followUpPlace) ? '#eaf6f1' : '#f5f2ed', color: ['Definitief akkoord', 'Geplaatst'].includes(row.followUpPlace) ? '#28745d' : '#7b6955', fontSize: 9.5 }} /></TableCell>
                  <TableCell><ArrowForwardRoundedIcon sx={{ fontSize: 17, color: '#91a1af' }} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={showClinicalColumns ? 8 : 7} sx={{ py: 6, textAlign: 'center', color: '#8492a2' }}>Geen trajecten gevonden. Pas de zoekterm of filters aan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Stack>
  )
}

export default JongerenPage
