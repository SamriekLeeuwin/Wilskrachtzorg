import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Alert, AppBar, Box, Chip, CssBaseline, Drawer, FormControl, IconButton, List, MenuItem, Select,
  ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Tooltip, Typography,
  useMediaQuery, useTheme,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import RuleRoundedIcon from '@mui/icons-material/RuleRounded'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import type { ReactNode } from 'react'
import { useWorkspaceRole, workspaceRoles, type WorkspaceRole } from '../context/RoleContext'
import LoadingState from '../components/dashboard/LoadingState'

type MenuItem = { label: string; to: string; icon: ReactNode; badge?: number; roles: WorkspaceRole[] }
const drawerWidth = 248
const allRoles: WorkspaceRole[] = ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager', 'Directie']
const careRoles: WorkspaceRole[] = ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager']

const primaryItems: MenuItem[] = [
  { label: 'Overzicht', to: '/', icon: <DashboardRoundedIcon />, roles: allRoles },
  { label: 'Openstaande taken', to: '/acties', icon: <AssignmentTurnedInRoundedIcon />, roles: careRoles },
  { label: 'Signaalcentrum', to: '/signalen', icon: <NotificationsActiveRoundedIcon />, roles: careRoles },
  { label: 'Beoordelingen & besluiten', to: '/beoordelingen', icon: <FactCheckRoundedIcon />, roles: ['Gedragswetenschapper', 'Zorgmanager'] },
  { label: 'Jongeren', to: '/jongeren', icon: <PeopleAltRoundedIcon />, roles: careRoles },
  { label: 'Managementrapportage', to: '/rapportages', icon: <RouteRoundedIcon />, roles: ['Zorgmanager', 'Directie'] },
  { label: 'Locaties & capaciteit', to: '/locaties', icon: <ApartmentRoundedIcon />, roles: ['Zorgmanager', 'Directie'] },
  { label: 'Uitstroom & vervolgplek', to: '/uitstroom-registratie', icon: <HomeWorkRoundedIcon />, roles: ['Begeleider', 'Zorgmanager'] },
  { label: 'Incidenten & herstel', to: '/gedrag-analyse', icon: <FactCheckRoundedIcon />, roles: ['Gedragswetenschapper', 'Zorgmanager', 'Directie'] },
  { label: 'Databetrouwbaarheid', to: '/kpi-overzicht', icon: <RuleRoundedIcon />, roles: ['Zorgmanager', 'Directie'] },
]

const pageMeta: Record<string, { title: string; eyebrow: string }> = {
  '/': { title: 'Dashboardoverzicht', eyebrow: 'OVERZICHT' },
  '/acties': { title: 'Openstaande taken', eyebrow: 'TAKEN & BESLUITEN' },
  '/acties/nieuw': { title: 'Nieuwe taak', eyebrow: 'TAKEN & BESLUITEN' },
  '/signalen': { title: 'Automatische signalen', eyebrow: 'RISICO & OPVOLGING' },
  '/beoordelingen': { title: 'Beoordelingen en besluiten', eyebrow: 'DATA & BESLUITVORMING' },
  '/jongeren': { title: 'Jongeren', eyebrow: 'CLIËNTEN' },
  '/rapportages': { title: 'Managementrapportage', eyebrow: 'STUREN & VERANTWOORDEN' },
  '/uitstroom-registratie': { title: 'Uitstroom & vervolgplek', eyebrow: 'DOORSTROOM' },
  '/gedrag-analyse': { title: 'Incidenten en herstelopvolging', eyebrow: 'VEILIGHEID' },
  '/fase-overzicht': { title: 'Fases & ontwikkeling', eyebrow: 'TRAJECTEN' },
  '/jongere-timeline': { title: 'Jongeredossier', eyebrow: 'CLIËNTEN' },
  '/begeleiders': { title: 'Medewerkers', eyebrow: 'ORGANISATIE' },
  '/locaties': { title: 'Locaties & capaciteit', eyebrow: 'BEZETTING & ZORGDRUK' },
  '/kpi-overzicht': { title: 'Databetrouwbaarheid', eyebrow: 'CONTROLE & DEFINITIES' },
  '/gebruikersbeheer': { title: 'Gebruikersbeheer', eyebrow: 'BEHEER' },
  '/systeeminstellingen': { title: 'Instellingen', eyebrow: 'BEHEER' },
}

function DashboardLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const { role, setRole } = useWorkspaceRole()
  const [online, setOnline] = useState(() => navigator.onLine)
  const meta = location.pathname.endsWith('/uitnodigingen')
    ? { title: 'Uitnodigingen beheren', eyebrow: 'AFSPRAAK & DEELNEMERS' }
    : location.pathname === '/melden'
    ? { title: 'Melding registreren', eyebrow: 'MELDING & OPVOLGING' }
    : location.pathname === '/uitstroom-registratie/bijwerken'
    ? { title: 'Vervolgplek bijwerken', eyebrow: 'DOORSTROOM & BESLUIT' }
    : location.pathname === '/jongeren/nieuw'
    ? { title: 'Nieuwe intake', eyebrow: 'INSTROOM & DOSSIER' }
    : location.pathname.endsWith('/afronden')
    ? { title: 'Afspraak afronden', eyebrow: 'BESLUIT & VERVOLG' }
    : location.pathname.endsWith('/afspraak/nieuw')
    ? { title: 'Afspraak inplannen', eyebrow: 'DOSSIER & OPVOLGING' }
    : location.pathname.startsWith('/jongeren/')
    ? { title: 'Jongeredossier', eyebrow: 'CLIËNTEN' }
    : location.pathname.startsWith('/acties/') && location.pathname.endsWith('/bewerken')
      ? { title: 'Taak wijzigen', eyebrow: 'ACTIES & BESLUITEN' }
    : pageMeta[location.pathname] ?? pageMeta['/']
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0b315d', color: '#fff' }}>
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 2.5, height: 76 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#fff', color: '#0b315d', display: 'grid', placeItems: 'center' }}>
          <FavoriteRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.15 }}>Wilskracht Zorg</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,.62)', mt: 0.25 }}>Zorginzicht</Typography>
        </Box>
      </Stack>

      <Box sx={{ px: 1.25, pt: 2 }}>
        <Typography sx={{ px: 1.5, mb: 1, color: 'rgba(255,255,255,.48)', fontWeight: 700, fontSize: 10, letterSpacing: '.11em' }}>
          WERKRUIMTE
        </Typography>
        <List disablePadding>
          {primaryItems.filter((item) => item.roles.includes(role)).map((item) => {
            const active = location.pathname === item.to
            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                selected={active}
                sx={{
                  minHeight: 46, px: 1.5, mb: 0.5, borderRadius: 2,
                  color: active ? '#fff' : 'rgba(255,255,255,.72)',
                  '& .MuiListItemIcon-root': { minWidth: 37, color: 'inherit' },
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.12)', boxShadow: 'inset 3px 0 #65b4ff' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,.14)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,.08)', color: '#fff' },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 550 }} />
                {item.badge && <Chip label={item.badge} size="small" sx={{ height: 20, minWidth: 20, bgcolor: '#fef3c7', color: '#92400e', fontSize: 10.5, '& .MuiChip-label': { px: .7 } }} />}
              </ListItemButton>
            )
          })}
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      <Box component="a" href="#main-content" sx={{ position: 'fixed', left: 12, top: -60, zIndex: 2000, bgcolor: '#fff', color: '#0b315d', px: 2, py: 1.2, borderRadius: 1, boxShadow: 3, '&:focus': { top: 12 } }}>Ga naar hoofdinhoud</Box>
      <AppBar position="fixed" elevation={0} color="inherit" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'rgba(255,255,255,.96)', borderBottom: '1px solid #e7ebf0' }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 76 }, px: { xs: 2, md: 4 } }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }} aria-label="Open navigatie"><MenuRoundedIcon /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#8090a4', fontWeight: 800, fontSize: 9.5, letterSpacing: '.12em', lineHeight: 1.2 }}>{meta.eyebrow}</Typography>
            <Typography component="h1" sx={{ m: 0, color: '#12243a', fontWeight: 760, fontSize: { xs: 20, md: 23 }, letterSpacing: '-.025em', mt: .25 }}>{meta.title}</Typography>
          </Box>
          {careRoles.includes(role) && (
            <Tooltip title="Openstaande signalen">
              <IconButton component={NavLink} to="/signalen" aria-label="Open automatische signalen" sx={{ border: '1px solid #e5eaf0', width: 44, height: 44, mr: 1.5 }}>
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Prototypeweergave: dit is geen echte aanmelding of autorisatie.">
          <FormControl size="small" sx={{ minWidth: { xs: 132, md: 190 }, maxWidth: { xs: 150, md: 220 }, mr: { xs: .7, md: 1.5 } }}>
            <Select
              value={role}
              onChange={(event) => setRole(event.target.value as WorkspaceRole)}
              inputProps={{ 'aria-label': 'Bekijk werkruimte als rol' }}
              sx={{ height: 44, bgcolor: '#fff', fontSize: { xs: 11.5, md: 12.5 } }}
            >
              {workspaceRoles.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          </Tooltip>
          <Chip label="Prototype · peildatum 28 jul 2026" size="small" sx={{ display: { xs: 'none', sm: 'flex' }, bgcolor: '#eff5fb', color: '#41617f', fontSize: 11, border: '1px solid #dae6f0' }} />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={isMobile && mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }}>{drawerContent}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }} open>{drawerContent}</Drawer>
      </Box>

      <Box component="main" id="main-content" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 76 } }} />
        <Box sx={{ px: { xs: 2, sm: 3, xl: 4 }, py: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ maxWidth: 1420, mx: 'auto' }}>
            {!online && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Geen internetverbinding. Wijzigingen in deze demo worden alleen op dit apparaat bewaard en zijn niet gesynchroniseerd met een bronsysteem.
              </Alert>
            )}
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
