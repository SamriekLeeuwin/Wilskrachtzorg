import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.alert.deleteMany()
  await prisma.behaviorIncident.deleteMany()
  await prisma.youthPhaseProgress.deleteMany()
  await prisma.outflow.deleteMany()
  await prisma.youth.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.auditLog.deleteMany()

  // Create phases
  const phases = await Promise.all([
    prisma.phase.create({
      data: {
        name: 'Stabilisatie',
        description: 'Fase 1: Stabilisatie en veiligheid',
        order: 1,
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Verantwoordelijkheid',
        description: 'Fase 2: Opbouwen verantwoordelijkheid',
        order: 2,
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Onafhankelijkheid',
        description: 'Fase 3: Ontwikkeling onafhankelijkheid',
        order: 3,
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Voorbereiding uitstroom',
        description: 'Fase 4: Voorbereiding op uitstroom',
        order: 4,
      },
    }),
  ])

  console.log(`✅ Created ${phases.length} phases`)

  // Create youth with mock data
  const youthNames = [
    'Client-001',
    'Client-002',
    'Client-003',
    'Client-004',
    'Client-005',
    'Client-006',
    'Client-007',
    'Client-008',
    'Client-009',
    'Client-010',
    'Client-011',
    'Client-012',
    'Client-013',
    'Client-014',
    'Client-015',
    'Client-016',
    'Client-017',
    'Client-018',
    'Client-019',
    'Client-020',
  ]

  const youth = await Promise.all(
    youthNames.map((name) =>
      prisma.youth.create({
        data: {
          firstName: name.split('-')[0],
          lastName: `Youth-${name.split('-')[1]}`,
          birthDate: new Date('2005-06-15'),
          startDate: new Date('2023-01-01'),
          supervisorId: 'mock-supervisor',
          locationId: 'mock-location',
        },
      })
    )
  )

  console.log(`✅ Created ${youth.length} youth`)

  // Create phase progressions
  for (let i = 0; i < youth.length; i++) {
    const y = youth[i]
    const numPhases = Math.floor(Math.random() * 3) + 1 // 1-3 phases per youth

    for (let p = 0; p < numPhases; p++) {
      const phase = phases[p]
      const daysSinceStart = Math.floor(Math.random() * 600) + p * 150
      const startDate = new Date('2023-01-01')
      startDate.setDate(startDate.getDate() + daysSinceStart)

      const endDate = p < numPhases - 1 ? new Date(startDate) : null
      if (endDate) {
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 180) + 60)
      }

      await prisma.youthPhaseProgress.create({
        data: {
          youthId: y.id,
          phaseId: phase.id,
          startDate,
          endDate,
          status: endDate ? 'COMPLETED' : 'ACTIVE',
          notes: `Started phase ${phase.order}`,
        },
      })
    }
  }

  console.log('✅ Created phase progressions')

  // Create behavior incidents
  const categories = [
    'ORDER_DISTURBANCE',
    'AVOIDANCE',
    'HYGIENE',
    'AGGRESSION',
    'SUBSTANCE_USE',
    'BORDER_CROSSING',
  ] as const
  const severities = ['LOW', 'MEDIUM', 'HIGH'] as const
  const actions = ['NOTE', 'TIMEOUT', 'OFFICIAL_WARNING'] as const
  const pbsSteps = ['STEP1', 'STEP2', 'STEP3', 'STEP4'] as const

  let incidentCount = 0

  // Create 10+ NOTE incidents
  for (let i = 0; i < 12; i++) {
    const randomYouth = youth[Math.floor(Math.random() * youth.length)]
    const randomPhase = phases[Math.floor(Math.random() * phases.length)]
    const daysAgo = Math.floor(Math.random() * 90)

    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - daysAgo)

    await prisma.behaviorIncident.create({
      data: {
        youthId: randomYouth.id,
        phaseId: randomPhase.id,
        category: categories[Math.floor(Math.random() * categories.length)],
        severity: 'LOW',
        actionTaken: 'NOTE',
        pbsStep: pbsSteps[Math.floor(Math.random() * pbsSteps.length)],
        reportedBy: 'Begeleider',
        description: 'Aantekening geplaatst',
        createdAt: createdDate,
      },
    })
    incidentCount++
  }

  // Create 4+ TIMEOUT incidents
  for (let i = 0; i < 5; i++) {
    const randomYouth = youth[Math.floor(Math.random() * youth.length)]
    const randomPhase = phases[Math.floor(Math.random() * phases.length)]
    const daysAgo = Math.floor(Math.random() * 60)

    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - daysAgo)

    await prisma.behaviorIncident.create({
      data: {
        youthId: randomYouth.id,
        phaseId: randomPhase.id,
        category: categories[Math.floor(Math.random() * categories.length)],
        severity: 'MEDIUM',
        actionTaken: 'TIMEOUT',
        pbsStep: pbsSteps[Math.floor(Math.random() * pbsSteps.length)],
        reportedBy: 'Begeleider',
        description: 'Time-out gegeven',
        createdAt: createdDate,
      },
    })
    incidentCount++
  }

  // Create 2+ OFFICIAL_WARNING incidents
  for (let i = 0; i < 3; i++) {
    const randomYouth = youth[Math.floor(Math.random() * youth.length)]
    const randomPhase = phases[Math.floor(Math.random() * phases.length)]
    const daysAgo = Math.floor(Math.random() * 30)

    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - daysAgo)

    await prisma.behaviorIncident.create({
      data: {
        youthId: randomYouth.id,
        phaseId: randomPhase.id,
        category: categories[Math.floor(Math.random() * categories.length)],
        severity: 'HIGH',
        actionTaken: 'OFFICIAL_WARNING',
        pbsStep: pbsSteps[Math.floor(Math.random() * pbsSteps.length)],
        reportedBy: 'Manager',
        description: 'Officiële waarschuwing gegeven',
        createdAt: createdDate,
      },
    })
    incidentCount++
  }

  console.log(`✅ Created ${incidentCount} behavior incidents`)

  // Create some outflows for demonstration
  const outflowYouth = youth.slice(0, 3)
  for (const y of outflowYouth) {
    await prisma.outflow.create({
      data: {
        youthId: y.id,
        outflowDate: new Date('2025-01-15'),
        reason: 'Doelen behaald',
        referred: false,
        housingStatus: 'STUDIO',
        workStatus: true,
        schoolStatus: false,
        successful: true,
      },
    })
  }

  console.log('✅ Created sample outflows')

  console.log('🎉 Database seeding complete!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
