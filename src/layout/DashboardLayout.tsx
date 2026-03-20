import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import StackedLineChartRoundedIcon from '@mui/icons-material/StackedLineChartRounded'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'
import type { ReactNode } from 'react'

type MenuItem = {
  label: string
  to: string
  section?: string
  icon: ReactNode
}

const drawerWidth = 280

const menuItems: MenuItem[] = [
  { section: 'Hoofdmenu', label: 'Dashboard', to: '/', icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: 'Jongeren', to: '/jongeren', icon: <PeopleRoundedIcon fontSize="small" /> },
  { label: 'Uitstroom', to: '/uitstroom-registratie', icon: <TimelineRoundedIcon fontSize="small" /> },
  { label: 'Rapportages', to: '/rapportages', icon: <AssessmentRoundedIcon fontSize="small" /> },
  { label: 'Fases & Ontwikkeling', to: '/fase-overzicht', icon: <StackedLineChartRoundedIcon fontSize="small" /> },
  { label: 'Begeleiders', to: '/begeleiders', icon: <PersonSearchRoundedIcon fontSize="small" /> },
  { section: 'Aanvullend', label: 'KPI Overzicht', to: '/kpi-overzicht', icon: <AssessmentRoundedIcon fontSize="small" /> },
  { label: 'Jongere Timeline', to: '/jongere-timeline', icon: <TimelineRoundedIcon fontSize="small" /> },
  { label: 'Gedrag Analyse', to: '/gedrag-analyse', icon: <StackedLineChartRoundedIcon fontSize="small" /> },
  { label: 'Locaties', to: '/locaties', icon: <PlaceRoundedIcon fontSize="small" /> },
  { section: 'Instellingen', label: 'Gebruikersbeheer', to: '/gebruikersbeheer', icon: <ManageAccountsRoundedIcon fontSize="small" /> },
  { label: 'Systeeminstellingen', to: '/systeeminstellingen', icon: <SettingsRoundedIcon fontSize="small" /> },
]

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/jongeren': 'Jongeren',
  '/uitstroom-registratie': 'Uitstroom Registratie',
  '/rapportages': 'Rapportages',
  '/kpi-overzicht': 'KPI Overzicht',
  '/fase-overzicht': 'Fase Overzicht',
  '/jongere-timeline': 'Jongere Timeline',
  '/gedrag-analyse': 'Gedrag Analyse',
  '/demo/gedrag-analyse': 'Gedrag Analyse Demo',
  '/begeleiders': 'Begeleiders',
  '/locaties': 'Locaties',
  '/gebruikersbeheer': 'Gebruikersbeheer',
  '/systeeminstellingen': 'Systeeminstellingen',
}

function DashboardLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const groupedMenuItems = useMemo(() => {
    const groups: Array<{ section: string; items: MenuItem[] }> = []
    let currentSection = 'Overig'

    menuItems.forEach((item) => {
      if (item.section) {
        currentSection = item.section
      }
      const existingGroup = groups.find((group) => group.section === currentSection)
      if (existingGroup) {
        existingGroup.items.push(item)
      } else {
        groups.push({ section: currentSection, items: [item] })
      }
    })

    return groups
  }, [])

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#07346a', color: '#fff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2.25 }}>
        <BusinessRoundedIcon fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Wilskrachtzorg
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{ pt: 1, pb: 2 }}>
        {groupedMenuItems.map((group) => (
          <Box key={group.section}>
            <ListSubheader
              disableSticky
              sx={{
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.62)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1.8,
                py: 1,
              }}
            >
              {group.section}
            </ListSubheader>

            {group.items.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <ListItemButton
                  key={item.label}
                  component={NavLink}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.82)',
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                      minWidth: 34,
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, rgba(23,73,133,0.95), rgba(28,88,160,0.88))',
                    },
                    '&.Mui-selected:hover': {
                      background: 'linear-gradient(90deg, rgba(23,73,133,0.95), rgba(28,88,160,0.88))',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  />
                </ListItemButton>
              )
            })}
          </Box>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at top right, #eef4ff 0%, #f5f7fb 36%)' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 68, md: 80 }, px: { xs: 2, md: 4 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsMobileMenuOpen(true)}
            sx={{ mr: 1.5, display: { md: 'none' } }}
            aria-label="Open menu"
          >
            <MenuRoundedIcon />
          </IconButton>

          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1, fontSize: { xs: 22, md: 30 } }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manager · Ingelogd
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={isMobile && isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ minHeight: { xs: 68, md: 80 } }} />
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
          <Box sx={{ width: 'min(1360px, 100%)', mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout