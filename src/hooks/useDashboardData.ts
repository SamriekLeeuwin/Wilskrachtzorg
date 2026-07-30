import { useEffect, useState } from 'react'
import { getDashboardData } from '../services/dashboardData'
import type { DashboardData, DashboardPeriod } from '../types/dashboard'

type UseDashboardDataState = {
  data: DashboardData | null
  isLoading: boolean
}

export function useDashboardData(period: DashboardPeriod): UseDashboardDataState {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    setIsLoading(true)

    getDashboardData(period)
      .then((result) => {
        if (!active) {
          return
        }
        setData(result)
      })
      .finally(() => {
        if (!active) {
          return
        }
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [period])

  return { data, isLoading }
}