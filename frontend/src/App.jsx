import HomePage from './HomePage.jsx'
import OfferingsPage from './OfferingsPage.jsx'
import SplashPage from './SplashPage.jsx'
import ListingPage from './ListingPage.jsx'
import VendorProfile from './VendorProfile.jsx'
import {CssBaseline} from '@mui/material'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import {Routes, Route, Navigate, useLocation} from 'react-router-dom'
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
import Tours from "./Tours.jsx";
import ListingWizardLayout from "./ListingWizardLayout.jsx";
import MyEventsPage from "./MyEventsPage.jsx";
import CreateServicePage from "./pages/CreateServicePage.jsx";
import CreateArtistPage from "./pages/CreateArtistPage.jsx";
import CreateVenuePage from "./pages/CreateVenuePage.jsx";
import SchedulingPlannerPage from "./pages/SchedulingPlannerPage.jsx";
import SchedulingOpsPage from "./pages/SchedulingOpsPage.jsx";

function App() {
    const theme = createTheme()
    const {user, logout, tokens} = useAuth();
    const profileImageUrl = user?.profile_picture;
    const location = useLocation();
    const isAuthenticated = Boolean(tokens);
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const requireAuth = (element) => (
        isAuthenticated
            ? element
            : <Navigate to="/login" replace state={{from: location.pathname}}/>
    );

    const guestOnly = (element) => (
        isAuthenticated ? <Navigate to="/" replace/> : element
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {isAuthenticated && !isAuthPage && (
                <Navbar
                    userProfileImageUrl={profileImageUrl}
                    onLogout={logout}
                />
            )}
            <EventCreationProvider>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <HomePage/> : <SplashPage/>}/>
                    <Route path="/offerings" element={requireAuth(<OfferingsPage/>)} />
                    <Route path="/services/:id" element={requireAuth(<ListingPage/>)} />
                    <Route path="/services" element={requireAuth(<Services/>)} />
                    <Route path="/artists" element={requireAuth(<Artists/>)} />
                    <Route path="/tours" element={requireAuth(<Tours/>)} />
                    <Route path="/artists/:id" element={requireAuth(<ArtistProfilePage/>)} />
                    <Route path="/locations/:id" element={requireAuth(<LocationDetailPage/>)} />
                    <Route path="/events/:id" element={requireAuth(<EventListingPage/>)} />
                    <Route path="/vendor/:username" element={requireAuth(<VendorProfile/>)} />
                    <Route path="/profile" element={requireAuth(<ProfilePage/>)} />
                    <Route path="/dashboard/organizer" element={requireAuth(<EventOrganizerDashboard/>)} />
                    <Route path="/dashboard/artist" element={requireAuth(<ArtistDashboard/>)} />
                    <Route path="/dashboard/service" element={requireAuth(<ServiceProviderDashboard/>)} />
                    <Route path="/dashboard/venue" element={requireAuth(<VenueManagerDashboard/>)} />
                    <Route path="/dashboard/tickets" element={requireAuth(<TicketBuyerDashboard/>)} />
                    <Route path="/events" element={requireAuth(<Events/>)} />
                    <Route path="/createEvent" element={requireAuth(<CreateEventPage/>)} />
                    <Route path="/create/service" element={requireAuth(<CreateServicePage/>)} />
                    <Route path="/create/artist" element={requireAuth(<CreateArtistPage/>)} />
                    <Route path="/create/venue" element={requireAuth(<CreateVenuePage/>)} />
                    <Route path="/my-events" element={requireAuth(<MyEventsPage/>)} />
                    <Route path="/scheduling" element={requireAuth(<SchedulingPlannerPage/>)} />
                    <Route path="/scheduling/ops" element={requireAuth(<SchedulingOpsPage/>)} />
                    <Route path="/listing/:eventId/*" element={requireAuth(<ListingWizardLayout/>)}>
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
                    <Route path="/listing/*" element={requireAuth(<Navigate to="/createEvent" replace/>)} />
                    <Route path="/profile/update" element={requireAuth(<VendorProfileEdit/>)} />
                    <Route path="/post/create" element={requireAuth(<PostCreate/>)} />
                    <Route path="/login" element={guestOnly(<Login/>)} />
                    <Route path="/register" element={guestOnly(<Register/>)} />
                    <Route path="/me" element={requireAuth(<Profile/>)} />
                    <Route path="/services/:id/request" element={requireAuth(<RequestToBook/>)} />
                    <Route path="/logout" element={requireAuth(<Logout/>)} />
                    <Route path="/dm/:roomId" element={requireAuth(<DirectMessagePage/>)} />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace/>}/>
                </Routes>
            </EventCreationProvider>
        </ThemeProvider>
    )
}

export default App
