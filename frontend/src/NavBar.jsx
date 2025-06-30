import { useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Button, Avatar, IconButton, Menu, MenuItem } from '@mui/material'
import SearchForm from './SearchForm.jsx'


function NavBar() {

  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
   <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 2 }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="a" href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Attica
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <SearchForm />
        </Box>
        <Button href="/vendors/profile/update/" color="primary" sx={{ mr: 2 }}>
          Become a Vendor
        </Button>
        <IconButton onClick={handleOpen} size="small">
          <Avatar src="/static/default_profile.jpg" sx={{ width: 40, height: 40 }} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleClose}>Notifications</MenuItem>
          <MenuItem onClick={handleClose}>Messages</MenuItem>
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar