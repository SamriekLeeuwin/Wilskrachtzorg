import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type WorkspaceRole = 'Begeleider' | 'Gedragswetenschapper' | 'Zorgmanager' | 'Directie'

const ROLE_KEY = 'wkz-demo-workspace-role-v1'

const RoleContext = createContext<{
  role: WorkspaceRole
  setRole: (role: WorkspaceRole) => void
} | null>(null)

export const workspaceRoles: WorkspaceRole[] = ['Begeleider', 'Gedragswetenschapper', 'Zorgmanager', 'Directie']

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<WorkspaceRole>(() => {
    const stored = window.localStorage.getItem(ROLE_KEY)
    return workspaceRoles.includes(stored as WorkspaceRole) ? stored as WorkspaceRole : 'Zorgmanager'
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
