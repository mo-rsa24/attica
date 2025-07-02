import { useEffect, useState } from 'react'
import { Container, Typography, Box, Card, CardMedia, CardContent } from '@mui/material'

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null)

  useEffect(() => {
    fetch('/api/vendors/profile/', { credentials: 'include' })
      .then(res => res.json())
      .then(setVendor)
      .catch(() => {})
  }, [])

  if (!vendor) return null

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>Welcome back, {vendor.name}</Typography>
      <Box display="grid" gridTemplateColumns="repeat(auto-fill,minmax(200px,1fr))" gap={2}>
        {vendor.posts.map(post => (
          <Card key={post.id}>
            <CardMedia component="img" height="140" image={post.image} alt="post" />
            <CardContent>
              <Typography variant="body2">{post.caption}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  )
}