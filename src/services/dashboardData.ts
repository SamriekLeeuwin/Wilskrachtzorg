import type { DashboardData, DashboardPeriod } from '../types/dashboard'

const phases = [
  { name: 'Stabilisatie', order: 1, activeYouth: 12, completedYouth: 8, avgDurationDays: 95, color: '#1d4ed8' },
  { name: 'Verantwoordelijkheid', order: 2, activeYouth: 10, completedYouth: 14, avgDurationDays: 120, color: '#3b82f6' },
  { name: 'Onafhankelijkheid', order: 3, activeYouth: 7, completedYouth: 18, avgDurationDays: 100, color: '#60a5fa' },
  { name: 'Voorbereiding uitstroom', order: 4, activeYouth: 5, completedYouth: 12, avgDurationDays: 60, color: '#93c5fd' },
]

const outflowMonthly = [
  { month: 'Jan', successful: 2, unsuccessful: 1, referred: 0 },
  { month: 'Feb', successful: 1, unsuccessful: 0, referred: 1 },
  { month: 'Mrt', successful: 3, unsuccessful: 1, referred: 0 },
  { month: 'Apr', successful: 2, unsuccessful: 0, referred: 0 },
  { month: 'Mei', successful: 2, unsuccessful: 1, referred: 1 },
  { month: 'Jun', successful: 3, unsuccessful: 0, referred: 0 },
  { month: 'Jul', successful: 1, unsuccessful: 1, referred: 0 },
  { month: 'Aug', successful: 2, unsuccessful: 0, referred: 1 },
  { month: 'Sep', successful: 3, unsuccessful: 1, referred: 0 },
  { month: 'Okt', successful: 2, unsuccessful: 0, referred: 0 },
  { month: 'Nov', successful: 1, unsuccessful: 1, referred: 1 },
  { month: 'Dec', successful: 2, unsuccessful: 0, referred: 0 },
]

const riskYouth = [
  {
    id: 'J-004', name: 'Wesley B.', location: 'Eindhoven', supervisor: 'M. van Dijk',
    currentPhase: 'Stabilisatie', riskLevel: 'UVO' as const, riskLabel: '3 aantekeningen — UVO vereist',
    incidentCount: 4, daysSinceLastIncident: 2,
  },
  {
    id: 'J-009', name: 'Dylan K.', location: 'Tilburg', supervisor: 'N. Janssen',
    currentPhase: 'Verantwoordelijkheid', riskLevel: 'timeout' as const, riskLabel: 'Time-out na agressie-incident',
    incidentCount: 3, daysSinceLastIncident: 5,
  },
  {
    id: 'J-015', name: 'Jayden V.', location: 'Breda', supervisor: 'S. Vermeer',
    currentPhase: 'Stabilisatie', riskLevel: 'waarschuwing' as const, riskLabel: '1e officiële waarschuwing',
    incidentCount: 5, daysSinceLastIncident: 1,
  },
  {
    id: 'J-021', name: 'Liam D.', location: 'Tilburg', supervisor: 'A. de Wit',
    currentPhase: 'Onafhankelijkheid', riskLevel: 'aantekening' as const, riskLabel: '2 aantekeningen — UVO dreigt',
    incidentCount: 2, daysSinceLastIncident: 8,
  },
  {
    id: 'J-028', name: 'Noah S.', location: 'Eindhoven', supervisor: 'R. de Groot',
    currentPhase: 'Stabilisatie', riskLevel: 'timeout' as const, riskLabel: 'Time-out na middelengebruik',
    incidentCount: 3, daysSinceLastIncident: 3,
  },
]

const incidentCategories = [
  { category: 'Ordeverstoring', count: 28, trend: -3, severity: 'low' as const },
  { category: 'Agressie', count: 14, trend: 2, severity: 'high' as const },
  { category: 'Vermijding / zorgmijding', count: 19, trend: 1, severity: 'medium' as const },
  { category: 'Hygiëne', count: 12, trend: -2, severity: 'low' as const },
  { category: 'Grensoverschrijdend gedrag', count: 6, trend: -1, severity: 'high' as const },
  { category: 'Onrechtmatige toe-eigening', count: 4, trend: 0, severity: 'medium' as const },
  { category: 'Middelengebruik', count: 9, trend: 4, severity: 'high' as const },
]

