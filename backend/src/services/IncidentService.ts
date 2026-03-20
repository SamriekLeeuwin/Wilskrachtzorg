import { PrismaClient, ActionType, Severity } from '@prisma/client'
import type { IncidentCategory, PbsStep } from '@prisma/client'

const prisma = new PrismaClient()

export class IncidentService {
  /**
   * Record a behavior incident
   */
  async recordIncident(data: {
    youthId: string
    phaseId: string
    category: IncidentCategory
    severity: Severity
    actionTaken: ActionType
    pbsStep: PbsStep
    reportedBy: string
    description?: string
  }) {
    const incident = await prisma.behaviorIncident.create({
      data,
      include: {
        youth: true,
        phase: true,
      },
    })

    // Check for automatic alerts
    await this.checkAndCreateAlerts(data.youthId, incident)

    return incident
  }

  /**
   * Get incidents for a youth
   */
  async getIncidentsForYouth(youthId: string) {
    return prisma.behaviorIncident.findMany({
      where: { youthId },
      include: {
        phase: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get incidents for a phase
   */
  async getIncidentsForPhase(phaseId: string) {
    return prisma.behaviorIncident.findMany({
      where: { phaseId },
      include: {
        youth: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Get incident analytics
   */
  async getIncidentAnalytics() {
    const allIncidents = await prisma.behaviorIncident.findMany({
      include: {
        phase: true,
      },
    })

    // By category
    const byCategory = {} as Record<string, number>
    allIncidents.forEach((inc) => {
      byCategory[inc.category] = (byCategory[inc.category] || 0) + 1
    })

    // By severity
    const bySeverity = {} as Record<string, number>
    allIncidents.forEach((inc) => {
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1
    })

    // By action
    const byAction = {} as Record<string, number>
    allIncidents.forEach((inc) => {
      byAction[inc.actionTaken] = (byAction[inc.actionTaken] || 0) + 1
    })

    // By phase
    const byPhase = {} as Record<string, number>
    allIncidents.forEach((inc) => {
      const phaseKey = inc.phase.name
      byPhase[phaseKey] = (byPhase[phaseKey] || 0) + 1
    })

    return {
      totalIncidents: allIncidents.length,
      byCategory,
      bySeverity,
      byAction,
      byPhase,
    }
  }

  /**
   * Business logic: Check for policy-triggered alerts
   *
   * Rule 1: 3 NOTE incidents within 3 weeks → UVO Required
   * Rule 2: 2 TIMEOUT actions → Official Warning Review
   * Rule 3: HIGH severity → Manager notification
   */
  private async checkAndCreateAlerts(youthId: string, incident: any) {
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

    // Rule 1: Check for 3 NOTEs in 3 weeks
    const recentNotes = await prisma.behaviorIncident.count({
      where: {
        youthId,
        actionTaken: 'NOTE',
        createdAt: { gte: threeWeeksAgo },
      },
    })

    if (recentNotes >= 3) {
      await prisma.alert.create({
        data: {
          youthId,
          type: 'UVO_REQUIRED',
          message: `UVO vereist: ${recentNotes} notities in de afgelopen 3 weken`,
          triggerReason: `${recentNotes} NOTE incidents in 21 dagen`,
        },
      })
    }

    // Rule 2: Check for 2 TIMEOUTs
    const recentTimeouts = await prisma.behaviorIncident.count({
      where: {
        youthId,
        actionTaken: 'TIMEOUT',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
    })

    if (recentTimeouts >= 2) {
      await prisma.alert.create({
        data: {
          youthId,
          type: 'OFFICIAL_WARNING_REVIEW',
          message: `Overweeg officiële waarschuwing: ${recentTimeouts} timeouts in de afgelopen 30 dagen`,
          triggerReason: `${recentTimeouts} TIMEOUT actions`,
        },
      })
    }

    // Rule 3: HIGH severity
    if (incident.severity === 'HIGH') {
      await prisma.alert.create({
        data: {
          youthId,
          type: 'HIGH_SEVERITY_INCIDENT',
          message: `Ernstig incident geregistreerd: ${incident.category}`,
          triggerReason: `HIGH severity incident in ${incident.category}`,
        },
      })
    }
  }

  /**
   * Get active alerts for a youth
   */
  async getAlertsForYouth(youthId: string) {
    return prisma.alert.findMany({
      where: {
        youthId,
        acknowledged: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
    })
  }

  /**
   * Get incident heat map (phase vs category)
   */
  async getIncidentHeatmap() {
    const incidents = await prisma.behaviorIncident.findMany({
      include: {
        phase: true,
      },
    })

    const heatmap = {} as Record<string, Record<string, number>>

    incidents.forEach((inc) => {
      const phaseName = inc.phase.name
      const category = inc.category

      if (!heatmap[phaseName]) {
        heatmap[phaseName] = {}
      }
      heatmap[phaseName][category] = (heatmap[phaseName][category] || 0) + 1
    })

    return heatmap
  }

  /**
   * Get trend data for incidents
   */
  async getIncidentTrend(days: number = 90) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const incidents = await prisma.behaviorIncident.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        phase: true,
      },
    })

    // Group by date
    const trend = {} as Record<string, number>
    incidents.forEach((inc) => {
      const dateKey = inc.createdAt.toISOString().split('T')[0]
      trend[dateKey] = (trend[dateKey] || 0) + 1
    })

    // Convert to array and sort
    const trendArray = Object.entries(trend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return trendArray
  }
}

export const incidentService = new IncidentService()
