import {
  dataCompleteness,
  getDataQualityIssues,
  incidentWindow90d,
  incidents,
  median,
  monthsBetween,
  type Filters,
  type Trajectory,
} from './careInsights'

export const REPORTING_AS_OF = '2026-07-28'

export type ReportingWindow = {
  start: string
  end: string
  label: string
}

export function getReportingWindow(period: Filters['period']): ReportingWindow {
  if (period === '12m') {
    return {
      start: '2025-07-28',
      end: REPORTING_AS_OF,
      label: 'de laatste 12 maanden',
    }
  }

  if (period === '2026') {
    return {
      start: '2026-01-01',
      end: REPORTING_AS_OF,
      label: '2026 tot en met de peildatum',
    }
  }

  return {
    start: '2025-01-01',
    end: '2025-12-31',
    label: 'kalenderjaar 2025',
  }
}

export function getPreviousReportingWindow(period: Filters['period']): ReportingWindow {
  if (period === '12m') {
    return {
      start: '2024-07-28',
      end: '2025-07-27',
      label: 'de voorgaande 12 maanden',
    }
  }

  if (period === '2026') {
    return {
      start: '2025-01-01',
      end: '2025-07-28',
      label: 'dezelfde maanden van 2025',
    }
  }

  return {
    start: '2024-01-01',
    end: '2024-12-31',
    label: 'kalenderjaar 2024',
  }
}

export function buildReportingSnapshot(filters: Filters, rows: Trajectory[]) {
  const window = getReportingWindow(filters.period)
  const previousWindow = getPreviousReportingWindow(filters.period)
  const scoped = rows.filter((item) =>
    (filters.location === 'Alle locaties' || item.location === filters.location) &&
    (filters.origin === 'Alle gemeenten' || item.originMunicipality === filters.origin)
  )
  const trajectoriesInPeriod = scoped.filter((item) =>
    item.startDate <= window.end && (item.endDate ?? '9999-12-31') >= window.start
  )
  const activeAtPeriodEnd = scoped.filter((item) =>
    item.startDate <= window.end && (!item.endDate || item.endDate > window.end)
  )
  const exitsInPeriod = scoped.filter((item) =>
    Boolean(item.endDate && item.endDate >= window.start && item.endDate <= window.end)
  )
  const closedDurations = exitsInPeriod.map((item) => monthsBetween(item.startDate, item.endDate!))
  const overdueAtPeriodEnd = activeAtPeriodEnd.filter((item) => item.expectedEndDate < window.end)
  const placementSnapshotAvailable = window.end === REPORTING_AS_OF
  const placementNeeded = placementSnapshotAvailable
    ? activeAtPeriodEnd.filter((item) => item.followUpPlace !== 'Niet nodig')
    : []
  const placementArranged = placementNeeded.filter((item) =>
    ['Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace)
  )
  const plannedExits = exitsInPeriod.filter((item) => item.outcome === 'Gepland')
  const qualityIssues = getDataQualityIssues(trajectoriesInPeriod)
  const previousActiveAtPeriodEnd = scoped.filter((item) =>
    item.startDate <= previousWindow.end && (!item.endDate || item.endDate > previousWindow.end)
  )
  const previousExitsInPeriod = scoped.filter((item) =>
    Boolean(item.endDate && item.endDate >= previousWindow.start && item.endDate <= previousWindow.end)
  )
  const previousClosedDurations = previousExitsInPeriod.map((item) => monthsBetween(item.startDate, item.endDate!))
  const previousPlannedExits = previousExitsInPeriod.filter((item) => item.outcome === 'Gepland')
  const currentSnapshotAvailable = window.end === REPORTING_AS_OF
  const activeClientCodes = new Set(activeAtPeriodEnd.map((item) => item.clientCode))
  const incidentEventTotal = currentSnapshotAvailable
    ? incidents.filter((item) =>
      activeClientCodes.has(item.clientCode) &&
      item.date >= incidentWindow90d.start &&
      item.date <= incidentWindow90d.end
    ).length
    : null
  const incidentSnapshotTotal = currentSnapshotAvailable
    ? activeAtPeriodEnd.reduce((sum, item) => sum + item.incidents90d, 0)
    : null

  return {
    window,
    scoped,
    trajectoriesInPeriod,
    activeAtPeriodEnd,
    exitsInPeriod,
    closedDurations,
    medianDuration: closedDurations.length ? median(closedDurations) : null,
    overdueAtPeriodEnd,
    placementSnapshotAvailable,
    placementNeeded,
    placementArranged,
    plannedExits,
    completeness: dataCompleteness(trajectoriesInPeriod),
    qualityIssues,
    blockingIssues: qualityIssues.filter((issue) => issue.severity === 'Blokkerend'),
    incidentReconciliation: {
      available: currentSnapshotAvailable,
      eventTotal: incidentEventTotal,
      snapshotTotal: incidentSnapshotTotal,
      matches: currentSnapshotAvailable && incidentEventTotal === incidentSnapshotTotal,
      window: incidentWindow90d,
    },
    previous: {
      window: previousWindow,
      activeAtPeriodEnd: previousActiveAtPeriodEnd,
      exitsInPeriod: previousExitsInPeriod,
      medianDuration: previousClosedDurations.length ? median(previousClosedDurations) : null,
      plannedExitRate: previousExitsInPeriod.length
        ? Math.round((previousPlannedExits.length / previousExitsInPeriod.length) * 100)
        : null,
    },
  }
}

export type KpiDefinition = {
  id: string
  name: string
  purpose: string
  calculation: string
  grain: string
  window: string
  source: string
  required: string
  owner: string
  target: string
  version: string
  definitionStatus: 'Concept'
}

export const kpiRegistry: KpiDefinition[] = [
  {
    id: 'active-at-period-end',
    name: 'Actieve trajecten',
    purpose: 'Caseload en bezetting op één reproduceerbare peildatum volgen',
    calculation: 'Unieke trajecten gestart op of vóór periode-einde, zonder eerdere uitstroom',
    grain: 'Uniek traject',
    window: 'Snapshot op periode-einde',
    source: 'Fictieve trajectregistratie',
    required: 'Traject-ID, instroomdatum, uitstroomdatum',
    owner: 'Zorgmanager',
    target: 'Capaciteitsnorm per locatie; organisatiebreed 30 plaatsen',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
  {
    id: 'median-duration-on-exit',
    name: 'Mediane verblijfsduur bij uitstroom',
    purpose: 'De typische duur van werkelijk afgeronde trajecten volgen',
    calculation: 'Mediaan van uitstroomdatum minus instroomdatum voor uitstroom in de periode',
    grain: 'Uitgestroomd traject',
    window: 'Uitstroomdatum binnen geselecteerde periode',
    source: 'Fictieve trajectregistratie',
    required: 'Traject-ID, instroomdatum, uitstroomdatum',
    owner: 'Zorgmanager',
    target: '≤ 12 maanden',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
  {
    id: 'planned-exit-rate',
    name: 'Geplande uitstroom',
    purpose: 'Onvoorziene beëindiging en continuïteitsrisico signaleren',
    calculation: 'Geplande uitstroom ÷ alle uitstroomtrajecten in de periode',
    grain: 'Uitgestroomd traject',
    window: 'Uitstroomdatum binnen geselecteerde periode',
    source: 'Fictieve trajectregistratie',
    required: 'Traject-ID, uitstroomdatum, uitstroomuitkomst',
    owner: 'Zorgmanager',
    target: '≥ 80%',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
  {
    id: 'overdue-expected-end',
    name: 'Boven verwachte einddatum',
    purpose: 'Actieve trajecten vinden waar doorstroom mogelijk stagneert',
    calculation: 'Actief op periode-einde én verwachte einddatum ligt vóór periode-einde',
    grain: 'Actief traject',
    window: 'Snapshot op periode-einde',
    source: 'Fictieve trajectregistratie',
    required: 'Traject-ID, verwachte einddatum, uitstroomdatum',
    owner: 'Zorgmanager',
    target: '0',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
  {
    id: 'follow-up-place-ready',
    name: 'Vervolgplek geregeld',
    purpose: 'Uitstroomrisico vóór de gewenste uitstroomdatum zichtbaar maken',
    calculation: 'Definitief akkoord of geplaatst ÷ actieve trajecten waarvoor een plek nodig is',
    grain: 'Actief traject',
    window: 'Alleen actuele peildatum; geen historische snapshot beschikbaar',
    source: 'Fictieve trajectregistratie',
    required: 'Vervolgplek nodig, status, aanbieder, gewenste uitstroom',
    owner: 'Zorgmanager',
    target: '≥ 80%',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
  {
    id: 'data-completeness',
    name: 'Datacompleetheid',
    purpose: 'Aangeven hoeveel verplichte bronvelden voor stuurinformatie gevuld zijn',
    calculation: 'Ingevulde verplichte controles ÷ alle verplichte controles in de selectie',
    grain: 'Verplicht veld per traject',
    window: 'Trajecten die de geselecteerde periode overlappen',
    source: 'Fictieve trajectregistratie',
    required: 'Alle velden uit de gebruikte KPI-definities',
    owner: 'Zorgmanager',
    target: '≥ 95% en 0 blokkades',
    version: 'concept v0.2 · 30 jul 2026',
    definitionStatus: 'Concept',
  },
]
