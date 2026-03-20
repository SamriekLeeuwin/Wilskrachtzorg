import { useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'

type TimelineEvent = {
  type: 'phase' | 'incident'
  date: Date
  title: string
  description: string
  color: string
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
        type: 'phase',
        date: new Date('2023-01-15'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Gestart met stabilisatiefase',
        color: '#1d4ed8',
      },
      {
        type: 'incident',
        date: new Date('2023-02-10'),
        title: 'Incident: Ordeverzoeken',
        description: 'Verhoogde onrust op leefgroep, individuele nabespreking gepland.',
        color: '#fbbf24',
        severity: 'low',
      },
      {
        type: 'incident',
        date: new Date('2023-03-05'),
        title: 'Incident: Hygiene',
        description: 'Afspraken rondom persoonlijke verzorging zijn opnieuw afgestemd.',
        color: '#f97316',
        severity: 'medium',
      },
      {
        type: 'phase',
        date: new Date('2023-04-20'),
        title: 'Fase 2: Verantwoordelijkheid',
        description: 'Overgang naar verantwoordelijkheidsfase',
        color: '#0891b2',
      },
      {
        type: 'incident',
        date: new Date('2023-06-15'),
        title: 'Incident: Grensoverschrijding',
        description: 'Normbesef besproken in begeleidingsgesprek, vervolgmonitoring actief.',
        color: '#fbbf24',
        severity: 'low',
      },
      {
        type: 'phase',
        date: new Date('2023-09-10'),
        title: 'Fase 3: Onafhankelijkheid',
        description: 'Fase onafhankelijkheid bereikt',
        color: '#059669',
      },
    ],
  },
  {
    id: 'Y-002',
    name: 'Client-002',
    events: [
      {
        type: 'phase',
        date: new Date('2023-02-01'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Began stabilization phase',
        color: '#1d4ed8',
      },
      {
        type: 'incident',
        date: new Date('2023-03-20'),
        title: 'Incident: Agressie',
        description: 'Escalatie geregistreerd en veiligheidsplan geactualiseerd.',
        color: '#dc2626',
        severity: 'high',
      },
      {
        type: 'phase',
        date: new Date('2023-05-15'),
        title: 'Fase 1 Herhaling',
        description: 'Teruggezet naar stabilisatie',
        color: '#1d4ed8',
      },
      {
        type: 'incident',
        date: new Date('2023-07-10'),
        title: 'Incident: Middelengebruik',
        description: 'Signaal besproken met jongere en ketenpartner, extra begeleiding ingezet.',
        color: '#f97316',
        severity: 'medium',
      },
    ],
  },
  {
    id: 'Y-003',
    name: 'Client-003',
    events: [
      {
        type: 'phase',
        date: new Date('2023-03-15'),
        title: 'Fase 1: Stabilisatie gestart',
        description: 'Intakefase afgerond en begeleidingsdoelen geactiveerd.',
        color: '#1d4ed8',
      },
      {
        type: 'phase',
        date: new Date('2023-06-10'),
        title: 'Fase 2: Verantwoordelijkheid',
        description: 'Zelfredzaamheidstraining en dagstructuur stabiel.',
        color: '#0891b2',
      },
      {
        type: 'phase',
        date: new Date('2023-09-20'),
        title: 'Fase 3: Onafhankelijkheid',
        description: 'Meer zelfstandige doelen met periodieke evaluaties.',
        color: '#059669',
      },
      {
        type: 'phase',
        date: new Date('2025-01-15'),
        title: 'Fase 4: Voorbereiding uitstroom',
        description: 'Uitstroom voorbereiding',
        color: '#7c3aed',
      },
    ],
  },
]

function JongereTimelinePage() {
  const [selectedYouthId, setSelectedYouthId] = useState('Y-001')

  const selectedYouth = useMemo(() => mockYouthTimelines.find((y) => y.id === selectedYouthId), [selectedYouthId])

  const sortedEvents = useMemo(
    () => (selectedYouth ? [...selectedYouth.events].sort((a, b) => a.date.getTime() - b.date.getTime()) : []),
    [selectedYouth]
  )

  const incidentCount = useMemo(() => sortedEvents.filter((e) => e.type === 'incident').length, [sortedEvents])
  const phaseCount = useMemo(() => sortedEvents.filter((e) => e.type === 'phase').length, [sortedEvents])

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Jongere Ontwikkel Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
            Visualisatie van faseprogressie en incidenten chronologisch per jongere.
          </Typography>

          <FormControl size="small" sx={{ minWidth: 280, mb: 1.5 }}>
            <InputLabel id="jongere-select-label">Selecteer jongere</InputLabel>
            <Select labelId="jongere-select-label" value={selectedYouthId} label="Selecteer jongere" onChange={(e) => setSelectedYouthId(e.target.value)}>
              {mockYouthTimelines.map((y) => (
                <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedYouth && (
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Fasen doorlopen</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: 'primary.main' }}>{phaseCount}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined"><CardContent sx={{ p: 1.5 }}><Typography variant="caption">Incidenten geregistreerd</Typography><Typography sx={{ fontSize: 26, fontWeight: 700, color: '#dc2626' }}>{incidentCount}</Typography></CardContent></Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {selectedYouth && (
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mb: 1.25 }}>
              Tijdlijn: {selectedYouth.name}
            </Typography>

            <Stack spacing={1.25}>
              {sortedEvents.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderLeft: `4px solid ${event.color}`,
                    borderRadius: 2,
                    p: 1.25,
                    bgcolor: '#fbfcff',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{event.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{event.date.toLocaleDateString('nl-NL')}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                  {event.severity && (
                    <Chip
                      sx={{ mt: 1 }}
                      size="small"
                      label={event.severity === 'high' ? 'Hoog' : event.severity === 'medium' ? 'Gemiddeld' : 'Laag'}
                      color={event.severity === 'high' ? 'error' : event.severity === 'medium' ? 'warning' : 'success'}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

export default JongereTimelinePage
