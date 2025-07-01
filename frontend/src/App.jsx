import NavBar from './NavBar.jsx'
import HomePage from './HomePage.jsx'
import Footer from './Footer.jsx'
import ListingPage from './ListingPage.jsx'
import VendorProfile from './VendorProfile.jsx'
import LoginPage from './LoginPage.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Routes, Route } from 'react-router-dom'

function App() {
    const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/service/:id" element={<ListingPage />} />
        <Route path="/vendor/:id" element={<VendorProfile />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
