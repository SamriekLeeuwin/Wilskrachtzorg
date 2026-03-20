import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type BegeleiderRow = {
  id: string
  naam: string
  email: string
  locatie: 'Tilburg' | 'Breda'
  actief: boolean
}

const initialRows: BegeleiderRow[] = [
  { id: 'B-001', naam: 'N. Janssen', email: 'n.janssen@wilskrachtzorg.nl', locatie: 'Tilburg', actief: true },
  { id: 'B-002', naam: 'S. Vermeer', email: 's.vermeer@wilskrachtzorg.nl', locatie: 'Breda', actief: true },
  { id: 'B-003', naam: 'A. de Wit', email: 'a.dewit@wilskrachtzorg.nl', locatie: 'Tilburg', actief: false },
]

function BegeleidersPage() {
  const [rows, setRows] = useState<BegeleiderRow[]>(initialRows)
  const [locatieFilter, setLocatieFilter] = useState<'Alle' | 'Tilburg' | 'Breda'>('Alle')
  const [statusFilter, setStatusFilter] = useState<'Alle' | 'Actief' | 'Inactief'>('Alle')

  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [locatie, setLocatie] = useState<'Tilburg' | 'Breda'>('Tilburg')
  const [actief, setActief] = useState(true)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesLocatie = locatieFilter === 'Alle' || row.locatie === locatieFilter
      const matchesStatus =
        statusFilter === 'Alle' || (statusFilter === 'Actief' && row.actief) || (statusFilter === 'Inactief' && !row.actief)
      return matchesLocatie && matchesStatus
    })
  }, [rows, locatieFilter, statusFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!naam || !email) {
      return
    }

    const newRow: BegeleiderRow = {
      id: `B-${String(rows.length + 1).padStart(3, '0')}`,
      naam,
      email,
      locatie,
      actief,
    }

    setRows((previous) => [newRow, ...previous])
    setNaam('')
    setEmail('')
    setLocatie('Tilburg')
    setActief(true)
  }

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Begeleidersbeheer
        </h2>
        <p className="card-subtitle">
          Overzicht van begeleiders met locatie en status. Voeg nieuwe mock-gebruikers toe via het formulier.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
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
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'Alle' | 'Actief' | 'Inactief')}
            className="ui-select"
          >
            <option value="Alle">Alle statussen</option>
            <option value="Actief">Actief</option>
            <option value="Inactief">Inactief</option>
          </select>
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Naam</th>
              <th>E-mail</th>
              <th>Locatie</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.naam}</td>
                <td>{row.email}</td>
                <td>{row.locatie}</td>
                <td>
                  <span className={row.actief ? 'badge badge-success' : 'badge badge-warning'}>
                    {row.actief ? 'Actief' : 'Inactief'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Nieuwe begeleider toevoegen (mock)</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
          <input value={naam} onChange={(event) => setNaam(event.target.value)} placeholder="Naam" className="ui-input" required />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" type="email" className="ui-input" required />

          <select value={locatie} onChange={(event) => setLocatie(event.target.value as 'Tilburg' | 'Breda')} className="ui-select">
            <option value="Tilburg">Tilburg</option>
            <option value="Breda">Breda</option>
          </select>

          <label className="ui-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={actief} onChange={(event) => setActief(event.target.checked)} />
            Actief
          </label>

          <button type="submit" className="ui-button" style={{ width: 'fit-content' }}>
            Opslaan
          </button>
        </form>
      </section>
    </div>
  )
}

export default BegeleidersPage