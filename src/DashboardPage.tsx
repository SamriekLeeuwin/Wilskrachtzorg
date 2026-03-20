type KpiItem = {
  title: string
  value: string
  delta: string
}

const kpis: KpiItem[] = [
  { title: 'Actieve Jongeren', value: '34', delta: '+4 t.o.v. vorige maand' },
  { title: 'Uitstroom dit jaar', value: '18', delta: '+2 sinds vorige kwartaal' },
  { title: 'Succespercentage', value: '72%', delta: '+6% op jaarbasis' },
  { title: 'Gem. Trajectduur', value: '8.4 mnd', delta: '-0.8 mnd verbetering' },
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
    <>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {kpis.map((kpi) => (
          <article
            key={kpi.title}
            style={{
              background: '#fff',
              border: '1px solid #e5e9f2',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 8px 22px rgba(7, 52, 106, 0.05)',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: 14 }}>{kpi.title}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', marginTop: 4 }}>{kpi.value}</div>
            <div style={{ marginTop: 6, color: 'var(--primary-color)', fontSize: 13 }}>{kpi.delta}</div>
          </article>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <article
          style={{
            background: '#fff',
            border: '1px solid #e5e9f2',
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Succestrend per jaar</h3>
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
                      background: 'var(--primary-color)',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          style={{
            background: '#fff',
            border: '1px solid #e5e9f2',
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Verdeling woonstatus</h3>
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

      <section
        style={{
          background: '#fff',
          border: '1px solid #e5e9f2',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#111827' }}>Recente uitstroomregistraties</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', fontSize: 14 }}>
              <th style={{ textAlign: 'left', padding: 10 }}>Jongere</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Locatie</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Begeleider</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Woonstatus</th>
              <th style={{ textAlign: 'left', padding: 10 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {outflowRows.map((row) => (
              <tr key={row.jongere} style={{ borderTop: '1px solid #eef2f7' }}>
                <td style={{ padding: 10 }}>{row.jongere}</td>
                <td style={{ padding: 10 }}>{row.locatie}</td>
                <td style={{ padding: 10 }}>{row.begeleider}</td>
                <td style={{ padding: 10 }}>{row.woonstatus}</td>
                <td style={{ padding: 10 }}>
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: row.status === 'Succesvol' ? '#065f46' : '#92400e',
                      background: row.status === 'Succesvol' ? '#d1fae5' : '#fef3c7',
                    }}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default DashboardPage