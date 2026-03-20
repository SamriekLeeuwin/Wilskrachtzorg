import { Router } from 'express'
import { incidentService } from '../services/IncidentService'
import type { IncidentCategory, PbsStep } from '@prisma/client'

const router = Router()

/**
 * POST /api/incidents
 * Record a behavior incident
 */
router.post('/', async (req, res) => {
  try {
    const {
      youthId,
      phaseId,
      category,
      severity,
      actionTaken,
      pbsStep,
      reportedBy,
      description,
    } = req.body

    const incident = await incidentService.recordIncident({
      youthId,
      phaseId,
      category: category as IncidentCategory,
      severity,
      actionTaken,
      pbsStep: pbsStep as PbsStep,
      reportedBy,
      description,
    })

    res.status(201).json(incident)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

/**
 * GET /api/incidents/youth/:youthId
 * Get incidents for a youth
 */
router.get('/youth/:youthId', async (req, res) => {
  try {
    const { youthId } = req.params
    const incidents = await incidentService.getIncidentsForYouth(youthId)
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' })
  }
})

/**
 * GET /api/incidents/phase/:phaseId
 * Get incidents for a phase
 */
router.get('/phase/:phaseId', async (req, res) => {
  try {
    const { phaseId } = req.params
    const incidents = await incidentService.getIncidentsForPhase(phaseId)
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' })
  }
})

/**
 * GET /api/incidents/analytics
 * Get incident analytics
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const analytics = await incidentService.getIncidentAnalytics()
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident analytics' })
  }
})

/**
 * GET /api/incidents/heatmap
 * Get incident heatmap (phase vs category)
 */
router.get('/analytics/heatmap', async (req, res) => {
  try {
    const heatmap = await incidentService.getIncidentHeatmap()
    res.json(heatmap)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap' })
  }
})

/**
 * GET /api/incidents/trend
 * Get incident trend
 */
router.get('/analytics/trend', async (req, res) => {
  try {
    const { days = 90 } = req.query
    const trend = await incidentService.getIncidentTrend(Number(days))
    res.json(trend)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trend' })
  }
})

/**
 * GET /api/incidents/alerts/youth/:youthId
 * Get active alerts for a youth
 */
router.get('/alerts/youth/:youthId', async (req, res) => {
  try {
    const { youthId } = req.params
    const alerts = await incidentService.getAlertsForYouth(youthId)
    res.json(alerts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

/**
 * POST /api/incidents/alerts/:alertId/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params
    const { acknowledgedBy } = req.body

    const alert = await incidentService.acknowledgeAlert(alertId, acknowledgedBy)
    res.json(alert)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

export default router
