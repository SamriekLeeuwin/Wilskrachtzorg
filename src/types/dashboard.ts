export type Metric = {
  value: number | string
  previous: number | string
  delta: number
}

export type PhaseDistribution = {
  name: string
  order: number
  activeYouth: number
  completedYouth: number
  avgDurationDays: number
  color: string
}

export type OutflowMonth = {
  month: string
  successful: number
  unsuccessful: number
  referred: number
}

export type RiskYouth = {
  id: string
  name: string
  location: string
  supervisor: string
  currentPhase: string
  riskLevel: 'UVO' | 'waarschuwing' | 'timeout' | 'aantekening'
  riskLabel: string
  incidentCount: number
  daysSinceLastIncident: number
}

export type IncidentCategory = {
  category: string
  count: number
  trend: number
  severity: 'low' | 'medium' | 'high'
}

export type DashboardData = {
  period: {
    label: string
    startDate: string
    endDate: string
  }
  kpis: {
    activeYouth: Metric
    outflowYear: Metric
    successRate: Metric
    avgDuration: Metric
  }
  trends: {
    successPerYear: { year: number; value: number }[]
    durationTrend?: { period: string; value: number }[]
  }
  distribution: {
    housingStatus: {
      label: string
      count: number
      percentage: number
    }[]
  }
  recentActivity: {
    id: string
    location: string
    supervisor: string
    housingStatus: string
    status: 'Succesvol' | 'Doorverwezen' | 'Lopend' | 'Aandacht vereist'
  }[]
  phases: PhaseDistribution[]
  outflow: {
    monthly: OutflowMonth[]
    totalSuccessful: number
    totalUnsuccessful: number
    totalReferred: number
    avgOutflowAge: number
  }
  risks: {
    youth: RiskYouth[]
    totalUVO: number
    totalWarnings: number
    totalTimeouts: number
    totalNotes: number
  }
  incidents: {
    categories: IncidentCategory[]
    totalThisPeriod: number
    totalPreviousPeriod: number
  }
}

export type DashboardPeriod = 'year' | '12m' | 'quarter'
