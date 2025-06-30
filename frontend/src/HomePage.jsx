import { useEffect, useState } from 'react'
import { Container, Typography, Box } from '@mui/material'
import ServiceCard from './ServiceCard.jsx'
import SearchForm from './SearchForm.jsx'

function HomePage() {
  const [popular, setPopular] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/vendors/api/services/popular/')
      .then(res => res.json())
      .then(setPopular)
      .catch(() => {})

    fetch('/vendors/api/categories-with-services/')
      .then(res => res.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  return (
    <Container sx={{ mt: 4 }}>
      <Box className="bg-light p-4 rounded shadow-sm mt-4">
        <Typography variant="h5" mb={2}>Welcome to Attica</Typography>
        <SearchForm />
      </Box>

      <Box mt={5}>
        <Typography variant="h6" mb={2}>Popular Service Providers</Typography>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2 }}>
          {popular.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </Box>
      </Box>

      <Box mt={5}>
        {categories.map(cat => (
          <Box key={cat.id} mb={5}>
            <Typography variant="h6" mb={2}>{cat.name}</Typography>
            <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2 }}>
              {cat.services.map(service => (
               <ServiceCard key={service.id} service={service} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  )
}

export default HomePage