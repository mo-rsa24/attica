import { Box, Grid, Typography, Link } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'

function Footer() {
  return (
      <Box component="footer" sx={{ bgcolor: 'grey.100', mt: 5, pt: 4 }}>
        <Box className="container">
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Support</Typography>
              <Link href="#" underline="hover" display="block">Help Center</Link>
              <Link href="#" underline="hover" display="block">Cancellation</Link>
              <Link href="#" underline="hover" display="block">Contact</Link>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Hosting</Typography>
              <Link href="#" underline="hover" display="block">Become a Vendor</Link>
              <Link href="#" underline="hover" display="block">Community</Link>
              <Link href="#" underline="hover" display="block">Rules</Link>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Attica</Typography>
              <Link href="#" underline="hover" display="block">About</Link>
              <Link href="#" underline="hover" display="block">Careers</Link>
              <Link href="#" underline="hover" display="block">Blog</Link>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ bgcolor: 'grey.200', mt: 4, py: 2, textAlign: 'center' }}>
          <Typography variant="body2" component="span">© {new Date().getFullYear()} Attica Inc.</Typography>
          <Box sx={{ ml: 1, display: 'inline-flex', gap: 1 }}>
            <FacebookIcon fontSize="small" />
            <InstagramIcon fontSize="small" />
            <TwitterIcon fontSize="small" />
          </Box>
        </Box>
      </Box>
  )
}

export default Footer