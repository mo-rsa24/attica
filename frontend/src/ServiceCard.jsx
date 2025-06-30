import { Card, CardMedia, CardContent, Typography, Box, IconButton } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

function ServiceCard({ service }) {
  return (
    <Card sx={{ minWidth: 220, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CardMedia
          component="img"
          image={service.profile_image || '/static/default_profile.jpg'}
          alt={service.vendor_name}
          sx={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        <Typography variant="subtitle2">{service.vendor_name}</Typography>
      </Box>
      <IconButton sx={{ position: 'absolute', top: 8, right: 8 }}>
        <FavoriteBorderIcon />
      </IconButton>
      <CardMedia
        component="img"
        height="150"
        image={service.image}
        alt={service.name}
        sx={{ mt: 5, objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {service.category_name} - {service.location_tags}
        </Typography>
        <Typography variant="body2" mt={1}>
          ⭐ {service.rating}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ServiceCard
