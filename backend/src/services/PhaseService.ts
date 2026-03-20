import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PhaseService {
  /**
   * Get all phases ordered by progression
   */
  async getAllPhases() {
    return prisma.phase.findMany({
      orderBy: { order: 'asc' },
    })
  }

  /**
   * Get current phase for a youth
   */
  async getCurrentPhaseForYouth(youthId: string) {
    return prisma.youthPhaseProgress.findFirst({
      where: {
        youthId,
        status: 'ACTIVE',
        endDate: null,
      },
      include: {
        phase: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    })
  }

  /**
   * Get full phase history for a youth
   */
  async getPhaseHistoryForYouth(youthId: string) {
    return prisma.youthPhaseProgress.findMany({
      where: { youthId },
      include: {
        phase: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    })
  }

  /**
   * Transition youth to next phase
   */
  async progressToNextPhase(
    youthId: string,
    currentPhaseId: string,
    notes?: string
  ) {
    // Get current phase order
    const currentPhase = await prisma.phase.findUnique({
      where: { id: currentPhaseId },
    })

    if (!currentPhase) {
      throw new Error('Current phase not found')
    }

    // Find next phase
    const nextPhase = await prisma.phase.findFirst({
      where: { order: { gt: currentPhase.order } },
      orderBy: { order: 'asc' },
    })

    if (!nextPhase) {
      throw new Error('No next phase available')
    }

    // End current phase progress
    await prisma.youthPhaseProgress.updateMany({
      where: {
        youthId,
        phaseId: currentPhaseId,
        status: 'ACTIVE',
      },
      data: {
        endDate: new Date(),
        status: 'COMPLETED',
      },
    })

    // Start new phase progress
    const newProgress = await prisma.youthPhaseProgress.create({
      data: {
        youthId,
        phaseId: nextPhase.id,
        startDate: new Date(),
        status: 'ACTIVE',
        notes,
      },
      include: {
        phase: true,
      },
    })

    return newProgress
  }

  /**
   * Regress youth to previous phase
   */
  async regressToPreviousPhase(youthId: string, reason: string) {
    // Get current phase
    const current = await this.getCurrentPhaseForYouth(youthId)
    if (!current) {
      throw new Error('No active phase found')
    }

    // Find previous phase
    const previousPhase = await prisma.phase.findFirst({
      where: { order: { lt: current.phase.order } },
      orderBy: { order: 'desc' },
    })

    if (!previousPhase) {
      throw new Error('No previous phase to regress to')
    }

    // End current phase as regressed
    await prisma.youthPhaseProgress.updateMany({
      where: {
        youthId,
        phaseId: current.phaseId,
        status: 'ACTIVE',
      },
      data: {
        endDate: new Date(),
        status: 'REGRESSED',
        notes: `Regressed: ${reason}`,
      },
    })

    // Start previous phase again
    const regressionProgress = await prisma.youthPhaseProgress.create({
      data: {
        youthId,
        phaseId: previousPhase.id,
        startDate: new Date(),
        status: 'ACTIVE',
        notes: `Returned to Phase ${previousPhase.order}: ${reason}`,
      },
      include: {
        phase: true,
      },
    })

    return regressionProgress
  }

  /**
   * Get phase analytics
   */
  async getPhaseAnalytics() {
    const phases = await prisma.phase.findMany({
      orderBy: { order: 'asc' },
    })

    const analytics = await Promise.all(
      phases.map(async (phase) => {
        const activeCount = await prisma.youthPhaseProgress.count({
          where: {
            phaseId: phase.id,
            status: 'ACTIVE',
          },
        })

        const completedCount = await prisma.youthPhaseProgress.count({
          where: {
            phaseId: phase.id,
            status: 'COMPLETED',
          },
        })

        const progressRecords = await prisma.youthPhaseProgress.findMany({
          where: { phaseId: phase.id, status: 'COMPLETED', endDate: { not: null } },
        })

        const durations = progressRecords
          .map((record) => {
            if (!record.endDate) return null
            return (
              (record.endDate.getTime() - record.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
            )
          })
          .filter((d) => d !== null) as number[]

        const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

        const incidentCount = await prisma.behaviorIncident.count({
          where: { phaseId: phase.id },
        })

        return {
          phaseId: phase.id,
          phaseName: phase.name,
          order: phase.order,
          activeYouth: activeCount,
          completedYouth: completedCount,
          averageDurationDays: avgDuration,
          incidentCount,
          successRate: completedCount > 0 ? Math.round((completedCount / (activeCount + completedCount)) * 100) : 0,
        }
      })
    )

    return analytics
  }
}

export const phaseService = new PhaseService()
