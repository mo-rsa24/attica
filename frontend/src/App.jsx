import NavBar from './NavBar.jsx'
import HomePage from './HomePage.jsx'
import Footer from './Footer.jsx'
import ListingPage from './ListingPage.jsx'
import VendorProfile from './VendorProfile.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Routes, Route } from 'react-router-dom'
import VendorDashboard from "./VendorDashboard.jsx";
import VendorProfileEdit from "./VendorProfileEdit.jsx";
import PostCreate from "./PostCreate.jsx";
import Register from "./Register.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login.jsx";

function App() {
    const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ListingPage />} />
        <Route path="/vendor/:username" element={<VendorProfile />} />
        <Route path="/profile" element={<VendorDashboard />} />
        <Route path="/profile/update" element={<VendorProfileEdit />} />
        <Route path="/post/create" element={<PostCreate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/me" element={<Profile />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
