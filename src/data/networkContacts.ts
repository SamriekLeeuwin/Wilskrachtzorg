import type { WorkspaceRole } from '../context/RoleContext'

export type NetworkContactStatus =
  | 'Wachten op reactie'
  | 'Aanvulling gevraagd'
  | 'Afspraak vastgelegd'
  | 'Besluit ontvangen'
  | 'Afgerond'

export type NetworkContact = {
  id: string
  clientCode: string
  contactDate: string
  contactType: 'Afstemming' | 'Evaluatie' | 'Beschikking / verlenging' | 'Veiligheid' | 'Vervolgplek'
  organisation: string
  contactPerson: string
  contactRole: string
  channel: 'Telefoon' | 'E-mail' | 'Beveiligd bericht' | 'Overleg'
  direction?: 'Inkomend' | 'Uitgaand' | 'Gezamenlijk overleg'
  subject: string
  summary: string
  agreement: string
  status: NetworkContactStatus
  nextAction?: string
  dueDate?: string
  owner: string
  sharingBasis: 'Uitvoering jeugdhulp / beschikking' | 'Toestemming vastgelegd' | 'Acuut veiligheidsbelang'
  sharedDataScope: string
  createdByRole: Extract<WorkspaceRole, 'Gedragswetenschapper' | 'Zorgmanager'>
  createdAt: string
  respondsToContactId?: string
  resolvedAt?: string
  resolvedByContactId?: string
  correctsContactId?: string
  correctionReason?: string
  correctedAt?: string
  correctedByContactId?: string
}

