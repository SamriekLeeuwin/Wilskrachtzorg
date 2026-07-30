import { Button, Stack, TableCell, TableRow, Typography } from '@mui/material'

type EmptyStateRowProps = {
  colSpan: number
  message: string
  actionLabel: string
  onAction: () => void
}

function EmptyStateRow({ colSpan, message, actionLabel, onAction }: EmptyStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
          <Button variant="text" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

export default EmptyStateRow