import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type WorkspaceRole =
  | 'Woonbegeleider'
  | 'Ambulant begeleider'
  | 'Gedragswetenschapper'
  | 'Locatieleider'
  | 'Management'
  | 'Administratie'
  | 'Directie'
  | 'Begeleider'
  | 'Zorgmanager'

const ROLE_KEY = 'wkz-demo-workspace-role-v1'

const RoleContext = createContext<{
  role: WorkspaceRole
  setRole: (role: WorkspaceRole) => void
} | null>(null)

export const workspaceRoles: WorkspaceRole[] = ['Woonbegeleider', 'Ambulant begeleider', 'Gedragswetenschapper', 'Locatieleider', 'Management', 'Administratie', 'Directie']

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<WorkspaceRole>(() => {
    const stored = window.localStorage.getItem(ROLE_KEY)
    if (stored === 'Begeleider') return 'Woonbegeleider'
    if (stored === 'Zorgmanager') return 'Locatieleider'
    return workspaceRoles.includes(stored as WorkspaceRole) ? stored as WorkspaceRole : 'Locatieleider'
  })

  const value = useMemo(() => ({
    role,
    setRole: (nextRole: WorkspaceRole) => {
      setRoleState(nextRole)
      window.localStorage.setItem(ROLE_KEY, nextRole)
    },
  }), [role])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useWorkspaceRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useWorkspaceRole must be used inside RoleProvider')
  return context
}
