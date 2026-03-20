import { useState, useMemo } from 'react'

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

  const selectedYouth = useMemo(
    () => mockYouthTimelines.find((y) => y.id === selectedYouthId),
    [selectedYouthId]
  )

  const sortedEvents = useMemo(
    () => (selectedYouth ? [...selectedYouth.events].sort((a, b) => a.date.getTime() - b.date.getTime()) : []),
    [selectedYouth]
  )

  const incidentCount = useMemo(() => sortedEvents.filter((e) => e.type === 'incident').length, [sortedEvents])
  const phaseCount = useMemo(() => sortedEvents.filter((e) => e.type === 'phase').length, [sortedEvents])

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Jongere Ontwikkel Timeline
        </h2>
        <p className="card-subtitle">
          Visualisatie van faseprogressie en incidenten chronologisch per jongere.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#7b8494', marginBottom: 8 }}>Selecteer jongere</label>
          <select value={selectedYouthId} onChange={(e) => setSelectedYouthId(e.target.value)} className="ui-select" style={{ maxWidth: 320 }}>
            {mockYouthTimelines.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {selectedYouth && (
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className="kpi-card">
              <div className="kpi-label">Fasen doorlopen</div>
              <div className="kpi-value" style={{ color: 'var(--color-primary)' }}>
                {phaseCount}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Incidenten geregistreerd</div>
              <div className="kpi-value" style={{ color: '#dc2626' }}>
                {incidentCount}
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedYouth && (
        <section className="card">
          <h3 className="card-title" style={{ marginBottom: 12 }}>
            Tijdlijn: {selectedYouth.name}
          </h3>

          <div className="timeline-list">
            {sortedEvents.map((event, index) => (
              <div key={index} className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{
                    backgroundColor: event.color,
                    width: event.type === 'incident' ? 10 : 14,
                    height: event.type === 'incident' ? 10 : 14,
                  }}
                />

                <div className="timeline-panel">
                  <div className="timeline-meta">
                    <h4 className="timeline-title">{event.title}</h4>
                    <span className="timeline-date">{event.date.toLocaleDateString('nl-NL')}</span>
                  </div>
                  <p className="timeline-description">{event.description}</p>
                  {event.severity && (
                    <span
                      className={`badge ${
                        event.severity === 'high'
                          ? 'badge-danger'
                          : event.severity === 'medium'
                            ? 'badge-warning'
                            : 'badge-success'
                      }`}
                      style={{ marginTop: 8 }}
                    >
                      {event.severity === 'high' ? 'Hoog' : event.severity === 'medium' ? 'Gemiddeld' : 'Laag'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default JongereTimelinePage
