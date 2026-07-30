import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Divider, FormControlLabel, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { workItems, workItemVisibleForRole, type WorkItem } from '../data/careInsights'
import {
  loadNetworkContacts,
  loadTrajectories,
  loadWorkQueue,
  saveNetworkContacts,
  saveWorkQueue,
} from '../data/demoStore'
import {
  contactsForClient,
  type NetworkContact,
  type NetworkContactStatus,
} from '../data/networkContacts'
import { useWorkspaceRole } from '../context/RoleContext'
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning'

const statuses: NetworkContactStatus[] = [
  'Wachten op reactie',
  'Aanvulling gevraagd',
  'Afspraak vastgelegd',
  'Besluit ontvangen',
  'Afgerond',
]

const statusLabels: Record<NetworkContactStatus, string> = {
  'Wachten op reactie': 'We wachten op een reactie',
  'Aanvulling gevraagd': 'De gemeente of verwijzer vraagt aanvullende informatie',
  'Afspraak vastgelegd': 'Er is een afspraak gemaakt',
  'Besluit ontvangen': 'Er is een besluit ontvangen',
  'Afgerond': 'Dit contactpunt is afgerond',
}

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export default function NetwerkcontactPage() {
  const { clientCode = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { role } = useWorkspaceRole()
  const trajectories = useMemo(() => loadTrajectories(), [])
  const trajectory = trajectories.find((item) => item.clientCode === clientCode)
  const storedContacts = loadNetworkContacts()
  const contactRows = contactsForClient(clientCode, storedContacts)
  const latest = contactRows.find((item) => !item.correctedAt)
  const today = new Date().toISOString().slice(0, 10)
  const linkedTaskId = searchParams.get('task') ?? ''
  const correctionId = searchParams.get('corrects') ?? ''
  const correctionTarget = correctionId
    ? contactRows.find((item) => item.id === correctionId && !item.correctedAt)
    : undefined
  const invalidCorrection = Boolean(correctionId && !correctionTarget)
  const initialQueue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
  const requestedLinkedTask = initialQueue.find((item) => item.id === linkedTaskId)
  const linkedTask = requestedLinkedTask &&
    requestedLinkedTask.clientCode === clientCode &&
    requestedLinkedTask.type === 'Gemeentecontact' &&
    requestedLinkedTask.status !== 'Afgerond' &&
    workItemVisibleForRole(requestedLinkedTask, role)
    ? requestedLinkedTask
    : undefined
  const invalidLinkedTask = Boolean(linkedTaskId && !linkedTask)
  const [values, setValues] = useState({
    contactDate: correctionTarget?.contactDate ?? today,
    contactType: correctionTarget?.contactType ?? latest?.contactType ?? 'Afstemming',
    organisation: correctionTarget?.organisation ?? latest?.organisation ?? `Gemeente ${trajectory?.responsibleMunicipality ?? trajectory?.originMunicipality ?? ''}`,
    contactPerson: correctionTarget?.contactPerson ?? latest?.contactPerson ?? '',
    contactRole: correctionTarget?.contactRole ?? latest?.contactRole ?? 'Gemeentelijk contact',
    channel: correctionTarget?.channel ?? latest?.channel ?? 'Telefoon',
    direction: correctionTarget?.direction ?? 'Uitgaand' as NonNullable<NetworkContact['direction']>,
    subject: correctionTarget?.subject ?? '',
    summary: correctionTarget?.summary ?? '',
    agreement: correctionTarget?.agreement ?? '',
    status: correctionTarget?.status ?? 'Wachten op reactie' as NetworkContactStatus,
    followUpAfterDecision: Boolean(correctionTarget?.status === 'Besluit ontvangen' && correctionTarget.nextAction),
    nextAction: correctionTarget?.nextAction ?? '',
    dueDate: correctionTarget?.dueDate ?? addDays(today, 7),
    owner: correctionTarget?.owner ?? latest?.owner ?? trajectory?.supervisor ?? '',
    sharingBasis: (correctionTarget?.sharingBasis ?? '') as NetworkContact['sharingBasis'] | '',
    sharedDataScope: correctionTarget?.sharedDataScope ?? '',
    sharingConfirmed: false,
    correctionReason: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const requiresFollowUp = ['Wachten op reactie', 'Aanvulling gevraagd', 'Afspraak vastgelegd'].includes(values.status) ||
    (values.status === 'Besluit ontvangen' && values.followUpAfterDecision)
  const owners = Array.from(new Set([
    trajectory?.supervisor,
    latest?.owner,
    'M. van Dijk',
    'Zorgmanager',
  ].filter(Boolean))) as string[]
  const valid = Boolean(
    trajectory &&
    values.contactDate &&
    values.contactDate <= today &&
    values.organisation.trim() &&
    values.contactPerson.trim() &&
    values.contactRole.trim() &&
    values.subject.trim() &&
    values.summary.trim() &&
    values.agreement.trim() &&
    values.owner &&
    values.sharingBasis &&
    values.sharedDataScope.trim() &&
    values.sharingConfirmed &&
    (!correctionTarget || values.correctionReason.trim()) &&
    (!requiresFollowUp || (
      values.nextAction.trim() &&
      values.dueDate &&
      values.dueDate >= values.contactDate
    ))
  )
  const dirty = Boolean(
    values.subject.trim() ||
    values.summary.trim() ||
    values.agreement.trim() ||
    values.nextAction.trim() ||
    values.contactPerson !== (correctionTarget?.contactPerson ?? latest?.contactPerson ?? '') ||
    values.correctionReason.trim()
  )
  useUnsavedChangesWarning(dirty)

  if (!trajectory) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
        <Alert severity="error">Het cliëntdossier “{clientCode || 'onbekend'}” bestaat niet. Er is geen contactmoment opgeslagen.</Alert>
        <Button component={RouterLink} to="/jongeren" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>Terug naar jongeren</Button>
      </Stack>
    )
  }

  const update = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const save = () => {
    setSubmitted(true)
    setSaveError('')
    if (!valid || invalidLinkedTask || invalidCorrection || saving) return
    setSaving(true)

    const createdAt = new Date().toISOString()
    const idSuffix = createdAt.replace(/\D/g, '')
    const contactId = `NC-${idSuffix}`
    const currentContacts = loadNetworkContacts()
    const currentCorrectionTarget = correctionTarget
      ? currentContacts.find((item) => item.id === correctionTarget.id)
      : undefined
    if (correctionTarget && (!currentCorrectionTarget || currentCorrectionTarget.correctedAt)) {
      setSaveError('Deze registratie is intussen al gecorrigeerd. Open het dossier opnieuw om de nieuwste versie te bekijken.')
      setSaving(false)
      return
    }
    const currentQueue = loadWorkQueue<WorkItem>(workItems.map((item) => ({ ...item, status: 'Open' })))
    const currentLinkedTask = linkedTaskId
      ? currentQueue.find((item) =>
        item.id === linkedTaskId &&
        item.clientCode === clientCode &&
        item.type === 'Gemeentecontact' &&
        item.status !== 'Afgerond' &&
        workItemVisibleForRole(item, role)
      )
      : undefined
    if (linkedTaskId && (!currentLinkedTask || currentLinkedTask.updatedAt !== linkedTask?.updatedAt)) {
      setSaveError('Deze gekoppelde taak is intussen gewijzigd of niet meer beschikbaar. Open de actuele taak opnieuw vanuit de werkvoorraad.')
      setSaving(false)
      return
    }
    const sourceContact = currentLinkedTask?.sourceNetworkContactId
      ? currentContacts.find((item) => item.id === currentLinkedTask.sourceNetworkContactId)
      : undefined
    if (sourceContact?.resolvedAt) {
      setSaveError('Deze externe opvolging is intussen al verwerkt. Open het dossier opnieuw om de actuele contactketen te controleren.')
      setSaving(false)
      return
    }
    const contact: NetworkContact = {
      id: contactId,
      clientCode,
      contactDate: values.contactDate,
      contactType: values.contactType as NetworkContact['contactType'],
      organisation: values.organisation.trim(),
      contactPerson: values.contactPerson.trim(),
      contactRole: values.contactRole.trim(),
      channel: values.channel as NetworkContact['channel'],
      direction: values.direction,
      subject: values.subject.trim(),
      summary: values.summary.trim(),
      agreement: values.agreement.trim(),
      status: values.status,
      nextAction: requiresFollowUp ? values.nextAction.trim() : undefined,
      dueDate: requiresFollowUp ? values.dueDate : undefined,
      owner: values.owner,
      sharingBasis: values.sharingBasis as NetworkContact['sharingBasis'],
      sharedDataScope: values.sharedDataScope.trim(),
      createdByRole: role === 'Zorgmanager' ? 'Zorgmanager' : 'Gedragswetenschapper',
      createdAt,
      respondsToContactId: sourceContact?.id,
      correctsContactId: correctionTarget?.id,
      correctionReason: correctionTarget ? values.correctionReason.trim() : undefined,
    }
    const nextContacts = currentContacts.map((item): NetworkContact => item.id === sourceContact?.id ? {
      ...item,
      resolvedAt: createdAt,
      resolvedByContactId: contactId,
    } : item.id === correctionTarget?.id ? {
      ...item,
      correctedAt: createdAt,
      correctedByContactId: contactId,
    } : item)
    saveNetworkContacts([contact, ...nextContacts])

    let nextQueue = linkedTaskId
      ? currentQueue.map((item): WorkItem => item.id === linkedTaskId ? {
        ...item,
        status: 'Afgerond',
        completionNote: `Contact met ${contact.organisation} is vastgelegd: ${contact.agreement}`,
        completedAt: createdAt,
        updatedAt: createdAt,
      } : item)
      : currentQueue

    if (correctionTarget) {
      nextQueue = nextQueue.map((item): WorkItem => item.sourceNetworkContactId === correctionTarget.id && item.status !== 'Afgerond' ? {
        ...item,
        status: 'Afgerond',
        completionNote: `Vervangen door gecorrigeerde contactregistratie ${contactId}.`,
        completedAt: createdAt,
        updatedAt: createdAt,
      } : item)
    }

    if (requiresFollowUp) {
      const dueLabel = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' })
        .format(new Date(`${values.dueDate}T12:00:00`))
      const followUpTask: WorkItem = {
        id: `A-NC-${idSuffix}`,
        clientCode,
        title: values.nextAction.trim(),
        detail: `Vervolg na contact met ${contact.organisation} over “${contact.subject}”.`,
        due: dueLabel,
        dueDate: values.dueDate,
        urgency: values.dueDate < today ? 'Te laat' : values.dueDate === today ? 'Vandaag' : 'Deze week',
        owner: values.owner,
        type: 'Gemeentecontact',
        status: 'Open',
        policyReason: 'Externe afspraak: reactie, eigenaar en deadline moeten controleerbaar worden opgevolgd.',
        expectedResult: 'De reactie of het besluit is ontvangen en in het cliëntdossier vastgelegd.',
        responsibleRoles: ['Gedragswetenschapper', 'Zorgmanager'],
        sourceNetworkContactId: contactId,
        createdByRole: role,
        updatedAt: createdAt,
      }
      nextQueue = [followUpTask, ...nextQueue]
    }
    if (linkedTaskId || correctionTarget || requiresFollowUp) saveWorkQueue(nextQueue)
    navigate(`/jongeren/${clientCode}?tab=network&contact=${correctionTarget ? 'corrected' : 'created'}`)
  }

  return (
    <Stack spacing={2.5} className="professional-form-page">
      <Box>
        <Button component={RouterLink} to={`/jongeren/${clientCode}?tab=network`} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar dossier</Button>
        <Typography sx={{ fontSize: 22, fontWeight: 780, color: '#172c42' }}>{correctionTarget ? 'Correctie op gemeente-/verwijzercontact' : 'Gemeente-/verwijzercontact vastleggen'}</Typography>
        <Typography sx={{ mt: .4, fontSize: 13, color: '#718395' }}>
          {clientCode} · verantwoordelijke gemeente {trajectory.responsibleMunicipality ?? 'niet vastgelegd'} · verwijzer {trajectory.referrer ?? 'niet vastgelegd'}
        </Typography>
      </Box>

      <Alert severity="info">Deze flow is uitsluitend voor professioneel contact met gemeente of verwijzer. Contact met ouders, school of persoonlijk netwerk hoort in een aparte contactsoort. Dit prototype verstuurt niets.</Alert>
      {!correctionTarget && latest && <Alert severity="info">Organisatie en contactpersoon zijn voorgesteld op basis van het laatste contact. Controleer beide opnieuw. Grondslag en gedeelde informatie worden bewust niet overgenomen.</Alert>}
      {correctionTarget && <Alert severity="warning">De oorspronkelijke registratie blijft in de historie bestaan en wordt als gecorrigeerd gemarkeerd. Leg hieronder de gecorrigeerde versie en de reden vast.</Alert>}
      {linkedTaskId && <Alert severity="info">Dit contactmoment rondt de gekoppelde taak af. Een nieuwe vervolgtaak wordt automatisch gemaakt als u nog op actie of reactie wacht.</Alert>}
      {invalidLinkedTask && <Alert severity="error">De gekoppelde taak hoort niet bij dit dossier, is al afgerond of past niet bij uw rol. Er wordt niets gewijzigd; open de taak opnieuw vanuit de werkvoorraad.</Alert>}
      {invalidCorrection && <Alert severity="error">Het te corrigeren contactmoment bestaat niet, hoort niet bij dit dossier of is al gecorrigeerd. Er wordt niets gewijzigd.</Alert>}
      {saveError && <Alert severity="warning">{saveError}</Alert>}
      {submitted && !valid && <Alert severity="warning">
        {values.contactDate > today
          ? 'Een contactmoment kan niet in de toekomst liggen.'
          : requiresFollowUp && values.dueDate < values.contactDate
            ? 'De reactiedeadline mag niet vóór het contactmoment liggen.'
            : 'Controleer de gemarkeerde velden. Contactpersoon, inhoud, uitkomst, gegevensdeling en eventuele vervolgactie moeten volledig en consistent zijn.'}
      </Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 16, fontWeight: 760 }}>1. Met wie was er contact?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField required type="date" label="Datum contact" value={values.contactDate} onChange={(event) => update('contactDate', event.target.value)} error={submitted && (!values.contactDate || values.contactDate > today)} helperText={submitted && values.contactDate > today ? 'Een contactmoment kan niet in de toekomst liggen.' : undefined} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select label="Soort contact" value={values.contactType} onChange={(event) => update('contactType', event.target.value as NetworkContact['contactType'])}>
                {['Afstemming', 'Evaluatie', 'Beschikking / verlenging', 'Veiligheid', 'Vervolgplek'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required label="Organisatie" value={values.organisation} onChange={(event) => update('organisation', event.target.value)} error={submitted && !values.organisation.trim()} helperText={latest && !correctionTarget ? 'Voorgesteld uit het laatste contact; controleer de ontvanger.' : undefined} />
              <TextField required label="Contactpersoon" value={values.contactPerson} onChange={(event) => update('contactPerson', event.target.value)} error={submitted && !values.contactPerson.trim()} helperText={latest && !correctionTarget ? 'Voorgesteld uit het laatste contact; controleer de persoon.' : undefined} />
              <TextField required label="Rol contactpersoon" value={values.contactRole} onChange={(event) => update('contactRole', event.target.value)} error={submitted && !values.contactRole.trim()} />
              <TextField select label="Contactkanaal" value={values.channel} onChange={(event) => update('channel', event.target.value as NetworkContact['channel'])}>
                {['Telefoon', 'E-mail', 'Beveiligd bericht', 'Overleg'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField select label="Richting van het contact" value={values.direction} onChange={(event) => update('direction', event.target.value as NonNullable<NetworkContact['direction']>)}>
                {['Inkomend', 'Uitgaand', 'Gezamenlijk overleg'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 16, fontWeight: 760 }}>2. Wat is besproken en afgesproken?</Typography>
            <Stack spacing={1.5}>
              <TextField required label="Onderwerp" value={values.subject} onChange={(event) => update('subject', event.target.value)} error={submitted && !values.subject.trim()} />
              <TextField required multiline minRows={3} label="Feitelijke samenvatting" value={values.summary} onChange={(event) => update('summary', event.target.value)} error={submitted && !values.summary.trim()} helperText="Noteer alleen wat nodig is voor besluit en opvolging." />
              <TextField required multiline minRows={2} label="Afspraak of ontvangen besluit" value={values.agreement} onChange={(event) => update('agreement', event.target.value)} error={submitted && !values.agreement.trim()} />
            </Stack>
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 16, fontWeight: 760 }}>3. Wat is de uitkomst en wat gebeurt er nu?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField select label="Uitkomst van het contact" value={values.status} onChange={(event) => {
                const status = event.target.value as NetworkContactStatus
                setValues((current) => ({ ...current, status, followUpAfterDecision: status === 'Besluit ontvangen' ? current.followUpAfterDecision : false, nextAction: status === 'Afgerond' ? '' : current.nextAction }))
              }}>
                {statuses.map((item) => <MenuItem key={item} value={item}>{statusLabels[item]}</MenuItem>)}
              </TextField>
              <TextField select label="Eigenaar vervolg" value={values.owner} onChange={(event) => update('owner', event.target.value)} disabled={!requiresFollowUp}>
                {owners.map((item) => <MenuItem key={item} value={item}>{item === 'Zorgmanager' ? 'Zorgmanager — teamwerkvoorraad' : `${item} — medewerker`}</MenuItem>)}
              </TextField>
              {values.status === 'Besluit ontvangen' && <FormControlLabel sx={{ gridColumn: '1 / -1' }} control={<Checkbox checked={values.followUpAfterDecision} onChange={(event) => update('followUpAfterDecision', event.target.checked)} />} label="Na dit besluit is nog een vervolgactie nodig" />}
              {requiresFollowUp && <TextField required label="Concrete vervolgactie" value={values.nextAction} onChange={(event) => update('nextAction', event.target.value)} error={submitted && !values.nextAction.trim()} />}
              {requiresFollowUp && <TextField required type="date" label="Reactie- of actiedeadline" value={values.dueDate} onChange={(event) => update('dueDate', event.target.value)} error={submitted && (!values.dueDate || values.dueDate < values.contactDate)} helperText={submitted && values.dueDate < values.contactDate ? 'Deadline mag niet vóór het contactmoment liggen.' : undefined} slotProps={{ inputLabel: { shrink: true } }} />}
            </Box>
            {requiresFollowUp ? <Typography sx={{ mt: 1, fontSize: 13, color: '#61788b' }}>Na opslaan ontstaat automatisch één vervolgtaak voor {values.owner || 'de gekozen eigenaar'}.</Typography> : <Typography sx={{ mt: 1, fontSize: 13, color: '#567568' }}>Deze uitkomst maakt geen vervolgtaak aan.</Typography>}
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 16, fontWeight: 760 }}>4. Controleer de gegevensdeling</Typography>
            <Stack spacing={1.5}>
              <TextField select required label="Grondslag voor dit deelmoment" value={values.sharingBasis} onChange={(event) => update('sharingBasis', event.target.value as NetworkContact['sharingBasis'])} error={submitted && !values.sharingBasis} helperText="Kies de grondslag opnieuw voor ieder contactmoment.">
                <MenuItem value="" disabled>Kies een grondslag</MenuItem>
                {['Uitvoering jeugdhulp / beschikking', 'Toestemming vastgelegd', 'Acuut veiligheidsbelang'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required multiline minRows={2} label="Welke informatie is tijdens dit contact gedeeld?" value={values.sharedDataScope} onChange={(event) => update('sharedDataScope', event.target.value)} error={submitted && !values.sharedDataScope.trim()} helperText="Dit veld begint bij een nieuw contact bewust leeg. Beschrijf alleen de noodzakelijke inhoud." />
              <FormControlLabel control={<Checkbox checked={values.sharingConfirmed} onChange={(event) => update('sharingConfirmed', event.target.checked)} />} label="Ik heb ontvanger, noodzakelijkheid, grondslag en gedeelde inhoud voor dit contact gecontroleerd" />
              {submitted && !values.sharingConfirmed && <Typography color="error" sx={{ fontSize: 13 }}>Bevestig deze controle voordat u opslaat.</Typography>}
            </Stack>
          </Box>

          {correctionTarget && <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 16, fontWeight: 760 }}>5. Reden van de correctie</Typography>
            <TextField required fullWidth multiline minRows={2} label="Waarom wordt de oorspronkelijke registratie gecorrigeerd?" value={values.correctionReason} onChange={(event) => update('correctionReason', event.target.value)} error={submitted && !values.correctionReason.trim()} helperText="De oorspronkelijke versie blijft zichtbaar in de dossierhistorie." />
          </Box>}
        </Stack>

        <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ContactPhoneRoundedIcon sx={{ color: '#3b719d' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 770 }}>Controleer vóór opslaan</Typography>
          </Stack>
          <Stack spacing={1.1} sx={{ mt: 1.7 }}>
            <Typography sx={{ fontSize: 13 }}>Contactpersoon: <b>{values.contactPerson || 'nog niet ingevuld'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Organisatie: <b>{values.organisation || 'nog niet ingevuld'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Richting: <b>{values.direction}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Uitkomst: <b>{statusLabels[values.status]}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Afspraak/besluit: <b>{values.agreement || 'nog niet ingevuld'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Eigenaar: <b>{requiresFollowUp ? values.owner || 'nog niet gekozen' : 'geen vervolg'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Deadline: <b>{requiresFollowUp ? values.dueDate || 'nog niet gekozen' : 'niet van toepassing'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Grondslag: <b>{values.sharingBasis || 'nog niet gekozen'}</b></Typography>
            <Typography sx={{ fontSize: 13 }}>Gedeeld: <b>{values.sharedDataScope || 'nog niet ingevuld'}</b></Typography>
          </Stack>
          <Divider sx={{ my: 1.7 }} />
          <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: '#657a8c' }}>{correctionTarget ? 'De correctie wordt als nieuwe versie toegevoegd; de oorspronkelijke registratie blijft raadpleegbaar.' : 'Het contactmoment komt in de dossierhistorie. Bij open opvolging wordt automatisch een rolgebonden taak toegevoegd.'}</Typography>
          <Button fullWidth size="large" variant="contained" startIcon={<ContactPhoneRoundedIcon />} onClick={save} disabled={invalidLinkedTask || invalidCorrection || saving} sx={{ mt: 2 }}>{saving ? 'Vastleggen…' : correctionTarget ? 'Correctie vastleggen' : 'Contactmoment opslaan'}</Button>
          <Button fullWidth component={RouterLink} to={`/jongeren/${clientCode}?tab=network`} sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
