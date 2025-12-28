import NavBar from './NavBar.jsx'
import HomePage from './HomePage.jsx'
import Footer from './Footer.jsx'
import ListingPage from './ListingPage.jsx'
import VendorProfile from './VendorProfile.jsx'
import {CssBaseline} from '@mui/material'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import {Routes, Route, Navigate} from 'react-router-dom'
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
import CreateEventPage from "./CreateEventPage.jsx";
import Events from "./Events.jsx";
import React from "react";
import DirectMessagePage from "./pages/DirectMessagePage.jsx";
import ListingStep1 from "./ListingStep1.jsx";
import ListingStep2 from "./ListingStep2.jsx";
import ListingStep3 from "./ListingStep3.jsx";
import ListingStep4 from "./ListingStep4.jsx";
import ListingStep5 from "./ListingStep5.jsx";
import ListingStep6 from "./ListingStep6.jsx";
import ListingStep7 from "./ListingStep7.jsx";
import ListingStep8 from "./ListingStep8.jsx";
import ListingReview from "./ListingReview.jsx";
import ProfilePage from "./ProfilePage.jsx";
import {useAuth} from './AuthContext';
import Navbar from "./NavBar.jsx";
import ArtistProfilePage from "./ArtistProfilePage.jsx";
import EventListingPage from "./EventListingPage.jsx";
import LocationDetailPage from "./LocationDetailPage.jsx";
import SelectLocation from "./pages/SelectLocation.jsx";
import SelectArtists from "./pages/SelectArtists.jsx";
import SelectVendors from "./pages/SelectVendors.jsx";
import {EventCreationProvider} from "./context/reactContext.jsx";
import Services from "./Services.jsx";
import Artists from "./Artists.jsx";
import ListingWizardLayout from "./ListingWizardLayout.jsx";
import MyEventsPage from "./MyEventsPage.jsx";

function App() {
    const theme = createTheme()
    const {user, logout, tokens} = useAuth();
    const profileImageUrl = user?.profile_picture;
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Navbar
                isAuthenticated={!!tokens} // Pass a boolean to indicate if the user is logged in
                userProfileImageUrl={profileImageUrl}
                onLogout={logout} // Pass the logout function
            />
            <EventCreationProvider>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/services/:id" element={<ListingPage/>}/>
                    <Route path="/services" element={<Services/>}/>
                    <Route path="/artists" element={<Artists/>}/>
                    <Route path="/artists/:id" element={<ArtistProfilePage/>}/>
                    <Route path="/locations/:id" element={<LocationDetailPage/>}/>
                    <Route path="/events/:id" element={<EventListingPage/>}/>
                    <Route path="/vendor/:username" element={<VendorProfile/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
                    <Route path="/dashboard/organizer" element={<EventOrganizerDashboard/>}/>
                    <Route path="/dashboard/artist" element={<ArtistDashboard/>}/>
                    <Route path="/dashboard/service" element={<ServiceProviderDashboard/>}/>
                    <Route path="/dashboard/venue" element={<VenueManagerDashboard/>}/>
                    <Route path="/dashboard/tickets" element={<TicketBuyerDashboard/>}/>
                    <Route path="/events" element={<Events/>}/>
                    <Route path="/createEvent" element={<CreateEventPage/>}/>
                    <Route path="/my-events" element={<MyEventsPage/>}/>
                    <Route path="/listing/:eventId/*" element={<ListingWizardLayout/>}>
                        <Route index element={<ListingStep1/>}/>
                        <Route path="step1" element={<ListingStep1/>}/>
                        <Route path="step2" element={<ListingStep2/>}/>
                        <Route path="step3" element={<ListingStep3/>}/>
                        <Route path="step3/location" element={<SelectLocation/>}/>
                        <Route path="step3/artists" element={<SelectArtists/>}/>
                        <Route path="step3/vendors" element={<SelectVendors/>}/>
                        <Route path="step4" element={<ListingStep4/>}/>
                        <Route path="step5" element={<ListingStep5/>}/>
                        <Route path="step6" element={<ListingStep6/>}/>
                        <Route path="step7" element={<ListingStep7/>}/>
                        <Route path="step8" element={<ListingStep8/>}/>
                        <Route path="review" element={<ListingReview/>}/>
                    </Route>
                    <Route path="/listing/*" element={<Navigate to="/createEvent" replace/>}/>
                    <Route path="/profile/update" element={<VendorProfileEdit/>}/>
                    <Route path="/post/create" element={<PostCreate/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/me" element={<Profile/>}/>
                    <Route path="/services/:id/request" element={<RequestToBook/>}/>
                    <Route path="/logout" element={<Logout/>}/>
                    <Route path="/dm/:roomId" element={<DirectMessagePage/>}/>
                </Routes>
            </EventCreationProvider>
            {/*<Footer />*/}
        </ThemeProvider>
    )
}

export default App
