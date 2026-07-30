import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

type StyledTableProps = {
  headers: string[]
  children: React.ReactNode
  empty?: boolean
  emptyMessage?: string
}

export default function StyledTable({ headers, children, empty, emptyMessage = 'Geen gegevens gevonden.' }: StyledTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            {headers.map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 700,
                  color: '#475569',
                  fontSize: '0.75rem',
                  py: 1.25,
                  borderBottom: '1px solid #e2e8f0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {children}
          {empty && (
            <TableRow>
              <TableCell colSpan={headers.length} sx={{ py: 3, textAlign: 'center', borderBottom: 0 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
