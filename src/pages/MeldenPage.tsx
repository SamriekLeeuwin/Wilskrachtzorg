import { useState } from 'react'
import { Alert, Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import { loadReports, loadTrajectories, saveReports } from '../data/demoStore'

type Report = {
  id: string
  kind: 'Veiligheidsincident' | 'Zorginhoudelijk signaal' | 'Datacorrectie'
  clientCode: string
  subject: string
  description: string
  owner: string
  urgency: 'Vandaag' | 'Deze week'
  status: 'Nieuw'
  createdAt: string
}

export default function MeldenPage() {
  const trajectories = loadTrajectories().filter((item) => !item.endDate)
  const [reports, setReports] = useState<Report[]>(() => loadReports([]))
  const [values, setValues] = useState({ kind: 'Zorginhoudelijk signaal' as Report['kind'], clientCode: '', subject: '', description: '', owner: '', urgency: 'Vandaag' as Report['urgency'] })
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)
  const valid = Boolean(values.clientCode && values.subject.trim() && values.description.trim() && values.owner)
  const chooseClient = (clientCode: string) => {
    const row = trajectories.find((item) => item.clientCode === clientCode)
    setValues({ ...values, clientCode, owner: row?.supervisor ?? '' })
  }
  const save = () => {
    setSubmitted(true)
    if (!valid) return
    const report: Report = { ...values, id: `M-${reports.length + 1}`, subject: values.subject.trim(), description: values.description.trim(), status: 'Nieuw', createdAt: new Date().toISOString() }
    const next = [report, ...reports]
    setReports(next); saveReports(next); setSaved(true); setSubmitted(false)
    setValues({ kind: 'Zorginhoudelijk signaal', clientCode: '', subject: '', description: '', owner: '', urgency: 'Vandaag' })
  }
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Iets melden</Typography>
        <Typography sx={{ mt: .4, maxWidth: 800, fontSize: 11.2, lineHeight: 1.6, color: '#718395' }}>Kies eerst wat je meldt. Zo komt een veiligheidsincident niet terecht in dezelfde stroom als een datacorrectie.</Typography>
      </Box>
      <Alert severity="info">Prototype: meldingen worden lokaal opgeslagen. Voor productie moet een veiligheidsincident rechtstreeks en aantoonbaar met Zilliz en de geldende escalatieprocedure worden gekoppeld.</Alert>
      {saved && <Alert severity="success" onClose={() => setSaved(false)}>De melding is vastgelegd en toegewezen.</Alert>}
      {submitted && !valid && <Alert severity="warning">Kies een dossier en vul onderwerp, beschrijving en eigenaar in.</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5 }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>1. Wat wil je melden?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
              {(['Veiligheidsincident', 'Zorginhoudelijk signaal', 'Datacorrectie'] as const).map((kind) => <Button key={kind} variant={values.kind === kind ? 'contained' : 'outlined'} onClick={() => setValues({ ...values, kind })}>{kind}</Button>)}
            </Box>
          </Box>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>2. Dossier en inhoud</Typography>
            <Stack spacing={1.7}>
              <TextField select required label="Jongere / dossier" value={values.clientCode} onChange={(event) => chooseClient(event.target.value)}>{trajectories.map((item) => <MenuItem key={item.id} value={item.clientCode}>{item.clientCode} · {item.location} · {item.supervisor}</MenuItem>)}</TextField>
              <TextField required label="Kort onderwerp" value={values.subject} onChange={(event) => setValues({ ...values, subject: event.target.value })} />
              <TextField required multiline minRows={4} label={values.kind === 'Datacorrectie' ? 'Wat staat er en wat moet correct zijn?' : 'Wat is er waargenomen?'} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} helperText="Noteer feiten en vermijd onnodige persoonsgegevens." />
            </Stack>
          </Box>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>3. Opvolging</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField select required label="Eigenaar" value={values.owner} onChange={(event) => setValues({ ...values, owner: event.target.value })}>{Array.from(new Set(trajectories.map((item) => item.supervisor))).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              <TextField select label="Urgentie" value={values.urgency} onChange={(event) => setValues({ ...values, urgency: event.target.value as Report['urgency'] })}><MenuItem value="Vandaag">Vandaag</MenuItem><MenuItem value="Deze week">Deze week</MenuItem></TextField>
            </Box>
          </Box>
        </Stack>
        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, alignSelf: 'start' }}>
          <CampaignRoundedIcon sx={{ color: '#4f7899' }} />
          <Typography sx={{ mt: .7, fontSize: 13.5, fontWeight: 770 }}>Controle</Typography>
          <Typography sx={{ mt: 1, fontSize: 10.7 }}>{values.kind}</Typography>
          <Typography sx={{ mt: .5, fontSize: 10.7 }}>{values.clientCode || 'Geen dossier gekozen'}</Typography>
          <Typography sx={{ mt: .5, fontSize: 10.7 }}>{values.owner || 'Geen eigenaar'} · {values.urgency}</Typography>
          <Divider sx={{ my: 1.6 }} />
          <Button fullWidth size="large" variant="contained" onClick={save}>Melding vastleggen</Button>
          {reports.length > 0 && <><Divider sx={{ my: 1.7 }} /><Typography sx={{ fontSize: 10.5, fontWeight: 750 }}>Recente meldingen</Typography>{reports.slice(0, 3).map((item) => <Box key={item.id} sx={{ mt: 1 }}><Chip size="small" label={item.kind} /><Typography sx={{ mt: .3, fontSize: 9.8 }}>{item.clientCode} · {item.subject}</Typography></Box>)}</>}
        </Box>
      </Box>
    </Stack>
  )
}
