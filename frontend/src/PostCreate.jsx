import { useState } from 'react'
import { Container, TextField, Button, Stack } from '@mui/material'

export default function PostCreate() {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    if (image) formData.append('image', image)
    formData.append('caption', caption)
    fetch('/api/vendor-posts/', {
      method: 'POST',
      credentials: 'include',
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
