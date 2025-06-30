import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Typography, Box, CardMedia } from '@mui/material'

function VendorProfile() {
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)

  useEffect(() => {
    fetch(`/vendors/api/vendors/${id}/`)
      .then(res => res.json())
      .then(setVendor)
      .catch(() => {})
  }, [id])

  if (!vendor) return null

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CardMedia
          component="img"
          image={vendor.profile_image || '/static/default_profile.jpg'}
          alt={vendor.name}
          sx={{ width: 80, height: 80, borderRadius: '50%' }}
        />
        <Typography variant="h5">{vendor.name}</Typography>
      </Box>
      <Typography variant="body1" mt={2}>{vendor.description}</Typography>
    </Container>
  )
}

export default VendorProfile