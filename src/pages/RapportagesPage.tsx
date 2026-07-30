import { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import InsightFilters from '../components/insights/InsightFilters'
import KpiCard from '../components/insights/KpiCard'
import {
  formatMonths, median, monthsBetween, type Filters,
} from '../data/careInsights'
import { loadNetworkContacts, loadTrajectories } from '../data/demoStore'
import { useWorkspaceRole } from '../context/RoleContext'
import { contactNeedsAttention } from '../data/networkContacts'
import { buildReportingSnapshot } from '../data/reporting'

function RapportagesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focus = searchParams.get('focus')
  const { role } = useWorkspaceRole()
  const canOpenDossiers = role === 'Zorgmanager'
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const allTrajectories = useMemo(() => loadTrajectories(), [])
  const reporting = useMemo(() => buildReportingSnapshot(filters, allTrajectories), [allTrajectories, filters])
  const period = reporting.window
  const filtered = reporting.trajectoriesInPeriod
  const exitsInPeriod = reporting.exitsInPeriod
  const activeAtPeriodEnd = reporting.activeAtPeriodEnd
  const placementSnapshotAvailable = reporting.placementSnapshotAvailable
  const completeness = reporting.completeness
  const trajectoryBlockingIssues = reporting.blockingIssues.length

  const originRows = useMemo(() => {
    const origins = ['Zaanstad', 'Amsterdam', 'Beverwijk', 'Overig'] as const
    return origins.map((origin) => {
      const rows = filtered.filter((item) => item.originMunicipality === origin)
      const closed = rows.filter((item) => item.endDate && item.endDate >= period.start && item.endDate <= period.end)
      const closedDurations = closed.map((item) => monthsBetween(item.startDate, item.endDate!))
      const active = rows.filter((item) => item.startDate <= period.end && (!item.endDate || item.endDate > period.end))
      const placementsNeeded = active.filter((item) => item.followUpPlace !== 'Niet nodig')
      const placementArranged = placementsNeeded.filter((item) => ['Definitief akkoord', 'Geplaatst'].includes(item.followUpPlace))
      return {
        origin,
        total: rows.length,
        active: active.length,
        completed: closed.length,
        average: closedDurations.length ? closedDurations.reduce((sum, value) => sum + value, 0) / closedDurations.length : 0,
        median: median(closedDurations),
        longStay: rows.filter((item) => {
          const measurementEnd = item.endDate && item.endDate <= period.end ? item.endDate : period.end
          return item.startDate <= measurementEnd && monthsBetween(item.startDate, measurementEnd) > 12
        }).length,
        placementRate: placementSnapshotAvailable && placementsNeeded.length ? Math.round((placementArranged.length / placementsNeeded.length) * 100) : null,
      }
    }).filter((row) => row.total > 0)
  }, [filtered, period.end, period.start, placementSnapshotAvailable])

  const closedDurations = reporting.closedDurations
  const active = activeAtPeriodEnd
  const placementNeeded = reporting.placementNeeded
  const placementArranged = reporting.placementArranged
  const plannedExitRate = exitsInPeriod.length ? Math.round((reporting.plannedExits.length / exitsInPeriod.length) * 100) : null
  const allContacts = useMemo(() => loadNetworkContacts(), [])
  const activeClientCodes = new Set(activeAtPeriodEnd.map((item) => item.clientCode))
  const currentContacts = placementSnapshotAvailable
    ? allContacts.filter((item) => activeClientCodes.has(item.clientCode))
    : []
  const contactAttention = currentContacts.filter((item) => contactNeedsAttention(item, period.end))
  const invalidContactRecords = currentContacts.filter((item) =>
    !item.organisation ||
    !item.contactPerson ||
    !item.contactRole ||
    !item.owner ||
    !item.sharingBasis ||
    !item.sharedDataScope ||
    (!['Besluit ontvangen', 'Afgerond'].includes(item.status) && (!item.nextAction || !item.dueDate))
  )
  const sourceBlockingIssues =
    (reporting.incidentReconciliation.available && !reporting.incidentReconciliation.matches ? 1 : 0) +
    (invalidContactRecords.length ? 1 : 0)
  const blockingIssues = trajectoryBlockingIssues + sourceBlockingIssues
  const coordinationRows = Array.from(new Set(activeAtPeriodEnd.map((item) => item.responsibleMunicipality ?? item.originMunicipality))).map((municipality) => {
    const clients = activeAtPeriodEnd.filter((item) => (item.responsibleMunicipality ?? item.originMunicipality) === municipality)
    const codes = new Set(clients.map((item) => item.clientCode))
    const contacts = currentContacts.filter((item) => codes.has(item.clientCode))
    const attention = contacts.filter((item) => contactNeedsAttention(item, period.end))
    return {
      municipality,
      clients: clients.length,
      attention: new Set(attention.map((item) => item.clientCode)).size,
      overdue: new Set(attention.filter((item) => item.dueDate && item.dueDate < period.end).map((item) => item.clientCode)).size,
      decisions: new Set(contacts.filter((item) => item.status === 'Besluit ontvangen').map((item) => item.clientCode)).size,
    }
  }).sort((a, b) => b.attention - a.attention || b.clients - a.clients)

  const durationBands = [
    { label: '< 6 mnd', value: exitsInPeriod.filter((item) => monthsBetween(item.startDate, item.endDate!) < 6).length },
    { label: '6–9 mnd', value: exitsInPeriod.filter((item) => { const value = monthsBetween(item.startDate, item.endDate!); return value >= 6 && value < 9 }).length },
    { label: '9–12 mnd', value: exitsInPeriod.filter((item) => { const value = monthsBetween(item.startDate, item.endDate!); return value >= 9 && value <= 12 }).length },
    { label: '> 12 mnd', value: exitsInPeriod.filter((item) => monthsBetween(item.startDate, item.endDate!) > 12).length },
  ]

  return (
    <Stack spacing={2.5}>
      <Alert
        severity="warning"
        action={<Button component={RouterLink} to="/kpi-overzicht" size="small">Controleer data</Button>}
        sx={{ border: '1px solid #f1d6a9', borderRadius: 2.5 }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 760 }}>
          Prototypecijfers — niet extern delen
        </Typography>
        <Typography sx={{ fontSize: 11 }}>
          {completeness}% compleet · {blockingIssues} blokkerende controles · {filtered.length} trajecten in de huidige selectie
        </Typography>
      </Alert>

      <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#edf5fb', border: '1px solid #d9e8f3' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 760, color: '#214969' }}>Wat laat dit overzicht zien?</Typography>
            <Typography sx={{ mt: .35, maxWidth: 760, fontSize: 11.5, lineHeight: 1.55, color: '#567188' }}>
              Voor {period.label} tellen we actieve trajecten op het einde van de periode en uitstroom uitsluitend wanneer de uitstroomdatum binnen de periode valt. Verblijfsduur wordt alleen over die uitstroomtrajecten berekend.
            </Typography>
          </Box>
          <Chip label="Prototype · fictieve data" size="small" sx={{ bgcolor: '#fff', color: '#54728b', border: '1px solid #d5e2ec', fontSize: 10.5 }} />
        </Stack>
      </Box>

      <InsightFilters value={filters} onChange={setFilters} periodOnly={role === 'Directie'} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 1.7 }}>
        {role === 'Directie' ? (
          <>
            <KpiCard label="Actief op periode-einde" value={String(active.length)} context={`${filtered.length} trajecten raakten de periode · vorige gelijke periode: ${reporting.previous.activeAtPeriodEnd.length}`} benchmark="organisatiecapaciteit: 30" icon={<RouteRoundedIcon />} to="/rapportages?focus=active" />
            <KpiCard label="Geplande uitstroom" value={plannedExitRate === null ? '–' : `${plannedExitRate}%`} context={`${plannedExitRate === null ? 'Geen uitstroom; niet van toepassing' : `${reporting.plannedExits.length} van ${exitsInPeriod.length}`} · vorige: ${reporting.previous.plannedExitRate === null ? 'n.v.t.' : `${reporting.previous.plannedExitRate}%`}`} benchmark="conceptdoel ≥ 80%" icon={<HomeWorkRoundedIcon />} tone={plannedExitRate === null ? 'blue' : plannedExitRate >= 80 ? 'green' : 'red'} to="/rapportages?focus=outflow" />
            <KpiCard label="Mediane verblijfsduur" value={reporting.medianDuration === null ? '–' : formatMonths(reporting.medianDuration)} context={`${reporting.medianDuration === null ? 'Geen uitstroom in deze periode' : `${closedDurations.length} uitstroomtrajecten`} · vorige: ${reporting.previous.medianDuration === null ? 'n.v.t.' : formatMonths(reporting.previous.medianDuration)}`} benchmark="conceptdoel ≤ 12 mnd" icon={<AccessTimeRoundedIcon />} tone={reporting.medianDuration === null ? 'blue' : reporting.medianDuration <= 12 ? 'green' : 'red'} to="/rapportages?focus=duration" />
          </>
        ) : (
          <>
            <KpiCard label="Boven verwachte einddatum" value={String(reporting.overdueAtPeriodEnd.length)} context={`${active.length} actieve trajecten aan periode-einde`} benchmark="conceptdoel: 0" icon={<QueryStatsRoundedIcon />} tone={reporting.overdueAtPeriodEnd.length ? 'red' : 'green'} to="/jongeren?attention=overdue" actionLabel="Bekijk betrokken dossiers" />
            <KpiCard label="Vervolgplek geregeld" value={placementSnapshotAvailable ? (placementNeeded.length ? `${Math.round((placementArranged.length / placementNeeded.length) * 100)}%` : 'n.v.t.') : '–'} context={placementSnapshotAvailable ? `${placementArranged.length} van ${placementNeeded.length} actieve trajecten waarvoor een plek nodig is` : 'Historische vervolgplekstatus is niet beschikbaar'} benchmark="conceptdoel ≥ 80%" icon={<HomeWorkRoundedIcon />} tone={placementNeeded.length && placementArranged.length / placementNeeded.length >= .8 ? 'green' : 'amber'} to="/uitstroom-registratie" />
            <KpiCard label="Blokkerende datacontroles" value={String(blockingIssues)} context={`${completeness}% compleet · ${filtered.length} trajecten gecontroleerd`} benchmark="vrijgave: 0 blokkades" icon={<QueryStatsRoundedIcon />} tone={blockingIssues ? 'red' : completeness >= 95 ? 'green' : 'amber'} to="/kpi-overzicht" actionLabel="Bekijk controles" />
          </>
        )}
      </Box>

      {role === 'Directie' && focus && (
        <Alert severity="info">
          <strong>Onderbouwing geselecteerd:</strong>{' '}
          {focus === 'active'
            ? `${active.length} trajecten waren actief op het einde van ${period.label}. Gebruik de organisatie- en gemeentelijke indicatoren hieronder om capaciteit en concentratie te duiden.`
            : focus === 'outflow'
              ? `${reporting.plannedExits.length} van ${exitsInPeriod.length} uitstroomtrajecten was gepland. De verblijfsduurverdeling hieronder laat zien waar vertraging kan zitten.`
              : `De mediaan is gebaseerd op ${closedDurations.length} trajecten met een uitstroomdatum binnen de geselecteerde periode. Trajecten zonder uitstroom tellen niet mee.`}
        </Alert>
      )}

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Samenwerking met verantwoordelijke gemeenten</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>
            {placementSnapshotAvailable ? 'Actuele dossiers met open reactie, aanvulling of besluitdeadline' : 'Contactstatus is alleen als actuele snapshot beschikbaar; niet als historische reeks'}
          </Typography>
        </Box>
        <TableContainer>
          {role === 'Zorgmanager' ? (
            <Table size="small" sx={{ minWidth: 680 }}>
              <TableHead><TableRow>{['Verantwoordelijke gemeente', 'Actieve dossiers', 'Opvolging nodig', 'Deadline verstreken', 'Besluit ontvangen'].map((header) => <TableCell key={header}>{header}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {placementSnapshotAvailable ? coordinationRows.map((row) => (
                  <TableRow key={row.municipality}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.municipality}</TableCell>
                    <TableCell>{row.clients}</TableCell>
                    <TableCell>{row.attention}</TableCell>
                    <TableCell><Chip label={row.overdue} size="small" sx={{ height: 21, bgcolor: row.overdue ? '#fcecea' : '#eaf6f1', color: row.overdue ? '#a44539' : '#24745d', fontSize: 10 }} /></TableCell>
                    <TableCell>{row.decisions}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={5} sx={{ py: 4, textAlign: 'center', color: '#718395' }}>Geen historische gemeentelijke contactstatus beschikbaar.</TableCell></TableRow>}
              </TableBody>
            </Table>
          ) : (
            <Table size="small" sx={{ minWidth: 620 }}>
              <TableHead><TableRow>{['Bestuurlijke indicator', 'Waarde', 'Duiding'].map((header) => <TableCell key={header}>{header}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ fontWeight: 700 }}>Externe opvolging nodig</TableCell><TableCell>{placementSnapshotAvailable ? new Set(contactAttention.map((item) => item.clientCode)).size : '–'}</TableCell><TableCell>Unieke actieve dossiers met reactie, aanvulling of deadline</TableCell></TableRow>
                <TableRow><TableCell sx={{ fontWeight: 700 }}>Deadline verstreken</TableCell><TableCell>{placementSnapshotAvailable ? new Set(contactAttention.filter((item) => item.dueDate && item.dueDate < period.end).map((item) => item.clientCode)).size : '–'}</TableCell><TableCell>Vraagt operationele opvolging door gedragswetenschapper of zorgmanager</TableCell></TableRow>
                <TableRow><TableCell sx={{ fontWeight: 700 }}>Dataconfidence</TableCell><TableCell>{completeness}%</TableCell><TableCell>{blockingIssues ? `${blockingIssues} blokkades in traject-, incident- of contactbron; niet vrijgeven` : 'Bronreconciliatie akkoord; formele bronvalidatie blijft nodig'}</TableCell></TableRow>
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: role === 'Directie' ? '1fr' : '1fr 1fr' }, gap: 2 }}>
        {role === 'Zorgmanager' && <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Verblijfsduur per herkomstgemeente</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Mediaan en gemiddelde van trajecten met uitstroom in de geselecteerde periode</Typography>
          <Box sx={{ height: 270, mt: 2 }}>
            {closedDurations.length ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originRows} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#edf1f4" />
                <XAxis dataKey="origin" tick={{ fill: '#708294', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b99a7', fontSize: 10 }} axisLine={false} tickLine={false} unit=" m" />
                <Tooltip cursor={{ fill: '#f7f9fb' }} contentStyle={{ border: '1px solid #dfe6ec', borderRadius: 10, fontSize: 11 }} formatter={(value, name) => [`${Number(value).toFixed(1)} maanden`, name === 'median' ? 'Mediaan' : 'Gemiddeld']} />
                <Bar dataKey="median" fill="#2f76ae" radius={[4, 4, 0, 0]} maxBarSize={34} />
                <Bar dataKey="average" fill="#a8c5db" radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer> : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 11, color: '#7c8d9b' }}>Geen uitstroomtrajecten in deze selectie.</Typography></Box>}
          </Box>
        </Box>}

        <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Verdeling verblijfsduur</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Alleen trajecten met een uitstroomdatum in de geselecteerde periode</Typography>
          <Box sx={{ height: 270, mt: 2 }}>
            {closedDurations.length ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationBands} margin={{ top: 8, right: 6, left: -28, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#edf1f4" />
                <XAxis dataKey="label" tick={{ fill: '#708294', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#8b99a7', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f7f9fb' }} contentStyle={{ border: '1px solid #dfe6ec', borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="value" name="Trajecten" fill="#5c91ba" radius={[5, 5, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer> : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 11, color: '#7c8d9b' }}>Geen verblijfsduurverdeling beschikbaar.</Typography></Box>}
          </Box>
        </Box>
      </Box>

      {role === 'Zorgmanager' ? <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Vergelijking per herkomstgemeente</Typography>
          <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Toon altijd aantallen naast percentages om kleine groepen herkenbaar te maken</Typography>
        </Box>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {['Gemeente', 'Trajecten', 'Actief', 'Afgesloten', 'Mediaan', 'Gemiddeld', '> 12 mnd', 'Vervolgplek'].map((header) => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {originRows.map((row) => (
                <TableRow
                  key={row.origin}
                  hover={canOpenDossiers}
                  tabIndex={canOpenDossiers ? 0 : undefined}
                  onClick={canOpenDossiers ? () => navigate(`/jongeren?origin=${encodeURIComponent(row.origin)}`) : undefined}
                  onKeyDown={canOpenDossiers ? (event) => { if (event.key === 'Enter') navigate(`/jongeren?origin=${encodeURIComponent(row.origin)}`) } : undefined}
                  sx={canOpenDossiers ? { cursor: 'pointer', '&:focus-visible': { outline: '2px solid #2f76ae', outlineOffset: -2 } } : undefined}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#274158' }}>{row.origin}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.active}</TableCell>
                  <TableCell>{row.completed}</TableCell>
                  <TableCell>{row.completed ? formatMonths(row.median) : '–'}</TableCell>
                  <TableCell>{row.completed ? formatMonths(row.average) : '–'}</TableCell>
                  <TableCell>{row.longStay}</TableCell>
                  <TableCell>{row.placementRate === null ? '–' : <Chip label={`${row.placementRate}%`} size="small" sx={{ height: 21, bgcolor: row.placementRate >= 75 ? '#eaf6f1' : '#fbf2e7', color: row.placementRate >= 75 ? '#24745d' : '#946020', fontSize: 10 }} />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box> : (
        <Alert severity="info">
          Gemeentevergelijkingen met minder dan vijf trajecten per groep zijn in de directieweergave onderdrukt. De zorgmanager kan de operationele vergelijking bekijken; Directie ziet alleen organisatietotalen.
        </Alert>
      )}

      <Typography sx={{ fontSize: 10.5, color: '#8a98a6' }}>
        Bron: fictieve Zilliz-demodata · Peildatum 28 juli 2026 · Verblijfsduur afgesloten trajecten = uitstroomdatum minus instroomdatum.
      </Typography>
    </Stack>
  )
}

export default RapportagesPage
