import type { CSSProperties } from 'react'

type PlaceholderPageProps = {
  title: string
  description: string
}

type InsightCard = {
  label: string
  phase: string
  metricValue: string
  metricUnit: string
  trend: string
  recommendation: string
  variant?: 'default' | 'warning'
}

const insightCards: InsightCard[] = [
  {
    label: 'Hoogste druk',
    phase: 'Stabilisatie',
    metricValue: '24',
    metricUnit: 'incidenten',
    trend: '+4 vs vorige maand',
    recommendation: 'Extra dagstart-checks per team',
    variant: 'warning',
  },
  {
    label: 'Laagste druk',
    phase: 'Voorbereiding uitstroom',
    metricValue: '1',
    metricUnit: 'incident',
    trend: '-2 vs vorige maand',
    recommendation: 'Aanpak van deze fase inzetten als referentie',
  },
  {
    label: 'Trend',
    phase: 'Fase 3-4',
    metricValue: '18%',
    metricUnit: 'daling',
    trend: 'Incidentlast daalt in latere fases',
    recommendation: 'Focus op snellere doorstroom uit fase 1',
  },
  {
    label: 'Actie nodig',
    phase: 'Stabilisatie',
    metricValue: '2',
    metricUnit: 'teams prioriteit',
    trend: 'Ordeverzoeken en ontwijking dominant',
    recommendation: 'Plan multidisciplinair casusoverleg binnen 48 uur',
    variant: 'warning',
  },
]

const kpiCards = [
  { label: 'Totaal incidenten', value: '49' },
  { label: 'Gem. per jongere', value: '1.4' },
  { label: 'Hoge ernst', value: '7' },
  { label: 'Actieve fases', value: '4' },
]

const heatmapColumns = ['Orde', 'Ontwijking', 'Hygiene', 'Agressie']

const heatmapRows = [
  { phase: 'Stabilisatie', values: [8, 6, 4, 3] },
  { phase: 'Verantwoordelijkheid', values: [5, 3, 2, 2] },
  { phase: 'Onafhankelijkheid', values: [2, 1, 1, 1] },
  { phase: 'Uitstroom', values: [1, 0, 0, 0] },
]

const maxHeatmapValue = Math.max(...heatmapRows.flatMap((row) => row.values))

function getHeatmapCellStyle(value: number): CSSProperties {
  if (value === 0) {
    return {
      background: '#fafcff',
      color: '#9ca3af',
      opacity: 0.66,
    }
  }

  const ratio = value / maxHeatmapValue
  const isKey = ratio >= 0.75

  if (isKey) {
    return {
      background: '#fee2e2',
      color: '#7f1d1d',
      outline: '2px solid rgba(185, 28, 28, 0.22)',
      outlineOffset: -2,
    }
  }

  return {
    background: '#eff6ff',
    color: '#334155',
    opacity: 0.78,
  }
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page-stack analytics-page">
      <section className="card" style={{ padding: 28 }}>
        <h2 className="card-title" style={{ fontSize: 24 }}>
          {title}
        </h2>
        <p className="card-subtitle">{description}</p>

        <div className="insights-grid" style={{ marginTop: 18 }}>
          {insightCards.map((insight) => (
            <article key={insight.label} className="kpi-card insight-dominant">
              <div className="kpi-label">{insight.label}</div>
              <div
                className="insight-phase"
                style={{
                  color: insight.variant === 'warning' ? '#b91c1c' : 'var(--color-primary)',
                  fontSize: '1.25rem',
                  marginTop: 8,
                }}
              >
                {insight.phase}
              </div>
              <div
                className="kpi-value"
                style={{
                  fontSize: '2.6rem',
                  marginTop: 10,
                  color: insight.variant === 'warning' ? '#b91c1c' : 'var(--color-text)',
                }}
              >
                {insight.metricValue}
              </div>
              <div className="kpi-label" style={{ marginTop: 2, fontSize: '0.7rem' }}>{insight.metricUnit}</div>
              <div className={insight.variant === 'warning' ? 'kpi-trend trend-negative' : 'kpi-trend'} style={{ fontSize: '0.72rem' }}>
                {insight.trend}
              </div>
              <div className="insight-caption">{insight.recommendation}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.label} className="kpi-card">
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">{card.value}</div>
          </article>
        ))}
      </section>

      <section className="card">
        <h3 className="card-title">Waar concentreert risico zich?</h3>
        <div className="ui-table-wrap" style={{ marginTop: 14 }}>
          <table className="ui-table heatmap-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Fase</th>
                {heatmapColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row) => (
                <tr key={row.phase}>
                  <td>{row.phase}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.phase}-${heatmapColumns[index]}`} style={getHeatmapCellStyle(value)}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="two-col">
        <article className="card">
          <h3 className="card-title">Aanbevolen acties</h3>
          <div className="stat-list" style={{ marginTop: 14 }}>
            {[
              { label: 'Stabilisatie', action: 'Dagelijks monitoren op ordeverzoeken', priority: 'Hoog' },
              { label: 'Verantwoordelijkheid', action: 'Wekelijkse coaching op ontwijkgedrag', priority: 'Midden' },
              { label: 'Onafhankelijkheid', action: 'Succesinterventies borgen in teamoverdracht', priority: 'Laag' },
            ].map((item) => (
              <div key={item.label} className="stat-row">
                <div>
                  <div className="stat-row-label">{item.label}</div>
                  <div className="stat-row-sub">{item.action}</div>
                </div>
                <span className={item.priority === 'Hoog' ? 'badge badge-danger' : item.priority === 'Midden' ? 'badge badge-warning' : 'badge badge-success'}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3 className="card-title">Beslisfocus deze week</h3>
          <div className="insight-list" style={{ marginTop: 14 }}>
            <div className="insight-item">
              <div>
                <h4>Capaciteit verschuiven naar fase 1</h4>
                <p>Daar zit de grootste incidentdruk en hoogste winstpotentie.</p>
              </div>
            </div>
            <div className="insight-item">
              <div>
                <h4>Monitor agressie en middelengebruik apart</h4>
                <p>Deze signalen bepalen de urgentie van casusopvolging.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default PlaceholderPage