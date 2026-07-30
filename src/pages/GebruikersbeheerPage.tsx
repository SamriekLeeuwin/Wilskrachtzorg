import { Box, Chip, TableRow, TableCell } from '@mui/material'
import SectionCard from '../components/ui/SectionCard'
import StyledTable from '../components/ui/StyledTable'

function GebruikersbeheerPage() {
  const gebruikers = [
    { naam: 'Eline Vos', rol: 'Begeleider', locatie: 'Tilburg', status: 'Actief' as const },
    { naam: 'Milan van Dijk', rol: 'Gedragswetenschapper', locatie: 'Breda', status: 'Actief' as const },
    { naam: 'Noor Peters', rol: 'Manager', locatie: 'Den Bosch', status: 'Uitgenodigd' as const },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionCard title="Gebruikers" subtitle="Rollen, locaties en toegangsstatus van medewerkers">
        <StyledTable headers={['Naam', 'Rol', 'Locatie', 'Status']}>
          {gebruikers.map((gebruiker) => (
            <TableRow key={gebruiker.naam} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a' }}>{gebruiker.naam}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{gebruiker.rol}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>{gebruiker.locatie}</TableCell>
              <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f1f5f9' }}>
                <Chip
                  size="small"
                  label={gebruiker.status}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: gebruiker.status === 'Actief' ? '#ecfdf5' : '#fff7ed',
                    color: gebruiker.status === 'Actief' ? '#059669' : '#c2410c',
                    border: `1px solid ${gebruiker.status === 'Actief' ? '#b9f0d1' : '#fed7aa'}`,
                    borderRadius: 1,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </StyledTable>
      </SectionCard>
    </Box>
  )
}

export default GebruikersbeheerPage
