import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar, Avatar, Box, Chip, CssBaseline, Divider, Drawer, IconButton, List,
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
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import RuleRoundedIcon from '@mui/icons-material/RuleRounded'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import type { ReactNode } from 'react'

type MenuItem = { label: string; to: string; icon: ReactNode; badge?: number }
const drawerWidth = 248

const primaryItems: MenuItem[] = [
  { label: 'Overzicht', to: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Werkvoorraad', to: '/acties', icon: <AssignmentTurnedInRoundedIcon />, badge: 5 },
  { label: 'Jongeren', to: '/jongeren', icon: <PeopleAltRoundedIcon /> },
  { label: 'Managementrapportage', to: '/rapportages', icon: <RouteRoundedIcon /> },
  { label: 'Locaties & capaciteit', to: '/locaties', icon: <ApartmentRoundedIcon /> },
  { label: 'Uitstroom & vervolgplek', to: '/uitstroom-registratie', icon: <HomeWorkRoundedIcon />, badge: 3 },
  { label: 'Gedrag & opvolging', to: '/gedrag-analyse', icon: <FactCheckRoundedIcon />, badge: 2 },
  { label: 'Databetrouwbaarheid', to: '/kpi-overzicht', icon: <RuleRoundedIcon /> },
]

const pageMeta: Record<string, { title: string; eyebrow: string }> = {
  '/': { title: 'Goedemorgen, Sam', eyebrow: 'OVERZICHT' },
  '/acties': { title: 'Werkvoorraad', eyebrow: 'ACTIES & BESLUITEN' },
  '/jongeren': { title: 'Jongeren', eyebrow: 'CLIËNTEN' },
  '/rapportages': { title: 'Managementrapportage', eyebrow: 'STUREN & VERANTWOORDEN' },
  '/uitstroom-registratie': { title: 'Uitstroom & vervolgplek', eyebrow: 'DOORSTROOM' },
  '/gedrag-analyse': { title: 'Gedrag & opvolging', eyebrow: 'VEILIGHEID' },
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
  const meta = location.pathname.startsWith('/jongeren/')
    ? { title: 'Jongeredossier', eyebrow: 'CLIËNTEN' }
    : pageMeta[location.pathname] ?? pageMeta['/']
  const [mobileOpen, setMobileOpen] = useState(false)

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
          {primaryItems.map((item) => {
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

      <Box sx={{ mt: 'auto', p: 1.25 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,.1)', mb: 1.25 }} />
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ p: 1.5, mt: 1, borderRadius: 2, bgcolor: 'rgba(0,0,0,.12)' }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#d9eafe', color: '#0b315d', fontSize: 12, fontWeight: 800 }}>SR</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>Sam Riek</Typography>
            <Typography noWrap sx={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)' }}>Zorgmanager</Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,.5)' }} />
        </Stack>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} color="inherit" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'rgba(255,255,255,.96)', borderBottom: '1px solid #e7ebf0' }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 76 }, px: { xs: 2, md: 4 } }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }} aria-label="Open navigatie"><MenuRoundedIcon /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#8090a4', fontWeight: 800, fontSize: 9.5, letterSpacing: '.12em', lineHeight: 1.2 }}>{meta.eyebrow}</Typography>
            <Typography sx={{ color: '#12243a', fontWeight: 760, fontSize: { xs: 20, md: 23 }, letterSpacing: '-.025em', mt: .25 }}>{meta.title}</Typography>
          </Box>
          <Tooltip title="2 openstaande signalen">
            <IconButton component={NavLink} to="/acties" aria-label="Open werkvoorraad en meldingen" sx={{ border: '1px solid #e5eaf0', width: 38, height: 38, mr: 1.5 }}>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              <Box sx={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', bgcolor: '#dc6b48', border: '1px solid #fff' }} />
            </IconButton>
          </Tooltip>
          <Chip label="Data t/m 28 jul" size="small" sx={{ display: { xs: 'none', sm: 'flex' }, bgcolor: '#eff5fb', color: '#41617f', fontSize: 11, border: '1px solid #dae6f0' }} />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={isMobile && mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }}>{drawerContent}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }} open>{drawerContent}</Drawer>
      </Box>

      <Box component="main" id="main-content" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 76 } }} />
        <Box sx={{ px: { xs: 2, sm: 3, xl: 4 }, py: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ maxWidth: 1420, mx: 'auto' }}><Outlet /></Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
