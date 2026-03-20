import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type JongereRecord = {
  id: string
  naam: string
  startdatum: string
  einddatum: string
  locatie: string
  begeleider: string
  trajectStatus: 'Actief' | 'Afgerond'
}

const initialRows: JongereRecord[] = [
  {
    id: 'J-001',
    naam: 'Client-001',
    startdatum: '2025-02-12',
    einddatum: '',
    locatie: 'Tilburg',
    begeleider: 'N. Janssen',
    trajectStatus: 'Actief',
  },
  {
    id: 'J-002',
    naam: 'Client-002',
    startdatum: '2024-11-03',
    einddatum: '2025-12-14',
    locatie: 'Breda',
    begeleider: 'S. Vermeer',
    trajectStatus: 'Afgerond',
  },
  {
    id: 'J-003',
    naam: 'Client-003',
    startdatum: '2025-05-19',
    einddatum: '',
    locatie: 'Tilburg',
    begeleider: 'A. de Wit',
    trajectStatus: 'Actief',
  },
]

function JongerenPage() {
  const [rows, setRows] = useState<JongereRecord[]>(initialRows)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Alle' | 'Actief' | 'Afgerond'>('Alle')
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')

  const [naam, setNaam] = useState('')
  const [startdatum, setStartdatum] = useState('')
  const [einddatum, setEinddatum] = useState('')
  const [locatie, setLocatie] = useState<'Tilburg' | 'Breda'>('Tilburg')
  const [begeleider, setBegeleider] = useState('')
  const [trajectStatus, setTrajectStatus] = useState<'Actief' | 'Afgerond'>('Actief')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        row.naam.toLowerCase().includes(searchText.toLowerCase()) || row.id.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter === 'Alle' || row.trajectStatus === statusFilter
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      return matchesSearch && matchesStatus && matchesLocatie
    })
  }, [rows, searchText, statusFilter, locatieFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!naam || !startdatum || !begeleider) {
      return
    }

    const newRow: JongereRecord = {
      id: `J-${String(rows.length + 1).padStart(3, '0')}`,
      naam,
      startdatum,
      einddatum,
      locatie,
      begeleider,
      trajectStatus,
    }

    setRows((previous) => [newRow, ...previous])
    setNaam('')
    setStartdatum('')
    setEinddatum('')
    setLocatie('Tilburg')
    setBegeleider('')
    setTrajectStatus('Actief')
  }

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Jongeren Overzicht
        </h2>
        <p className="card-subtitle">
          Zoek en filter op trajectstatus en locatie. Gebruik het formulier om mock-registraties toe te voegen.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Zoek op cliënt-ID of naam"
            className="ui-input"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'Alle' | 'Actief' | 'Afgerond')}
            className="ui-select"
          >
            <option value="Alle">Alle statussen</option>
            <option value="Actief">Actief</option>
            <option value="Afgerond">Afgerond</option>
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
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Naam</th>
              <th>Startdatum</th>
              <th>Einddatum</th>
              <th>Locatie</th>
              <th>Begeleider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.naam}</td>
                <td>{row.startdatum}</td>
                <td>{row.einddatum || '-'}</td>
                <td>{row.locatie}</td>
                <td>{row.begeleider}</td>
                <td>
                  <span
                    className={row.trajectStatus === 'Actief' ? 'badge badge-warning' : 'badge badge-success'}
                  >
                    {row.trajectStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Nieuwe jongere toevoegen (mock)</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <input value={naam} onChange={(event) => setNaam(event.target.value)} placeholder="Naam" className="ui-input" required />
          <input value={startdatum} onChange={(event) => setStartdatum(event.target.value)} type="date" className="ui-input" required />
          <input value={einddatum} onChange={(event) => setEinddatum(event.target.value)} type="date" className="ui-input" />
          <select value={locatie} onChange={(event) => setLocatie(event.target.value as 'Tilburg' | 'Breda')} className="ui-select">
            <option value="Tilburg">Tilburg</option>
            <option value="Breda">Breda</option>
          </select>
          <input value={begeleider} onChange={(event) => setBegeleider(event.target.value)} placeholder="Begeleider" className="ui-input" required />
          <select value={trajectStatus} onChange={(event) => setTrajectStatus(event.target.value as 'Actief' | 'Afgerond')} className="ui-select">
            <option value="Actief">Actief</option>
            <option value="Afgerond">Afgerond</option>
          </select>

          <button type="submit" className="ui-button" style={{ width: 'fit-content' }}>
            Opslaan
          </button>
        </form>
      </section>
    </div>
  )
}

export default JongerenPage