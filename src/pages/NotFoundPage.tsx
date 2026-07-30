import { Alert, Button, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Link as RouterLink, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const location = useLocation()
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', py: { xs: 2, md: 5 } }}>
      <Alert severity="error">
        <Typography sx={{ fontWeight: 760 }}>Pagina niet gevonden</Typography>
        <Typography sx={{ mt: .3, fontSize: 11.5 }}>
          Het adres “{location.pathname}” bestaat niet in deze prototypewerkruimte. Er is niets gewijzigd.
        </Typography>
      </Alert>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
        Terug naar overzicht
      </Button>
    </Stack>
  )
}
