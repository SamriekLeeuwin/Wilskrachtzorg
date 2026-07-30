import type { ReactNode } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { useWorkspaceRole, type WorkspaceRole } from '../../context/RoleContext'

export default function RoleGate({ roles, children }: { roles: WorkspaceRole[]; children: ReactNode }) {
  const { role } = useWorkspaceRole()
  if (roles.includes(role)) return children

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: { xs: 3, md: 6 } }}>
      <Alert severity="warning" icon={<LockOutlinedIcon />} sx={{ alignItems: 'flex-start', border: '1px solid #efd5aa' }}>
        <Stack spacing={1.2}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 780 }}>Deze pagina hoort niet bij uw werkruimte</Typography>
            <Typography sx={{ mt: .35, fontSize: 11.5, lineHeight: 1.6 }}>
              Met de geselecteerde rol <strong>{role}</strong> kunt u deze informatie of handeling niet openen.
              Er is niets gewijzigd.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/" variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
            Terug naar mijn overzicht
          </Button>
        </Stack>
      </Alert>
    </Box>
  )
}
