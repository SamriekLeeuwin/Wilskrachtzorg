import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type UitstroomRecord = {
  id: string
  jongere: string
  datum: string
  reden: string
  doorverwezen: boolean
  organisatie: string
  woonstatus: 'Studio' | 'Kamer' | 'Ouders' | 'Crisisopvang' | 'Onbekend'
  werk: boolean
  school: boolean
  succesvol: boolean
}

const initialRows: UitstroomRecord[] = [
  {
    id: 'U-001',
    jongere: 'Client-001',
    datum: '2025-12-16',
    reden: 'Doelen behaald',
    doorverwezen: false,
    organisatie: '-',
    woonstatus: 'Studio',
    werk: true,
    school: false,
    succesvol: true,
  },
  {
    id: 'U-002',
    jongere: 'Client-002',
    datum: '2025-11-02',
    reden: 'Overdracht specialistische zorg',
    doorverwezen: true,
    organisatie: 'Partnerzorg Noord',
    woonstatus: 'Ouders',
    werk: false,
    school: true,
    succesvol: false,
  },
]

function UitstroomRegistratiePage() {
  const [rows, setRows] = useState<UitstroomRecord[]>(initialRows)
  const [yearFilter, setYearFilter] = useState<'Alle' | '2025' | '2024'>('Alle')
  const [succesFilter, setSuccesFilter] = useState<'Alle' | 'Succesvol' | 'Niet succesvol'>('Alle')

  const [jongere, setJongere] = useState('')
  const [datum, setDatum] = useState('')
  const [reden, setReden] = useState('')
  const [doorverwezen, setDoorverwezen] = useState(false)
  const [organisatie, setOrganisatie] = useState('')
  const [woonstatus, setWoonstatus] = useState<UitstroomRecord['woonstatus']>('Studio')
  const [werk, setWerk] = useState(false)
  const [school, setSchool] = useState(false)
  const [succesvol, setSuccesvol] = useState(true)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesYear = yearFilter === 'Alle' || row.datum.startsWith(yearFilter)
      const matchesSucces =
        succesFilter === 'Alle' ||
        (succesFilter === 'Succesvol' && row.succesvol) ||
        (succesFilter === 'Niet succesvol' && !row.succesvol)
      return matchesYear && matchesSucces
    })
  }, [rows, yearFilter, succesFilter])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!jongere || !datum || !reden) {
      return
    }

    const newRow: UitstroomRecord = {
      id: `U-${String(rows.length + 1).padStart(3, '0')}`,
      jongere,
      datum,
      reden,
      doorverwezen,
      organisatie: doorverwezen && organisatie ? organisatie : '-',
      woonstatus,
      werk,
      school,
      succesvol,
    }

    setRows((previous) => [newRow, ...previous])
    setJongere('')
    setDatum('')
    setReden('')
    setDoorverwezen(false)
    setOrganisatie('')
    setWoonstatus('Studio')
    setWerk(false)
    setSchool(false)
    setSuccesvol(true)
  }

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Uitstroom Registraties
        </h2>
        <p className="card-subtitle">
          Bekijk registraties en filter op jaar en resultaatstatus.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value as 'Alle' | '2025' | '2024')} className="ui-select">
            <option value="Alle">Alle jaren</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select
            value={succesFilter}
            onChange={(event) => setSuccesFilter(event.target.value as 'Alle' | 'Succesvol' | 'Niet succesvol')}
            className="ui-select"
          >
            <option value="Alle">Alle resultaten</option>
            <option value="Succesvol">Succesvol</option>
            <option value="Niet succesvol">Niet succesvol</option>
          </select>
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Jongere</th>
              <th>Datum</th>
              <th>Reden</th>
              <th>Doorverwezen</th>
              <th>Organisatie</th>
              <th>Woonstatus</th>
              <th>Werk/School</th>
              <th>Resultaat</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.jongere}</td>
                <td>{row.datum}</td>
                <td>{row.reden}</td>
                <td>{row.doorverwezen ? 'Ja' : 'Nee'}</td>
                <td>{row.organisatie}</td>
                <td>{row.woonstatus}</td>
                <td>
                  {row.werk ? 'Werk' : ''}
                  {row.werk && row.school ? ' / ' : ''}
                  {row.school ? 'School' : ''}
                  {!row.werk && !row.school ? '-' : ''}
                </td>
                <td>
                  <span className={row.succesvol ? 'badge badge-success' : 'badge badge-warning'}>
                    {row.succesvol ? 'Succesvol' : 'Niet succesvol'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Nieuwe uitstroom registreren (mock)</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <input value={jongere} onChange={(event) => setJongere(event.target.value)} placeholder="Jongere (Client-ID)" className="ui-input" required />
          <input value={datum} onChange={(event) => setDatum(event.target.value)} type="date" className="ui-input" required />
          <input value={reden} onChange={(event) => setReden(event.target.value)} placeholder="Reden uitstroom" className="ui-input" required />

          <select
            value={woonstatus}
            onChange={(event) => setWoonstatus(event.target.value as UitstroomRecord['woonstatus'])}
            className="ui-select"
          >
            <option value="Studio">Studio</option>
            <option value="Kamer">Kamer</option>
            <option value="Ouders">Ouders</option>
            <option value="Crisisopvang">Crisisopvang</option>
            <option value="Onbekend">Onbekend</option>
          </select>

          <label className="ui-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={doorverwezen} onChange={(event) => setDoorverwezen(event.target.checked)} />
            Doorverwezen
          </label>

          <input
            value={organisatie}
            onChange={(event) => setOrganisatie(event.target.value)}
            placeholder="Doorverwijsorganisatie"
            className="ui-input"
            disabled={!doorverwezen}
          />

          <label className="ui-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={werk} onChange={(event) => setWerk(event.target.checked)} />
            Werk
          </label>

          <label className="ui-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={school} onChange={(event) => setSchool(event.target.checked)} />
            School
          </label>

          <label className="ui-select" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={succesvol} onChange={(event) => setSuccesvol(event.target.checked)} />
            Succesvol
          </label>

          <button type="submit" className="ui-button" style={{ width: 'fit-content' }}>
            Registreren
          </button>
        </form>
      </section>
    </div>
  )
}

export default UitstroomRegistratiePage