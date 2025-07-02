import { useEffect, useState } from 'react'
import { Container, TextField, Button, Stack } from '@mui/material'

export default function VendorProfileEdit() {
  const [form, setForm] = useState({ id: null, name: '', description: '' })

  useEffect(() => {
    fetch('/api/profile/', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setForm({ id: data.id, name: data.name, description: data.description }))
      .catch(() => {})
  }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    fetch('/api/vendors/' + form.id + '/', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).catch(() => {})
  }

  return (
    <Container sx={{ mt: 4 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} maxWidth={400}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
          <TextField label="Description" name="description" multiline value={form.description || ''} onChange={handleChange} />
          <Button variant="contained" type="submit">Save</Button>
        </Stack>
      </form>
    </Container>
  )
}