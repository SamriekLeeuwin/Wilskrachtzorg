import { useMemo, useState } from 'react'

type RapportRow = {
  id: string
  jaar: string
  locatie: 'Tilburg' | 'Breda'
  begeleider: string
  uitstroomTotaal: number
  succesvolPct: number
  doorverwezenPct: number
  werkOfSchoolPct: number
}

const rapportRows: RapportRow[] = [
  {
    id: 'R-001',
    jaar: '2025',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    uitstroomTotaal: 14,
    succesvolPct: 78,
    doorverwezenPct: 22,
    werkOfSchoolPct: 71,
  },
  {
    id: 'R-002',
    jaar: '2025',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    uitstroomTotaal: 10,
    succesvolPct: 67,
    doorverwezenPct: 30,
    werkOfSchoolPct: 63,
  },
  {
    id: 'R-003',
    jaar: '2024',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    uitstroomTotaal: 12,
    succesvolPct: 62,
    doorverwezenPct: 35,
    werkOfSchoolPct: 58,
  },
]

function RapportagesPage() {
  const [jaarFilter, setJaarFilter] = useState<'Alle' | '2025' | '2024'>('Alle')
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')
  const [begeleiderFilter, setBegeleiderFilter] = useState<'Alle' | 'N. Janssen' | 'S. Vermeer' | 'A. de Wit'>('Alle')
  const [exportMessage, setExportMessage] = useState('')

  const filteredRows = useMemo(() => {
    return rapportRows.filter((row) => {
      const matchesYear = jaarFilter === 'Alle' || row.jaar === jaarFilter
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      const matchesBegeleider = begeleiderFilter === 'Alle' || row.begeleider === begeleiderFilter
      return matchesYear && matchesLocatie && matchesBegeleider
    })
  }, [jaarFilter, locatieFilter, begeleiderFilter])

  const totaalUitstroom = filteredRows.reduce((sum, row) => sum + row.uitstroomTotaal, 0)
  const gemiddeldSucces =
    filteredRows.length > 0 ? Math.round(filteredRows.reduce((sum, row) => sum + row.succesvolPct, 0) / filteredRows.length) : 0

  const handleExport = () => {
    const timestamp = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    setExportMessage(`Mock export gestart om ${timestamp} (CSV/PDF volgt in backend-fase).`)
  }

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Rapportages
        </h2>
        <p className="card-subtitle">
          Filter op jaar, locatie en begeleider. Gebruik export als mockvoorbereiding op CSV/PDF-koppeling.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 12 }}>
          <select value={jaarFilter} onChange={(event) => setJaarFilter(event.target.value as 'Alle' | '2025' | '2024')} className="ui-select">
            <option value="Alle">Alle jaren</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select
            value={locatieFilter}
            onChange={(event) => setLocatieFilter(event.target.value as 'Alle' | 'Tilburg' | 'Breda')}
            className="ui-select"
          >
            <option value="Alle">Alle locaties</option>
            <option value="Tilburg">Tilburg</option>
            <option value="Breda">Breda</option>
          </select>
          <select
            value={begeleiderFilter}
            onChange={(event) =>
              setBegeleiderFilter(event.target.value as 'Alle' | 'N. Janssen' | 'S. Vermeer' | 'A. de Wit')
            }
            className="ui-select"
          >
            <option value="Alle">Alle begeleiders</option>
            <option value="N. Janssen">N. Janssen</option>
            <option value="S. Vermeer">S. Vermeer</option>
            <option value="A. de Wit">A. de Wit</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="ui-button"
          >
            Export (mock)
          </button>
        </div>

        {exportMessage && <div style={{ fontSize: 13, color: 'var(--color-primary)', marginBottom: 12 }}>{exportMessage}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
          <div className="kpi-card">
            <div className="kpi-label">Totaal uitstroom (selectie)</div>
            <div className="kpi-value" style={{ color: 'var(--color-primary)', fontSize: 28 }}>
              {totaalUitstroom}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Gemiddeld succespercentage</div>
            <div className="kpi-value" style={{ color: 'var(--color-primary)', fontSize: 28 }}>
              {gemiddeldSucces}%
            </div>
          </div>
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
          <thead>
            <tr>
              <th>Jaar</th>
              <th>Locatie</th>
              <th>Begeleider</th>
              <th>Uitstroom</th>
              <th>Succes %</th>
              <th>Doorverwezen %</th>
              <th>Werk/School %</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.jaar}</td>
                <td>{row.locatie}</td>
                <td>{row.begeleider}</td>
                <td>{row.uitstroomTotaal}</td>
                <td>{row.succesvolPct}%</td>
                <td>{row.doorverwezenPct}%</td>
                <td>{row.werkOfSchoolPct}%</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default RapportagesPage