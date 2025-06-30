import { Card, CardMedia, CardContent, Typography, Box, IconButton } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import {useState} from "react";

function ServiceCard({ service }) {
    const [liked, setLiked] = useState(service.liked)
    const [count, setCount] = useState(service.likes)

  const toggleLike = () => {
    fetch(`/vendors/api/services/${service.id}/like/`, {
      method: liked ? 'DELETE' : 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setLiked(data.liked)
        setCount(data.likes)
      })
      .catch(() => {})
  }

  return (
    <Card sx={{ minWidth: 220, position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CardMedia
          component="img"
          image={service.vendor.profile_image || '/static/default_profile.jpg'}
          alt={service.vendor.name}
          sx={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
          onClick={() => window.location.href = `/vendor/${service.vendor.id}`}
        />
         <Typography variant="subtitle2" onClick={() => window.location.href = `/vendor/${service.vendor.id}`} style={{cursor: 'pointer'}}>{service.vendor.name}</Typography>
      </Box>
      <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={toggleLike}>
        {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        <Typography variant="caption" ml={0.5}>{count}</Typography>
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
