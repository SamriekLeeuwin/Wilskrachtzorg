import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Divider, MenuItem, Stack, TextField, Typography,
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
  const latest = contactsForClient(clientCode, storedContacts)[0]
  const today = new Date().toISOString().slice(0, 10)
  const linkedTaskId = searchParams.get('task') ?? ''
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
    contactDate: today,
    contactType: latest?.contactType ?? 'Afstemming',
    organisation: latest?.organisation ?? `Gemeente ${trajectory?.responsibleMunicipality ?? trajectory?.originMunicipality ?? ''}`,
    contactPerson: latest?.contactPerson ?? '',
    contactRole: latest?.contactRole ?? 'Gemeentelijk contact',
    channel: latest?.channel ?? 'Telefoon',
    subject: '',
    summary: '',
    agreement: '',
    status: 'Wachten op reactie' as NetworkContactStatus,
    nextAction: '',
    dueDate: addDays(today, 7),
    owner: latest?.owner ?? trajectory?.supervisor ?? '',
    sharingBasis: latest?.sharingBasis ?? 'Uitvoering jeugdhulp / beschikking',
    sharedDataScope: latest?.sharedDataScope ?? '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saveError, setSaveError] = useState('')
  const statusRequiresFollowUp = !['Besluit ontvangen', 'Afgerond'].includes(values.status)
  const requiresFollowUp = statusRequiresFollowUp || Boolean(values.nextAction.trim())
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
    values.contactPerson !== (latest?.contactPerson ?? '')
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
    if (!valid || invalidLinkedTask) return

    const createdAt = new Date().toISOString()
    const idSuffix = createdAt.replace(/\D/g, '')
    const contactId = `NC-${idSuffix}`
    const currentContacts = loadNetworkContacts()
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
      return
    }
    const sourceContact = currentLinkedTask?.sourceNetworkContactId
      ? currentContacts.find((item) => item.id === currentLinkedTask.sourceNetworkContactId)
      : undefined
    if (sourceContact?.resolvedAt) {
      setSaveError('Deze externe opvolging is intussen al verwerkt. Open het dossier opnieuw om de actuele contactketen te controleren.')
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
    }
    const nextContacts = currentContacts.map((item): NetworkContact => item.id === sourceContact?.id ? {
      ...item,
      resolvedAt: createdAt,
      resolvedByContactId: contactId,
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
    if (linkedTaskId || requiresFollowUp) saveWorkQueue(nextQueue)
    navigate(`/jongeren/${clientCode}?tab=network&contact=created`)
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to={`/jongeren/${clientCode}?tab=network`} startIcon={<ArrowBackRoundedIcon />} sx={{ px: 0, mb: 1 }}>Terug naar dossier</Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>Contact met gemeente of verwijzer vastleggen</Typography>
        <Typography sx={{ mt: .4, fontSize: 11.2, color: '#718395' }}>
          {clientCode} · verantwoordelijke gemeente {trajectory.responsibleMunicipality ?? 'niet vastgelegd'} · verwijzer {trajectory.referrer ?? 'niet vastgelegd'}
        </Typography>
      </Box>

      <Alert severity="info">
        Dit prototype verstuurt niets. Leg alleen noodzakelijke informatie vast en controleer vóór echte gegevensdeling de grondslag, ontvanger en afgesproken inhoud.
      </Alert>
      {linkedTaskId && <Alert severity="info">Dit contactmoment rondt de gekoppelde taak af. Een nieuwe vervolgtaak wordt automatisch gemaakt als u nog op actie of reactie wacht.</Alert>}
      {invalidLinkedTask && <Alert severity="error">De gekoppelde taak hoort niet bij dit dossier, is al afgerond of past niet bij uw rol. Er wordt niets gewijzigd; open de taak opnieuw vanuit de werkvoorraad.</Alert>}
      {saveError && <Alert severity="warning">{saveError}</Alert>}
      {submitted && !valid && (
        <Alert severity="warning">
          {values.contactDate > today
            ? 'Een contactmoment kan niet in de toekomst liggen.'
            : requiresFollowUp && values.dueDate < values.contactDate
              ? 'De reactiedeadline mag niet vóór het contactmoment liggen.'
              : 'Vul contactpersoon, onderwerp, feitelijke samenvatting, afspraak, gegevensdeling en eventuele vervolgactie volledig in.'}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>1. Met wie was er contact?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField required type="date" label="Datum contact" value={values.contactDate} onChange={(event) => update('contactDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select label="Soort contact" value={values.contactType} onChange={(event) => update('contactType', event.target.value as NetworkContact['contactType'])}>
                {['Afstemming', 'Evaluatie', 'Beschikking / verlenging', 'Veiligheid', 'Vervolgplek'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required label="Organisatie" value={values.organisation} onChange={(event) => update('organisation', event.target.value)} />
              <TextField required label="Contactpersoon" value={values.contactPerson} onChange={(event) => update('contactPerson', event.target.value)} />
              <TextField required label="Rol contactpersoon" value={values.contactRole} onChange={(event) => update('contactRole', event.target.value)} />
              <TextField select label="Contactkanaal" value={values.channel} onChange={(event) => update('channel', event.target.value as NetworkContact['channel'])}>
                {['Telefoon', 'E-mail', 'Beveiligd bericht', 'Overleg'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>2. Wat is besproken en afgesproken?</Typography>
            <Stack spacing={1.5}>
              <TextField required label="Onderwerp" value={values.subject} onChange={(event) => update('subject', event.target.value)} />
              <TextField required multiline minRows={3} label="Feitelijke samenvatting" value={values.summary} onChange={(event) => update('summary', event.target.value)} helperText="Noteer alleen wat nodig is voor besluit en opvolging." />
              <TextField required multiline minRows={2} label="Afspraak of ontvangen besluit" value={values.agreement} onChange={(event) => update('agreement', event.target.value)} />
            </Stack>
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>3. Wat gebeurt er nu?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField select label="Processtatus" value={values.status} onChange={(event) => update('status', event.target.value as NetworkContactStatus)}>
                {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField select label="Eigenaar vervolg" value={values.owner} onChange={(event) => update('owner', event.target.value)}>
                {owners.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required={requiresFollowUp} label="Concrete vervolgactie" value={values.nextAction} onChange={(event) => update('nextAction', event.target.value)} />
              <TextField required={requiresFollowUp} type="date" label="Reactie- of actiedeadline" value={values.dueDate} onChange={(event) => update('dueDate', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            {requiresFollowUp && <Typography sx={{ mt: 1, fontSize: 10.3, color: '#61788b' }}>Na opslaan ontstaat automatisch één vervolgtaak voor {values.owner || 'de gekozen eigenaar'}.</Typography>}
          </Box>

          <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.7, fontSize: 13.5, fontWeight: 760 }}>4. Controle gegevensdeling</Typography>
            <Stack spacing={1.5}>
              <TextField select required label="Geregistreerde grondslag" value={values.sharingBasis} onChange={(event) => update('sharingBasis', event.target.value as NetworkContact['sharingBasis'])}>
                {['Uitvoering jeugdhulp / beschikking', 'Toestemming vastgelegd', 'Acuut veiligheidsbelang'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required multiline minRows={2} label="Welke informatie is gedeeld?" value={values.sharedDataScope} onChange={(event) => update('sharedDataScope', event.target.value)} helperText="Beschrijf de beperkte inhoud; voeg hier geen volledig document of onnodige persoonsgegevens toe." />
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ p: 2.4, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ContactPhoneRoundedIcon sx={{ color: '#3b719d' }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 770 }}>Controleer vóór opslaan</Typography>
          </Stack>
          <Stack spacing={1.1} sx={{ mt: 1.7 }}>
            <Typography sx={{ fontSize: 10.8 }}>Organisatie: <b>{values.organisation || 'nog niet ingevuld'}</b></Typography>
            <Typography sx={{ fontSize: 10.8 }}>Status: <b>{values.status}</b></Typography>
            <Typography sx={{ fontSize: 10.8 }}>Eigenaar: <b>{values.owner || 'nog niet gekozen'}</b></Typography>
            <Typography sx={{ fontSize: 10.8 }}>Deadline: <b>{requiresFollowUp ? values.dueDate || 'nog niet gekozen' : 'niet verplicht'}</b></Typography>
          </Stack>
          <Divider sx={{ my: 1.7 }} />
          <Typography sx={{ fontSize: 10.2, lineHeight: 1.55, color: '#657a8c' }}>
            Het contactmoment komt in de dossierhistorie. Bij open opvolging wordt automatisch een rolgebonden taak toegevoegd.
          </Typography>
          <Button fullWidth size="large" variant="contained" startIcon={<ContactPhoneRoundedIcon />} onClick={save} sx={{ mt: 2 }}>Contactmoment opslaan</Button>
          <Button fullWidth component={RouterLink} to={`/jongeren/${clientCode}?tab=network`} sx={{ mt: .7 }}>Annuleren</Button>
        </Box>
      </Box>
    </Stack>
  )
}
