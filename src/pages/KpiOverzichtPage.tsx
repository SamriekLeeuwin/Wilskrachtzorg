import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Chip, Divider, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import RuleRoundedIcon from '@mui/icons-material/RuleRounded'
import { Link as RouterLink } from 'react-router-dom'
import InsightFilters from '../components/insights/InsightFilters'
import KpiCard from '../components/insights/KpiCard'
import {
  type Filters,
} from '../data/careInsights'
import { loadNetworkContacts, loadTrajectories } from '../data/demoStore'
import { useWorkspaceRole } from '../context/RoleContext'
import { buildReportingSnapshot, kpiRegistry } from '../data/reporting'

function KpiOverzichtPage() {
  const { role } = useWorkspaceRole()
  const canOpenDossier = role === 'Zorgmanager'
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const [tab, setTab] = useState(0)
  const rows = useMemo(() => loadTrajectories(), [])
  const contacts = useMemo(() => loadNetworkContacts(), [])
  const reporting = useMemo(() => buildReportingSnapshot(filters, rows), [filters, rows])
  const filtered = reporting.trajectoriesInPeriod
  const issues = reporting.qualityIssues
  const completeness = reporting.completeness
  const active = reporting.activeAtPeriodEnd
  const blocking = reporting.blockingIssues
  const activeClientCodes = new Set(active.map((item) => item.clientCode))
  const relevantContacts = reporting.placementSnapshotAvailable
    ? contacts.filter((item) => activeClientCodes.has(item.clientCode))
    : []
  const invalidContactRecords = relevantContacts.filter((item) =>
    !item.organisation ||
    !item.contactPerson ||
    !item.contactRole ||
    !item.owner ||
    !item.sharingBasis ||
    !item.sharedDataScope ||
    ((['Wachten op reactie', 'Aanvulling gevraagd', 'Afspraak vastgelegd'].includes(item.status) || Boolean(item.nextAction)) &&
      (!item.nextAction || !item.dueDate))
  )
  const sourceMismatchCount =
    (reporting.incidentReconciliation.available && !reporting.incidentReconciliation.matches ? 1 : 0) +
    (invalidContactRecords.length ? 1 : 0)
  const releaseBlockingCount = blocking.length + sourceMismatchCount
  const passesPrototypeChecks = completeness >= 95 && releaseBlockingCount === 0
  const aggregateIssues = Array.from(issues.reduce((map, issue) => {
    const key = `${issue.field}-${issue.severity}`
    const current = map.get(key)
    map.set(key, current ? { ...current, count: current.count + 1 } : {
      field: issue.field,
      problem: issue.problem,
      severity: issue.severity,
      count: 1,
    })
    return map
  }, new Map<string, { field: string; problem: string; severity: 'Blokkerend' | 'Controleren'; count: number }>()).values())

  return (
    <Stack spacing={2.5}>
      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, pt: 2.2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 780, color: '#172c42' }}>Controleer vóór u cijfers deelt</Typography>
          <Typography sx={{ mt: .35, fontSize: 11.2, color: '#748598' }}>
            Eén werkplek voor bronkwaliteit, uitzonderingen en afgesproken KPI-berekeningen.
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 1.5, mt: 1, minHeight: 44, borderTop: '1px solid #eef1f4', '& .MuiTab-root': { minHeight: 44, fontSize: 12, fontWeight: 700, textTransform: 'none' } }}>
          <Tab label={`Kwaliteitscontrole (${issues.length})`} />
          <Tab label="Concept KPI-woordenboek" />
        </Tabs>
      </Box>

      <InsightFilters value={filters} onChange={setFilters} periodOnly={role === 'Directie'} />

      {tab === 0 ? (
        <>
          <Alert
            severity={passesPrototypeChecks ? 'success' : 'warning'}
            icon={passesPrototypeChecks ? <CheckCircleRoundedIcon /> : <ErrorOutlineRoundedIcon />}
            sx={{ border: `1px solid ${passesPrototypeChecks ? '#bde4d5' : '#f1d6a9'}`, borderRadius: 2.5 }}
          >
            <Typography sx={{ fontWeight: 760, fontSize: 13 }}>
              {passesPrototypeChecks ? 'Prototypecontroles zonder blokkade' : 'Niet vrijgeven voor rapportage'}
            </Typography>
            <Typography sx={{ fontSize: 11.5 }}>
              {passesPrototypeChecks
                ? 'De ingebouwde controles zijn doorlopen. Formele bronvalidatie en goedkeuring blijven vóór ieder intern of extern gebruik verplicht.'
                : `${releaseBlockingCount} blokkerende controles moeten eerst worden opgelost. Verkenning kan alleen met deze waarschuwing zichtbaar.`}
            </Typography>
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
            <KpiCard label="Datacompleetheid" value={`${completeness}%`} context={`Norm voor vrijgave: ≥95% en 0 blokkades`} icon={<FactCheckRoundedIcon />} tone={completeness >= 95 ? 'green' : 'amber'} />
            <KpiCard label="Blokkerende controles" value={String(releaseBlockingCount)} context="Velden én bronafwijkingen vóór rapportage oplossen" icon={<ErrorOutlineRoundedIcon />} tone={releaseBlockingCount ? 'red' : 'green'} />
            <KpiCard label="Dossiers gecontroleerd" value={String(filtered.length)} context={`${active.length} actief · ${filtered.length - active.length} afgesloten`} icon={<RuleRoundedIcon />} />
            <KpiCard
              label="Bronreconciliatie"
              value={!reporting.incidentReconciliation.available ? 'n.v.t.' : sourceMismatchCount === 0 ? 'Akkoord' : 'Verschil'}
              context={!reporting.incidentReconciliation.available
                ? 'Geen historische incidentsnapshot beschikbaar'
                : `${reporting.incidentReconciliation.eventTotal} incidentregels = ${reporting.incidentReconciliation.snapshotTotal} in trajectsamenvatting · ${relevantContacts.length} contactregistraties gecontroleerd`}
              icon={<RuleRoundedIcon />}
              tone={!reporting.incidentReconciliation.available ? 'blue' : sourceMismatchCount === 0 ? 'green' : 'red'}
            />
          </Box>

          {sourceMismatchCount > 0 && (
            <Alert severity="error" sx={{ border: '1px solid #edc5c0', borderRadius: 2.5 }}>
              De incidentbron sluit niet aan of een contactregistratie mist verplichte procesgegevens. Rapportage blijft geblokkeerd totdat de bronverschillen zijn hersteld.
            </Alert>
          )}

          <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ px: 2.5, py: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Te herstellen registraties</Typography>
                <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Gesorteerd op blokkade; herstel altijd in het oorspronkelijke jongerendossier</Typography>
              </Box>
              <Chip label={`${issues.length} aandachtspunten`} size="small" sx={{ alignSelf: 'flex-start', bgcolor: issues.length ? '#fff3e5' : '#eaf6f1', color: issues.length ? '#925b1d' : '#24745d' }} />
            </Stack>
            <Divider />
            <TableContainer>
              {canOpenDossier ? (
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead><TableRow>{['Dossier', 'Ontbrekend/onjuist veld', 'Effect op rapportage', 'Prioriteit', 'Herstellen'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {issues.length ? issues.map((issue) => (
                      <TableRow key={issue.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{issue.clientCode}</TableCell>
                        <TableCell>{issue.field}</TableCell>
                        <TableCell>{issue.problem}</TableCell>
                        <TableCell><Chip label={issue.severity} size="small" sx={{ height: 21, fontSize: 10, bgcolor: issue.severity === 'Blokkerend' ? '#fcecea' : '#fff3e5', color: issue.severity === 'Blokkerend' ? '#a44539' : '#925b1d' }} /></TableCell>
                        <TableCell><Button component={RouterLink} to={`/jongeren/${issue.clientCode}`} size="small">Open dossier</Button></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: '#718196' }}>Geen problemen gevonden in deze selectie.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table size="small" sx={{ minWidth: 680 }}>
                  <TableHead><TableRow>{['Controle', 'Effect op rapportage', 'Prioriteit', 'Geaggregeerd aantal'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {aggregateIssues.length ? aggregateIssues.map((issue) => (
                      <TableRow key={`${issue.field}-${issue.severity}`}>
                        <TableCell sx={{ fontWeight: 700 }}>{issue.field}</TableCell>
                        <TableCell>{issue.problem}</TableCell>
                        <TableCell><Chip label={issue.severity} size="small" sx={{ height: 21, fontSize: 10, bgcolor: issue.severity === 'Blokkerend' ? '#fcecea' : '#fff3e5', color: issue.severity === 'Blokkerend' ? '#a44539' : '#925b1d' }} /></TableCell>
                        <TableCell>{issue.count < 5 ? '<5' : issue.count}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, color: '#718196' }}>Geen problemen gevonden in deze selectie.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Box>
        </>
      ) : (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Concept KPI-definities</Typography>
            <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Eén reproduceerbare definitie per stuurgetal; formele goedkeuring door Wilskracht Zorg is nog nodig</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small" sx={{ minWidth: 1320 }}>
              <TableHead><TableRow>{['KPI', 'Beslisdoel', 'Exacte berekening', 'Grain & venster', 'Bronvelden', 'Norm', 'Eigenaar & versie'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{kpiRegistry.map((item) => (
                <TableRow key={item.name}>
                  <TableCell sx={{ fontWeight: 750 }}>{item.name}</TableCell>
                  <TableCell>{item.purpose}</TableCell>
                  <TableCell>{item.calculation}</TableCell>
                  <TableCell>{item.grain}<Typography sx={{ mt: .3, fontSize: 9.5, color: '#8492a2' }}>{item.window}</Typography></TableCell>
                  <TableCell>{item.required}</TableCell>
                  <TableCell>{item.target}</TableCell>
                  <TableCell><Chip label={`${item.definitionStatus} · ${item.owner}`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: '#fff3e5', color: '#8a5b20' }} /><Typography sx={{ mt: .4, fontSize: 9.5, color: '#8492a2' }}>{item.version}</Typography></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box sx={{ p: 2.25, bgcolor: '#edf5fb', border: '1px solid #d9e8f3', borderRadius: 2.5 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 750, color: '#214969' }}>Bronstatus</Typography>
        <Typography sx={{ mt: .35, fontSize: 11, lineHeight: 1.55, color: '#567188' }}>
          Fictieve Zilliz-demodata · peildatum 28 juli 2026 · geen automatische synchronisatie.
          Filters gelden voor alle controles. Deze prototypegegevens zijn bedoeld om de werkwijze te beoordelen, niet voor cliëntbesluiten of externe verantwoording.
        </Typography>
      </Box>
    </Stack>
  )
}

export default KpiOverzichtPage
