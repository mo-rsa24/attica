import { useEffect, useState } from 'react'
import { Container, TextField, Button, Stack } from '@mui/material'
import { useAuth } from './AuthContext';

export default function VendorProfileEdit() {
  const { tokens } = useAuth()
  const [form, setForm] = useState({ id: null, name: '', description: '' })

  useEffect(() => {
    fetch('/api/vendors/profile/', {
      headers: tokens ? { Authorization: `Bearer ${tokens.access}` } : {},
    })
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
      headers: {
        'Content-Type': 'application/json',
        ...(tokens ? { Authorization: `Bearer ${tokens.access}` } : {}),
      },
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