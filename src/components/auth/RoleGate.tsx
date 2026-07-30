import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useWorkspaceRole, type WorkspaceRole } from '../../context/RoleContext'

export default function RoleGate({ roles, children }: { roles: WorkspaceRole[]; children: ReactNode }) {
  const { role } = useWorkspaceRole()
  return roles.includes(role) ? children : <Navigate to="/" replace />
}
