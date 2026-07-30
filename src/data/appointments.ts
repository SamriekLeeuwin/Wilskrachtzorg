import type { WorkspaceRole } from '../context/RoleContext'

export type CareAppointment = {
  id: string
  date: string
  time: string
  endTime?: string
  type: string
  subject: string
  participants: string
  owner: string
  purpose?: string
  agenda?: string[]
  relatedTaskId?: string
  status?: 'Gepland' | 'Afgerond'
  outcome?: 'Gehouden' | 'Niet verschenen' | 'Geannuleerd'
  attendees?: string
  summary?: string
  decision?: string
  followUp?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  createdByRole?: WorkspaceRole
  requiredRoles?: WorkspaceRole[]
  invitations?: Array<{
    id: string
    name: string
    role: string
    contact: string
    channel: 'E-mail' | 'Telefoon'
    status: 'Concept' | 'Verzonden' | 'Geaccepteerd' | 'Afgewezen'
    statusUpdatedAt?: string
  }>
}

export function appointmentCanBeCompletedByRole(appointment: CareAppointment, role: WorkspaceRole) {
  if (appointment.requiredRoles?.length) return appointment.requiredRoles.includes(role)
  if (appointment.type === 'Mentorgesprek') return ['Begeleider', 'Zorgmanager'].includes(role)
  if (['UVO', 'Netwerkoverleg'].includes(appointment.type)) return ['Gedragswetenschapper', 'Zorgmanager'].includes(role)
  return ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'].includes(role)
}

export function appointmentInvitationsCanBeManagedByRole(appointment: CareAppointment, role: WorkspaceRole) {
  if (appointment.status === 'Afgerond') return false
  if (appointment.requiredRoles?.length) return appointment.requiredRoles.includes(role)
  if (appointment.type === 'Mentorgesprek') return ['Begeleider', 'Zorgmanager'].includes(role)
  if (['UVO', 'Netwerkoverleg'].includes(appointment.type)) return ['Gedragswetenschapper', 'Zorgmanager'].includes(role)
  return ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager'].includes(role)
}

const wkz001Appointments: CareAppointment[] = [
  { id: 'AP-1', date: '2026-07-30', time: '10:00', endTime: '10:45', type: 'Mentorgesprek', subject: 'Voortgang doelen en weekplanning', participants: 'Jongere, mentor', owner: 'N. Janssen', status: 'Gepland' },
  { id: 'AP-2', date: '2026-08-04', time: '14:30', endTime: '15:30', type: 'Netwerkoverleg', subject: 'Vervolgplek en warme overdracht', participants: 'Jongere, mentor, gemeente, aanbieder', owner: 'N. Janssen', status: 'Gepland' },
  { id: 'AP-3', date: '2026-08-11', time: '09:30', endTime: '10:30', type: 'Evaluatie', subject: 'Eindevaluatie traject', participants: 'Jongere, mentor, gedragswetenschapper', owner: 'N. Janssen', status: 'Gepland' },
]

export function defaultAppointments(clientCode: string): CareAppointment[] {
  return clientCode === 'WKZ-001' ? wkz001Appointments : []
}