export const networkContacts: NetworkContact[] = [
  {
    id: 'NC-001',
    clientCode: 'WKZ-001',
    contactDate: '2026-07-24',
    contactType: 'Vervolgplek',
    organisation: 'Gemeente Zaanstad',
    contactPerson: 'Jeugdregisseur (demo)',
    contactRole: 'Gemeentelijk regisseur',
    channel: 'Overleg',
    subject: 'Plaatsingsbesluit en warme overdracht',
    summary: 'Gemeente, jongere en aanbieder hebben de voorgestelde vervolgplek besproken.',
    agreement: 'Plaatsing bij Kompas Wonen per 18 augustus is bevestigd.',
    status: 'Besluit ontvangen',
    nextAction: 'Warme overdracht en sleuteloverdracht plannen.',
    dueDate: '2026-08-04',
    owner: 'N. Janssen',
    sharingBasis: 'Uitvoering jeugdhulp / beschikking',
    sharedDataScope: 'Voortgang, uitstroombehoefte en noodzakelijke overdrachtsafspraken.',
    createdByRole: 'Gedragswetenschapper',
    createdAt: '2026-07-24T15:10:00.000Z',
  },
  {
    id: 'NC-002',
    clientCode: 'WKZ-002',
    contactDate: '2026-07-21',
    contactType: 'Vervolgplek',
    organisation: 'Gemeente Amsterdam',
    contactPerson: 'Ouder- en Kindteam (demo)',
    contactRole: 'Verwijzer',
    channel: 'Beveiligd bericht',
    subject: 'Uitbreiding zoekprofiel beschermd wonen',
    summary: 'Zoekgebied en benodigde ondersteuning zijn feitelijk toegelicht.',
    agreement: 'Gemeente beoordeelt uitbreiding naar regio Kennemerland.',
    status: 'Wachten op reactie',
    nextAction: 'Besluit over uitbreiding zoekgebied opvragen.',
    dueDate: '2026-07-30',
    owner: 'M. van Dijk',
    sharingBasis: 'Uitvoering jeugdhulp / beschikking',
    sharedDataScope: 'Benodigde woonondersteuning en beoogde uitstroomtermijn.',
    createdByRole: 'Gedragswetenschapper',
    createdAt: '2026-07-21T10:15:00.000Z',
  },
  {
    id: 'NC-003',
    clientCode: 'WKZ-004',
    contactDate: '2026-07-18',
    contactType: 'Beschikking / verlenging',
    organisation: 'Gemeente Zaanstad',
    contactPerson: 'Jeugdconsulent (demo)',
    contactRole: 'Financierend contact',
    channel: 'E-mail',
    subject: 'Aanvullende informatie voor verlengingsbesluit',
    summary: 'De gemeente heeft om een actuele doelen- en risico-inschatting gevraagd.',
    agreement: 'Aanvulling wordt na inhoudelijke controle beveiligd aangeleverd.',
    status: 'Aanvulling gevraagd',
    nextAction: 'Inhoudelijke aanvulling laten controleren en registreren.',
    dueDate: '2026-07-29',
    owner: 'M. van Dijk',
    sharingBasis: 'Uitvoering jeugdhulp / beschikking',
    sharedDataScope: 'Actuele doelen, voortgang en noodzakelijke ondersteuningsduur.',
    createdByRole: 'Gedragswetenschapper',
    createdAt: '2026-07-18T13:40:00.000Z',
  },
  {
    id: 'NC-004',
    clientCode: 'WKZ-006',
    contactDate: '2026-07-16',
    contactType: 'Vervolgplek',
    organisation: 'Gemeente Haarlem',
    contactPerson: 'CJG Kennemerland (demo)',
    contactRole: 'Verwijzer',
    channel: 'Telefoon',
    subject: 'Voortgang aanmelding zelfstandige studio',
    summary: 'De stand van de aanmelding en het ontbrekende toestemmingsformulier zijn besproken.',
    agreement: 'Aanmelding wordt na ontvangst van het formulier verder beoordeeld.',
    status: 'Wachten op reactie',
    nextAction: 'Ondertekend formulier controleren en reactie gemeente opvolgen.',
    dueDate: '2026-07-27',
    owner: 'S. Vermeer',
    sharingBasis: 'Toestemming vastgelegd',
    sharedDataScope: 'Aanmeldstatus en noodzakelijke woonondersteuning.',
    createdByRole: 'Zorgmanager',
    createdAt: '2026-07-16T09:20:00.000Z',
  },
  {
    id: 'NC-005',
    clientCode: 'WKZ-008',
    contactDate: '2026-07-18',
    contactType: 'Evaluatie',
    organisation: 'Gemeente Zaanstad',
    contactPerson: 'Jeugdregisseur (demo)',
    contactRole: 'Gemeentelijk regisseur',
    channel: 'Overleg',
    subject: 'Eindevaluatie en kamertraining',
    summary: 'De voortgang en voorwaarden voor kamertraining zijn besproken.',
    agreement: 'Eindevaluatie staat gepland; gemeente ontvangt alleen de afgesproken samenvatting.',
    status: 'Afspraak vastgelegd',
    nextAction: 'Eindevaluatie voorbereiden en genodigden bevestigen.',
    dueDate: '2026-08-04',
    owner: 'M. van Dijk',
    sharingBasis: 'Uitvoering jeugdhulp / beschikking',
    sharedDataScope: 'Voortgang op hoofddoelen en afspraken voor de overgang.',
    createdByRole: 'Gedragswetenschapper',
    createdAt: '2026-07-18T15:00:00.000Z',
  },
]

export function contactNeedsAttention(contact: NetworkContact, referenceDate = '2026-07-30') {
  if (contact.resolvedAt || contact.correctedAt) return false
  if (contact.status === 'Afgerond') return false
  if (contact.status === 'Aanvulling gevraagd') return true
  return Boolean(contact.dueDate && contact.dueDate <= referenceDate)
}

export function contactsForClient(clientCode: string, rows: NetworkContact[]) {
  return rows
    .filter((item) => item.clientCode === clientCode)
    .sort((a, b) => `${b.contactDate}${b.createdAt}`.localeCompare(`${a.contactDate}${a.createdAt}`))
}
