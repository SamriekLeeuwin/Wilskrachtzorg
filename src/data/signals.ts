import { incidents, type Trajectory, type WorkItem } from './careInsights'

export type SignalType = 'Doorstroom' | 'Veiligheid' | 'Evaluatie' | 'Datakwaliteit'
export type SignalPriority = 'Kritiek' | 'Hoog' | 'Normaal'

export type CareSignal = {
  id: string
  clientCode: string
  type: SignalType
  title: string
  reason: string
  nextAction: string
  owner: string
  due: string
  priority: SignalPriority
  source: string
}

export function deriveSignals(trajectories: Trajectory[], workItems: WorkItem[]): CareSignal[] {
  const active = trajectories.filter((row) => !row.endDate)
  const signals: CareSignal[] = []

  active.forEach((row) => {
    if (new Date(row.expectedEndDate) < new Date('2026-07-28')) {
      signals.push({
        id: `end-${row.clientCode}`,
        clientCode: row.clientCode,
        type: 'Doorstroom',
        title: 'Verwachte einddatum overschreden',
        reason: `Het traject loopt sinds ${new Date(row.startDate).toLocaleDateString('nl-NL')} en is voorbij de verwachte einddatum.`,
        nextAction: 'Beoordeel stagnatie en leg een nieuw uitstroomscenario met taakverantwoordelijke vast.',
        owner: row.supervisor,
        due: 'Vandaag',
        priority: 'Hoog',
        source: 'Trajectregistratie',
      })
    }

    const noteDates = incidents
      .filter((incident) => incident.clientCode === row.clientCode && incident.measure === 'Aantekening')
      .map((incident) => incident.date)
      .sort()
    const qualifyingWindow = noteDates.findIndex((date, index) =>
      Boolean(noteDates[index + 2]) &&
      (new Date(noteDates[index + 2]).getTime() - new Date(date).getTime()) / 86_400_000 <= 21
    )
    const firstDate = qualifyingWindow >= 0 ? noteDates[qualifyingWindow] : ''
    const thirdDate = qualifyingWindow >= 0 ? noteDates[qualifyingWindow + 2] : ''
    const uvoAlreadyHandled = workItems.some((item) =>
      item.clientCode === row.clientCode &&
      item.type === 'UVO' &&
      (
        item.status !== 'Afgerond' ||
        !item.completedAt ||
        item.completedAt.slice(0, 10) >= thirdDate
      )
    )
    if (row.activeNotes >= 3 && qualifyingWindow >= 0 && !uvoAlreadyHandled) {
      signals.push({
        id: `uvo-${row.clientCode}`,
        clientCode: row.clientCode,
        type: 'Veiligheid',
        title: 'UVO moet worden ingepland',
        reason: `Drie aantekeningen zijn geregistreerd tussen ${new Date(firstDate).toLocaleDateString('nl-NL')} en ${new Date(thirdDate).toLocaleDateString('nl-NL')} (binnen 21 dagen).`,
        nextAction: 'Maak een UVO-taak, wijs een taakverantwoordelijke toe en leg deelnemers en datum vast.',
        owner: row.supervisor,
        due: 'Vandaag',
        priority: 'Kritiek',
        source: 'Incidentdatums + configureerbare beleidsregel (21 dagen)',
      })
    }

    if (!['Niet nodig', 'Definitief akkoord', 'Geplaatst'].includes(row.followUpPlace) && row.plannedOutflow) {
      signals.push({
        id: `placement-${row.clientCode}`,
        clientCode: row.clientCode,
        type: 'Doorstroom',
        title: 'Vervolgplek nog niet definitief',
        reason: `Status is “${row.followUpPlace}” bij een gewenste uitstroom op ${new Date(row.plannedOutflow).toLocaleDateString('nl-NL')}.`,
        nextAction: 'Controleer aanmeldingen, besluitvorming en eerstvolgende deadline.',
        owner: row.supervisor,
        due: 'Deze week',
        priority: row.followUpPlace === 'Nog niet gestart' ? 'Kritiek' : 'Hoog',
        source: 'Vervolgplekmonitor',
      })
    }
  })

  const openRecovery = incidents.filter((incident) => incident.recoveryRequired && !incident.recoveryCompleted)
  openRecovery.filter((incident) => !workItems.some((item) =>
    item.clientCode === incident.clientCode &&
    item.type === 'Herstelgesprek' &&
    (item.status !== 'Afgerond' || !item.completedAt || item.completedAt.slice(0, 10) >= incident.date)
  )).forEach((incident) => {
    const trajectory = active.find((row) => row.clientCode === incident.clientCode)
    signals.push({
      id: `recovery-${incident.id}`,
      clientCode: incident.clientCode,
      type: 'Veiligheid',
      title: 'Herstelopvolging ontbreekt',
      reason: `${incident.severity} incident (${incident.measure}) op ${new Date(incident.date).toLocaleDateString('nl-NL')}.`,
      nextAction: 'Plan en documenteer het herstelgesprek en eventuele vervolgmaatregel.',
      owner: trajectory?.supervisor ?? 'Nog toe te wijzen',
      due: 'Vandaag',
      priority: 'Kritiek',
      source: 'Incidentregistratie',
    })
  })

  workItems.filter((item) => item.type === 'Evaluatie' && item.status !== 'Afgerond').forEach((item) => {
    signals.push({
      id: `evaluation-${item.id}`,
      clientCode: item.clientCode,
      type: 'Evaluatie',
      title: item.title,
      reason: item.detail,
      nextAction: 'Plan de evaluatie en leg besluit, deelnemers en vervolgactie vast.',
      owner: item.owner,
      due: item.due,
      priority: item.urgency === 'Te laat' ? 'Kritiek' : 'Normaal',
      source: 'Werkvoorraad',
    })
  })

  return signals.sort((a, b) => {
    const order: Record<SignalPriority, number> = { Kritiek: 0, Hoog: 1, Normaal: 2 }
    return order[a.priority] - order[b.priority]
  })
}
