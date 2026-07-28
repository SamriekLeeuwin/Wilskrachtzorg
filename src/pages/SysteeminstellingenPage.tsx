import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import SectionCard from '../components/ui/SectionCard'

function SysteeminstellingenPage() {
  const settings = [
    { label: 'E-mailmeldingen voor escalaties', defaultChecked: true, description: 'Ontvang een e-mail wanneer een jongere een UVO of officiële waarschuwing krijgt.' },
    { label: 'Wekelijkse managementrapportage', defaultChecked: true, description: 'Automatische rapportage elke maandagochtend met kerngetallen.' },
    { label: 'Strikte invoervalidatie op vrije tekstvelden', defaultChecked: false, description: 'Verplicht minimumlengte en controle op verboden termen.' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionCard title="Systeeminstellingen" subtitle="Algemene voorkeuren voor meldingen, rapportages en validatie">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {settings.map((s) => (
            <Box key={s.label} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={<Switch defaultChecked={s.defaultChecked} />}
                label={<Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{s.label}</Typography>}
              />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25, ml: 4.5 }}>
                {s.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Box>
  )
}

export default SysteeminstellingenPage
