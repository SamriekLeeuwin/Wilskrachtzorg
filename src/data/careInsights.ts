export type PeriodKey = '12m' | '2026' | '2025'
export type LocationKey = 'Alle locaties' | 'Tilburg' | 'Breda' | 'Eindhoven'
export type OriginKey = 'Alle gemeenten' | 'Zaanstad' | 'Amsterdam' | 'Beverwijk' | 'Overig'

export type Filters = {
  period: PeriodKey
  location: LocationKey
  origin: OriginKey
}

export type Trajectory = {
  id: string
  clientCode: string
  originCity: 'Zaandam' | 'Amsterdam' | 'Beverwijk' | 'Haarlem' | 'Purmerend'
  originMunicipality: Exclude<OriginKey, 'Alle gemeenten'>
  location: Exclude<LocationKey, 'Alle locaties'>
  startDate: string
  expectedEndDate: string
  previousExpectedEndDate?: string
  expectedEndDateReason?: string
  endDate?: string
  currentPhase?: 'Stabilisatie' | 'Verantwoordelijkheid' | 'Onafhankelijkheid' | 'Voorbereiding uitstroom'
  supervisor: string
  incidents90d: number
  activeNotes: number
  followUpPlace: 'Niet nodig' | 'Nog niet gestart' | 'Zoeken' | 'Wachtlijst' | 'Definitief akkoord' | 'Geplaatst'
  followUpType?: string
  followUpProvider?: string
  plannedOutflow?: string
  outcome?: 'Gepland' | 'Ongepland'
  referrer?: string
  intakeReason?: string
  consentConfirmed?: boolean
}

export type WorkItem = {
  id: string
  clientCode: string
  title: string
  detail: string
  due: string
  urgency: 'Vandaag' | 'Deze week' | 'Te laat'
  owner: string
  type: 'Vervolgplek' | 'Herstelgesprek' | 'UVO' | 'Evaluatie'
  status?: 'Open' | 'Afgerond'
  policyReason?: string
  expectedResult?: string
  checklist?: string[]
  dueDate?: string
  dueTime?: string
  completionNote?: string
  completedAt?: string
  updatedAt?: string
  responsibleRoles?: WorkspaceRole[]
  sourceReportId?: string
  sourceAppointmentId?: string
  createdByRole?: WorkspaceRole
}

export type PlacementConversation = {
  id: string
  clientCode: string
  date: string
  subject: string
  participants: string[]
  decision: string
  nextAction: string
  owner: string
  dueDate: string
  status: 'Afgerond' | 'Open'
  decisionBy?: string
  evidenceReference?: string
}

export type IncidentRecord = {
  id: string
  clientCode: string
  date: string
  category: 'Ordeverstoring' | 'Vermijding / zorgmijding' | 'Agressie' | 'Onvoldoende hygiëne' | 'Middelengebruik' | 'Grensoverschrijdend' | 'Onrechtmatige toe-eigening'
  severity: 'Regulier' | 'Zwaar'
  phase?: NonNullable<Trajectory['currentPhase']>
  location: Trajectory['location']
  measure: 'Aantekening' | 'Time-out' | 'Officiële waarschuwing'
  recoveryRequired: boolean
  recoveryCompleted: boolean
}

