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
import Logout from "./Logout.jsx";
import RequestToBook from "./RequestToBook.jsx";
import ArtistDashboard from "./ArtistDashboard.jsx";
import ServiceProviderDashboard from "./ServiceProviderDashboard.jsx";
import VenueManagerDashboard from "./VenueManagerDashboard.jsx";
import TicketBuyerDashboard from "./TicketBuyerDashboard.jsx";
import EventOrganizerDashboard from "./EventOrganizerDashboard.jsx";
import EventsPage from "./EventsPage.jsx";
import React from "react";
// Import all the listing step components
import ListingStep1 from "./ListingStep1.jsx";
import ListingStep2 from "./ListingStep2.jsx";
import ListingStep3 from "./ListingStep3.jsx";
import ListingStep4 from "./ListingStep4.jsx";
import ListingStep5 from "./ListingStep5.jsx";
import ListingStep6 from "./ListingStep6.jsx";
import ListingStep7 from "./ListingStep7.jsx";
import ListingStep8 from "./ListingStep8.jsx";


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
                <Route path="/dashboard/organizer" element={<EventOrganizerDashboard />} />
                <Route path="/dashboard/artist" element={<ArtistDashboard />} />
                <Route path="/dashboard/service" element={<ServiceProviderDashboard />} />
                <Route path="/dashboard/venue" element={<VenueManagerDashboard />} />
                <Route path="/dashboard/tickets" element={<TicketBuyerDashboard />} />
                <Route path="/events" element={<EventsPage />} />
                 {/* Updated listing step routes */}
                <Route path="/listing/step1" element={<ListingStep1 />} />
                <Route path="/listing/step2" element={<ListingStep2 />} />
                <Route path="/listing/step3" element={<ListingStep3 />} />
                <Route path="/listing/step4" element={<ListingStep4 />} />
                <Route path="/listing/step5" element={<ListingStep5 />} />
                <Route path="/listing/step6" element={<ListingStep6 />} />
                <Route path="/listing/step7" element={<ListingStep7 />} />
                <Route path="/listing/step8" element={<ListingStep8 />} />

                <Route path="/profile/update" element={<VendorProfileEdit />} />
                <Route path="/post/create" element={<PostCreate />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/me" element={<Profile />} />
                <Route path="/services/:id/request" element={<RequestToBook />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
            <Footer />
        </ThemeProvider>
    )
}

export default App
