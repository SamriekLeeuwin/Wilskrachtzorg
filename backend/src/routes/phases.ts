import { Router } from 'express'
import { phaseService } from '../services/PhaseService'

const router = Router()

/**
 * GET /api/phases
 * Get all phases
 */
router.get('/', async (req, res) => {
  try {
    const phases = await phaseService.getAllPhases()
    res.json(phases)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch phases' })
  }
})

/**
 * GET /api/phases/:youthId/current
 * Get current phase for youth
 */
router.get('/:youthId/current', async (req, res) => {
  try {
    const { youthId } = req.params
    const currentPhase = await phaseService.getCurrentPhaseForYouth(youthId)
    res.json(currentPhase)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current phase' })
  }
})

/**
 * GET /api/phases/:youthId/history
 * Get phase history for youth
 */
router.get('/:youthId/history', async (req, res) => {
  try {
    const { youthId } = req.params
    const history = await phaseService.getPhaseHistoryForYouth(youthId)
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch phase history' })
  }
})

/**
 * POST /api/phases/:youthId/progress
 * Move youth to next phase
 */
router.post('/:youthId/progress', async (req, res) => {
  try {
    const { youthId } = req.params
    const { currentPhaseId, notes } = req.body

    const newPhase = await phaseService.progressToNextPhase(youthId, currentPhaseId, notes)
    res.json(newPhase)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

/**
 * POST /api/phases/:youthId/regress
 * Regress youth to previous phase
 */
router.post('/:youthId/regress', async (req, res) => {
  try {
    const { youthId } = req.params
    const { reason } = req.body

    const regressed = await phaseService.regressToPreviousPhase(youthId, reason)
    res.json(regressed)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/phases/analytics
 * Get phase analytics
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const analytics = await phaseService.getPhaseAnalytics()
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch phase analytics' })
  }
})

export default router
