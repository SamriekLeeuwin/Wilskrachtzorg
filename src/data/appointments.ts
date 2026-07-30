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
  attendees?: string
  summary?: string
  decision?: string
  followUp?: string
  completedAt?: string
}

const wkz001Appointments: CareAppointment[] = [
  { id: 'AP-1', date: '2026-07-30', time: '10:00', endTime: '10:45', type: 'Mentorgesprek', subject: 'Voortgang doelen en weekplanning', participants: 'Jongere, mentor', owner: 'N. Janssen', status: 'Gepland' },
  { id: 'AP-2', date: '2026-08-04', time: '14:30', endTime: '15:30', type: 'Netwerkoverleg', subject: 'Vervolgplek en warme overdracht', participants: 'Jongere, mentor, gemeente, aanbieder', owner: 'N. Janssen', status: 'Gepland' },
  { id: 'AP-3', date: '2026-08-11', time: '09:30', endTime: '10:30', type: 'Evaluatie', subject: 'Eindevaluatie traject', participants: 'Jongere, mentor, gedragswetenschapper', owner: 'N. Janssen', status: 'Gepland' },
]

export function defaultAppointments(clientCode: string): CareAppointment[] {
  return clientCode === 'WKZ-001' ? wkz001Appointments : []
}
