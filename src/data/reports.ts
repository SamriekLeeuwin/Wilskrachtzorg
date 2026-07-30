import type { WorkspaceRole } from '../context/RoleContext'

export type CareReportKind = 'Veiligheidsincident' | 'Zorginhoudelijk signaal' | 'Datacorrectie'
export type CareReportStatus = 'Ter beoordeling' | 'Advies gereed' | 'Herbeoordeling nodig' | 'Escalatie directie' | 'Besluit vastgelegd'
export type ManagerDecision = 'Akkoord' | 'Terug voor herbeoordeling' | 'Escaleren'
export type DirectorDecision = 'Maatregel akkoord' | 'Aanvullende beoordeling nodig' | 'Geen bestuurlijke maatregel'

export type CareReport = {
  id: string
  kind: CareReportKind
  clientCode: string
  subject: string
  description: string
  owner: string
  urgency: 'Vandaag' | 'Deze week'
  status: CareReportStatus
  createdAt: string
  createdByRole: WorkspaceRole
  occurredDate?: string
  occurredTime?: string
  location?: string
  immediateAction?: string
  notified?: string
  clinicalAssessment?: string
  recommendation?: string
  reviewedByRole?: 'Gedragswetenschapper'
  reviewedAt?: string
  managerDecision?: ManagerDecision
  managerDecisionNote?: string
  decidedByRole?: 'Zorgmanager'
  decidedAt?: string
  directorDecision?: DirectorDecision
  directorDecisionNote?: string
  decidedByDirectorAt?: string
  updatedAt: string
}

export function normalizeCareReport(report: Partial<CareReport> & Pick<CareReport, 'id' | 'kind' | 'clientCode' | 'subject' | 'description' | 'owner' | 'urgency' | 'createdAt'>): CareReport {
  const validStatuses: CareReportStatus[] = ['Ter beoordeling', 'Advies gereed', 'Herbeoordeling nodig', 'Escalatie directie', 'Besluit vastgelegd']
  return {
    ...report,
    status: validStatuses.includes(report.status as CareReportStatus) ? report.status as CareReportStatus : 'Ter beoordeling',
    createdByRole: report.createdByRole ?? 'Begeleider',
    updatedAt: report.updatedAt ?? report.createdAt,
  }
}