export const trajectories: Trajectory[] = [
  { id: 'T-001', clientCode: 'WKZ-001', originCity: 'Zaandam', originMunicipality: 'Zaanstad', location: 'Tilburg', startDate: '2025-02-12', expectedEndDate: '2026-02-12', currentPhase: 'Voorbereiding uitstroom', supervisor: 'N. Janssen', incidents90d: 1, activeNotes: 0, followUpPlace: 'Definitief akkoord', followUpType: 'Begeleid wonen', followUpProvider: 'Kompas Wonen', plannedOutflow: '2026-08-18' },
  { id: 'T-002', clientCode: 'WKZ-002', originCity: 'Amsterdam', originMunicipality: 'Amsterdam', location: 'Breda', startDate: '2025-08-04', expectedEndDate: '2026-08-04', currentPhase: 'Onafhankelijkheid', supervisor: 'S. Vermeer', incidents90d: 3, activeNotes: 2, followUpPlace: 'Zoeken', followUpType: 'Beschermd wonen', plannedOutflow: '2026-09-30' },
  { id: 'T-003', clientCode: 'WKZ-003', originCity: 'Beverwijk', originMunicipality: 'Beverwijk', location: 'Tilburg', startDate: '2025-11-17', expectedEndDate: '2026-11-17', currentPhase: 'Verantwoordelijkheid', supervisor: 'A. de Wit', incidents90d: 0, activeNotes: 0, followUpPlace: 'Niet nodig' },
  { id: 'T-004', clientCode: 'WKZ-004', originCity: 'Zaandam', originMunicipality: 'Zaanstad', location: 'Eindhoven', startDate: '2024-12-09', expectedEndDate: '2025-12-09', currentPhase: 'Voorbereiding uitstroom', supervisor: 'M. van Dijk', incidents90d: 4, activeNotes: 3, followUpPlace: 'Wachtlijst', followUpType: 'Trainingswoning', plannedOutflow: '2026-08-31' },
  { id: 'T-005', clientCode: 'WKZ-005', originCity: 'Amsterdam', originMunicipality: 'Amsterdam', location: 'Tilburg', startDate: '2026-01-20', expectedEndDate: '2027-01-20', currentPhase: 'Stabilisatie', supervisor: 'N. Janssen', incidents90d: 2, activeNotes: 1, followUpPlace: 'Nog niet gestart' },
  { id: 'T-006', clientCode: 'WKZ-006', originCity: 'Haarlem', originMunicipality: 'Overig', location: 'Breda', startDate: '2025-04-14', expectedEndDate: '2026-04-14', currentPhase: 'Voorbereiding uitstroom', supervisor: 'S. Vermeer', incidents90d: 1, activeNotes: 1, followUpPlace: 'Zoeken', followUpType: 'Zelfstandige studio', plannedOutflow: '2026-10-15' },
  { id: 'T-007', clientCode: 'WKZ-007', originCity: 'Purmerend', originMunicipality: 'Overig', location: 'Eindhoven', startDate: '2026-03-02', expectedEndDate: '2027-03-02', currentPhase: 'Stabilisatie', supervisor: 'R. de Groot', incidents90d: 0, activeNotes: 0, followUpPlace: 'Niet nodig' },
  { id: 'T-008', clientCode: 'WKZ-008', originCity: 'Zaandam', originMunicipality: 'Zaanstad', location: 'Breda', startDate: '2025-06-23', expectedEndDate: '2026-06-23', currentPhase: 'Onafhankelijkheid', supervisor: 'S. Vermeer', incidents90d: 2, activeNotes: 1, followUpPlace: 'Definitief akkoord', followUpType: 'Kamertraining', followUpProvider: 'Startpunt', plannedOutflow: '2026-08-11' },
  { id: 'T-009', clientCode: 'WKZ-009', originCity: 'Amsterdam', originMunicipality: 'Amsterdam', location: 'Tilburg', startDate: '2024-10-07', expectedEndDate: '2025-10-07', endDate: '2026-02-13', currentPhase: 'Voorbereiding uitstroom', supervisor: 'A. de Wit', incidents90d: 0, activeNotes: 0, followUpPlace: 'Geplaatst', followUpType: 'Begeleid wonen', followUpProvider: 'De Haven', outcome: 'Gepland' },
  { id: 'T-010', clientCode: 'WKZ-010', originCity: 'Beverwijk', originMunicipality: 'Beverwijk', location: 'Breda', startDate: '2025-01-06', expectedEndDate: '2026-01-06', endDate: '2026-04-24', currentPhase: 'Voorbereiding uitstroom', supervisor: 'S. Vermeer', incidents90d: 0, activeNotes: 0, followUpPlace: 'Geplaatst', followUpType: 'Zelfstandige studio', followUpProvider: 'Woonstart', outcome: 'Gepland' },
  { id: 'T-011', clientCode: 'WKZ-011', originCity: 'Zaandam', originMunicipality: 'Zaanstad', location: 'Tilburg', startDate: '2025-03-03', expectedEndDate: '2026-03-03', endDate: '2026-05-19', currentPhase: 'Onafhankelijkheid', supervisor: 'N. Janssen', incidents90d: 0, activeNotes: 0, followUpPlace: 'Geplaatst', followUpType: 'Netwerk/ouders', followUpProvider: 'Eigen netwerk', outcome: 'Gepland' },
  { id: 'T-012', clientCode: 'WKZ-012', originCity: 'Amsterdam', originMunicipality: 'Amsterdam', location: 'Eindhoven', startDate: '2025-09-15', expectedEndDate: '2026-09-15', endDate: '2026-06-06', currentPhase: 'Verantwoordelijkheid', supervisor: 'M. van Dijk', incidents90d: 0, activeNotes: 0, followUpPlace: 'Geplaatst', followUpType: 'Crisisopvang', followUpProvider: 'Crisisopvang Zuid', outcome: 'Ongepland' },
]

