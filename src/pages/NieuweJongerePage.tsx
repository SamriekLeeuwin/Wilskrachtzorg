import { useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Divider, FormControlLabel, MenuItem, Stack,
  TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { loadTrajectories, saveTrajectories } from '../data/demoStore'
import type { Trajectory } from '../data/careInsights'

export default function NieuweJongerePage() {
  const navigate = useNavigate()
  const rows = loadTrajectories()
  const [values, setValues] = useState({
    clientCode: '', originCity: '', originMunicipality: '', referrer: '', intakeReason: '',
    startDate: '', expectedEndDate: '', location: '', supervisor: '', consentConfirmed: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const valid = Boolean(
    values.clientCode.trim() && values.originCity.trim() && values.originMunicipality &&
    values.referrer.trim() && values.intakeReason.trim() && values.startDate &&
    values.expectedEndDate && values.location && values.supervisor && values.consentConfirmed
  )
  const duplicate = rows.some((item) => item.clientCode.toLowerCase() === values.clientCode.trim().toLowerCase())

  const save = () => {
    setSubmitted(true)
    if (!valid || duplicate) return
    const trajectory: Trajectory = {
      id: `T-${String(rows.length + 1).padStart(3, '0')}`,
      clientCode: values.clientCode.trim().toUpperCase(),
      originCity: values.originCity.trim() as Trajectory['originCity'],
      originMunicipality: values.originMunicipality as Trajectory['originMunicipality'],
      location: values.location as Trajectory['location'],
      startDate: values.startDate,
      expectedEndDate: values.expectedEndDate,
      currentPhase: 'Stabilisatie',
      supervisor: values.supervisor,
      incidents90d: 0,
      activeNotes: 0,
      followUpPlace: 'Niet nodig',
      referrer: values.referrer.trim(),
      intakeReason: values.intakeReason.trim(),
      consentConfirmed: true,
    }
    saveTrajectories([trajectory, ...rows])
    navigate(`/jongeren/${trajectory.clientCode}?intake=created`)
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar jongeren</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Nieuwe jongere en traject</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>Start één controleerbaar dossier zonder persoonsgegevens te kopiëren die al in het bronsysteem staan.</Typography>
      </Box>
      {submitted && !valid && <Alert severity="warning">Vul alle verplichte intake- en trajectgegevens in en bevestig de grondslag.</Alert>}
      {duplicate && <Alert severity="error">Deze cliëntcode bestaat al. Open het bestaande dossier om dubbele registratie te voorkomen.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>1. Identificatie en herkomst</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField required label="Cliëntcode uit bronsysteem" value={values.clientCode} onChange={(event) => setValues({ ...values, clientCode: event.target.value })} helperText="Gebruik geen volledige naam." />
              <TextField required label="Woonplaats vóór instroom" value={values.originCity} onChange={(event) => setValues({ ...values, originCity: event.target.value })} />
              <TextField select required label="Gemeente vóór instroom" value={values.originMunicipality} onChange={(event) => setValues({ ...values, originMunicipality: event.target.value })}>
                {['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required label="Verwijzer / gemeente" value={values.referrer} onChange={(event) => setValues({ ...values, referrer: event.target.value })} />
            </Box>
            <TextField required fullWidth multiline minRows={3} label="Aanleiding en doel van plaatsing" value={values.intakeReason} onChange={(event) => setValues({ ...values, intakeReason: event.target.value })} sx={{ mt: 1.7 }} />
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>2. Traject en verantwoordelijkheid</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField required type="date" label="Startdatum" value={values.startDate} onChange={(event) => setValues({ ...values, startDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField required type="date" label="Verwachte einddatum" value={values.expectedEndDate} onChange={(event) => setValues({ ...values, expectedEndDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select required label="Startlocatie" value={values.location} onChange={(event) => setValues({ ...values, location: event.target.value })}>
                {['Tilburg', 'Breda', 'Eindhoven'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField select required label="Hoofdbegeleider" value={values.supervisor} onChange={(event) => setValues({ ...values, supervisor: event.target.value })}>
                {['N. Janssen', 'S. Vermeer', 'A. de Wit', 'M. van Dijk', 'R. de Groot'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760 }}>3. Controle en grondslag</Typography>
            <FormControlLabel
              control={<Checkbox checked={values.consentConfirmed} onChange={(event) => setValues({ ...values, consentConfirmed: event.target.checked })} />}
              label="Ik bevestig dat de benodigde toestemming of geldige verwerkingsgrondslag is gecontroleerd."
            />
            <Typography sx={{ ml: 4, fontSize: 9.8, color: '#8492a2' }}>In productie moet deze bevestiging worden voorzien van gebruiker, datum en bronverwijzing.</Typography>
          </Box>
        </Stack>

        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 770 }}>Controleer vóór starten</Typography>
          <Stack spacing={1.1} sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: 10.8 }}>Cliëntcode: {values.clientCode || '—'}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Locatie: {values.location || '—'}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Begeleider: {values.supervisor || '—'}</Typography>
            <Typography sx={{ fontSize: 10.8 }}>Periode: {values.startDate || '—'} tot {values.expectedEndDate || '—'}</Typography>
          </Stack>
          <Divider sx={{ my: 1.7 }} />
          <Button fullWidth size="large" variant="contained" startIcon={<PersonAddAltRoundedIcon />} onClick={save}>Dossier en traject starten</Button>
          <Button fullWidth component={RouterLink} to="/jongeren" sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
