import NavBar from './NavBar.jsx'
import HomePage from './HomePage.jsx'
import Footer from './Footer.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {Route, Routes} from "react-router-dom";
import VendorProfile from "./VendorProfile.jsx";

function App() {
    const theme = createTheme()
    return (
        <ThemeProvider theme={theme}>
            {/*<CssBaseline />*/}
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vendor/:id" element={<VendorProfile />} />
            </Routes>
            <Footer />
        </ThemeProvider>
    )
}

export default App
