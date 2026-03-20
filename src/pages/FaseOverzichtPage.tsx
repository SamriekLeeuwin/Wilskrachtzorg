import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

type PhaseData = {
  name: string
  order: number
  activeYouth: number
  completedYouth: number
  incidentCount: number
  successRate: number
  avgDuration: number
}

const mockPhaseData: PhaseData[] = [
  {
    name: 'Stabilisatie',
    order: 1,
    activeYouth: 12,
    completedYouth: 8,
    incidentCount: 24,
    successRate: 67,
    avgDuration: 95,
  },
  {
    name: 'Verantwoordelijkheid',
    order: 2,
    activeYouth: 8,
    completedYouth: 14,
    incidentCount: 18,
    successRate: 76,
    avgDuration: 120,
  },
  {
    name: 'Onafhankelijkheid',
    order: 3,
    activeYouth: 5,
    completedYouth: 18,
    incidentCount: 12,
    successRate: 82,
    avgDuration: 100,
  },
  {
    name: 'Voorbereiding uitstroom',
    order: 4,
    activeYouth: 2,
    completedYouth: 12,
    incidentCount: 6,
    successRate: 92,
    avgDuration: 60,
  },
]

const COLORS = ['#07346a', '#1d4ed8', '#059669', '#f97316']

function FaseOverzichtPage() {
  const youthPerPhase = useMemo(
    () => mockPhaseData.map((p) => ({ name: p.name, active: p.activeYouth, completed: p.completedYouth })),
    []
  )

  const incidentTrend = useMemo(
    () => mockPhaseData.map((p) => ({ phase: p.name, incidents: p.incidentCount })),
    []
  )

  const successRatio = useMemo(
    () => mockPhaseData.map((p) => ({ name: p.name, value: p.successRate })),
    []
  )

  const totals = useMemo(() => {
    const activeTotal = mockPhaseData.reduce((sum, p) => sum + p.activeYouth, 0)
    const completedTotal = mockPhaseData.reduce((sum, p) => sum + p.completedYouth, 0)
    const totalIncidents = mockPhaseData.reduce((sum, p) => sum + p.incidentCount, 0)
    const avgSucces = Math.round(mockPhaseData.reduce((sum, p) => sum + p.successRate, 0) / mockPhaseData.length)

    return { activeTotal, completedTotal, totalIncidents, avgSucces }
  }, [])

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 22 }}>
          Fase Overzicht KPI's
        </h2>
        <div className="kpi-grid" style={{ marginTop: 16 }}>
          <div className="kpi-card">
            <div className="kpi-label">Actieve Jongeren</div>
            <div className="kpi-value" style={{ color: 'var(--color-primary)', fontSize: 28 }}>
              {totals.activeTotal}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Afgeronde Fases</div>
            <div className="kpi-value" style={{ color: '#059669' }}>
              {totals.completedTotal}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Totale Incidenten</div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>
              {totals.totalIncidents}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Gem. Succesrate</div>
            <div className="kpi-value" style={{ color: 'var(--color-secondary)' }}>
              {totals.avgSucces}%
            </div>
          </div>
        </div>
      </section>

      <section className="two-col">
        <div className="card">
          <h3 className="card-title">Jongeren per Fase</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={youthPerPhase} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 8" stroke="#e9eef5" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#334155', fontWeight: 600 }}
              />
              <Legend iconType="circle" wrapperStyle={{ color: '#64748b' }} />
              <Bar dataKey="active" fill="#07346a" radius={[8, 8, 0, 0]} name="Actief" />
              <Bar dataKey="completed" fill="#059669" radius={[8, 8, 0, 0]} name="Afgerond" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Incidenten per Fase</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incidentTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="2 8" stroke="#e9eef5" />
              <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8a93a3' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#334155', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#1d4ed8"
                strokeWidth={3.5}
                dot={{ r: 3, fill: '#1d4ed8', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Succesrate per Fase (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={successRatio}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: PieLabelRenderProps) => `${props.name}: ${props.value}%`}
              outerRadius={100}
              innerRadius={54}
              paddingAngle={2}
              dataKey="value"
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3 className="card-title">Fase Details</h3>
        <div className="ui-table-wrap" style={{ marginTop: 12 }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Fase</th>
                <th>Actief</th>
                <th>Afgerond</th>
                <th>Incidenten</th>
                <th>Succesrate</th>
                <th>Gem. Duur (dagen)</th>
              </tr>
            </thead>
            <tbody>
              {mockPhaseData.map((phase) => (
                <tr key={phase.order}>
                  <td>{phase.name}</td>
                  <td>{phase.activeYouth}</td>
                  <td>{phase.completedYouth}</td>
                  <td>{phase.incidentCount}</td>
                  <td>
                    <span style={{ color: phase.successRate >= 75 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                      {phase.successRate}%
                    </span>
                  </td>
                  <td>{phase.avgDuration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default FaseOverzichtPage
