import NavBar from './NavBar.jsx'
import HomePage from './HomePage.jsx'
import Footer from './Footer.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

function App() {
    const theme = createTheme()
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar />
            <HomePage />
            <Footer />
        </ThemeProvider>
    )
}

export default App