const dashboardDataset: Record<DashboardPeriod, DashboardData> = {
  year: {
    period: {
      label: 'Dit jaar',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
    kpis: {
      activeYouth: { value: 34, previous: 30, delta: 13.3 },
      outflowYear: { value: 18, previous: 16, delta: 12.5 },
      successRate: { value: '72%', previous: '66%', delta: 6 },
      avgDuration: { value: '8.4 mnd', previous: '9.2 mnd', delta: -0.8 },
    },
    trends: {
      successPerYear: [
        { year: 2022, value: 58 },
        { year: 2023, value: 64 },
        { year: 2024, value: 69 },
        { year: 2025, value: 71 },
        { year: 2026, value: 72 },
      ],
      durationTrend: [
        { period: 'Q1 2025', value: 9.7 },
        { period: 'Q2 2025', value: 9.3 },
        { period: 'Q3 2025', value: 9.1 },
        { period: 'Q4 2025', value: 8.8 },
        { period: 'Q1 2026', value: 8.4 },
      ],
    },
    distribution: {
      housingStatus: [
        { label: 'Studio', count: 14, percentage: 41.2 },
        { label: 'Kamer', count: 9, percentage: 26.5 },
        { label: 'Terug naar ouders', count: 7, percentage: 20.6 },
        { label: 'Crisisopvang', count: 4, percentage: 11.7 },
      ],
    },
    recentActivity: [
      { id: 'J-001', location: 'Tilburg', supervisor: 'N. Janssen', housingStatus: 'Studio', status: 'Succesvol' },
      { id: 'J-002', location: 'Breda', supervisor: 'S. Vermeer', housingStatus: 'Terug naar ouders', status: 'Doorverwezen' },
      { id: 'J-003', location: 'Tilburg', supervisor: 'A. de Wit', housingStatus: 'Kamer', status: 'Succesvol' },
      { id: 'J-004', location: 'Eindhoven', supervisor: 'M. van Dijk', housingStatus: 'Crisisopvang', status: 'Aandacht vereist' },
      { id: 'J-005', location: 'Breda', supervisor: 'L. Bos', housingStatus: 'Kamer', status: 'Lopend' },
    ],
    phases,
    outflow: {
      monthly: outflowMonthly,
      totalSuccessful: 24,
      totalUnsuccessful: 6,
      totalReferred: 4,
      avgOutflowAge: 17.8,
    },
    risks: {
      youth: riskYouth,
      totalUVO: 1,
      totalWarnings: 1,
      totalTimeouts: 2,
      totalNotes: 8,
    },
    incidents: {
      categories: incidentCategories,
      totalThisPeriod: 92,
      totalPreviousPeriod: 88,
    },
  },
  '12m': {
    period: {
      label: 'Laatste 12 maanden',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
    },
    kpis: {
      activeYouth: { value: 32, previous: 31, delta: 3.2 },
      outflowYear: { value: 16, previous: 15, delta: 6.7 },
      successRate: { value: '70%', previous: '68%', delta: 2 },
      avgDuration: { value: '8.8 mnd', previous: '9.0 mnd', delta: -0.2 },
    },
    trends: {
      successPerYear: [
        { year: 2022, value: 58 },
        { year: 2023, value: 64 },
        { year: 2024, value: 67 },
        { year: 2025, value: 69 },
        { year: 2026, value: 70 },
      ],
      durationTrend: [
        { period: 'Apr', value: 9.1 },
        { period: 'Jun', value: 9.0 },
        { period: 'Sep', value: 8.9 },
        { period: 'Dec', value: 8.8 },
        { period: 'Mrt', value: 8.8 },
      ],
    },
    distribution: {
      housingStatus: [
        { label: 'Studio', count: 13, percentage: 40.6 },
        { label: 'Kamer', count: 10, percentage: 31.2 },
        { label: 'Terug naar ouders', count: 6, percentage: 18.8 },
        { label: 'Crisisopvang', count: 3, percentage: 9.4 },
      ],
    },
    recentActivity: [
      { id: 'J-010', location: 'Tilburg', supervisor: 'N. Janssen', housingStatus: 'Studio', status: 'Succesvol' },
      { id: 'J-011', location: 'Breda', supervisor: 'S. Vermeer', housingStatus: 'Crisisopvang', status: 'Aandacht vereist' },
      { id: 'J-012', location: 'Eindhoven', supervisor: 'R. de Groot', housingStatus: 'Kamer', status: 'Lopend' },
      { id: 'J-013', location: 'Tilburg', supervisor: 'A. de Wit', housingStatus: 'Terug naar ouders', status: 'Doorverwezen' },
    ],
    phases,
    outflow: {
      monthly: outflowMonthly.slice(0, 12),
      totalSuccessful: 20,
      totalUnsuccessful: 5,
      totalReferred: 3,
      avgOutflowAge: 17.5,
    },
    risks: {
      youth: riskYouth.slice(0, 4),
      totalUVO: 1,
      totalWarnings: 1,
      totalTimeouts: 2,
      totalNotes: 7,
    },
    incidents: {
      categories: incidentCategories.map(c => ({ ...c, count: Math.round(c.count * 0.9) })),
      totalThisPeriod: 82,
      totalPreviousPeriod: 80,
    },
  },
  quarter: {
    period: {
      label: 'Lopend kwartaal',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    },
    kpis: {
      activeYouth: { value: 31, previous: 34, delta: -8.8 },
      outflowYear: { value: 5, previous: 7, delta: -28.6 },
      successRate: { value: '66%', previous: '72%', delta: -6 },
      avgDuration: { value: '8.9 mnd', previous: '8.6 mnd', delta: 0.3 },
    },
    trends: {
      successPerYear: [
        { year: 2022, value: 58 },
        { year: 2023, value: 64 },
        { year: 2024, value: 69 },
        { year: 2025, value: 72 },
        { year: 2026, value: 66 },
      ],
      durationTrend: [
        { period: 'Jan', value: 8.6 },
        { period: 'Feb', value: 8.8 },
        { period: 'Mrt', value: 8.9 },
      ],
    },
    distribution: {
      housingStatus: [
        { label: 'Studio', count: 11, percentage: 35.5 },
        { label: 'Kamer', count: 8, percentage: 25.8 },
        { label: 'Terug naar ouders', count: 7, percentage: 22.6 },
        { label: 'Crisisopvang', count: 5, percentage: 16.1 },
      ],
    },
    recentActivity: [
      { id: 'J-020', location: 'Breda', supervisor: 'S. Vermeer', housingStatus: 'Crisisopvang', status: 'Aandacht vereist' },
      { id: 'J-021', location: 'Tilburg', supervisor: 'N. Janssen', housingStatus: 'Kamer', status: 'Lopend' },
      { id: 'J-022', location: 'Tilburg', supervisor: 'A. de Wit', housingStatus: 'Studio', status: 'Succesvol' },
      { id: 'J-023', location: 'Eindhoven', supervisor: 'M. van Dijk', housingStatus: 'Terug naar ouders', status: 'Doorverwezen' },
    ],
    phases,
    outflow: {
      monthly: outflowMonthly.slice(0, 3),
      totalSuccessful: 6,
      totalUnsuccessful: 2,
      totalReferred: 1,
      avgOutflowAge: 17.9,
    },
    risks: {
      youth: riskYouth.slice(0, 3),
      totalUVO: 1,
      totalWarnings: 1,
      totalTimeouts: 1,
      totalNotes: 5,
    },
    incidents: {
      categories: incidentCategories.map(c => ({ ...c, count: Math.round(c.count * 0.3) })),
      totalThisPeriod: 28,
      totalPreviousPeriod: 24,
    },
  },
}

export async function getDashboardData(period: DashboardPeriod): Promise<DashboardData> {
  const data = dashboardDataset[period]

  // Simuleert API latency voor skeleton states.
  await new Promise((resolve) => setTimeout(resolve, 260))

  return structuredClone(data)
}
