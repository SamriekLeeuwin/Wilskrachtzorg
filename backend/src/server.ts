import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import phasesRouter from './routes/phases'
import incidentsRouter from './routes/incidents'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/phases', phasesRouter)
app.use('/api/incidents', incidentsRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Wilskrachtzorg Backend running on port ${PORT}`)
  console.log(`📡 CORS origin: ${CORS_ORIGIN}`)
})
