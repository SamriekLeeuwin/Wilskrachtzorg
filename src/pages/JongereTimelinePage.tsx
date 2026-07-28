import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useSearchParams } from 'react-router-dom'

type TimelineEvent = {
  id: string
  type: 'phase' | 'incident'
  date: Date
  title: string
  description: string
  color: string
  location: string
  owner: string
  impact: string
  action: string
  status: 'open' | 'in_progress' | 'done'
  dueDate?: Date
  severity?: 'low' | 'medium' | 'high'
}

type YouthTimeline = {
  id: string
  name: string
  events: TimelineEvent[]
}

const mockYouthTimelines: YouthTimeline[] = [
  {
    id: 'Y-001',
    name: 'Client-001',
    events: [
      {
        id: 'Y001-E1',
        type: 'phase',
        date: new Date('2023-01-15'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Gestart met stabilisatiefase',
        color: '#1d4ed8',
        location: 'Leefgroep A',
        owner: 'S. de Vries',
        impact: 'Dagstructuur hersteld binnen 1 week.',
        action: 'Wekelijkse evaluatie met mentor.',
        status: 'done',
      },
      {
        id: 'Y001-E2',
        type: 'incident',
        date: new Date('2023-02-10'),
        title: 'Incident: Ordeverzoeken',
        description: 'Verhoogde onrust op leefgroep, individuele nabespreking gepland.',
        color: '#fbbf24',
        location: 'Leefgroep A',
        owner: 'S. de Vries',
        impact: 'Spanning in groepsmomenten nam toe.',
        action: 'Rustplan en prikkelarm moment ingepland.',
        status: 'done',
        dueDate: new Date('2023-02-17'),
        severity: 'low',
      },
      {
        id: 'Y001-E3',
        type: 'incident',
        date: new Date('2023-03-05'),
        title: 'Incident: Hygiene',
        description: 'Afspraken rondom persoonlijke verzorging zijn opnieuw afgestemd.',
        color: '#f97316',
        location: 'Woonunit 3',
        owner: 'M. van Dijk',
        impact: 'Risico op sociale isolatie door afwijzing peers.',
        action: 'Dagelijks checkmoment ADL met coach.',
        status: 'in_progress',
        dueDate: new Date('2023-03-12'),
        severity: 'medium',
      },
      {
        id: 'Y001-E4',
        type: 'phase',
        date: new Date('2023-04-20'),
        title: 'Fase 2: Verantwoordelijkheid',
        description: 'Overgang naar verantwoordelijkheidsfase',
        color: '#0891b2',
        location: 'Leefgroep A',
        owner: 'M. van Dijk',
        impact: 'Meer eigen regie bij dagplanning.',
        action: 'Doelen tweewekelijks bijstellen.',
        status: 'done',
      },
      {
        id: 'Y001-E5',
        type: 'incident',
        date: new Date('2023-06-15'),
        title: 'Incident: Grensoverschrijding',
        description: 'Normbesef besproken in begeleidingsgesprek, vervolgmonitoring actief.',
        color: '#fbbf24',
        location: 'Leefgroep A',
        owner: 'J. Koster',
        impact: 'Tijdelijke beperking groepsvrijheden.',
        action: 'Herstelgesprek met betrokken jongere en mentor.',
        status: 'in_progress',
        dueDate: new Date('2023-06-22'),
        severity: 'low',
      },
      {
        id: 'Y001-E6',
        type: 'phase',
        date: new Date('2023-09-10'),
        title: 'Fase 3: Onafhankelijkheid',
        description: 'Fase onafhankelijkheid bereikt',
        color: '#059669',
        location: 'Trainingswoning',
        owner: 'J. Koster',
        impact: 'Zelfredzaamheid en taakuitvoering verbeterd.',
        action: 'Voorbereiding op uitstroomplan opstarten.',
        status: 'open',
        dueDate: new Date('2023-09-17'),
      },
    ],
  },
  {
    id: 'Y-002',
    name: 'Client-002',
    events: [
      {
        id: 'Y002-E1',
        type: 'phase',
        date: new Date('2023-02-01'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Began stabilization phase',
        color: '#1d4ed8',
        location: 'Leefgroep B',
        owner: 'R. Meijer',
        impact: 'Start basisstructuur en veiligheidsafspraken.',
        action: 'Dagstart en dagafsluiting monitoren.',
        status: 'done',
      },
      {
        id: 'Y002-E2',
        type: 'incident',
        date: new Date('2023-03-20'),
        title: 'Incident: Agressie',
        description: 'Escalatie geregistreerd en veiligheidsplan geactualiseerd.',
        color: '#dc2626',
        location: 'Leefgroep B',
        owner: 'R. Meijer',
        impact: 'Veiligheidsrisico voor groepsgenoten.',
        action: 'Dagelijks veiligheidscheck + multidisciplinair overleg.',
        status: 'open',
        dueDate: new Date('2023-03-23'),
        severity: 'high',
      },
      {
        id: 'Y002-E3',
        type: 'phase',
        date: new Date('2023-05-15'),
        title: 'Fase 1 Herhaling',
        description: 'Teruggezet naar stabilisatie',
        color: '#1d4ed8',
        location: 'Leefgroep B',
        owner: 'N. Janssen',
        impact: 'Terugval in emotieregulatie.',
        action: 'Doelen versmald naar veiligheid en ritme.',
        status: 'in_progress',
      },
      {
        id: 'Y002-E4',
        type: 'incident',
        date: new Date('2023-07-10'),
        title: 'Incident: Middelengebruik',
        description: 'Signaal besproken met jongere en ketenpartner, extra begeleiding ingezet.',
        color: '#f97316',
        location: 'Extern verlof',
        owner: 'N. Janssen',
        impact: 'Vertrouwensrelatie en verlofopbouw onder druk.',
        action: 'Urinecontrole en terugvalpreventie-plan actualiseren.',
        status: 'open',
        dueDate: new Date('2023-07-15'),
        severity: 'medium',
      },
    ],
  },
  {
    id: 'Y-003',
    name: 'Client-003',
    events: [
      {
        id: 'Y003-E1',
        type: 'phase',
        date: new Date('2023-03-15'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Intakefase afgerond en begeleidingsdoelen geactiveerd.',
        color: '#1d4ed8',
        location: 'Leefgroep C',
        owner: 'L. Bakker',
        impact: 'Start van begeleidingslijn en rust in gedrag.',
        action: 'Mentorgesprekken wekelijks uitvoeren.',
        status: 'done',
      },
      {
        id: 'Y003-E2',
        type: 'phase',
        date: new Date('2023-06-10'),
        title: 'Fase 2: Verantwoordelijkheid',
        description: 'Zelfredzaamheidstraining en dagstructuur stabiel.',
        color: '#0891b2',
        location: 'Leefgroep C',
        owner: 'L. Bakker',
        impact: 'Minder externe sturing nodig.',
        action: 'Takenpakket uitbreiden met budgettraining.',
        status: 'done',
      },
      {
        id: 'Y003-E3',
        type: 'phase',
        date: new Date('2023-09-20'),
        title: 'Fase 3: Onafhankelijkheid',
        description: 'Meer zelfstandige doelen met periodieke evaluaties.',
        color: '#059669',
        location: 'Trainingswoning',
        owner: 'K. Bos',
        impact: 'Zelfstandig functioneren zichtbaar verbeterd.',
        action: 'Uitstroom-competenties maandelijks beoordelen.',
        status: 'in_progress',
      },
      {
        id: 'Y003-E4',
        type: 'phase',
        date: new Date('2025-01-15'),
        title: 'Fase 4: Voorbereiding uitstroom',
        description: 'Uitstroom voorbereiding',
        color: '#7c3aed',
        location: 'Trainingswoning',
        owner: 'K. Bos',
        impact: 'Overdracht richting gemeente en vervolgzorg opgestart.',
        action: 'Definitieve uitstroomdatum vastleggen met ketenpartners.',
        status: 'open',
        dueDate: new Date('2025-01-22'),
      },
    ],
  },
]

type EventTypeFilter = 'all' | 'phase' | 'incident'
type SeverityFilter = 'all' | 'low' | 'medium' | 'high'
type PeriodFilter = 'all' | '30d' | '90d' | '365d'
type ActionFilter = 'all' | 'action-required' | 'open-only'

const severityLabel = {
  low: 'Laag',
  medium: 'Gemiddeld',
  high: 'Hoog',
} as const

function formatDate(date: Date) {
  return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isActionRequired(event: TimelineEvent) {
  if (event.type === 'phase') {
    return event.status !== 'done'
  }

  return event.status !== 'done' || event.severity === 'high' || event.severity === 'medium'
}

function JongereTimelinePage() {
  const [searchParams] = useSearchParams()
  const [selectedYouthId, setSelectedYouthId] = useState('Y-001')
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')

  useEffect(() => {
    const fromQuery = searchParams.get('y')
    if (!fromQuery) {
      return
    }

    const normalized = fromQuery.startsWith('J-') ? `Y-${fromQuery.slice(2)}` : fromQuery
    const exists = mockYouthTimelines.some((y) => y.id === normalized)
    if (exists) {
      setSelectedYouthId(normalized)
    }
  }, [searchParams])

  const selectedYouth = useMemo(() => mockYouthTimelines.find((y) => y.id === selectedYouthId), [selectedYouthId])

  const sortedEvents = useMemo(
    () => (selectedYouth ? [...selectedYouth.events].sort((a, b) => b.date.getTime() - a.date.getTime()) : []),
    [selectedYouth]
  )

  const referenceDate = useMemo(() => {
    if (sortedEvents.length === 0) {
      return new Date()
    }

    return new Date(sortedEvents[0].date)
  }, [sortedEvents])

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) {
        return false
      }

      if (severityFilter !== 'all') {
        if (event.type !== 'incident' || event.severity !== severityFilter) {
          return false
        }
      }

      if (periodFilter !== 'all') {
        const days = Number(periodFilter.replace('d', ''))
        const threshold = new Date(referenceDate)
        threshold.setDate(referenceDate.getDate() - days)
        if (event.date < threshold) {
          return false
        }
      }

      if (actionFilter === 'action-required' && !isActionRequired(event)) {
        return false
      }

      if (actionFilter === 'open-only' && event.status === 'done') {
        return false
      }

      return true
    })
  }, [actionFilter, eventTypeFilter, periodFilter, referenceDate, severityFilter, sortedEvents])

  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
      const key = monthKey(event.date)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(event)
      return acc
    }, {})
  }, [filteredEvents])

  const groupOrder = useMemo(
    () => Object.keys(groupedEvents).sort((a, b) => (a > b ? -1 : 1)),
    [groupedEvents]
  )

  const incidentCount = useMemo(() => sortedEvents.filter((e) => e.type === 'incident').length, [sortedEvents])
  const phaseCount = useMemo(() => sortedEvents.filter((e) => e.type === 'phase').length, [sortedEvents])

  const activePhase = useMemo(() => sortedEvents.find((e) => e.type === 'phase'), [sortedEvents])

  const riskLevel = useMemo(() => {
    const ninetyDaysAgo = new Date(referenceDate)
    ninetyDaysAgo.setDate(referenceDate.getDate() - 90)

    const recentIncidents = sortedEvents.filter(
      (event) => event.type === 'incident' && event.date >= ninetyDaysAgo
    )

    const score = recentIncidents.reduce((acc, event) => {
      if (event.severity === 'high') {
        return acc + 3
      }
      if (event.severity === 'medium') {
        return acc + 2
      }
      return acc + 1
    }, 0)

    if (score >= 6) {
      return { label: 'Hoog', color: 'error' as const }
    }

    if (score >= 3) {
      return { label: 'Midden', color: 'warning' as const }
    }

    return { label: 'Laag', color: 'success' as const }
  }, [referenceDate, sortedEvents])

  const openActions = useMemo(
    () => sortedEvents.filter((event) => isActionRequired(event)).sort((a, b) => a.date.getTime() - b.date.getTime()),
    [sortedEvents]
  )

  const nextReviewDate = useMemo(() => {
    const datedOpenActions = openActions.filter((event) => event.dueDate)
    if (datedOpenActions.length === 0) {
      return null
    }

    const next = [...datedOpenActions].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) {
        return 0
      }
      return a.dueDate.getTime() - b.dueDate.getTime()
    })[0]

    return next.dueDate ?? null
  }, [openActions])

  const todayRelevant = useMemo(() => {
    const nextSevenDays = new Date(referenceDate)
    nextSevenDays.setDate(referenceDate.getDate() + 7)

    return sortedEvents.filter((event) => {
      if (event.type === 'incident' && event.severity === 'high') {
        return true
      }

      if (event.dueDate && event.dueDate <= nextSevenDays && event.status !== 'done') {
        return true
      }

      return false
    })
  }, [referenceDate, sortedEvents])

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Jongere Timeline
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
            Actuele fase, risico, open acties en gebeurtenissen in de tijd.
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="jongere-select-label">Selecteer jongere</InputLabel>
                <Select
                  labelId="jongere-select-label"
                  value={selectedYouthId}
                  label="Selecteer jongere"
                  onChange={(e) => setSelectedYouthId(e.target.value)}
                >
                  {mockYouthTimelines.map((y) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2.25 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={eventTypeFilter}
                  label="Type"
                  onChange={(e) => setEventTypeFilter(e.target.value as EventTypeFilter)}
                >
                  <MenuItem value="all">Alles</MenuItem>
                  <MenuItem value="phase">Alleen fasen</MenuItem>
                  <MenuItem value="incident">Alleen incidenten</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2.25 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="severity-filter-label">Ernst</InputLabel>
                <Select
                  labelId="severity-filter-label"
                  value={severityFilter}
                  label="Ernst"
                  onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                >
                  <MenuItem value="all">Alles</MenuItem>
                  <MenuItem value="high">Hoog</MenuItem>
                  <MenuItem value="medium">Gemiddeld</MenuItem>
                  <MenuItem value="low">Laag</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2.25 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="period-filter-label">Periode</InputLabel>
                <Select
                  labelId="period-filter-label"
                  value={periodFilter}
                  label="Periode"
                  onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                >
                  <MenuItem value="all">Alles</MenuItem>
                  <MenuItem value="30d">Laatste 30 dagen</MenuItem>
                  <MenuItem value="90d">Laatste 90 dagen</MenuItem>
                  <MenuItem value="365d">Laatste 12 maanden</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2.25 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="action-filter-label">Actie</InputLabel>
                <Select
                  labelId="action-filter-label"
                  value={actionFilter}
                  label="Actie"
                  onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                >
                  <MenuItem value="all">Alles</MenuItem>
                  <MenuItem value="action-required">Actie vereist</MenuItem>
                  <MenuItem value="open-only">Alleen openstaand</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedYouth && (
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption">Actuele fase</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 0.5 }}>
                      {activePhase ? activePhase.title : 'Onbekend'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, md: 2.25 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption">Risico-indicatie</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={riskLevel.label} color={riskLevel.color} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, md: 2.25 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption">Open acties</Typography>
                    <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#b45309' }}>
                      {openActions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, md: 2.25 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption">Fasen doorlopen</Typography>
                    <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'primary.main' }}>
                      {phaseCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, md: 2.25 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="caption">Incidenten</Typography>
                    <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#dc2626' }}>
                      {incidentCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {selectedYouth && (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Tijdlijn: {selectedYouth.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
                  {filteredEvents.length} gefilterde gebeurtenissen
                </Typography>

                {groupOrder.length === 0 && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Geen gebeurtenissen gevonden met de gekozen filters.
                  </Alert>
                )}

                <Stack spacing={1}>
                  {groupOrder.map((groupKey) => {
                    const groupItems = groupedEvents[groupKey]
                    const firstDate = groupItems[0]?.date ?? referenceDate
                    const label = firstDate.toLocaleDateString('nl-NL', {
                      month: 'long',
                      year: 'numeric',
                    })

                    return (
                      <Accordion key={groupKey} defaultExpanded>
                        <AccordionSummary>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                              {label}
                            </Typography>
                            <Chip label={`${groupItems.length} items`} size="small" />
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ pt: 0 }}>
                          <Stack spacing={1}>
                            {groupItems.map((event) => (
                              <Box
                                key={event.id}
                                sx={{
                                  border: '1px solid #e2e8f0',
                                  borderLeft: `4px solid ${event.color}`,
                                  borderRadius: 2,
                                  p: 1.5,
                                  bgcolor: '#fbfcff',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{event.title}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(event.date)}
                                  </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {event.description}
                                </Typography>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Impact op zorgdoelen
                                    </Typography>
                                    <Typography variant="body2">{event.impact}</Typography>
                                  </Grid>

                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Afgesproken actie
                                    </Typography>
                                    <Typography variant="body2">{event.action}</Typography>
                                  </Grid>
                                </Grid>

                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                  <Chip size="small" label={event.type === 'phase' ? 'Fase' : 'Incident'} />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`Status: ${
                                      event.status === 'open'
                                        ? 'Open'
                                        : event.status === 'in_progress'
                                        ? 'In uitvoering'
                                        : 'Afgerond'
                                    }`}
                                  />
                                  <Chip size="small" variant="outlined" label={`Eigenaar: ${event.owner}`} />
                                  <Chip size="small" variant="outlined" label={`Locatie: ${event.location}`} />
                                  {event.severity && (
                                    <Chip
                                      size="small"
                                      label={`Ernst: ${severityLabel[event.severity]}`}
                                      color={
                                        event.severity === 'high'
                                          ? 'error'
                                          : event.severity === 'medium'
                                          ? 'warning'
                                          : 'success'
                                      }
                                    />
                                  )}
                                  {event.dueDate && (
                                    <Chip
                                      size="small"
                                      color={event.status === 'done' ? 'default' : 'warning'}
                                      label={`Deadline: ${formatDate(event.dueDate)}`}
                                    />
                                  )}
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={1.5} sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', mb: 1.5 }}>Vandaag relevant</Typography>

                  {todayRelevant.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Geen urgente punten in de komende 7 dagen.
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    {todayRelevant.slice(0, 3).map((event) => (
                      <Box key={event.id}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{event.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.dueDate ? `Deadline ${formatDate(event.dueDate)}` : `Geregistreerd ${formatDate(event.date)}`}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Open acties</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                    {nextReviewDate
                      ? `Volgende evaluatie uiterlijk ${formatDate(nextReviewDate)}`
                      : 'Nog geen evaluatiedatum vastgelegd.'}
                  </Typography>

                  <Divider sx={{ my: 1.25 }} />

                  <Stack spacing={1.1}>
                    {openActions.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Geen open acties.
                      </Typography>
                    )}

                    {openActions.map((event) => (
                      <Box key={`action-${event.id}`} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 1 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{event.title}</Typography>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{event.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.owner}
                          {event.dueDate ? ` • Deadline ${formatDate(event.dueDate)}` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  )
}

export default JongereTimelinePage
