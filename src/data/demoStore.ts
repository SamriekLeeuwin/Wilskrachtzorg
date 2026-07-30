import { trajectories, placementConversations, type PlacementConversation, type Trajectory } from './careInsights'

const TRAJECTORIES_KEY = 'wkz-demo-trajectories-v1'
const CONVERSATIONS_KEY = 'wkz-demo-placement-conversations-v1'
const WORK_QUEUE_KEY = 'wkz-demo-work-queue-v1'
const REPORTS_KEY = 'wkz-demo-reports-v1'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function loadTrajectories(): Trajectory[] {
  if (!canUseStorage()) return trajectories
  const stored = window.localStorage.getItem(TRAJECTORIES_KEY)
  if (!stored) return trajectories
  try {
    return JSON.parse(stored) as Trajectory[]
  } catch {
    return trajectories
  }
}

export function saveTrajectories(rows: Trajectory[]) {
  if (canUseStorage()) window.localStorage.setItem(TRAJECTORIES_KEY, JSON.stringify(rows))
}

export function loadPlacementConversations(): PlacementConversation[] {
  if (!canUseStorage()) return placementConversations
  const stored = window.localStorage.getItem(CONVERSATIONS_KEY)
  if (!stored) return placementConversations
  try {
    return JSON.parse(stored) as PlacementConversation[]
  } catch {
    return placementConversations
  }
}

export function savePlacementConversations(rows: PlacementConversation[]) {
  if (canUseStorage()) window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(rows))
}

export function loadAppointments<T>(clientCode: string, fallback: T[]): T[] {
  if (!canUseStorage()) return fallback
  const stored = window.localStorage.getItem(`wkz-demo-appointments-${clientCode}`)
  if (!stored) return fallback
  try {
    return JSON.parse(stored) as T[]
  } catch {
    return fallback
  }
}

export function saveAppointments<T>(clientCode: string, rows: T[]) {
  if (canUseStorage()) window.localStorage.setItem(`wkz-demo-appointments-${clientCode}`, JSON.stringify(rows))
}

export function loadWorkQueue<T>(fallback: T[]): T[] {
  if (!canUseStorage()) return fallback
  const stored = window.localStorage.getItem(WORK_QUEUE_KEY)
  if (!stored) return fallback
  try {
    return JSON.parse(stored) as T[]
  } catch {
    return fallback
  }
}

export function saveWorkQueue<T>(rows: T[]) {
  if (canUseStorage()) window.localStorage.setItem(WORK_QUEUE_KEY, JSON.stringify(rows))
}

export function loadReports<T>(fallback: T[]): T[] {
  if (!canUseStorage()) return fallback
  const stored = window.localStorage.getItem(REPORTS_KEY)
  if (!stored) return fallback
  try {
    return JSON.parse(stored) as T[]
  } catch {
    return fallback
  }
}

export function saveReports<T>(rows: T[]) {
  if (canUseStorage()) window.localStorage.setItem(REPORTS_KEY, JSON.stringify(rows))
}
