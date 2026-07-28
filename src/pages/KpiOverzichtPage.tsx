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
  dataCompleteness, filterTrajectories, getDataQualityIssues, type Filters,
} from '../data/careInsights'
import { loadTrajectories } from '../data/demoStore'

const definitions = [
  {
    name: 'Actieve jongeren',
    purpose: 'Actuele caseload en bezetting volgen',
    calculation: 'Unieke trajecten zonder uitstroomdatum op de peildatum',
    required: 'Cliëntcode, instroomdatum, uitstroomdatum',
    owner: 'Zorgmanager',
  },
  {
    name: 'Mediane verblijfsduur',
    purpose: 'Typische trajectduur volgen zonder vertekening door uitschieters',
    calculation: 'Mediaan van uitstroomdatum minus instroomdatum, uitsluitend afgesloten trajecten',
    required: 'Instroomdatum, uitstroomdatum',
    owner: 'Zorgmanager',
  },
  {
    name: 'Boven verwachte einddatum',
    purpose: 'Dossiers vinden waar doorstroom stagneert',
    calculation: 'Actief traject waarvan verwachte einddatum vóór de peildatum ligt',
    required: 'Instroomdatum, verwachte einddatum, uitstroomdatum',
    owner: 'Zorgmanager',
  },
  {
    name: 'Vervolgplek geregeld',
    purpose: 'Uitstroomrisico vroeg zichtbaar maken',
    calculation: 'Definitief akkoord of geplaatst ÷ trajecten waarvoor een vervolgplek nodig is',
    required: 'Vervolgplek nodig, status, aanbieder en geplande uitstroom',
    owner: 'Zorgmanager',
  },
  {
    name: 'Actieve aantekeningen',
    purpose: 'Gedrags- en veiligheidsopvolging bewaken',
    calculation: 'Niet-vervallen aantekeningen binnen 3 maanden; historische registraties blijven bewaard',
    required: 'Datum, type, ernst, fase, melder en opvolging',
    owner: 'Gedragswetenschapper',
  },
  {
    name: 'Datacompleetheid',
    purpose: 'Aangeven of stuurinformatie betrouwbaar genoeg is',
    calculation: 'Ingevulde verplichte velden ÷ alle verplichte velden voor de geselecteerde trajecten',
    required: 'Alle hierboven genoemde bronvelden',
    owner: 'Zorgmanager',
  },
]

function KpiOverzichtPage() {
  const [filters, setFilters] = useState<Filters>({ period: '12m', location: 'Alle locaties', origin: 'Alle gemeenten' })
  const [tab, setTab] = useState(0)
  const rows = useMemo(() => loadTrajectories(), [])
  const filtered = useMemo(() => filterTrajectories(filters, rows), [filters, rows])
  const issues = useMemo(() => getDataQualityIssues(filtered), [filtered])
  const completeness = dataCompleteness(filtered)
  const active = filtered.filter((row) => !row.endDate)
  const overdue = active.filter((row) => new Date(row.expectedEndDate) < new Date('2026-07-28'))
  const blocking = issues.filter((issue) => issue.severity === 'Blokkerend')
  const trustworthy = completeness >= 95 && blocking.length === 0

  return (
    <Stack spacing={2.5}>
      <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, pt: 2.2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 780, color: '#172c42' }}>Controleer vóór je cijfers deelt</Typography>
          <Typography sx={{ mt: .35, fontSize: 11.2, color: '#748598' }}>
            Eén werkplek voor bronkwaliteit, uitzonderingen en afgesproken KPI-berekeningen.
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 1.5, mt: 1, minHeight: 44, borderTop: '1px solid #eef1f4', '& .MuiTab-root': { minHeight: 44, fontSize: 12, fontWeight: 700, textTransform: 'none' } }}>
          <Tab label={`Kwaliteitscontrole (${issues.length})`} />
          <Tab label="KPI-woordenboek" />
        </Tabs>
      </Box>

      <InsightFilters value={filters} onChange={setFilters} />

      {tab === 0 ? (
        <>
          <Alert
            severity={trustworthy ? 'success' : 'warning'}
            icon={trustworthy ? <CheckCircleRoundedIcon /> : <ErrorOutlineRoundedIcon />}
            sx={{ border: `1px solid ${trustworthy ? '#bde4d5' : '#f1d6a9'}`, borderRadius: 2.5 }}
          >
            <Typography sx={{ fontWeight: 760, fontSize: 13 }}>
              {trustworthy ? 'Vrijgegeven voor intern managementgebruik' : 'Nog niet vrijgeven voor externe rapportage'}
            </Typography>
            <Typography sx={{ fontSize: 11.5 }}>
              {trustworthy
                ? 'De selectie voldoet aan de ingestelde minimale kwaliteitsgrens.'
                : `${blocking.length} blokkerende controles moeten eerst worden opgelost. Interne verkenning kan wel, met deze waarschuwing zichtbaar.`}
            </Typography>
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 1.7 }}>
            <KpiCard label="Datacompleetheid" value={`${completeness}%`} context={`Norm voor vrijgave: ≥95% en 0 blokkades`} icon={<FactCheckRoundedIcon />} tone={completeness >= 95 ? 'green' : 'amber'} />
            <KpiCard label="Blokkerende controles" value={String(blocking.length)} context="Moeten vóór externe rapportage worden opgelost" icon={<ErrorOutlineRoundedIcon />} tone={blocking.length ? 'red' : 'green'} />
            <KpiCard label="Dossiers gecontroleerd" value={String(filtered.length)} context={`${active.length} actief · ${filtered.length - active.length} afgesloten`} icon={<RuleRoundedIcon />} />
            <KpiCard label="Te late trajectverwachting" value={String(overdue.length)} context="Actieve dossiers voorbij verwachte einddatum" icon={<ErrorOutlineRoundedIcon />} tone={overdue.length ? 'amber' : 'green'} />
          </Box>

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
            </TableContainer>
          </Box>
        </>
      ) : (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e3e9ef', borderRadius: 2.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 760, color: '#172c42' }}>Goedgekeurde KPI-definities</Typography>
            <Typography sx={{ fontSize: 10.8, color: '#8492a2', mt: .3 }}>Eén definitie per stuurgetal; wijzigingen horen door de gegevenseigenaar te worden goedgekeurd</Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead><TableRow>{['KPI', 'Beslisdoel', 'Exacte berekening', 'Verplichte bronvelden', 'Gegevenseigenaar'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
              <TableBody>{definitions.map((item) => (
                <TableRow key={item.name}>
                  <TableCell sx={{ fontWeight: 750 }}>{item.name}</TableCell>
                  <TableCell>{item.purpose}</TableCell>
                  <TableCell>{item.calculation}</TableCell>
                  <TableCell>{item.required}</TableCell>
                  <TableCell><Chip label={item.owner} size="small" sx={{ height: 22, fontSize: 10, bgcolor: '#eef4f9', color: '#426684' }} /></TableCell>
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
