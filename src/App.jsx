import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import MenuPage from './pages/MenuPage';
import RestaurantPage from './pages/RestaurantPage';
import SpaPage from './pages/SpaPage';
import GalleryPage from './pages/GalleryPage';
import LocationsPage from './pages/LocationsPage';
import ExploreRoomsPage from './pages/ExploreRoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import AboutPage from './pages/AboutPage';
import AmenitiesPage from './pages/AmenitiesPage';
import ReviewsPage from './pages/ReviewsPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import PaymentPage from './pages/PaymentPage';
import OffersPage from './pages/OffersPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans text-luxury-text bg-luxury-dark selection:bg-luxury-gold selection:text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/staff/:role" element={<StaffDashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/restaurant" element={<RestaurantPage />} />
          <Route path="/spa" element={<SpaPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/rooms" element={<ExploreRoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/explore" element={<ExploreRoomsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/amenities" element={<AmenitiesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/policies" element={<PolicyPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/offers" element={<OffersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;





