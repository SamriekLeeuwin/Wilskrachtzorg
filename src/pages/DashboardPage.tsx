type KpiItem = {
  title: string
  value: string
  delta: string
  trend: 'positive' | 'negative'
}

const kpis: KpiItem[] = [
  { title: 'Actieve Jongeren', value: '34', delta: '+4 t.o.v. vorige maand', trend: 'positive' },
  { title: 'Uitstroom dit jaar', value: '18', delta: '+2 sinds vorige kwartaal', trend: 'positive' },
  { title: 'Succespercentage', value: '72%', delta: '+6% op jaarbasis', trend: 'positive' },
  { title: 'Gem. Trajectduur', value: '8.4 mnd', delta: '-0.8 mnd verbetering', trend: 'positive' },
]

const trendData = [
  { year: 2022, value: 58 },
  { year: 2023, value: 64 },
  { year: 2024, value: 69 },
  { year: 2025, value: 72 },
]

const outflowRows = [
  {
    jongere: 'Client-001',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    woonstatus: 'Studio',
    status: 'Succesvol',
  },
  {
    jongere: 'Client-002',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    woonstatus: 'Terug naar ouders',
    status: 'Doorverwezen',
  },
  {
    jongere: 'Client-003',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    woonstatus: 'Kamer',
    status: 'Succesvol',
  },
]

function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <article key={kpi.title} className="kpi-card">
            <div className="kpi-label">{kpi.title}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-trend ${kpi.trend === 'positive' ? 'trend-positive' : 'trend-negative'}`}>{kpi.delta}</div>
          </article>
        ))}
      </section>

      <section className="two-col">
        <article className="card">
          <h3 className="card-title">Succestrend per jaar</h3>
          <div style={{ marginTop: 14 }}>
            {trendData.map((point) => (
              <div key={point.year} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: '#4b5563',
                    marginBottom: 4,
                  }}
                >
                  <span>{point.year}</span>
                  <span>{point.value}%</span>
                </div>
                <div style={{ height: 9, borderRadius: 999, background: '#eef2f7', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${point.value}%`,
                      background: 'var(--color-primary)',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3 className="card-title">Verdeling woonstatus</h3>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              { label: 'Studio', value: 42 },
              { label: 'Kamer', value: 24 },
              { label: 'Terug naar ouders', value: 20 },
              { label: 'Crisisopvang', value: 14 },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#374151' }}>{item.label}</span>
                <strong style={{ color: '#111827' }}>{item.value}%</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h3 className="card-title">Recente uitstroomregistraties</h3>
        <div className="ui-table-wrap" style={{ marginTop: 12 }}>
          <table className="ui-table">
          <thead>
            <tr>
              <th>Jongere</th>
              <th>Locatie</th>
              <th>Begeleider</th>
              <th>Woonstatus</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {outflowRows.map((row) => (
              <tr key={row.jongere}>
                <td>{row.jongere}</td>
                <td>{row.locatie}</td>
                <td>{row.begeleider}</td>
                <td>{row.woonstatus}</td>
                <td>
                  <span
                    className={row.status === 'Succesvol' ? 'badge badge-success' : 'badge badge-warning'}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage