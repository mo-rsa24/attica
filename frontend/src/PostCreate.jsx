import { useState } from 'react'
import { Container, TextField, Button, Stack } from '@mui/material'
import {useAuth} from "./AuthProvider.jsx";

export default function PostCreate() {
  const { tokens } = useAuth()
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    if (image) formData.append('image', image)
    formData.append('caption', caption)
    fetch('/api/vendors/posts/', {
      method: 'POST',
      headers: tokens ? { Authorization: `Bearer ${tokens.access}` } : {},
      body: formData
    }).catch(() => {})
  }

  return (
    <Container sx={{ mt: 4 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} maxWidth={400}>
          <TextField label="Caption" value={caption} onChange={e => setCaption(e.target.value)} />
          <input type="file" onChange={e => setImage(e.target.files[0])} />
          <Button variant="contained" type="submit">Create</Button>
        </Stack>
      </form>
    </Container>
  )
}
