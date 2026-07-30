import { Box, Skeleton, Stack } from '@mui/material'

function LoadingState() {
  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack spacing={0.5}>
          <Skeleton variant="text" width={140} height={32} />
          <Skeleton variant="text" width={220} height={18} />
        </Stack>
        <Skeleton variant="rounded" width={180} height={36} />
      </Box>

      {/* KPI Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={80} />
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="text" width={100} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Risk Signals */}
      <Box>
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={320} height={16} sx={{ mb: 1.5 }} />
        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <Skeleton variant="rounded" height={40} sx={{ borderRadius: 0 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 0, mt: 0.5 }} />
          ))}
        </Box>
      </Box>

      {/* Phase + Outflow */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <Box sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Skeleton variant="text" width={140} height={22} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={36} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={16} />
        </Box>
        <Box sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Skeleton variant="text" width={140} height={22} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={180} />
        </Box>
      </Box>
    </Stack>
  )
}

export default LoadingState
