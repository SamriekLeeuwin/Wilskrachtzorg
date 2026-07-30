import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Link as RouterLink } from 'react-router-dom'
import { useWorkspaceRole } from '../context/RoleContext'
import { loadReports, saveReports } from '../data/demoStore'
import {
  normalizeCareReport, type CareReport, type CareReportStatus, type DirectorDecision, type ManagerDecision,
} from '../data/reports'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'

const statusTone: Record<CareReportStatus, { background: string; color: string }> = {
  'Ter beoordeling': { background: '#fff3e5', color: '#925b1d' },
  'Advies gereed': { background: '#edf4fa', color: '#376b95' },
  'Herbeoordeling nodig': { background: '#fbecea', color: '#a44539' },
  'Escalatie directie': { background: '#f7eafb', color: '#76438a' },
  'Besluit vastgelegd': { background: '#eaf6f1', color: '#28745d' },
}

function readReports() {
  return loadReports<CareReport>([]).map(normalizeCareReport)
}

export default function BeoordelingenPage() {
  const { role } = useWorkspaceRole()
  const [reports, setReports] = useState<CareReport[]>(readReports)
  const [selected, setSelected] = useState<CareReport | null>(null)
  const [assessment, setAssessment] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [managerDecision, setManagerDecision] = useState<ManagerDecision>('Akkoord')
  const [managerNote, setManagerNote] = useState('')
  const [directorDecision, setDirectorDecision] = useState<DirectorDecision>('Maatregel akkoord')
  const [directorNote, setDirectorNote] = useState('')
  const [message, setMessage] = useState('')
  const [conflict, setConflict] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const visibleReports = useMemo(
    () => reports.filter((report) =>
      role === 'Directie'
        ? report.status === 'Escalatie directie' || Boolean(report.directorDecision)
        : role === 'Zorgmanager' || report.kind !== 'Datacorrectie'
    ),
    [reports, role],
  )
  const awaitingReview = visibleReports.filter((report) => ['Ter beoordeling', 'Herbeoordeling nodig'].includes(report.status)).length
  const awaitingDecision = visibleReports.filter((report) => report.status === 'Advies gereed').length
  const awaitingDirector = visibleReports.filter((report) => report.status === 'Escalatie directie').length
  const directorDecided = visibleReports.filter((report) => Boolean(report.directorDecision)).length
  const dirty = Boolean(selected && (
    assessment !== (selected.clinicalAssessment ?? '') ||
    recommendation !== (selected.recommendation ?? '') ||
    managerDecision !== (selected.managerDecision ?? 'Akkoord') ||
    managerNote !== (selected.managerDecisionNote ?? '')
    || directorDecision !== (selected.directorDecision ?? 'Maatregel akkoord')
    || directorNote !== (selected.directorDecisionNote ?? '')
  ))
  useUnsavedChangesWarning(dirty)

  const openReport = (report: CareReport) => {
    setSelected(report)
    setAssessment(report.clinicalAssessment ?? '')
    setRecommendation(report.recommendation ?? '')
    setManagerDecision(report.managerDecision ?? 'Akkoord')
    setManagerNote(report.managerDecisionNote ?? '')
    setDirectorDecision(report.directorDecision ?? 'Maatregel akkoord')
    setDirectorNote(report.directorDecisionNote ?? '')
    setSubmitted(false)
    setConflict('')
  }

  const close = () => {
    setSelected(null)
    setSubmitted(false)
  }

  const updateLatest = (update: (report: CareReport, now: string) => CareReport) => {
    if (!selected) return false
    const latest = readReports()
    const current = latest.find((report) => report.id === selected.id)
    if (!current || current.updatedAt !== selected.updatedAt) {
      setReports(latest)
      setConflict('Deze registratie is intussen gewijzigd. De actuele gegevens zijn opnieuw geladen; controleer ze voordat u verdergaat.')
      return false
    }
    const now = new Date().toISOString()
    const next = latest.map((report) => report.id === current.id ? update(current, now) : report)
    saveReports(next)
    setReports(next)
    return true
  }

  const saveClinicalReview = () => {
    setSubmitted(true)
    if (!selected || !assessment.trim() || !recommendation.trim()) return
    const saved = updateLatest((report, now) => ({
      ...report,
      status: 'Advies gereed',
      clinicalAssessment: assessment.trim(),
      recommendation: recommendation.trim(),
      reviewedByRole: 'Gedragswetenschapper',
      reviewedAt: now,
      managerDecision: undefined,
      managerDecisionNote: undefined,
      decidedByRole: undefined,
      decidedAt: undefined,
      updatedAt: now,
    }))
    if (!saved) return
    setMessage('De inhoudelijke beoordeling en het advies zijn vastgelegd en staan klaar voor de zorgmanager.')
    close()
  }

  const saveManagerDecision = () => {
    setSubmitted(true)
    if (!selected || !managerNote.trim()) return
    if (selected.kind !== 'Datacorrectie' && selected.status !== 'Advies gereed') return
    const saved = updateLatest((report, now) => ({
      ...report,
      status: managerDecision === 'Terug voor herbeoordeling'
        ? 'Herbeoordeling nodig'
        : managerDecision === 'Escaleren' ? 'Escalatie directie' : 'Besluit vastgelegd',
      managerDecision,
      managerDecisionNote: managerNote.trim(),
      decidedByRole: 'Zorgmanager',
      decidedAt: now,
      updatedAt: now,
    }))
    if (!saved) return
    setMessage(managerDecision === 'Terug voor herbeoordeling'
      ? 'De registratie is met toelichting teruggezet voor inhoudelijke herbeoordeling.'
      : managerDecision === 'Escaleren'
        ? 'De casus is met een beperkte beslissamenvatting naar de directie geëscaleerd.'
        : 'Het besluit van de zorgmanager is vastgelegd en terug te zien in het cliëntdossier.')
    close()
  }

  const saveDirectorDecision = () => {
    setSubmitted(true)
    if (!selected || selected.status !== 'Escalatie directie' || !directorNote.trim()) return
    const saved = updateLatest((report, now) => ({
      ...report,
      status: directorDecision === 'Aanvullende beoordeling nodig' ? 'Herbeoordeling nodig' : 'Besluit vastgelegd',
      directorDecision,
      directorDecisionNote: directorNote.trim(),
      decidedByDirectorAt: now,
      updatedAt: now,
    }))
    if (!saved) return
    setMessage('Het bestuurlijke besluit is vastgelegd. De zorgmanager blijft verantwoordelijk voor uitvoering en dossieropvolging.')
    close()
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Beoordelingen en besluiten</Typography>
        <Typography sx={{ mt: .4, maxWidth: 820, fontSize: 11.2, lineHeight: 1.6, color: '#718395' }}>
          {role === 'Directie'
            ? 'Hier staan uitsluitend geëscaleerde beslispunten. Operationele dossierdetails blijven afgeschermd.'
            : 'Hier wordt zichtbaar hoe vastgelegde gegevens door de rollen gaan: registratie, inhoudelijke beoordeling, advies en zorgmanagementbesluit.'}
        </Typography>
      </Box>

      <Alert severity="info">
        Prototype: iedere statuswijziging wordt lokaal met rol en tijd vastgelegd. Er is nog geen serveraudit, echte medewerkeridentiteit of synchronisatie met het zorgdossier.
      </Alert>
      {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
      {conflict && <Alert severity="warning" onClose={() => setConflict('')}>{conflict}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <Box sx={{ p: 2, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.2 }}>
          <Typography sx={{ fontSize: 10.5, color: '#8191a0' }}>{role === 'Directie' ? 'Wacht op bestuurlijk besluit' : 'Wacht op inhoudelijke beoordeling'}</Typography>
          <Typography sx={{ mt: .3, fontSize: 24, fontWeight: 790, color: '#925b1d' }}>{role === 'Directie' ? awaitingDirector : awaitingReview}</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.2 }}>
          <Typography sx={{ fontSize: 10.5, color: '#8191a0' }}>{role === 'Directie' ? 'Bestuurlijke besluiten vastgelegd' : 'Advies gereed voor besluit'}</Typography>
          <Typography sx={{ mt: .3, fontSize: 24, fontWeight: 790, color: '#376b95' }}>{role === 'Directie' ? directorDecided : awaitingDecision}</Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2.2 }}>
          <FactCheckRoundedIcon sx={{ color: '#47789e' }} />
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>{visibleReports.length} registraties</Typography>
            <Typography sx={{ mt: .2, fontSize: 10.5, color: '#8492a2' }}>Nieuwste registratie staat bovenaan</Typography>
          </Box>
        </Stack>
        <Divider />
        <Stack divider={<Divider flexItem />}>
          {visibleReports.map((report) => {
            const tone = statusTone[report.status]
            const canReview = role === 'Gedragswetenschapper' &&
              report.kind !== 'Datacorrectie' &&
              report.status !== 'Besluit vastgelegd'
            const canDecide = role === 'Zorgmanager' &&
              (report.kind === 'Datacorrectie' || report.status === 'Advies gereed')
            return (
              <Box key={report.id} sx={{ p: 2.2 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} gap={1.5} alignItems={{ lg: 'center' }}>
                  <Box sx={{ minWidth: 170 }}>
                    <Chip label={report.status} size="small" sx={{ bgcolor: tone.background, color: tone.color }} />
                    <Typography sx={{ mt: .7, fontSize: 9.7, color: '#8492a2' }}>
                      {new Date(report.createdAt).toLocaleString('nl-NL')} · door {report.createdByRole.toLowerCase()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 10, color: '#6d8192' }}>{report.kind}{role === 'Directie' ? ' · bestuurlijke escalatie' : ` · ${report.clientCode}`}</Typography>
                    <Typography sx={{ mt: .25, fontSize: 12.2, fontWeight: 730, color: '#294157' }}>{report.subject}</Typography>
                    {role !== 'Directie' && <Typography sx={{ mt: .35, fontSize: 10.5, color: '#718497' }}>{report.description}</Typography>}
                    {report.recommendation && <Typography sx={{ mt: .55, fontSize: 10.3, fontWeight: 650, color: '#486d89' }}>Advies: {report.recommendation}</Typography>}
                    {report.managerDecision && <Typography sx={{ mt: .4, fontSize: 10.3, fontWeight: 700, color: '#39725f' }}>Besluit: {report.managerDecision} · {report.managerDecisionNote}</Typography>}
                    {report.directorDecision && <Typography sx={{ mt: .4, fontSize: 10.3, fontWeight: 700, color: '#76438a' }}>Bestuurlijk besluit: {report.directorDecision} · {report.directorDecisionNote}</Typography>}
                  </Box>
                  <Stack direction="row" spacing={.8} flexWrap="wrap" useFlexGap>
                    {role !== 'Directie' && <Button component={RouterLink} to={`/jongeren/${report.clientCode}`} size="small" variant="outlined" endIcon={<OpenInNewRoundedIcon />}>Dossier</Button>}
                    {canReview && <Button size="small" variant="contained" onClick={() => openReport(report)}>Inhoudelijk beoordelen</Button>}
                    {canDecide && <Button size="small" variant="contained" onClick={() => openReport(report)}>Besluit vastleggen</Button>}
                    {role === 'Directie' && report.status === 'Escalatie directie' && <Button size="small" variant="contained" onClick={() => openReport(report)}>Bestuurlijk besluit</Button>}
                    {role === 'Zorgmanager' && report.kind !== 'Datacorrectie' && report.status !== 'Advies gereed' && report.status !== 'Besluit vastgelegd' && (
                      <Chip label="Wacht op advies" size="small" variant="outlined" />
                    )}
                  </Stack>
                </Stack>
              </Box>
            )
          })}
          {!visibleReports.length && (
            <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: '#718496' }}>Er zijn nog geen registraties voor deze beoordelingswerkvoorraad.</Typography>
              <Button component={RouterLink} to="/melden" sx={{ mt: 1 }}>Melding registreren</Button>
            </Box>
          )}
        </Stack>
      </Box>

      <Dialog open={Boolean(selected)} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography sx={{ fontSize: 17, fontWeight: 760, color: '#172c42' }}>
            {role === 'Gedragswetenschapper' ? 'Inhoudelijke beoordeling' : role === 'Directie' ? 'Bestuurlijk besluit' : 'Zorgmanagementbesluit'}
          </Typography>
          <Typography sx={{ mt: .3, fontSize: 10.8, color: '#8492a2' }}>{role === 'Directie' ? 'Geëscaleerd beslispunt' : selected?.clientCode} · {selected?.subject}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.8} sx={{ pt: 1 }}>
            {submitted && role === 'Gedragswetenschapper' && (!assessment.trim() || !recommendation.trim()) && (
              <Alert severity="warning">Leg zowel de inhoudelijke beoordeling als het concrete advies vast.</Alert>
            )}
            {submitted && role === 'Zorgmanager' && (
              (!managerNote.trim() || (selected?.kind !== 'Datacorrectie' && selected?.status !== 'Advies gereed'))
            ) && <Alert severity="warning">Een zorgmanagementbesluit vereist een gereed advies en een concrete toelichting.</Alert>}
            {submitted && role === 'Directie' && (!directorNote.trim() || selected?.status !== 'Escalatie directie') && <Alert severity="warning">Leg een concreet bestuurlijk besluit met onderbouwing vast.</Alert>}
            <Box sx={{ p: 1.5, bgcolor: '#f7f9fb', borderRadius: 1.7 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 720 }}>{selected?.kind}</Typography>
              <Typography sx={{ mt: .45, fontSize: 10.5, lineHeight: 1.55, color: '#61778a' }}>{role === 'Directie' ? selected?.managerDecisionNote : selected?.description}</Typography>
            </Box>
            {role === 'Gedragswetenschapper' ? (
              <>
                <TextField required multiline minRows={4} label="Inhoudelijke beoordeling" value={assessment} onChange={(event) => setAssessment(event.target.value)} helperText="Beschrijf de betekenis van de feiten; wijzig de oorspronkelijke registratie niet." />
                <TextField required multiline minRows={3} label="Advies aan zorgmanager" value={recommendation} onChange={(event) => setRecommendation(event.target.value)} helperText="Maak de aanbevolen vervolgstap en urgentie concreet." />
              </>
            ) : role === 'Zorgmanager' ? (
              <>
                {selected?.clinicalAssessment && <Alert severity="info"><strong>Beoordeling:</strong> {selected.clinicalAssessment}<br /><strong>Advies:</strong> {selected.recommendation}</Alert>}
                <TextField select required label="Besluit" value={managerDecision} onChange={(event) => setManagerDecision(event.target.value as ManagerDecision)}>
                  <MenuItem value="Akkoord">Akkoord</MenuItem>
                  <MenuItem value="Terug voor herbeoordeling">Terug voor herbeoordeling</MenuItem>
                  <MenuItem value="Escaleren">Escaleren</MenuItem>
                </TextField>
                <TextField required multiline minRows={3} label={managerDecision === 'Escaleren' ? 'Bestuurlijke beslissamenvatting en gevraagde beslissing' : 'Toelichting en vervolgstap'} value={managerNote} onChange={(event) => setManagerNote(event.target.value)} helperText={managerDecision === 'Escaleren' ? 'Neem alleen informatie op die de directie nodig heeft om te besluiten; vermijd direct identificeerbare cliëntdetails.' : undefined} />
              </>
            ) : (
              <>
                <Alert severity="info"><strong>Inhoudelijk advies:</strong> {selected?.recommendation}<br /><strong>Escalatiesamenvatting:</strong> {selected?.managerDecisionNote}</Alert>
                <TextField select required label="Bestuurlijk besluit" value={directorDecision} onChange={(event) => setDirectorDecision(event.target.value as DirectorDecision)}>
                  <MenuItem value="Maatregel akkoord">Maatregel akkoord</MenuItem>
                  <MenuItem value="Aanvullende beoordeling nodig">Aanvullende beoordeling nodig</MenuItem>
                  <MenuItem value="Geen bestuurlijke maatregel">Geen bestuurlijke maatregel</MenuItem>
                </TextField>
                <TextField required multiline minRows={3} label="Onderbouwing en opdracht aan zorgmanager" value={directorNote} onChange={(event) => setDirectorNote(event.target.value)} />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={close}>Annuleren</Button>
          <Button variant="contained" onClick={role === 'Gedragswetenschapper' ? saveClinicalReview : role === 'Directie' ? saveDirectorDecision : saveManagerDecision}>
            {role === 'Gedragswetenschapper' ? 'Advies vastleggen' : role === 'Directie' ? 'Bestuurlijk besluit vastleggen' : 'Besluit vastleggen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
