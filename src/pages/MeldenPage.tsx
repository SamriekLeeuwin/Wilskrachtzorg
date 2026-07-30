import { useState } from 'react'
import { Alert, Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import { loadReports, loadTrajectories, loadWorkQueue, saveReports, saveWorkQueue } from '../data/demoStore'
import { workItems, type WorkItem } from '../data/careInsights'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'
import { normalizeCareReport, type CareReport, type CareReportKind } from '../data/reports'
import { useWorkspaceRole } from '../context/RoleContext'

export default function MeldenPage() {
  const { role } = useWorkspaceRole()
  const trajectories = loadTrajectories().filter((item) => !item.endDate)
  const allowedKinds: CareReportKind[] = role === 'Zorgmanager'
    ? ['Veiligheidsincident', 'Zorginhoudelijk signaal', 'Datacorrectie']
    : ['Veiligheidsincident', 'Zorginhoudelijk signaal']
  const [reports, setReports] = useState<CareReport[]>(() => loadReports<CareReport>([]).map(normalizeCareReport))
  const [values, setValues] = useState({
    kind: 'Zorginhoudelijk signaal' as CareReportKind,
    clientCode: '',
    subject: '',
    description: '',
    owner: '',
    urgency: 'Vandaag' as CareReport['urgency'],
    occurredDate: new Date().toISOString().slice(0, 10),
    occurredTime: '',
    location: '',
    immediateAction: '',
    notified: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validationNow] = useState(() => Date.now())
  useUnsavedChangesWarning(Boolean(values.clientCode || values.subject.trim() || values.description.trim() || values.owner || values.immediateAction.trim() || values.notified.trim()))
  const safetyFieldsValid = values.kind !== 'Veiligheidsincident' || Boolean(
    values.occurredDate && values.occurredTime && values.location &&
    values.immediateAction.trim() && values.notified.trim() &&
    new Date(`${values.occurredDate}T${values.occurredTime}`).getTime() <= validationNow
  )
  const valid = Boolean(allowedKinds.includes(values.kind) && values.clientCode && values.subject.trim() && values.description.trim() && values.owner && safetyFieldsValid)
  const chooseClient = (clientCode: string) => {
    const row = trajectories.find((item) => item.clientCode === clientCode)
    setValues({ ...values, clientCode, owner: row?.supervisor ?? '' })
  }
  const save = () => {
    setSubmitted(true)
    if (!valid || saving) return
    setSaving(true)
    const createdAt = new Date().toISOString()
    const report: CareReport = {
      ...values,
      id: `M-${Date.now()}`,
      subject: values.subject.trim(),
      description: values.description.trim(),
      status: 'Ter beoordeling',
      createdAt,
      createdByRole: role,
      updatedAt: createdAt,
    }
    const next = [report, ...reports]
    setReports(next)
    saveReports(next)
    if (values.kind !== 'Datacorrectie') {
      const queue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
      const followUpTask: WorkItem = {
        id: `A-${report.id}`,
        clientCode: report.clientCode,
        type: values.kind === 'Veiligheidsincident' ? 'Herstelgesprek' : 'Evaluatie',
        title: values.kind === 'Veiligheidsincident' ? `Veiligheidsmelding beoordelen: ${report.subject}` : `Zorgsignaal beoordelen: ${report.subject}`,
        detail: values.kind === 'Veiligheidsincident'
          ? `${report.description} · Directe maatregel: ${report.immediateAction}`
          : report.description,
        due: values.urgency,
        urgency: values.urgency,
        owner: values.owner,
        status: 'Open',
        policyReason: values.kind === 'Veiligheidsincident'
          ? 'Incidentprocedure: veiligheid waarborgen, verantwoordelijke informeren en herstelopvolging aantoonbaar beoordelen.'
          : 'Zorginhoudelijk signaal: beoordeling, besluit en vervolg moeten controleerbaar worden vastgelegd.',
        responsibleRoles: values.kind === 'Veiligheidsincident'
          ? ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']
          : ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'],
        sourceReportId: report.id,
        createdByRole: role,
        updatedAt: createdAt,
      }
      saveWorkQueue([followUpTask, ...queue])
    }
    setSaved(true)
    setSaving(false)
    setSubmitted(false)
    setValues({ kind: 'Zorginhoudelijk signaal', clientCode: '', subject: '', description: '', owner: '', urgency: 'Vandaag', occurredDate: new Date().toISOString().slice(0, 10), occurredTime: '', location: '', immediateAction: '', notified: '' })
  }
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Melding registreren</Typography>
        <Typography sx={{ mt: .4, maxWidth: 800, fontSize: 11.2, lineHeight: 1.6, color: '#718395' }}>Selecteer het type melding. Veiligheidsincidenten, zorginhoudelijke signalen en datacorrecties volgen ieder een afzonderlijke opvolgingsroute.</Typography>
      </Box>
      <Alert severity="info">Prototype: invoer wordt alleen lokaal op dit apparaat bewaard. Dit is geen bevestiging van registratie in Zilliz of van een formele escalatie.</Alert>
      {values.kind === 'Veiligheidsincident' && <Alert severity="warning"><strong>Acute situatie?</strong> Waarborg eerst de veiligheid en volg direct de geldende bel- en escalatieprocedure. Registreer daarna de feiten en wie is geïnformeerd.</Alert>}
      {saved && <Alert severity="success" onClose={() => setSaved(false)}>De gegevens zijn als lokaal prototypeconcept opgeslagen met status “Ter beoordeling”. Voor een zorg- of veiligheidsmelding is ook een zichtbare opvolgtaak aangemaakt. Externe registratie en verzending zijn niet uitgevoerd.</Alert>}
      {submitted && !valid && <Alert severity="warning">Kies een dossier en vul alle verplichte inhouds- en opvolgingsvelden in. Een incidentmoment mag niet in de toekomst liggen.</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5 }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>1. Type melding</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
              {allowedKinds.map((kind) => <Button key={kind} variant={values.kind === kind ? 'contained' : 'outlined'} onClick={() => setValues({ ...values, kind })}>{kind}</Button>)}
            </Box>
          </Box>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>2. Dossier en inhoud</Typography>
            <Stack spacing={1.7}>
              <TextField select required label="Jongere / dossier" value={values.clientCode} onChange={(event) => chooseClient(event.target.value)}>{trajectories.map((item) => <MenuItem key={item.id} value={item.clientCode}>{item.clientCode} · {item.location} · {item.supervisor}</MenuItem>)}</TextField>
              <TextField required label="Kort onderwerp" value={values.subject} onChange={(event) => setValues({ ...values, subject: event.target.value })} />
              <TextField required multiline minRows={4} label={values.kind === 'Datacorrectie' ? 'Wat staat er en wat moet correct zijn?' : 'Wat is er waargenomen?'} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} helperText="Noteer feiten en vermijd onnodige persoonsgegevens." />
              {values.kind === 'Veiligheidsincident' && <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
                  <TextField required type="date" label="Datum incident" value={values.occurredDate} onChange={(event) => setValues({ ...values, occurredDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField required type="time" label="Tijd incident" value={values.occurredTime} onChange={(event) => setValues({ ...values, occurredTime: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>
                <TextField required label="Locatie / situatie" value={values.location} onChange={(event) => setValues({ ...values, location: event.target.value })} />
                <TextField required multiline minRows={2} label="Direct genomen veiligheidsmaatregel" value={values.immediateAction} onChange={(event) => setValues({ ...values, immediateAction: event.target.value })} />
                <TextField required label="Wie is direct geïnformeerd?" value={values.notified} onChange={(event) => setValues({ ...values, notified: event.target.value })} helperText="Bijvoorbeeld locatieleider en gedragswetenschapper, volgens de geldende procedure." />
              </>}
            </Stack>
          </Box>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.5, fontSize: 13.5, fontWeight: 760 }}>3. Opvolging</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.7 }}>
              <TextField select required label="Taakverantwoordelijke" value={values.owner} onChange={(event) => setValues({ ...values, owner: event.target.value })}>{Array.from(new Set(trajectories.map((item) => item.supervisor))).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              <TextField select label="Urgentie" value={values.urgency} onChange={(event) => setValues({ ...values, urgency: event.target.value as CareReport['urgency'] })}><MenuItem value="Vandaag">Vandaag</MenuItem><MenuItem value="Deze week">Deze week</MenuItem></TextField>
            </Box>
          </Box>
        </Stack>
        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, alignSelf: 'start' }}>
          <CampaignRoundedIcon sx={{ color: '#4f7899' }} />
          <Typography sx={{ mt: .7, fontSize: 13.5, fontWeight: 770 }}>Controle</Typography>
          <Typography sx={{ mt: 1, fontSize: 10.7 }}>{values.kind}</Typography>
          <Typography sx={{ mt: .5, fontSize: 10.7 }}>{values.clientCode || 'Geen dossier gekozen'}</Typography>
          <Typography sx={{ mt: .5, fontSize: 10.7 }}>{values.owner || 'Geen taakverantwoordelijke'} · {values.urgency}</Typography>
          <Divider sx={{ my: 1.6 }} />
          <Button fullWidth size="large" variant="contained" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : 'Prototypeconcept opslaan'}</Button>
          {reports.length > 0 && <><Divider sx={{ my: 1.7 }} /><Typography sx={{ fontSize: 10.5, fontWeight: 750 }}>Recent vastgelegde gegevens</Typography>{reports.slice(0, 3).map((item) => <Box key={item.id} sx={{ mt: 1 }}><Chip size="small" label={item.status} /><Typography sx={{ mt: .3, fontSize: 9.8 }}>{item.clientCode} · {item.subject}</Typography></Box>)}</>}
        </Box>
      </Box>
    </Stack>
  )
}
