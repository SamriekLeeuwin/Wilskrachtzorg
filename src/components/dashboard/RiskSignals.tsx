import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import type { RiskYouth } from '../../types/dashboard'

type RiskSignalsProps = {
  youth: RiskYouth[]
  totalUVO: number
  totalWarnings: number
  totalTimeouts: number
  totalNotes: number
}

function RiskChip({ level }: { level: RiskYouth['riskLevel'] }) {
  const map = {
    UVO: { label: 'UVO', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    waarschuwing: { label: 'Waarschuwing', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    timeout: { label: 'Time-out', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    aantekening: { label: 'Aantekening', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  }
  const c = map[level]
  return (
    <Chip
      size="small"
      label={c.label}
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: '0.68rem',
        height: 22,
        border: `1px solid ${c.border}`,
        borderRadius: 1,
      }}
    />
  )
}

export default function RiskSignals({ youth, totalUVO, totalWarnings, totalTimeouts, totalNotes }: RiskSignalsProps) {
  return (
    <Box>
      {/* Header + mini stats */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Actie vereist
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            Jongeren op het escalatiepad die directe aandacht nodig hebben
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {totalUVO > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                {totalUVO} UVO
              </Typography>
            </Box>
          )}
          {totalWarnings > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <WarningAmberIcon sx={{ color: '#f97316', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#f97316' }}>
                {totalWarnings} waarschuwing
              </Typography>
            </Box>
          )}
          {totalTimeouts > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AccessTimeIcon sx={{ color: '#7c3aed', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                {totalTimeouts} time-out
              </Typography>
            </Box>
          )}
          {totalNotes > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StickyNote2Icon sx={{ color: '#1d4ed8', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                {totalNotes} aantekeningen
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Escalatiepad hint — klein, subtiel */}
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, display: 'block', mb: 1.5 }}>
        Escalatiepad: Aantekening → 3x in 2-3 weken → UVO → Time-out → Officiële waarschuwing → Laatste kans
      </Typography>

      {/* Table */}
      <TableContainer
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          bgcolor: '#fff',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.25, borderBottom: '1px solid #e2e8f0' }}>
                Jongere
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.25, borderBottom: '1px solid #e2e8f0' }}>
                Locatie
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.25, borderBottom: '1px solid #e2e8f0' }}>
                Fase
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.25, borderBottom: '1px solid #e2e8f0' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.25, borderBottom: '1px solid #e2e8f0' }}>
                Laatste incident
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {youth.map((y) => (
              <TableRow key={y.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {y.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    {y.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#334155' }}>
                  {y.location}
                </TableCell>
                <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#334155' }}>
                  {y.currentPhase}
                </TableCell>
                <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                  <RiskChip level={y.riskLevel} />
                </TableCell>
                <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color:
                        y.daysSinceLastIncident <= 3
                          ? '#dc2626'
                          : y.daysSinceLastIncident <= 7
                          ? '#f97316'
                          : '#059669',
                    }}
                  >
                    {y.daysSinceLastIncident}d geleden
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {youth.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Geen actieve risicosignalen
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
