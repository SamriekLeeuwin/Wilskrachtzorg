import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Chip, Divider, FormControl, FormControlLabel,
  FormLabel, MenuItem, Radio, RadioGroup, Stack, TextField, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { WorkItem } from '../data/careInsights'
import { workItems } from '../data/careInsights'
import { loadTrajectories, loadWorkQueue, saveWorkQueue } from '../data/demoStore'
import { useWorkspaceRole, type WorkspaceRole } from '../context/RoleContext'

type TaskType = WorkItem['type']
type SavedTask = WorkItem & {
  status: 'Open' | 'Afgerond'
  policyReason: string
  expectedResult?: string
  checklist?: string[]
  dueDate?: string
  dueTime?: string
}

type TaskTemplate = {
  type: TaskType
  label: string
  description: string
  title: string
  policyReason: string
  expectedResult: string
  checklist: string[]
  roles: WorkspaceRole[]
}

const templates: TaskTemplate[] = [
  {
    type: 'UVO',
    label: 'UVO plannen',
    description: 'Netwerk uitnodigen en overleg voorbereiden.',
    title: 'UVO plannen en voorbereiden',
    policyReason: 'Pedagogisch beleid: bij 3 aantekeningen binnen circa 2–3 weken wordt het netwerk uitgenodigd voor een UVO.',
    expectedResult: 'Het UVO staat gepland, betrokkenen zijn uitgenodigd en het doel van het overleg is vastgelegd.',
    checklist: ['Datum afstemmen', 'Netwerk uitnodigen', 'Aanleiding samenvatten', 'Agendapunten toevoegen'],
    roles: ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'],
  },
  {
    type: 'Herstelgesprek',
    label: 'Herstelgesprek',
    description: 'Herstel na incident of maatregel organiseren.',
    title: 'Herstelgesprek voeren en vastleggen',
    policyReason: 'Pedagogisch beleid: een herstelgesprek is verplicht na een zwaar incident, time-out of officiële waarschuwing.',
    expectedResult: 'Het gesprek is gevoerd, afspraken zijn vastgelegd en betrokkenen weten wat de vervolgstap is.',
    checklist: ['Jongere uitnodigen', 'Betrokken medewerker uitnodigen', 'Afspraken vastleggen', 'Vervolg controleren'],
    roles: ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'],
  },
  {
    type: 'Vervolgplek',
    label: 'Vervolgplek',
    description: 'Aanmelding, besluit of overdracht opvolgen.',
    title: 'Vervolgplek opvolgen',
    policyReason: 'Doorstroom: besluit, deelnemers, actiehouder en deadline moeten controleerbaar zijn vastgelegd.',
    expectedResult: 'De volgende stap richting een passende vervolgplek is uitgevoerd en terug te vinden in het dossier.',
    checklist: ['Status aanbieder controleren', 'Benodigde documenten verzamelen', 'Betrokkenen informeren', 'Vervolgdatum vastleggen'],
    roles: ['Begeleider', 'Zorgmanager'],
  },
  {
    type: 'Evaluatie',
    label: 'Evaluatie',
    description: 'Zorgplan of traject periodiek evalueren.',
    title: 'Trajectevaluatie voorbereiden',
    policyReason: 'Medewerkershandboek: het zorgplan wordt bijgehouden en de zorg wordt periodiek geëvalueerd.',
    expectedResult: 'De voortgang, doelen, besluiten en nieuwe afspraken zijn samen beoordeeld en vastgelegd.',
    checklist: ['Voortgang doelen controleren', 'Jongere betrekken', 'Netwerk of verwijzer uitnodigen', 'Nieuwe afspraken vastleggen'],
    roles: ['Begeleider', 'Zorgmanager'],
  },
]

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function NieuweTaakPage() {
  const { role } = useWorkspaceRole()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const [searchParams] = useSearchParams()
  const trajectories = useMemo(() => loadTrajectories().filter((item) => !item.endDate), [])
  const availableTemplates = templates.filter((template) => template.roles.includes(role))
  const requestedType = searchParams.get('type') as TaskType | null
  const firstTemplate = availableTemplates.find((item) => item.type === requestedType) ?? availableTemplates[0]
  const storedTasks = useMemo(() => loadWorkQueue<SavedTask>(workItems.map((item) => ({
    ...item,
    status: 'Open',
    policyReason: templates.find((template) => template.type === item.type)?.policyReason ?? '',
    expectedResult: templates.find((template) => template.type === item.type)?.expectedResult,
    checklist: templates.find((template) => template.type === item.type)?.checklist,
  }))), [])
  const existingTask = storedTasks.find((item) => item.id === taskId)
  const existingTemplate = availableTemplates.find((item) => item.type === existingTask?.type) ?? firstTemplate
  const [selectedType, setSelectedType] = useState<TaskType>(existingTask?.type ?? firstTemplate.type)
  const [clientCode, setClientCode] = useState(existingTask?.clientCode ?? searchParams.get('client') ?? '')
  const [title, setTitle] = useState(existingTask?.title ?? firstTemplate.title)
  const [detail, setDetail] = useState(existingTask?.detail ?? searchParams.get('source') ?? '')
  const [expectedResult, setExpectedResult] = useState(existingTask?.expectedResult ?? existingTemplate.expectedResult)
  const [policyReason, setPolicyReason] = useState(existingTask?.policyReason ?? existingTemplate.policyReason)
  const initialOwner = trajectories.find((item) => item.clientCode === (existingTask?.clientCode ?? searchParams.get('client')))?.supervisor ?? ''
  const [owner, setOwner] = useState(existingTask?.owner ?? initialOwner)
  const [dueDate, setDueDate] = useState(existingTask?.dueDate ?? addDays(1))
  const [dueTime, setDueTime] = useState(existingTask?.dueTime ?? '16:00')
  const [urgency, setUrgency] = useState<WorkItem['urgency']>(existingTask?.urgency ?? 'Deze week')
  const [checklist, setChecklist] = useState(existingTask?.checklist ?? existingTemplate.checklist)
  const [submitted, setSubmitted] = useState(false)

  const owners = Array.from(new Set(trajectories.map((item) => item.supervisor)))
  const selectedClient = trajectories.find((item) => item.clientCode === clientCode)
  const activeTemplate = templates.find((template) => template.type === selectedType) ?? firstTemplate
  const isValid = Boolean(clientCode && title.trim() && detail.trim() && expectedResult.trim() && owner && dueDate)

  const selectTemplate = (template: TaskTemplate) => {
    setSelectedType(template.type)
    setTitle(template.title)
    setExpectedResult(template.expectedResult)
    setPolicyReason(template.policyReason)
    setChecklist(template.checklist)
  }

  const selectClient = (code: string) => {
    setClientCode(code)
    const client = trajectories.find((item) => item.clientCode === code)
    if (client) setOwner(client.supervisor)
  }

  const saveTask = () => {
    setSubmitted(true)
    if (!isValid) return
    const dateLabel = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(`${dueDate}T12:00:00`))
    const defaults: SavedTask[] = workItems.map((item) => ({
      ...item,
      status: 'Open',
      policyReason: templates.find((template) => template.type === item.type)?.policyReason ?? '',
    }))
    const current = loadWorkQueue<SavedTask>(defaults)
    const task: SavedTask = {
      id: existingTask?.id ?? `A-${Date.now()}`,
      clientCode,
      type: selectedType,
      title: title.trim(),
      detail: detail.trim(),
      expectedResult: expectedResult.trim(),
      policyReason,
      owner,
      due: `${dateLabel}${dueTime ? `, ${dueTime}` : ''}`,
      dueDate,
      dueTime,
      urgency,
      checklist,
      status: 'Open',
    }
    saveWorkQueue(existingTask ? current.map((item) => item.id === existingTask.id ? task : item) : [task, ...current])
    navigate(`/acties?${existingTask ? 'updated' : 'created'}=1`)
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={RouterLink} to="/acties" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1, px: 0 }}>
          Terug naar werkvoorraad
        </Button>
        <Typography sx={{ fontSize: 20, fontWeight: 780, color: '#172c42' }}>{existingTask ? 'Taak wijzigen' : 'Nieuwe taak toevoegen'}</Typography>
        <Typography sx={{ mt: .5, maxWidth: 760, fontSize: 11.5, lineHeight: 1.6, color: '#718395' }}>
          Kies een herkenbare taak. De verplichte informatie en standaardstappen worden automatisch klaargezet.
        </Typography>
      </Box>

      {submitted && !isValid && <Alert severity="warning">Vul de gemarkeerde verplichte velden in voordat je de taak opslaat.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 330px' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 760, color: '#294157' }}>1. Wat moet er gebeuren?</Typography>
            <Typography sx={{ mt: .3, mb: 1.7, fontSize: 10.5, color: '#8492a2' }}>De suggesties passen bij jouw rol als {role.toLowerCase()}.</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.2 }}>
              {availableTemplates.map((template) => {
                const active = selectedType === template.type
                return (
                  <Button
                    key={template.type}
                    onClick={() => selectTemplate(template)}
                    variant="outlined"
                    sx={{
                      p: 1.6, justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none',
                      borderColor: active ? '#2d75ae' : '#dfe6ec', bgcolor: active ? '#edf5fb' : '#fff',
                      '&:hover': { borderColor: '#2d75ae', bgcolor: '#f4f8fb' },
                    }}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={.7}>
                        {active && <CheckCircleOutlineRoundedIcon sx={{ fontSize: 17 }} />}
                        <Typography sx={{ fontSize: 12, fontWeight: 760 }}>{template.label}</Typography>
                      </Stack>
                      <Typography sx={{ mt: .35, fontSize: 10.2, lineHeight: 1.45, color: '#718395' }}>{template.description}</Typography>
                    </Box>
                  </Button>
                )
              })}
            </Box>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.8, fontSize: 13.5, fontWeight: 760, color: '#294157' }}>2. Voor wie en waarom?</Typography>
            <Stack spacing={1.8}>
              <TextField select required fullWidth disabled={Boolean(existingTask)} label="Jongere / dossier" value={clientCode} onChange={(event) => selectClient(event.target.value)} error={submitted && !clientCode}>
                {trajectories.map((item) => <MenuItem key={item.id} value={item.clientCode}>{item.clientCode} · {item.location} · {item.supervisor}</MenuItem>)}
              </TextField>
              <TextField required fullWidth label="Titel van de taak" value={title} onChange={(event) => setTitle(event.target.value)} error={submitted && !title.trim()} />
              <TextField
                required fullWidth multiline minRows={3} label="Aanleiding en wat er nodig is"
                placeholder="Beschrijf kort wat er is gebeurd, wat ontbreekt of welke afspraak moet worden opgevolgd."
                value={detail} onChange={(event) => setDetail(event.target.value)} error={submitted && !detail.trim()}
              />
              <TextField required fullWidth multiline minRows={2} label="Wanneer is deze taak klaar?" value={expectedResult} onChange={(event) => setExpectedResult(event.target.value)} error={submitted && !expectedResult.trim()} />
              <Box sx={{ p: 1.5, bgcolor: '#f7f9fb', borderRadius: 1.7 }}>
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#7c8d9b', letterSpacing: '.06em' }}>BELEIDSAANLEIDING · AUTOMATISCH INGEVULD</Typography>
                <Typography sx={{ mt: .45, fontSize: 10.6, lineHeight: 1.55, color: '#536a7d' }}>{policyReason}</Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
            <Typography sx={{ mb: 1.8, fontSize: 13.5, fontWeight: 760, color: '#294157' }}>3. Wie doet wat en wanneer?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.8 }}>
              <TextField select required label="Actiehouder" value={owner} onChange={(event) => setOwner(event.target.value)} error={submitted && !owner}>
                {owners.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField required type="date" label="Deadline" value={dueDate} onChange={(event) => setDueDate(event.target.value)} error={submitted && !dueDate} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField type="time" label="Tijd" value={dueTime} onChange={(event) => setDueTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <FormControl>
                <FormLabel sx={{ fontSize: 11 }}>Prioriteit</FormLabel>
                <RadioGroup row value={urgency} onChange={(event) => setUrgency(event.target.value as WorkItem['urgency'])}>
                  <FormControlLabel value="Vandaag" control={<Radio size="small" />} label="Vandaag" />
                  <FormControlLabel value="Deze week" control={<Radio size="small" />} label="Deze week" />
                </RadioGroup>
              </FormControl>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 750, color: '#526a7e' }}>Standaardstappen</Typography>
            <Typography sx={{ mt: .2, mb: .8, fontSize: 10.2, color: '#8492a2' }}>Haal een stap weg als die voor deze taak niet nodig is.</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              {activeTemplate.checklist.map((item) => (
                <FormControlLabel
                  key={item}
                  control={<Checkbox checked={checklist.includes(item)} onChange={() => setChecklist((current) => current.includes(item) ? current.filter((step) => step !== item) : [...current, item])} />}
                  label={item}
                />
              ))}
            </Box>
          </Box>
        </Stack>

        <Box sx={{ p: 2.3, bgcolor: '#fff', border: '1px solid #dce5ec', borderRadius: 2.5, position: { lg: 'sticky' }, top: { lg: 100 } }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 770, color: '#294157' }}>Controleer de taak</Typography>
          <Stack spacing={1.4} sx={{ mt: 1.8 }}>
            <Box><Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#91a0ad' }}>TYPE</Typography><Chip label={selectedType} size="small" sx={{ mt: .5 }} /></Box>
            <Box><Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#91a0ad' }}>JONGERE</Typography><Typography sx={{ mt: .25, fontSize: 11 }}>{clientCode || 'Nog niet gekozen'}{selectedClient ? ` · ${selectedClient.location}` : ''}</Typography></Box>
            <Box><Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#91a0ad' }}>ACTIEHOUDER</Typography><Typography sx={{ mt: .25, fontSize: 11 }}>{owner || 'Nog niet gekozen'}</Typography></Box>
            <Box><Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#91a0ad' }}>DEADLINE</Typography><Typography sx={{ mt: .25, fontSize: 11 }}>{dueDate || 'Nog niet gekozen'}{dueTime ? ` om ${dueTime}` : ''}</Typography></Box>
            <Box><Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#91a0ad' }}>STAPPEN</Typography><Typography sx={{ mt: .25, fontSize: 11 }}>{checklist.length} voorbereid</Typography></Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Button fullWidth variant="contained" size="large" startIcon={<AssignmentTurnedInRoundedIcon />} onClick={saveTask}>
              {existingTask ? 'Wijzigingen opslaan' : 'Taak opslaan'}
            </Button>
            <Button fullWidth component={RouterLink} to="/acties">Annuleren</Button>
          </Stack>
          <Typography sx={{ mt: 1.4, fontSize: 9.7, lineHeight: 1.5, color: '#8a98a5' }}>De taak verschijnt direct in de werkvoorraad van de actiehouder.</Typography>
        </Box>
      </Box>
    </Stack>
  )
}

export default NieuweTaakPage
