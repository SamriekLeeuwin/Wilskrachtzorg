import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Building2,
  LayoutDashboard,
  Route,
  Settings,
  UserCog,
  Users,
  UserSquare2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type MenuItem = {
  label: string
  to: string
  section?: string
  icon: LucideIcon
}

const menuItems: MenuItem[] = [
  { section: 'Hoofdmenu', label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Jongeren', to: '/jongeren', icon: Users },
  { label: 'Uitstroom', to: '/uitstroom-registratie', icon: Route },
  { label: 'Rapportages', to: '/rapportages', icon: BarChart3 },
  { label: 'Fases & Ontwikkeling', to: '/fase-overzicht', icon: Activity },
  { label: 'Begeleiders', to: '/begeleiders', icon: UserSquare2 },
  { section: 'Aanvullend', label: 'KPI Overzicht', to: '/kpi-overzicht', icon: BarChart3 },
  { label: 'Jongere Timeline', to: '/jongere-timeline', icon: Route },
  { label: 'Gedrag Analyse', to: '/gedrag-analyse', icon: Activity },
  { label: 'Locaties', to: '/locaties', icon: Building2 },
  { section: 'Instellingen', label: 'Gebruikersbeheer', to: '/gebruikersbeheer', icon: UserCog },
  { label: 'Systeeminstellingen', to: '/systeeminstellingen', icon: Settings },
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
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Building2 aria-hidden="true" />
          <span>Wilskrachtzorg</span>
        </div>

        <nav>
          {menuItems.map((item) => (
            <div key={item.label} className={item.section ? 'sidebar-group' : undefined}>
              {item.section && <p className="sidebar-group-label">{item.section}</p>}
              <NavLink
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <item.icon aria-hidden="true" />
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <h1 className="dashboard-title">{title}</h1>
            <div className="dashboard-user">Manager · Ingelogd</div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout