import { TextField, InputAdornment, IconButton, Grid } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

function SearchForm() {
  return (
    <form method="get" action="/vendors/">
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            name="where"
            placeholder="Where"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            name="event_date"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            type="time"
            name="start_time"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            type="time"
            name="end_time"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <IconButton type="submit" color="primary" sx={{ mt: { xs: 1, md: 0 } }}>
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
    </form>
  )
}

export default SearchForm