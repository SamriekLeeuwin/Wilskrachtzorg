import { useMemo, useState } from 'react'
import { AlertTriangle, ShieldAlert, ShieldCheck, TrendingDown, ChevronRight, Activity, Users, Zap, Eye, Link2 } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'

type HeatmapData = {
  phase: string
  ORDER_DISTURBANCE: number
  AVOIDANCE: number
  HYGIENE: number
  AGGRESSION: number
  SUBSTANCE_USE: number
  BORDER_CROSSING: number
}

const mockHeatmapData: HeatmapData[] = [
  { phase: 'Stabilisatie', ORDER_DISTURBANCE: 8, AVOIDANCE: 6, HYGIENE: 4, AGGRESSION: 3, SUBSTANCE_USE: 2, BORDER_CROSSING: 1 },
  { phase: 'Verantwoordelijkheid', ORDER_DISTURBANCE: 5, AVOIDANCE: 3, HYGIENE: 2, AGGRESSION: 2, SUBSTANCE_USE: 1, BORDER_CROSSING: 2 },
  { phase: 'Onafhankelijkheid', ORDER_DISTURBANCE: 2, AVOIDANCE: 1, HYGIENE: 1, AGGRESSION: 1, SUBSTANCE_USE: 0, BORDER_CROSSING: 1 },
  { phase: 'Voorbereiding uitstroom', ORDER_DISTURBANCE: 1, AVOIDANCE: 0, HYGIENE: 0, AGGRESSION: 0, SUBSTANCE_USE: 0, BORDER_CROSSING: 0 },
]

const categoryLabels: Record<string, string> = {
  ORDER_DISTURBANCE: 'Ordeverzoeken',
  AVOIDANCE: 'Ontwijking',
  HYGIENE: 'Hygiëne',
  AGGRESSION: 'Agressie',
  SUBSTANCE_USE: 'Middelengebruik',
  BORDER_CROSSING: 'Grensoverschrijding',
}

const categories = ['ORDER_DISTURBANCE', 'AVOIDANCE', 'HYGIENE', 'AGGRESSION', 'SUBSTANCE_USE', 'BORDER_CROSSING'] as const
const ACTIVE_YOUTH_COUNT = 34

type Severity = 'low' | 'elevated' | 'high'

const getSeverity = (value: number, maxValue: number): Severity => {
  if (value === 0) return 'low'
  const intensity = value / maxValue
  if (intensity >= 0.85) return 'high'
  if (intensity >= 0.55) return 'elevated'
  return 'low'
}

const severityConfig: Record<Severity, { bg: string; text: string; dot: string }> = {
  low:      { bg: '#f0f9f4', text: '#166534', dot: '#22c55e' },
  elevated: { bg: '#fff8ed', text: '#92400e', dot: '#f59e0b' },
  high:     { bg: '#fff1f1', text: '#991b1b', dot: '#ef4444' },
}