export const workItems: WorkItem[] = [
  { id: 'A-01', clientCode: 'WKZ-004', title: 'UVO plannen', detail: '3 actieve aantekeningen binnen 21 dagen', due: 'Vandaag, 16:00', urgency: 'Vandaag', owner: 'M. van Dijk', type: 'UVO', responsibleRoles: ['Gedragswetenschapper', 'Zorgmanager'] },
  { id: 'A-02', clientCode: 'WKZ-002', title: 'Herstelgesprek vastleggen', detail: 'Na time-out van 26 juli', due: '1 dag te laat', urgency: 'Te laat', owner: 'S. Vermeer', type: 'Herstelgesprek', responsibleRoles: ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'] },
  { id: 'A-03', clientCode: 'WKZ-006', title: 'Aanmelding vervolgplek afronden', detail: 'Ontbrekend toestemmingsformulier', due: 'Morgen', urgency: 'Deze week', owner: 'S. Vermeer', type: 'Vervolgplek', responsibleRoles: ['Begeleider', 'Zorgmanager'] },
  { id: 'A-04', clientCode: 'WKZ-008', title: 'Warme overdracht plannen', detail: 'Definitief akkoord van Startpunt ontvangen', due: '31 juli', urgency: 'Deze week', owner: 'N. Janssen', type: 'Vervolgplek', responsibleRoles: ['Begeleider', 'Zorgmanager'] },
  { id: 'A-05', clientCode: 'WKZ-001', title: 'Eindevaluatie voorbereiden', detail: 'Uitstroom staat gepland voor 18 augustus', due: '2 augustus', urgency: 'Deze week', owner: 'N. Janssen', type: 'Evaluatie', responsibleRoles: ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'] },
]

export function workItemVisibleForRole(item: WorkItem, role: WorkspaceRole) {
  if (role === 'Zorgmanager') return true
  if (item.responsibleRoles?.length) {
    const storedRoles = item.responsibleRoles as string[]
    if (role === 'Begeleider') return storedRoles.some((storedRole) => ['Begeleider', 'Woonbegeleider', 'Ambulant begeleider'].includes(storedRole))
    return storedRoles.includes(role)
  }
  if (role === 'Gedragswetenschapper') return ['UVO', 'Herstelgesprek'].includes(item.type)
  return role === 'Begeleider'
}

export const placementConversations: PlacementConversation[] = [
  { id: 'G-01', clientCode: 'WKZ-001', date: '2026-07-24', subject: 'Definitief plaatsingsbesluit', participants: ['Jongere', 'Mentor N. Janssen', 'Gemeente Zaanstad', 'Kompas Wonen'], decision: 'Plaatsing per 18 augustus akkoord', nextAction: 'Warme overdracht en sleuteloverdracht plannen', owner: 'N. Janssen', dueDate: '2026-08-04', status: 'Open' },
  { id: 'G-02', clientCode: 'WKZ-002', date: '2026-07-21', subject: 'Zoekprofiel beschermd wonen', participants: ['Jongere', 'S. Vermeer', 'Gemeente Amsterdam', 'Gedragswetenschapper'], decision: 'Zoekgebied uitgebreid naar regio Kennemerland', nextAction: 'Twee aanbieders aanmelden', owner: 'S. Vermeer', dueDate: '2026-07-30', status: 'Open' },
  { id: 'G-03', clientCode: 'WKZ-008', date: '2026-07-18', subject: 'Kennismaking Startpunt', participants: ['Jongere', 'Mentor S. Vermeer', 'Startpunt', 'Ouder/verzorger'], decision: 'Definitief akkoord kamertraining', nextAction: 'Overdrachtsdossier controleren', owner: 'S. Vermeer', dueDate: '2026-07-29', status: 'Open' },
  { id: 'G-04', clientCode: 'WKZ-006', date: '2026-07-16', subject: 'Voortgang aanmeldingen', participants: ['Jongere', 'S. Vermeer', 'Gemeente Haarlem'], decision: 'Aanmelding zelfstandige studio voortzetten', nextAction: 'Toestemmingsformulier laten ondertekenen', owner: 'S. Vermeer', dueDate: '2026-07-27', status: 'Open' },
]

export const incidents: IncidentRecord[] = [
  { id: 'ZI-2401', clientCode: 'WKZ-002', date: '2026-07-26', category: 'Agressie', severity: 'Zwaar', phase: 'Onafhankelijkheid', location: 'Breda', measure: 'Time-out', recoveryRequired: true, recoveryCompleted: false },
  { id: 'ZI-2394', clientCode: 'WKZ-004', date: '2026-07-22', category: 'Ordeverstoring', severity: 'Regulier', phase: 'Voorbereiding uitstroom', location: 'Eindhoven', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2388', clientCode: 'WKZ-004', date: '2026-07-15', category: 'Vermijding / zorgmijding', severity: 'Regulier', phase: 'Voorbereiding uitstroom', location: 'Eindhoven', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2379', clientCode: 'WKZ-004', date: '2026-07-05', category: 'Ordeverstoring', severity: 'Regulier', phase: 'Voorbereiding uitstroom', location: 'Eindhoven', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2372', clientCode: 'WKZ-005', date: '2026-07-02', category: 'Middelengebruik', severity: 'Zwaar', phase: 'Stabilisatie', location: 'Tilburg', measure: 'Officiële waarschuwing', recoveryRequired: true, recoveryCompleted: false },
  { id: 'ZI-2361', clientCode: 'WKZ-002', date: '2026-06-25', category: 'Vermijding / zorgmijding', severity: 'Regulier', phase: 'Onafhankelijkheid', location: 'Breda', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2350', clientCode: 'WKZ-006', date: '2026-06-13', category: 'Onvoldoende hygiëne', severity: 'Regulier', phase: 'Voorbereiding uitstroom', location: 'Breda', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2341', clientCode: 'WKZ-001', date: '2026-06-02', category: 'Ordeverstoring', severity: 'Regulier', phase: 'Voorbereiding uitstroom', location: 'Tilburg', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2329', clientCode: 'WKZ-008', date: '2026-05-22', category: 'Vermijding / zorgmijding', severity: 'Regulier', phase: 'Onafhankelijkheid', location: 'Breda', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2316', clientCode: 'WKZ-005', date: '2026-05-09', category: 'Ordeverstoring', severity: 'Regulier', phase: 'Stabilisatie', location: 'Tilburg', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2308', clientCode: 'WKZ-002', date: '2026-04-27', category: 'Grensoverschrijdend', severity: 'Zwaar', phase: 'Verantwoordelijkheid', location: 'Breda', measure: 'Time-out', recoveryRequired: true, recoveryCompleted: true },
  { id: 'ZI-2294', clientCode: 'WKZ-006', date: '2026-04-11', category: 'Onrechtmatige toe-eigening', severity: 'Zwaar', phase: 'Onafhankelijkheid', location: 'Breda', measure: 'Officiële waarschuwing', recoveryRequired: true, recoveryCompleted: true },
  { id: 'ZI-2280', clientCode: 'WKZ-008', date: '2026-03-24', category: 'Ordeverstoring', severity: 'Regulier', phase: 'Verantwoordelijkheid', location: 'Breda', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2267', clientCode: 'WKZ-004', date: '2026-03-03', category: 'Agressie', severity: 'Zwaar', phase: 'Onafhankelijkheid', location: 'Eindhoven', measure: 'Time-out', recoveryRequired: true, recoveryCompleted: true },
  { id: 'ZI-2251', clientCode: 'WKZ-001', date: '2026-02-15', category: 'Onvoldoende hygiëne', severity: 'Regulier', phase: 'Onafhankelijkheid', location: 'Tilburg', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
  { id: 'ZI-2238', clientCode: 'WKZ-005', date: '2026-01-28', category: 'Vermijding / zorgmijding', severity: 'Regulier', phase: 'Stabilisatie', location: 'Tilburg', measure: 'Aantekening', recoveryRequired: false, recoveryCompleted: false },
]

export const asOfDate = '28 juli 2026'

export function filterTrajectories(filters: Filters, rows: Trajectory[] = trajectories) {
  return rows.filter((trajectory) => {
    const locationMatches = filters.location === 'Alle locaties' || trajectory.location === filters.location
    const originMatches = filters.origin === 'Alle gemeenten' || trajectory.originMunicipality === filters.origin
    const windowStart = filters.period === '12m' ? '2025-07-28' : `${filters.period}-01-01`
    const windowEnd = filters.period === '12m' ? '2026-07-28' : `${filters.period}-12-31`
    const periodMatches = trajectory.startDate <= windowEnd && (trajectory.endDate ?? '9999-12-31') >= windowStart
    return locationMatches && originMatches && periodMatches
  })
}

export function daysBetween(start: string, end: string) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000))
}

export function monthsBetween(start: string, end: string) {
  return daysBetween(start, end) / 30.4375
}

export function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function formatMonths(value: number) {
  return `${value.toLocaleString('nl-NL', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} mnd`
}

export type DataQualityIssue = {
  id: string
  clientCode: string
  field: string
  problem: string
  severity: 'Blokkerend' | 'Controleren'
}

export function getDataQualityIssues(rows: Trajectory[]): DataQualityIssue[] {
  return rows.flatMap((row) => {
    const issues: DataQualityIssue[] = []
    const add = (field: string, problem: string, severity: DataQualityIssue['severity'] = 'Blokkerend') =>
      issues.push({ id: `${row.id}-${field}`, clientCode: row.clientCode, field, problem, severity })

    if (!row.startDate) add('Instroomdatum', 'Nodig voor verblijfsduur en instroomtelling')
    if (!row.originMunicipality) add('Herkomstgemeente', 'Nodig voor gemeentelijke vergelijking')
    if (!row.location) add('Locatie', 'Nodig voor bezetting en locatievergelijking')
    if (!row.supervisor) add('Trajectbegeleider', 'Nodig voor eigenaarschap en opvolging')
    if (!row.expectedEndDate) add('Verwachte einddatum', 'Nodig voor tijdige uitstroomsturing')
    if (row.startDate && row.expectedEndDate && new Date(row.expectedEndDate) < new Date(row.startDate)) add('Trajectdatums', 'Verwachte einddatum ligt vóór de instroomdatum')
    if (!row.consentConfirmed) add('Verwerkingsgrondslag', 'Controle of bronverwijzing voor de verwerkingsgrondslag ontbreekt', 'Controleren')
    if (row.endDate && !row.outcome) add('Uitstroomresultaat', 'Afgesloten traject mist gepland of ongepland resultaat')
    if (row.endDate && row.followUpPlace !== 'Geplaatst') add('Vervolgplek', 'Afgesloten traject heeft geen definitieve plaatsingsstatus')
    if (row.followUpPlace === 'Geplaatst' && !row.followUpProvider) add('Vervolgaanbieder', 'Plaatsing mist ontvangende aanbieder', 'Controleren')
    if (row.endDate && new Date(row.endDate) < new Date(row.startDate)) add('Uitstroomdatum', 'Datum ligt vóór de instroomdatum')
    return issues
  })
}

export function dataCompleteness(rows: Trajectory[]) {
  const requiredChecks = rows.flatMap((row) => [
    Boolean(row.startDate),
    Boolean(row.originMunicipality),
    Boolean(row.location),
    Boolean(row.supervisor),
    Boolean(row.expectedEndDate),
    Boolean(row.startDate && row.expectedEndDate && new Date(row.expectedEndDate) >= new Date(row.startDate)),
    Boolean(row.consentConfirmed),
    !row.endDate || Boolean(row.outcome),
    !row.endDate || row.followUpPlace === 'Geplaatst',
  ])
  if (!requiredChecks.length) return 0
  return Math.round((requiredChecks.filter(Boolean).length / requiredChecks.length) * 100)
}
import type { WorkspaceRole } from '../context/RoleContext'