const phaseColors = ['#1e3a5f', '#2d5a8e', '#3b82c4', '#7db8e8']
const getHeatmapCellKey = (phase: string, category: typeof categories[number]) => `${phase}::${category}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontSize: 13,
      }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1e293b' }}>{label}</p>
        <p style={{ margin: 0, color: '#64748b' }}>
          <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{payload[0].value}</span> incidenten
        </p>
      </div>
    )
  }
  return null
}

function StatBadge({ delta }: { delta?: string }) {
  const isNeg = delta?.startsWith('+')
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 20,
      background: isNeg ? '#fff1f1' : '#f0f9f4',
      color: isNeg ? '#991b1b' : '#166534',
    }}>
      {delta}
    </span>
  )
}

type GedragAnalysePageProps = {
  forceDemoMode?: boolean
}

function GedragAnalysePage({ forceDemoMode = false }: GedragAnalysePageProps) {
  const isDemoFromUrl = useMemo(() => {
    if (typeof window === 'undefined') return false
    const hasDemoQuery = new URLSearchParams(window.location.search).get('demo') === '1'
    const hasDemoPath = window.location.pathname.includes('/demo/gedrag-analyse')
    return hasDemoQuery || hasDemoPath || forceDemoMode
  }, [forceDemoMode])

  const [isDemoMode, setIsDemoMode] = useState(isDemoFromUrl)
  const [linkCopied, setLinkCopied] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const maxValue = useMemo(
    () => Math.max(...mockHeatmapData.flatMap((row) => categories.map((cat) => row[cat]))),
    []
  )

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; avgPerPhase: string }> = {}
    categories.forEach((cat) => {
      const total = mockHeatmapData.reduce((sum, row) => sum + row[cat], 0)
      const avgPerPhase = (total / mockHeatmapData.length).toFixed(1)
      stats[cat] = { total, avgPerPhase }
    })
    return stats
  }, [])

  const phaseStats = useMemo(() => {
    return mockHeatmapData.map((phase) => {
      const total = categories.reduce((sum, cat) => sum + phase[cat], 0)
      return { phase: phase.phase, total }
    })
  }, [])

  const insights = useMemo(() => {
    const rankedPhases = [...phaseStats].sort((a, b) => b.total - a.total)
    const highest = rankedPhases[0]
    const lowest = rankedPhases[rankedPhases.length - 1]
    const firstHalf = phaseStats.slice(0, 2).reduce((sum, item) => sum + item.total, 0)
    const secondHalf = phaseStats.slice(2).reduce((sum, item) => sum + item.total, 0)
    const trendDirection = secondHalf < firstHalf ? 'improving' : 'worsening'
    const trendPercent = firstHalf > 0 ? Math.round((Math.abs(firstHalf - secondHalf) / firstHalf) * 100) : 0
    return { highest, lowest, trendDirection, trendDelta: Math.abs(firstHalf - secondHalf), trendPercent }
  }, [phaseStats])

  const totalIncidents = useMemo(() => phaseStats.reduce((sum, p) => sum + p.total, 0), [phaseStats])
  const avgIncidentsPerYouth = useMemo(
    () => (ACTIVE_YOUTH_COUNT > 0 ? (totalIncidents / ACTIVE_YOUTH_COUNT).toFixed(1) : '0'),
    [totalIncidents]
  )
  const highSeverityIncidents = useMemo(
    () => mockHeatmapData.reduce((sum, row) => sum + row.AGGRESSION + row.SUBSTANCE_USE, 0),
    []
  )

  const topCategories = useMemo(() => {
    return categories
      .map((cat) => ({ key: cat, label: categoryLabels[cat], total: categoryStats[cat].total }))
      .sort((a, b) => b.total - a.total)
  }, [categoryStats])

  const highestRiskCategory = topCategories[0]

  const recommendedActions = useMemo(() => {
    const actions = [
      {
        title: `Start binnen 48 uur een gerichte interventie in ${insights.highest.phase}`,
        detail: `Focus op ${highestRiskCategory.label.toLowerCase()} met extra begeleidingsmomenten in de avond.`
      },
      {
        title: 'Plan een wekelijks escalatie-overleg met teamleiders',
        detail: `Doel: ${insights.trendDirection === 'improving' ? 'dalende trend bestendigen' : 'stijgende trend doorbreken'} en doorstroom versnellen naar lagere drukfases.`
      },
    ]
    return actions
  }, [highestRiskCategory.label, insights.highest.phase, insights.trendDirection])

  const criticalHeatmapCells = useMemo(() => {
    const ranked = mockHeatmapData
      .flatMap((row) => categories.map((cat) => ({ phase: row.phase, category: cat, value: row[cat] })))
      .filter((cell) => cell.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    return new Set(ranked.map((cell) => getHeatmapCellKey(cell.phase, cell.category)))
  }, [])

  const heatmapHeadline = useMemo(() => {
    const criticalInHighestPhase = categories
      .filter((cat) => criticalHeatmapCells.has(getHeatmapCellKey(insights.highest.phase, cat)))
      .map((cat) => categoryLabels[cat])
      .slice(0, 2)
      .join(' en ')
    return `${insights.highest.phase} concentreert de meeste hotspots, vooral in ${criticalInHighestPhase || 'de hoogste incidentcategorieën'}.`
  }, [criticalHeatmapCells, insights.highest.phase])

  const maxCategoryTotal = Math.max(...topCategories.map(c => c.total))

  const selectedData = selectedPhase
    ? mockHeatmapData.find(d => d.phase === selectedPhase)
    : null

  const shareDemoLink = () => {
    if (typeof window === 'undefined') return
    const demoUrl = `${window.location.origin}/demo/gedrag-analyse`
    navigator.clipboard.writeText(demoUrl)
      .then(() => {
        setLinkCopied(true)
        window.setTimeout(() => setLinkCopied(false), 1800)
      })
      .catch(() => {
        setLinkCopied(false)
      })
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1e293b', padding: '0 0 40px', fontSize: 13 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 60%, #1a4d7a 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 80,
          width: 140, height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '6px 8px',
                display: 'flex',
              }}>
                <Activity size={16} color="#93c5fd" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Gedragsanalyse
              </span>
              {isDemoMode && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fde68a',
                  background: 'rgba(217, 119, 6, 0.22)',
                  border: '1px solid rgba(253, 230, 138, 0.4)',
                  padding: '3px 8px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  <Eye size={11} />
                  Demo versie
                </span>
              )}
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Inzichten & Risico's
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              Belangrijkste inzicht: {insights.highest.phase} draagt het grootste risico en vraagt directe opvolging.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#bfdbfe', lineHeight: 1.5 }}>
              Risicovolste categorie: {highestRiskCategory.label} ({highestRiskCategory.total} meldingen) · {ACTIVE_YOUTH_COUNT} actieve jongeren
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '10px 16px',
              textAlign: 'right',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Rapportageperiode</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>April 2025</div>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoMode((prev) => !prev)}
              style={{
                border: '1px solid rgba(147, 197, 253, 0.35)',
                background: 'rgba(30, 58, 95, 0.36)',
                color: '#dbeafe',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 42,
              }}
            >
              <Eye size={13} />
              {isDemoMode ? 'Demo aan' : 'Demo uit'}
            </button>
            <button
              type="button"
              onClick={shareDemoLink}
              style={{
                border: '1px solid rgba(147, 197, 253, 0.35)',
                background: 'rgba(30, 58, 95, 0.36)',
                color: '#dbeafe',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 42,
              }}
            >
              <Link2 size={13} />
              {linkCopied ? 'Link gekopieerd' : 'Kopieer demo-link'}
            </button>
          </div>
        </div>
      </div>

      {isDemoMode && (
        <div style={{
          background: '#fff8e6',
          border: '1px solid #fde68a',
          color: '#92400e',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          Demo weergave voor klantpresentatie: data en inzichten zijn representatief en bedoeld voor demonstratie.
        </div>
      )}

      {/* Priority insight */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: 14,
        marginBottom: 18,
      }}>
        <div style={{
          background: 'linear-gradient(130deg, #7f1d1d 0%, #b91c1c 55%, #dc2626 100%)',
          borderRadius: 14,
          padding: '20px 22px',
          color: '#fff',
          boxShadow: '0 12px 24px rgba(127, 29, 29, 0.22)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.82)',
            marginBottom: 10,
          }}>
            Prioriteit 1 · Hoog risico
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>
            {insights.highest.phase} vraagt direct managementbesluit
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Incidenten in fase</div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{insights.highest.total}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Dominante categorie</div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{highestRiskCategory.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>{highestRiskCategory.total} meldingen totaal</div>
            </div>
          </div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8edf4',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Prioriteit 2 · Trend
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            {insights.trendDirection === 'improving' ? 'Dalende druk in latere fases' : 'Stijgende druk in latere fases'}
          </div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
            Verschil tussen vroege en late fases: <strong>{insights.trendDelta}</strong> incidenten ({insights.trendPercent}%).
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Activity size={16} />, label: 'Totaal incidenten', value: totalIncidents, sub: 'deze periode', color: '#1e3a5f', bg: '#e8f0fb' },
          { icon: <Users size={16} />, label: 'Gemiddeld per jongere', value: avgIncidentsPerYouth, sub: `van ${ACTIVE_YOUTH_COUNT} jongeren`, color: '#0f766e', bg: '#f0fdfa' },
          { icon: <ShieldAlert size={16} />, label: 'Hoge ernst', value: highSeverityIncidents, sub: 'agressie + middelengebruik', color: '#b91c1c', bg: '#fff1f1' },
          { icon: <Zap size={16} />, label: 'Behandelfases', value: phaseStats.length, sub: 'in analyse scope', color: '#7c3aed', bg: '#f5f3ff' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e8edf4',
            padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
              <div style={{
                background: kpi.bg, color: kpi.color,
                borderRadius: 8, padding: '5px 6px', display: 'flex',
              }}>
                {kpi.icon}
              </div>
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, color: kpi.color, lineHeight: 1, marginBottom: 6 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          {
            icon: <ShieldAlert size={15} />,
            badge: 'Prioriteit 1',
            title: `${insights.highest.phase} is huidige risicohaard`,
            value: insights.highest.total,
            unit: 'incidenten',
            delta: 'Directe opvolging nodig',
            deltaPos: false,
            action: 'Versterk toezicht in piekmomenten en monitor dagelijks',
            accent: '#b91c1c',
            accentBg: '#fff1f1',
            large: true,
          },
          {
            icon: <ShieldCheck size={15} />,
            badge: 'Prioriteit 2',
            title: `${insights.trendPercent}% ${insights.trendDirection === 'improving' ? 'daling' : 'stijging'}`,
            value: insights.trendDelta,
            unit: 'incidenten verschil',
            delta: insights.trendDirection === 'improving' ? 'Verbeterend patroon' : 'Verslechterend patroon',
            deltaPos: insights.trendDirection === 'improving',
            action: 'Focus op snellere doorstroom fase 1',
            accent: '#1d4ed8',
            accentBg: '#eff6ff',
          },
          {
            icon: <TrendingDown size={15} />,
            badge: 'Prioriteit 3',
            title: `${insights.lowest.phase} blijft stabiel`,
            value: insights.lowest.total,
            unit: 'incidenten',
            delta: 'Geschikt als referentie-aanpak',
            deltaPos: true,
            action: 'Borg bewezen interventies in teamrichtlijn',
            accent: '#166534',
            accentBg: '#f0f9f4',
          },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 14,
            border: card.large ? '1px solid #fecaca' : '1px solid #e8edf4',
            boxShadow: card.large ? '0 10px 20px rgba(185, 28, 28, 0.08)' : 'none',
            padding: card.large ? '22px 24px' : '20px 22px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: card.large ? 228 : 210,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: card.accent,
              borderRadius: '14px 14px 0 0',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                background: card.accentBg, color: card.accent,
                borderRadius: 7, padding: '5px 6px', display: 'flex',
              }}>
                {card.icon}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: card.accent,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {card.badge}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
              {card.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: card.large ? 34 : 27, fontWeight: 800, color: card.accent, lineHeight: 1 }}>
                {card.value}
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{card.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatBadge delta={card.delta} />
            </div>
            <div style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#475569',
            }}>
              <ChevronRight size={13} color={card.accent} />
              {card.action}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended actions */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #fee2e2',
        padding: '20px 22px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            background: '#fff1f1',
            color: '#b91c1c',
            borderRadius: 8,
            padding: '5px 7px',
            display: 'flex',
          }}>
            <AlertTriangle size={15} />
          </div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#7f1d1d' }}>Aanbevolen actie</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {recommendedActions.map((action, index) => (
            <div key={index} style={{
              background: '#fff7f7',
              border: '1px solid #fee2e2',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', marginBottom: 6 }}>
                Actie {index + 1}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', lineHeight: 1.35, marginBottom: 4 }}>
                {action.title}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{action.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e8edf4',
        padding: '22px 24px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
              Incidentverdeling per fase
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
              Kerninzicht: {heatmapHeadline}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Hotspot', 'Overig'] as const).map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: ['#fecaca', '#f8fafc'][i],
                  border: `1px solid ${['#ef4444', '#cbd5e1'][i]}`,
                }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left', padding: '8px 14px 8px 0',
                  color: '#94a3b8', fontWeight: 600, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  Fase
                </th>
                {categories.map((cat) => (
                  <th key={cat} style={{
                    textAlign: 'center', padding: '8px 6px',
                    color: '#94a3b8', fontWeight: 600, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid #f1f5f9',
                    minWidth: 80,
                  }}>
                    {categoryLabels[cat]}
                  </th>
                ))}
                <th style={{
                  textAlign: 'center', padding: '8px 0 8px 6px',
                  color: '#94a3b8', fontWeight: 600, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  Totaal
                </th>
              </tr>
            </thead>
            <tbody>
              {mockHeatmapData.map((row, rowIdx) => {
                const rowTotal = phaseStats.find(p => p.phase === row.phase)?.total ?? 0
                const isSelected = selectedPhase === row.phase
                return (
                  <tr
                    key={row.phase}
                    onClick={() => setSelectedPhase(isSelected ? null : row.phase)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#f8faff' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{
                      padding: '11px 14px 11px 0',
                      borderBottom: rowIdx < mockHeatmapData.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 4, height: 28, borderRadius: 2,
                          background: phaseColors[rowIdx],
                          flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{row.phase}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Fase {rowIdx + 1}</div>
                        </div>
                      </div>
                    </td>
                    {categories.map((cat) => {
                      const value = row[cat]
                      const severity = getSeverity(value, maxValue)
                      const cfg = severityConfig[severity]
                      const isCritical = criticalHeatmapCells.has(getHeatmapCellKey(row.phase, cat))
                      return (
                        <td key={cat} style={{
                          textAlign: 'center',
                          padding: '8px 6px',
                          borderBottom: rowIdx < mockHeatmapData.length - 1 ? '1px solid #f8fafc' : 'none',
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40, height: 32,
                            borderRadius: 8,
                            background: isCritical ? cfg.bg : '#f8fafc',
                            color: isCritical ? cfg.text : '#64748b',
                            fontWeight: value > 0 ? 700 : 400,
                            fontSize: 13,
                            border: isCritical ? `1px solid ${cfg.dot}60` : '1px solid #eef2f7',
                          }}>
                            {value > 0 ? value : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                          </div>
                        </td>
                      )
                    })}
                    <td style={{
                      textAlign: 'center',
                      padding: '8px 0 8px 6px',
                      borderBottom: rowIdx < mockHeatmapData.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40, height: 32,
                        padding: '0 10px',
                        borderRadius: 8,
                        background: '#f1f5f9',
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#1e293b',
                      }}>
                        {rowTotal}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Drill-down panel */}
        {selectedData && (
          <div style={{
            marginTop: 16,
            padding: '16px 18px',
            background: '#f8faff',
            borderRadius: 10,
            border: '1px solid #dbeafe',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
              Detail: {selectedData.phase}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories
                .filter(cat => selectedData[cat] > 0)
                .sort((a, b) => selectedData[b] - selectedData[a])
                .map(cat => {
                  const v = selectedData[cat]
                  const severity = getSeverity(v, maxValue)
                  const cfg = severityConfig[severity]
                  return (
                    <div key={cat} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px',
                      borderRadius: 20,
                      background: cfg.bg,
                      color: cfg.text,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${cfg.dot}30`,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: cfg.dot, flexShrink: 0,
                      }} />
                      {categoryLabels[cat]}: {v}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>

        {/* Category ranking */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8edf4',
          padding: '20px 22px',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            Categorieën naar volume
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCategories.map((item, i) => {
              const pct = Math.round((item.total / maxCategoryTotal) * 100)
              const isTop = i === 0
              return (
                <div key={item.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isTop ? '#fff' : '#64748b',
                        background: isTop ? '#1e3a5f' : '#f1f5f9',
                        borderRadius: 4,
                        width: 18, height: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: isTop ? 600 : 400, color: '#1e293b' }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? '#1e3a5f' : '#64748b' }}>
                      {item.total}
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: isTop ? '#1e3a5f' : i < 3 ? '#3b82c4' : '#93c5fd',
                      borderRadius: 3,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8edf4',
          padding: '20px 22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
              Incidenten per behandelfase
            </h3>
            <div style={{
              fontSize: 11, color: '#3b82c4',
              background: '#eff6ff', borderRadius: 6,
              padding: '3px 8px', fontWeight: 600,
            }}>
              Dalende trend
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="phase"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.split(' ')[0]}
                />
                <YAxis tick={false} tickLine={false} axisLine={false} width={0} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {phaseStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.phase === insights.highest.phase ? '#b91c1c' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
            Rode balk = hoogste actuele prioriteit · overige balken = context
          </div>
        </div>
      </div>
    </div>
  )
}

export default GedragAnalysePage