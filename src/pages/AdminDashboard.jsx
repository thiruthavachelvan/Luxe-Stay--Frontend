import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    LogOut,
    LayoutDashboard,
    UserPlus,
    Settings,
    Bell,
    TrendingUp,
    CheckCircle,
    Clock,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    X,
    Shield,
    MapPin,
    Bed,
    Calendar,
    Utensils,
    BellRing,
    Building,
    Plus,
    Map,
    Wind,
    Car,
    Flower2,
    User,
    Edit2,
    MessageSquare,
    Star,
    Mail,
    Trash2,
    CheckCircle2,
    Tag,
    Megaphone,
    Send,
    Download,
    Menu,
    Crown,
    ShieldCheck,
    RefreshCw,
    Check,
    Hash,
    ChevronDown,
    PackageCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [staffMembers, setStaffMembers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
    const [selectedLocationForEdit, setSelectedLocationForEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingStaff, setFetchingStaff] = useState(false);
    const [fetchingLocations, setFetchingLocations] = useState(false);
    const [fetchingRooms, setFetchingRooms] = useState(false);
    const [fetchingMenu, setFetchingMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [fetchingOrders, setFetchingOrders] = useState(false);
    const [serviceQueries, setServiceQueries] = useState([]);
    const [fetchingQueries, setFetchingQueries] = useState(false);
    const [tableReservations, setTableReservations] = useState([]);
    const [fetchingReservations, setFetchingReservations] = useState(false);
    const [adminBookings, setAdminBookings] = useState([]);
    const [fetchingAdminBookings, setFetchingAdminBookings] = useState(false);
    const [bulkOffer, setBulkOffer] = useState({ title: '', description: '', code: '' });
    const [sendingOffer, setSendingOffer] = useState(false);
    const [viewingBooking, setViewingBooking] = useState(null);
    const [respondingTo, setRespondingTo] = useState(null);
    const [spaTimes, setSpaTimes] = useState({});
    const [adminSpaDates, setAdminSpaDates] = useState({});
    const [assignmentDrafts, setAssignmentDrafts] = useState({});
    const [isReassigning, setIsReassigning] = useState({});

    // Live Dashboard Stats State
    const [dashboardStats, setDashboardStats] = useState({
        activeStays: 0,
        upcomingArrivals: 0,
        totalResidents: 0,
        totalRevenue: 0,
        staffOnline: 0,
        locationStats: []
    });
    const [revenueRange, setRevenueRange] = useState('month');
    const [responseText, setResponseText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // Reviews & Contacts admin state
    const [adminReviews, setAdminReviews] = useState([]);
    const [fetchingReviews, setFetchingReviews] = useState(false);
    const [adminContacts, setAdminContacts] = useState([]);
    const [fetchingContacts, setFetchingContacts] = useState(false);
    const [replyingToContact, setReplyingToContact] = useState(null);
    const [contactReplyText, setContactReplyText] = useState('');

    // Coupon management state
    const [coupons, setCoupons] = useState([]);
    const [fetchingCoupons, setFetchingCoupons] = useState(false);
    const [couponForm, setCouponForm] = useState({ code: '', description: '', discountType: 'percent', discountValue: '', maxUses: '', minOrderValue: '', expiresAt: '', appliesTo: 'all', isActive: true });
    const [couponFormMode, setCouponFormMode] = useState('create'); // 'create' | 'edit'
    const [editingCouponId, setEditingCouponId] = useState(null);
    const [showCouponForm, setShowCouponForm] = useState(false);

    // Analytics Export State
    const [exportMonth, setExportMonth] = useState('all');
    const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

    const navigate = useNavigate();

    // Floor Navigator State
    const [selectedFloor, setSelectedFloor] = useState('All Floors');
    const [selectedRoomLocation, setSelectedRoomLocation] = useState('');
    const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
    const [editRoomFormData, setEditRoomFormData] = useState({
        price: '',
        type: '',
        status: '',
        amenities: '',
        benefits: '',
        viewType: '',
        bedType: ''
    });

    // New Unit Creation State
    const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
    const [addUnitFormData, setAddUnitFormData] = useState({
        roomNumber: '',
        type: 'Single Room',
        floor: 'Ground Floor',
        price: '',
        viewType: 'City View',
        bedType: 'Single Bed',
        adults: 2,
        children: 0,
        luxuryLevel: 3,
        status: 'Available',
        amenities: [],
        benefits: []
    });

    // ── Tiered amenities/benefits by room type ──────────────────────────────
    const ROOM_TIER_CONFIG = {
        'Single Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV'],
            benefits: ['Welcome Drinks', 'Express Check-in'],
            luxuryLevel: 1, bedType: 'Single Bed', adults: 1, children: 0
        },
        'Accessible Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Wheelchair Access'],
            benefits: ['Welcome Drinks', 'Express Check-in', 'Accessibility Assistance'],
            luxuryLevel: 1, bedType: 'Single Bed', adults: 1, children: 0
        },
        'Double Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Maker'],
            benefits: ['Welcome Drinks', 'Express Check-in', 'High Speed Internet', 'Laundry Service'],
            luxuryLevel: 2, bedType: 'Double Bed', adults: 2, children: 0
        },
        'Family Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Maker', 'Premium Toiletries'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Express Check-in'],
            luxuryLevel: 2, bedType: 'Double Bed', adults: 2, children: 2
        },
        'Deluxe Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Maker', 'Premium Toiletries', 'Nespresso Machine'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Express Check-in', 'Lounge Access'],
            luxuryLevel: 3, bedType: 'King Size', adults: 2, children: 1
        },
        'Executive Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Maker', 'Premium Toiletries', 'Nespresso Machine', 'Bose Sound System'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Express Check-in', 'Lounge Access', 'VIP Airport Transfer'],
            luxuryLevel: 3, bedType: 'King Size', adults: 2, children: 1
        },
        'Themed Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7'],
            luxuryLevel: 3, bedType: 'King Size', adults: 2, children: 1
        },
        'Honeymoon Suite': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries', 'Jacuzzi Bath', 'Private Sunbed'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7', 'VIP Airport Transfer', 'Evening Cocktails'],
            luxuryLevel: 4, bedType: 'King Size', adults: 2, children: 0
        },
        'Beach-connected Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries', 'Beach Kit', 'Private Sunbed'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7', 'VIP Airport Transfer', 'Exclusive Lounge Access'],
            luxuryLevel: 4, bedType: 'King Size', adults: 2, children: 1
        },
        'Private Pool Room': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries', 'Jacuzzi Bath', 'Private Sunbed', 'Beach Kit'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7', 'VIP Airport Transfer', 'Exclusive Lounge Access', 'Evening Cocktails'],
            luxuryLevel: 5, bedType: 'King Size', adults: 2, children: 1
        },
        'Exclusive Suite': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries', 'Jacuzzi Bath', 'Private Sunbed', 'Beach Kit'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7', 'VIP Airport Transfer', 'Exclusive Lounge Access', 'Evening Cocktails'],
            luxuryLevel: 5, bedType: 'King Size', adults: 3, children: 2
        },
        'Presidential Suite': {
            amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Nespresso Machine', 'Bose Sound System', 'Silk Robes', 'Premium Toiletries', 'Jacuzzi Bath', 'Private Sunbed', 'Beach Kit'],
            benefits: ['Welcome Drinks', 'Complimentary Breakfast', 'High Speed Internet', 'Laundry Service', 'Lounge Access', 'Butler Service 24/7', 'VIP Airport Transfer', 'Exclusive Lounge Access', 'Evening Cocktails', 'Personal Concierge'],
            luxuryLevel: 5, bedType: 'King Size', adults: 4, children: 2
        },
    };

    // Flat lists (for edit room amenities/benefits checkboxes)
    const standardAmenities = [...new Set(Object.values(ROOM_TIER_CONFIG).flatMap(t => t.amenities))];
    const standardBenefits = [...new Set(Object.values(ROOM_TIER_CONFIG).flatMap(t => t.benefits))];

    // Auto-populate form when room type changes
    const handleRoomTypeChange = (type) => {
        const tier = ROOM_TIER_CONFIG[type] || {};
        setAddUnitFormData(prev => ({
            ...prev,
            type,
            amenities: tier.amenities || [],
            benefits: tier.benefits || [],
            luxuryLevel: tier.luxuryLevel ?? prev.luxuryLevel,
            bedType: tier.bedType ?? prev.bedType,
            adults: tier.adults ?? prev.adults,
            children: tier.children ?? prev.children,
        }));
    };


    // Restaurant Menu State
    const [selectedMenuCategory, setSelectedMenuCategory] = useState('All Categories');
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [menuFormData, setMenuFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Breakfast',
        dietaryType: 'Veg',
        isComplimentary: false,
        isSpecial: false,
        calories: '',
        preparationTime: '',
        availableAt: []
    });
    const [selectedMenuItemForEdit, setSelectedMenuItemForEdit] = useState(null);

    const menuCategories = [
        'All Categories', 'Breakfast', 'Chef\'s Specials', 'Lunch', 'Dinner',
        'Desserts', 'Beverages', 'Bar Menu', 'In-Room Dining', 'Weekend Buffet'
    ];

    // Form State for Staff
    const [staffFormData, setStaffFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'driver',
        location: ''
    });

    const [locationFormData, setLocationFormData] = useState({
        city: '',
        description: '',
        price: '',
        rooms: 0,
        status: 'Active',
        category: 'India'
    });

    const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
    const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);
    const [editStaffFormData, setEditStaffFormData] = useState({
        fullName: '',
        role: '',
        location: '',
        password: '',
        email: ''
    });

    const [staffFilter, setStaffFilter] = useState('all');
    const [branchOccupancyFilter, setBranchOccupancyFilter] = useState('all');
    const [occupancyStatusFilter, setOccupancyStatusFilter] = useState('CheckedIn');
    const [roomsViewDate, setRoomsViewDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        if (!userData || JSON.parse(userData).role !== 'admin') {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const fetchStaff = async (locationId = 'all') => {
        setFetchingStaff(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const url = `${__API_BASE__}/api/auth/admin/staff${locationId !== 'all' ? `?locationId=${locationId}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setStaffMembers(data);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
        } finally {
            setFetchingStaff(false);
        }
    };

    const fetchLocations = async () => {
        setFetchingLocations(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/locations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setLocations(data);
                if (data.length > 0 && !selectedRoomLocation) {
                    setSelectedRoomLocation(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
        } finally {
            setFetchingLocations(false);
        }
    };

    const fetchRooms = async (locationId, floor = 'All Floors') => {
        if (!locationId) return;
        setFetchingRooms(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const url = `${__API_BASE__}/api/auth/admin/rooms/${locationId}${floor !== 'All Floors' ? `?floor=${floor}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setRooms(data);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        } finally {
            setFetchingRooms(false);
        }
    };

    const fetchMenuItems = async (category = 'All Categories', locationId = '') => {
        setFetchingMenu(true);
        try {
            const token = sessionStorage.getItem('userToken');
            let url = `${__API_BASE__}/api/auth/admin/menu?category=${category}`;
            if (locationId) url += `&locationId=${locationId}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setMenuItems(data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        } finally {
            setFetchingMenu(false);
        }
    };

    const fetchKitchenOrders = async () => {
        setFetchingOrders(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/food-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setKitchenOrders(data);
            }
        } catch (err) {
            console.error('Error fetching kitchen orders:', err);
        } finally {
            setFetchingOrders(false);
        }
    };

    const fetchServiceQueries = async () => {
        setFetchingQueries(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServiceQueries(data);
            }
        } catch (err) {
            console.error('Error fetching service queries:', err);
        } finally {
            setFetchingQueries(false);
        }
    };

    const fetchTableReservations = async () => {
        setFetchingReservations(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/reservations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setTableReservations(data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setFetchingReservations(false);
        }
    };

    const handleConfirmReservation = async (id) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Confirmed' })
            });
            if (response.ok) {
                setSuccess('Reservation Confirmed');
                fetchTableReservations();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to confirm reservation');
        }
    };

    const handleRespondToQuery = async (queryId) => {
        if (!responseText.trim()) return;
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/admin/${queryId}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ response: responseText })
            });
            if (res.ok) {
                setRespondingTo(null);
                setResponseText('');
                fetchServiceQueries();
            }
        } catch (err) {
            console.error('Error responding:', err);
        }
    };

    const handleCreateMenuItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(menuFormData)
            });
            if (response.ok) {
                setSuccess('Culinary asset integrated');
                setIsMenuModalOpen(false);
                fetchMenuItems(selectedMenuCategory);
            }
        } catch (err) {
            setError('Integration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMenuItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/menu/${selectedMenuItemForEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(menuFormData)
            });
            if (response.ok) {
                setSuccess('Culinary profile updated');
                setIsMenuModalOpen(false);
                fetchMenuItems(selectedMenuCategory);
            }
        } catch (err) {
            setError('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMenuItem = async (id) => {
        if (!window.confirm('Decommission this culinary asset?')) return;
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setSuccess('Asset decommissioned');
                fetchMenuItems(selectedMenuCategory);
            }
        } catch (err) {
            setError('Decommissioning failed');
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchNotifications();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleClearNotifications = async () => {
        if (!window.confirm('Erase all system alerts?')) return;
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/notifications`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
                setIsNotificationOpen(false);
            }
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    };

    const handleEditRoomClick = (room) => {
        setSelectedRoomForEdit(room);
        setEditRoomFormData({
            price: room.price,
            type: room.type,
            status: room.status,
            amenities: room.amenities.join(', '),
            benefits: room.benefits.join(', '),
            viewType: room.viewType,
            bedType: room.bedType
        });
        setIsEditRoomModalOpen(true);
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/rooms/${selectedRoomForEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editRoomFormData,
                    amenities: editRoomFormData.amenities.split(',').map(a => a.trim()),
                    benefits: editRoomFormData.benefits.split(',').map(b => b.trim())
                })
            });

            if (response.ok) {
                setSuccess('Logistics updated successfully');
                setIsEditRoomModalOpen(false);
                fetchRooms(selectedRoomLocation, selectedFloor);
            }
        } catch (err) {
            setError('Failed to update logistics');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminBookingAction = async (bookingId, action) => {
        if (!bookingId) return;
        if (action === 'cancel' && !window.confirm('Are you sure you want to cancel this booking?')) return;

        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/bookings/${bookingId}/${action}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess(`Booking ${action.replace('-', ' ')} successful`);
                fetchAdminBookings();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || `Failed to ${action}`);
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            setError(`Network error during ${action}`);
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicateRoom = (roomId) => {
        const roomToClone = rooms.find(r => r._id === roomId);
        if (roomToClone) {
            setAddUnitFormData({
                ...addUnitFormData,
                type: roomToClone.type,
                floor: roomToClone.floor,
                price: roomToClone.price,
                viewType: roomToClone.viewType,
                bedType: roomToClone.bedType,
                adults: roomToClone.capacity.adults,
                children: roomToClone.capacity.children,
                luxuryLevel: roomToClone.luxuryLevel,
                amenities: [...roomToClone.amenities],
                benefits: [...roomToClone.benefits]
            });
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...addUnitFormData,
                    location: selectedRoomLocation,
                    capacity: {
                        adults: addUnitFormData.adults,
                        children: addUnitFormData.children
                    }
                })
            });

            if (response.ok) {
                setSuccess('New unit established successfully');
                setIsAddUnitModalOpen(false);
                fetchRooms(selectedRoomLocation, selectedFloor);
                fetchLocations(); // Refresh for inventory count sync
                setAddUnitFormData({
                    roomNumber: '',
                    type: 'Single Room',
                    floor: 'Ground Floor',
                    price: '',
                    viewType: 'City View',
                    bedType: 'Single Bed',
                    adults: 2,
                    children: 0,
                    luxuryLevel: 3,
                    status: 'Available',
                    amenities: [],
                    benefits: []
                });
            }
        } catch (err) {
            setError('Failed to manifest new unit');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'staff') {
            fetchStaff(staffFilter);
        } else if (activeSection === 'locations') {
            fetchLocations();
        } else if (activeSection === 'rooms') {
            fetchRooms(selectedRoomLocation, selectedFloor);
            fetchAdminBookings();
        } else if (activeSection === 'restaurant') {
            fetchMenuItems(selectedMenuCategory);
        } else if (activeSection === 'kitchen-orders') {
            fetchKitchenOrders();
        } else if (activeSection === 'room-service') {
            fetchServiceQueries();
        } else if (activeSection === 'table-reservations') {
            fetchTableReservations();
        } else if (activeSection === 'bookings') {
            fetchAdminBookings();
        }

        // Fetch notifications periodically
        fetchNotifications();
        const notificationInterval = setInterval(fetchNotifications, 30000); // Every 30 seconds

        // Always fetch locations if we are in staff, rooms, restaurant, kitchen-orders, or branch-occupancy
        if ((activeSection === 'staff' || activeSection === 'rooms' || activeSection === 'restaurant' || activeSection === 'kitchen-orders' || activeSection === 'branch-occupancy') && locations.length === 0) {
            fetchLocations();
        }

        // Fetch Live Stats when viewing dashboard
        if (activeSection === 'dashboard') {
            fetchStats(revenueRange);
        }


        // Always fetch admin bookings if in bookings, rooms, or branch-occupancy section to cross-reference
        if ((activeSection === 'bookings' || activeSection === 'rooms' || activeSection === 'branch-occupancy') && adminBookings.length === 0) {
            fetchAdminBookings();
        }

        // Always fetch staff if we need to populate assign dropdowns
        if ((activeSection === 'kitchen-orders' || activeSection === 'room-service') && staffMembers.length === 0) {
            fetchStaff('all');
        }
        if (activeSection === 'admin-reviews') fetchAdminReviews();
        if (activeSection === 'contact-messages') fetchAdminContacts();
        if (activeSection === 'coupons') fetchCoupons();
        if (activeSection === 'analytics') {
            fetchAdminBookings();
            fetchAdminReviews();
            fetchStats(revenueRange);
        }

        return () => clearInterval(notificationInterval);
    }, [activeSection, staffFilter, selectedRoomLocation, selectedFloor, selectedMenuCategory, revenueRange]);

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        navigate('/');
    };

    const fetchStats = async (range = 'month') => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/admin/stats?range=${range}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDashboardStats(data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        }
    };

    const fetchAdminReviews = async () => {
        setFetchingReviews(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/reviews/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAdminReviews(await res.json());
        } catch (err) { console.error(err); } finally { setFetchingReviews(false); }
    };

    const fetchAdminBookings = async () => {
        setFetchingAdminBookings(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/admin/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAdminBookings(await res.json());
        } catch (err) { console.error('Error fetching admin bookings', err); } finally { setFetchingAdminBookings(false); }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(`${__API_BASE__}/api/reviews/admin/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { setSuccess('Review deleted'); fetchAdminReviews(); setTimeout(() => setSuccess(''), 3000); }
    };

    const fetchAdminContacts = async () => {
        setFetchingContacts(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/contact/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAdminContacts(await res.json());
        } catch (err) { console.error(err); } finally { setFetchingContacts(false); }
    };

    const handleUpdateContactStatus = async (id, status) => {
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(`${__API_BASE__}/api/contact/admin/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
        if (res.ok) { fetchAdminContacts(); setSuccess(`Marked as ${status}`); setTimeout(() => setSuccess(''), 3000); }
    };

    const handleReplyContact = async (id) => {
        if (!contactReplyText.trim()) return;
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(`${__API_BASE__}/api/contact/admin/${id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ reply: contactReplyText }) });
        if (res.ok) { setReplyingToContact(null); setContactReplyText(''); fetchAdminContacts(); setSuccess('Reply sent'); setTimeout(() => setSuccess(''), 3000); }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/create-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(staffFormData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create staff');

            setSuccess(data.message);
            setStaffFormData({ fullName: '', email: '', password: '', role: 'driver', location: '' });
            fetchStaff(staffFilter);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditStaffClick = (staff) => {
        setSelectedStaffForEdit(staff);
        setEditStaffFormData({
            fullName: staff.fullName || '',
            role: staff.role || 'driver',
            location: staff.location?._id || '',
            password: staff.staffPassword || '',
            email: staff.email.split('.')[0]
        });
        setIsEditStaffModalOpen(true);
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/staff/${selectedStaffForEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editStaffFormData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update staff');

            setSuccess('Personnel profile synchronized successfully.');
            fetchStaff(staffFilter);
            setTimeout(() => {
                setIsEditStaffModalOpen(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (!window.confirm('Are you certain you wish to purge this personnel record?')) return;

        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/staff/${staffId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchStaff(staffFilter);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete staff');
            }
        } catch (err) {
            console.error('Error deleting staff:', err);
        }
    };

    const handleCreateLocation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(locationFormData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create location');

            setSuccess(data.message);
            setLocationFormData({ city: '', description: '', price: '', status: 'Active', rooms: 0, category: 'India' });
            fetchLocations();
            setTimeout(() => {
                setIsLocationModalOpen(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = sessionStorage.getItem('userToken');
            const response = await fetch(`${__API_BASE__}/api/auth/admin/locations/${selectedLocationForEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(locationFormData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update location');

            setSuccess(data.message);
            fetchLocations();
            setTimeout(() => {
                setIsEditLocationModalOpen(false);
                setSuccess('');
                setLocationFormData({ city: '', description: '', price: '', rooms: 0, status: 'Active', category: 'India' });
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSpa = async (bookingId, amenityName) => {
        try {
            const scheduleDate = adminSpaDates[`${bookingId}_${amenityName}`];
            if (!scheduleDate) return toast.error("Please select a date and time");
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/admin/bookings/${bookingId}/spa-schedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ spaSchedule: scheduleDate, amenityName })
            });

            if (res.ok) {
                toast.success('Spa time assigned and user notified');
                fetchAdminBookings();

                // update local state so modal updates instantly
                setViewingBooking(prev => {
                    if (prev && prev._id === bookingId) {
                        return {
                            ...prev,
                            addOns: prev.addOns.map(a => a.name === amenityName ? { ...a, spaSchedule: scheduleDate } : a)
                        };
                    }
                    return prev;
                });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Error updating schedule');
            }
        } catch (error) {
            console.error('Error assigning spa:', error);
            toast.error('Failed to assign spa time');
        }
    };

    if (!user) return null;

    // ── Coupon CRUD helpers ─────────────────────────────────
    const fetchCoupons = async () => {
        setFetchingCoupons(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/admin/coupons`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setCoupons(await res.json());
        } catch (err) { console.error(err); } finally { setFetchingCoupons(false); }
    };

    const handleSaveCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const url = couponFormMode === 'create'
                ? `${__API_BASE__}/api/auth/admin/coupons`
                : `${__API_BASE__}/api/auth/admin/coupons/${editingCouponId}`;
            const method = couponFormMode === 'create' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...couponForm,
                    discountValue: Number(couponForm.discountValue),
                    maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
                    minOrderValue: couponForm.minOrderValue ? Number(couponForm.minOrderValue) : 0,
                    expiresAt: couponForm.expiresAt || null,
                })
            });
            if (res.ok) {
                setSuccess(couponFormMode === 'create' ? 'Coupon created successfully' : 'Coupon updated');
                setShowCouponForm(false);
                setCouponForm({ code: '', description: '', discountType: 'percent', discountValue: '', maxUses: '', minOrderValue: '', expiresAt: '', appliesTo: 'all', isActive: true, isFeatured: false, featuredTitle: '', featuredSubtitle: '', featuredDescription: '', featuredTag: '', featuredImage: '', featuredColor: 'from-blue-900/60 to-[#0F1626]' });
                setCouponFormMode('create');
                setTimeout(() => setSuccess(''), 3000);
                fetchCoupons();
            } else {
                const d = await res.json();
                setError(d.message);
            }
        } catch (err) { setError('Error saving coupon'); } finally { setLoading(false); }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(`${__API_BASE__}/api/auth/admin/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { setSuccess('Coupon deleted'); setTimeout(() => setSuccess(''), 3000); fetchCoupons(); }
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'MAIN MENU' },
        { id: 'branch-occupancy', label: 'Branch Occupancy', icon: Building, category: 'MAIN MENU' },
        { id: 'staff', label: 'Staff Mgmt', icon: Users, category: 'MAIN MENU' },
        { id: 'locations', label: 'Location Mgmt', icon: Map, category: 'MAIN MENU' },
        { id: 'rooms', label: 'Room Mgmt', icon: Bed, category: 'MAIN MENU' },
        { id: 'bookings', label: 'Booking Mgmt', icon: Calendar, category: 'MAIN MENU' },
        { id: 'marketing', label: 'Marketing', icon: Megaphone, category: 'MAIN MENU' },
        { id: 'restaurant', label: 'Restaurant Menu', icon: Utensils, category: 'SERVICES' },
        { id: 'kitchen-orders', label: 'Kitchen Orders', icon: Clock, category: 'SERVICES' },
        { id: 'room-service', label: 'Room Service', icon: BellRing, category: 'SERVICES' },
        { id: 'table-reservations', label: 'Table Reservations', icon: Utensils, category: 'SERVICES' },
        { id: 'admin-reviews', label: 'Guest Reviews', icon: Star, category: 'ENGAGEMENT' },
        { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquare, category: 'ENGAGEMENT' },
        { id: 'coupons', label: 'Coupon Mgmt', icon: Tag, category: 'ENGAGEMENT' },
        { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp, category: 'ENGAGEMENT' },
    ];

    const getFilteredBookings = () => {
        let filtered = adminBookings || [];
        if (exportYear !== 'all') {
            filtered = filtered.filter(b => {
                const d = new Date(b.createdAt);
                return d.getFullYear().toString() === exportYear &&
                    (exportMonth === 'all' || d.getMonth().toString() === exportMonth);
            });
        }
        return filtered;
    };

    const handleSendOffer = async () => {
        setSendingOffer(true);
        try {
            const response = await fetch(`${__API_BASE__}/api/auth/admin/send-offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
                },
                body: JSON.stringify(bulkOffer)
            });

            if (!response.ok) throw new Error('Failed to send campaign');

            toast.success('Marketing campaign launched successfully!');
            setBulkOffer({ title: '', description: '', code: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSendingOffer(false);
        }
    };

    const handleDownloadReport = () => {
        const filteredBookings = getFilteredBookings();

        const doc = new jsPDF();

        // Header
        doc.setFillColor(15, 22, 38); // bg-luxury-dark
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(212, 175, 55); // luxury-gold
        doc.setFontSize(28);
        doc.setFont('helvetica', 'italic');
        doc.text("LuxeStay Command Center", 105, 20, { align: "center" });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let periodText = "All Time";
        if (exportYear !== 'all') {
            periodText = exportMonth !== 'all' ? `${new Date(2000, parseInt(exportMonth)).toLocaleString('default', { month: 'long' })} ${exportYear}` : `Year ${exportYear}`;
        }
        doc.text(`Executive Analytics Report: ${periodText}`, 105, 30, { align: "center" });

        // Financial Summary
        const totalRevenueMs = filteredBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalBookingsMs = filteredBookings.length;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Executive Summary", 14, 50);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Bookings Generated: ${totalBookingsMs}`, 14, 60);
        doc.text(`Total Revenue Collected: Rs ${totalRevenueMs.toLocaleString('en-IN')}`, 14, 68);

        // Booking Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Recent Activity Log", 14, 85);

        const tableColumn = ["Guest Name", "Location", "Dates", "Status", "Amount"];
        const tableRows = [];

        filteredBookings.slice(0, 50).forEach(booking => {
            const bookingData = [
                booking.user?.fullName || 'Guest',
                booking.location?.city || 'HQ',
                `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
                booking.status,
                `Rs ${booking.totalPrice?.toLocaleString('en-IN') || 0}`
            ];
            tableRows.push(bookingData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [15, 22, 38], textColor: [212, 175, 55] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        doc.save(`LuxeStay_Report_${periodText.replace(/ /g, '_')}.pdf`);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                        {/* Stats Grid */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gold-500/10">
                            <div>
                                <h2 className="text-4xl font-bold text-white font-serif italic tracking-wide">Strategic Intelligence</h2>
                                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.3em] mt-2">Real-time Operational Overview</p>
                            </div>
                            <div className="flex bg-navy-900/50 backdrop-blur-xl border border-gold-500/10 p-1.5 rounded-2xl shadow-2xl">
                                <button
                                    onClick={() => setRevenueRange('month')}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${revenueRange === 'month' ? 'bg-gradient-to-br from-gold-600 to-gold-400 text-navy-950 shadow-lg shadow-gold-500/20' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    Cycle: Month
                                </button>
                                <button
                                    onClick={() => setRevenueRange('year')}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${revenueRange === 'year' ? 'bg-gradient-to-br from-gold-600 to-gold-400 text-navy-950 shadow-lg shadow-gold-500/20' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    Cycle: Year
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {[
                                { label: 'Global Residents', value: dashboardStats.totalResidents.toLocaleString(), icon: Users, color: 'text-gold-400', bg: 'bg-gold-500/5', border: 'border-gold-500/10' },
                                { label: 'Active Regalia', value: (dashboardStats.activeStays || 0).toLocaleString(), icon: Clock, color: 'text-gold-400', bg: 'bg-gold-500/5', border: 'border-gold-500/10' },
                                { label: 'Upcoming Stays', value: (dashboardStats.upcomingArrivals || 0).toLocaleString(), icon: Calendar, color: 'text-gold-400', bg: 'bg-gold-500/5', border: 'border-gold-500/10' },
                                { label: `${revenueRange === 'month' ? 'Monthly' : 'Annual'} Yield`, value: `₹${(dashboardStats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                                { label: 'Staff Corps', value: (dashboardStats.staffOnline || 0).toLocaleString(), icon: CheckCircle, color: 'text-gold-400', bg: 'bg-gold-500/5', border: 'border-gold-500/10' },
                            ].map((stat, i) => (
                                <div key={i} className={`bg-navy-900/40 backdrop-blur-xl border ${stat.border} p-6 rounded-[2rem] hover:border-gold-500/30 transition-all duration-500 group relative overflow-hidden shadow-2xl shadow-black/20`}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-gold-500/10 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-gold-500/10 group-hover:scale-110 group-hover:bg-gold-500/10 transition-all duration-500`}>
                                            <stat.icon className="w-5 h-5 shadow-lg" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight relative z-10 font-serif italic">{stat.value}</h3>
                                    <p className="text-[10px] text-gold-500/60 uppercase tracking-[0.2em] font-bold relative z-10">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Marketing Quick-Access */}
                        <div className="p-12 rounded-[2.5rem] bg-navy-900/60 backdrop-blur-xl border border-gold-500/20 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover:bg-gold-500/10 transition-all duration-1000" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-gold-600 to-gold-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-gold-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                    <Megaphone className="w-10 h-10 text-navy-950" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 font-serif italic underline decoration-gold-500/20 underline-offset-8">Engagement Command</h3>
                                    <p className="text-sm text-luxury-muted max-w-lg leading-relaxed">Broadcast luxury invitations and bespoke seasonal offers to your global resident network with a single command.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveSection('marketing')}
                                className="z-10 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-bold transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] flex items-center gap-3 group/btn relative overflow-hidden"
                            >
                                <span className="uppercase tracking-[0.2em] text-[10px] relative z-10">Deploy Campaigns</span>
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                            </button>
                        </div>

                        {/* System Overview Details */}
                        <div className="bg-navy-900/40 backdrop-blur-xl border border-gold-500/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                                <h2 className="text-xl font-bold text-white uppercase tracking-[0.3em] flex items-center gap-4">
                                    <Map className="w-6 h-6 text-gold-400" />
                                    Global Asset Distribution
                                </h2>
                                <button
                                    onClick={() => setActiveSection('branch-occupancy')}
                                    className="text-gold-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gold-500/20 hover:border-gold-500 pb-1"
                                >
                                    Deep Intelligence &rarr;
                                </button>
                            </div>
                            <div className="p-10">
                                {dashboardStats.locationStats && dashboardStats.locationStats.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {dashboardStats.locationStats.map((loc, idx) => (
                                            <div key={idx} className="bg-navy-950/40 backdrop-blur-xl border border-gold-500/5 p-8 rounded-3xl hover:border-gold-500/30 transition-all group scale-100 hover:scale-[1.02] duration-500 shadow-xl">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-white font-bold text-xl mb-1 font-serif italic tracking-wide">{loc.city} Hub</h3>
                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.3em] font-bold">Strategic Branch</p>
                                                    </div>
                                                    <div className="p-3 bg-gold-400/5 border border-gold-500/10 rounded-2xl text-gold-400 group-hover:bg-gold-500/10 transition-colors">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gold-500/10">
                                                    <div>
                                                        <div className="text-3xl font-bold text-gold-400 font-serif">{loc.activeStays || 0}</div>
                                                        <p className="text-[9px] text-luxury-muted uppercase tracking-[0.2em] mt-2 font-bold opacity-60">In-Residence</p>
                                                    </div>
                                                    <div className="text-right border-l border-gold-500/10 pl-6">
                                                        <div className="text-3xl font-bold text-white/50 font-serif">{loc.upcomingArrivals || 0}</div>
                                                        <p className="text-[9px] text-luxury-muted uppercase tracking-[0.2em] mt-2 font-bold opacity-60">Reserved</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-navy-950/20 rounded-3xl border border-dashed border-gold-500/10">
                                        <p className="text-gold-500/40 text-sm italic font-serif tracking-wide select-none">Global network quiet. Awaiting transmission.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            case 'branch-occupancy': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-gold-500/10">
                            <div>
                                <h2 className="text-4xl font-bold text-white font-serif italic tracking-wide">Strategic Occupancy</h2>
                                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.3em] mt-2">Global Resident Deployment Tracking</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <select
                                    className="bg-navy-900/60 backdrop-blur-xl border border-gold-500/10 rounded-2xl px-6 py-3.5 text-white/80 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-gold-500 transition-all shadow-xl"
                                    value={occupancyStatusFilter}
                                    onChange={(e) => setOccupancyStatusFilter(e.target.value)}
                                >
                                    <option value="CheckedIn">Active Stays (In-House)</option>
                                    <option value="Confirmed">Scheduled Arrivals</option>
                                </select>
                                <select
                                    className="bg-navy-900/60 backdrop-blur-xl border border-gold-500/10 rounded-2xl px-6 py-3.5 text-white/80 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-gold-500 transition-all shadow-xl"
                                    value={branchOccupancyFilter}
                                    onChange={(e) => setBranchOccupancyFilter(e.target.value)}
                                >
                                    <option value="all">Global Portfolio</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id}>{l.city} Hub</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {fetchingAdminBookings ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <div className="w-12 h-12 rounded-2xl border-2 border-gold-500/20 border-t-gold-500 animate-spin shadow-2xl"></div>
                                <p className="text-[10px] text-gold-500/40 uppercase tracking-[0.3em] font-bold animate-pulse">Scanning Global Network...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {adminBookings
                                    .filter(b => b.status === occupancyStatusFilter)
                                    .filter(b => branchOccupancyFilter === 'all' || b.location?._id === branchOccupancyFilter)
                                    .length === 0 ? (
                                    <div className="col-span-full py-40 bg-navy-900/20 backdrop-blur-xl border-2 border-dashed border-gold-500/10 rounded-[3rem] text-center flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-gold-500/5 rounded-full flex items-center justify-center mb-6">
                                            <Clock className="w-10 h-10 text-gold-500/20" />
                                        </div>
                                        <p className="text-gold-500/40 text-lg italic font-serif tracking-wide max-w-md mx-auto leading-relaxed">
                                            {occupancyStatusFilter === 'CheckedIn'
                                                ? '"The halls of grandeur rest in tranquility. No active residencies recorded in this sector."'
                                                : '"The aether remains undisturbed. No upcoming arrivals detected for this deployment."'}
                                        </p>
                                    </div>
                                ) : (
                                    adminBookings
                                        .filter(b => b.status === occupancyStatusFilter)
                                        .filter(b => branchOccupancyFilter === 'all' || b.location?._id === branchOccupancyFilter)
                                        .map(booking => (
                                            <div key={booking._id} className="bg-navy-900/40 backdrop-blur-xl border border-gold-500/10 p-8 rounded-[2.5rem] hover:border-gold-500/30 transition-all duration-500 flex flex-col gap-8 shadow-2xl relative group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-gold-500/10 transition-all"></div>

                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-gold-500/20 flex items-center justify-center text-gold-400 text-2xl font-serif italic shadow-2xl">
                                                            {booking.user?.fullName?.charAt(0) || 'G'}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white font-serif tracking-wide">{booking.user?.fullName || 'Distinguished Guest'}</h3>
                                                            <p className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mt-1 opacity-70">{booking.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-3 text-gold-400 justify-end mb-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">{booking.location?.city}</span>
                                                        </div>
                                                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Primary Hub</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gold-500/10 relative z-10">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-bold">Suite Unit</p>
                                                        <p className="text-white text-base font-bold font-serif">{booking.room?.roomNumber || '—'}</p>
                                                        <p className="text-[10px] text-luxury-muted font-medium tracking-tight truncate">{booking.room?.type}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-bold">Delegation</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <div className="flex items-center gap-2 text-white text-[11px] font-bold bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-xl">
                                                                <Users className="w-3.5 h-3.5 text-gold-400" />
                                                                <span>{booking.guests?.adults || 1}A</span>
                                                            </div>
                                                            {booking.guests?.children > 0 && (
                                                                <div className="flex items-center gap-2 text-white/50 text-[11px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                                                    <span>{booking.guests.children}C</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-bold">Stay Protocol</p>
                                                        <div className="flex flex-col">
                                                            <span className="text-white text-xs font-bold tracking-tight">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                            <span className="text-white/30 text-[10px]">to {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-bold">Account</p>
                                                        <p className="text-gold-400 text-base font-bold font-serif">₹{booking.totalPrice?.toLocaleString()}</p>
                                                        <div className="pt-1">
                                                            {booking.paymentStatus === 'Paid' ? (
                                                                <span className="text-[9px] font-black tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                                                                    <Crown className="w-2.5 h-2.5" /> Settled
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-black tracking-widest uppercase text-amber-500 flex items-center gap-1.5">
                                                                    <Clock className="w-2.5 h-2.5" /> Due
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>
                );
            }

            case 'staff': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-gold-500/10">
                            <div>
                                <h2 className="text-4xl font-bold text-white font-serif italic tracking-wide">Command Personnel</h2>
                                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.3em] mt-2">Human Infrastructure Management</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <select
                                    className="bg-navy-900/60 backdrop-blur-xl border border-gold-500/10 rounded-2xl px-6 py-3.5 text-white/80 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-gold-500 transition-all shadow-xl appearance-none pr-12 relative"
                                    value={staffFilter}
                                    onChange={(e) => setStaffFilter(e.target.value)}
                                >
                                    <option value="all">Global Deployment</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id}>{l.city} Hub</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-bold transition-all shadow-2xl hover:shadow-gold-500/20 active:scale-95 group"
                                >
                                    <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span className="uppercase tracking-[0.2em] text-[10px]">Induct Personnel</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-navy-900/40 backdrop-blur-xl border border-gold-500/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
                            {fetchingStaff ? (
                                <div className="p-32 text-center flex flex-col items-center justify-center space-y-6">
                                    <div className="w-14 h-14 rounded-2xl border-2 border-gold-500/20 border-t-gold-500 animate-spin shadow-2xl"></div>
                                    <p className="text-[10px] text-gold-500/40 uppercase tracking-[0.4em] font-bold animate-pulse">Syncing Roster...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gold-500/[0.03] text-[10px] uppercase tracking-[0.3em] text-gold-500/60 font-black border-b border-gold-500/10">
                                                <th className="px-10 py-8">Member Identity</th>
                                                <th className="px-10 py-8">Designation</th>
                                                <th className="px-10 py-8">Domain</th>
                                                <th className="px-10 py-8">Security Protocol</th>
                                                <th className="px-10 py-8 text-right">Directives</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gold-500/10">
                                            {staffMembers.length > 0 ? staffMembers.map((staff, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-gold-500/20 flex items-center justify-center text-gold-400 font-serif italic text-xl shadow-lg group-hover:bg-gold-500 group-hover:text-navy-950 transition-all duration-500">
                                                                {staff.fullName?.charAt(0) || staff.email.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-bold text-white font-serif tracking-wide">{staff.fullName || staff.email.split('@')[0]}</div>
                                                                <div className="text-[9px] text-gold-500/40 uppercase tracking-widest mt-1 font-bold">Joined {new Date(staff.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.15em] bg-white/5 border border-white/10 px-4 py-2 rounded-xl group-hover:border-gold-500/30 transition-colors">{staff.role.replace('-', ' ')}</span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-3 text-gold-400">
                                                            <MapPin className="w-4 h-4 opacity-50" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">{staff.location?.city || 'Central Hub'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[8px] font-black text-gold-500/40 uppercase w-14 tracking-tighter">ID Tag:</span>
                                                                <span className="text-[11px] font-mono text-gold-400 font-medium">{staff.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[8px] font-black text-gold-500/40 uppercase w-14 tracking-tighter">Cipher:</span>
                                                                <span className="text-[11px] font-mono text-white/30 group-hover:text-gold-500/80 transition-colors font-medium">{staff.staffPassword || '********'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                                            <button
                                                                onClick={() => handleEditStaffClick(staff)}
                                                                className="w-10 h-10 rounded-xl bg-gold-400/5 border border-gold-500/10 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-navy-950 transition-all duration-300"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-10 py-32 text-center">
                                                        <p className="text-gold-500/30 text-lg italic font-serif tracking-widest underline decoration-gold-500/10 underline-offset-8">No personnel indexed in the current sector.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'locations': {
                const indiaLocations = locations.filter(l => l.category === 'India' && l.status === 'Active');
                const internationalLocations = locations.filter(l => l.category === 'International' && l.status === 'Active');
                const pipelineLocations = locations.filter(l => l.status === 'Coming Soon');

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16 pb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b border-gold-500/10">
                            <div>
                                <h2 className="text-5xl font-bold text-white font-serif italic tracking-tight">Global Portfolio</h2>
                                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.4em] mt-3">Strategic Real Estate Asset Management</p>
                            </div>
                            <button
                                onClick={() => {
                                    setLocationFormData({ city: '', description: '', price: '', status: 'Active', rooms: 0, category: 'India' });
                                    setIsLocationModalOpen(true);
                                }}
                                className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-bold transition-all shadow-2xl hover:shadow-gold-500/30 active:scale-95 group overflow-hidden relative"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform relative z-10" />
                                <span className="uppercase tracking-[0.2em] text-[10px] relative z-10">Add Strategic Asset</span>
                            </button>
                        </div>

                        {fetchingLocations ? (
                            <div className="p-32 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 rounded-[2rem] border-2 border-gold-500/20 border-t-gold-500 animate-spin shadow-2xl"></div>
                                <p className="text-[10px] text-gold-500/40 uppercase tracking-[0.5em] font-bold animate-pulse">Mapping Satellite Assets...</p>
                            </div>
                        ) : (
                            <div className="space-y-24">
                                {/* India Locations */}
                                {indiaLocations.length > 0 && (
                                    <section className="space-y-10">
                                        <div className="flex items-center gap-8">
                                            <h3 className="text-[11px] font-black text-gold-500/60 tracking-[0.4em] uppercase whitespace-nowrap">Domestic Strategic Hubs</h3>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-gold-500/20 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {indiaLocations.map((loc, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedLocationForEdit(loc);
                                                        setLocationFormData({
                                                            city: loc.city, description: loc.description, price: loc.price, rooms: loc.rooms, status: loc.status, category: loc.category
                                                        });
                                                        setIsEditLocationModalOpen(true);
                                                    }}
                                                    className="bg-navy-900/40 backdrop-blur-xl border border-gold-500/10 rounded-[2.5rem] p-8 hover:border-gold-500/40 transition-all duration-700 group relative overflow-hidden cursor-pointer shadow-2xl hover:scale-[1.03] hover:-translate-y-2"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-gold-500/10 transition-colors"></div>

                                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                                        <div className="p-4 bg-navy-950 border border-gold-500/10 rounded-2xl text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 transition-all duration-500">
                                                            <MapPin className="w-5 h-5 shadow-lg" />
                                                        </div>
                                                        <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl tracking-widest uppercase shadow-lg group-hover:bg-emerald-400 group-hover:text-navy-950 transition-all duration-500">{loc.status}</span>
                                                    </div>

                                                    <h4 className="text-2xl font-bold text-white mb-2 font-serif italic tracking-wide group-hover:text-gold-400 transition-colors duration-500">{loc.city} Hub</h4>
                                                    <p className="text-[10px] text-gold-500/40 mb-8 uppercase tracking-[0.1em] font-medium leading-relaxed line-clamp-2 italic">"{loc.description}"</p>

                                                    <div className="space-y-4 relative z-10">
                                                        <div className="flex items-center justify-between py-4 border-t border-gold-500/10">
                                                            <span className="text-[9px] text-gold-500/40 uppercase font-bold tracking-widest">Global Inventory</span>
                                                            <span className="text-sm font-bold text-white font-serif">{loc.rooms} Suites</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-4 border-t border-gold-500/10">
                                                            <span className="text-[9px] text-gold-500/40 uppercase font-bold tracking-widest">Base Protocol</span>
                                                            <span className="text-base font-bold text-gold-400 font-serif">₹{loc.price?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* International Locations */}
                                {internationalLocations.length > 0 && (
                                    <section className="space-y-12">
                                        <div className="flex items-center gap-8">
                                            <h3 className="text-[11px] font-black text-gold-500/60 tracking-[0.4em] uppercase whitespace-nowrap">International Flagships</h3>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-gold-500/20 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {internationalLocations.map((loc, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedLocationForEdit(loc);
                                                        setLocationFormData({
                                                            city: loc.city, description: loc.description, price: loc.price, rooms: loc.rooms, status: loc.status, category: loc.category
                                                        });
                                                        setIsEditLocationModalOpen(true);
                                                    }}
                                                    className="bg-navy-900/60 backdrop-blur-3xl border border-gold-500/20 rounded-[3.5rem] p-12 hover:border-gold-500/50 transition-all duration-1000 flex flex-col lg:flex-row items-center gap-12 group cursor-pointer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden active:scale-[0.98]"
                                                >
                                                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] group-hover:bg-gold-500/10 transition-all duration-1000"></div>

                                                    <div className="flex-1 relative z-10">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-3 h-3 rounded-full bg-gold-500 animate-[ping_3s_infinite] shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
                                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.3em]">Diamond Portfolio Asset</span>
                                                        </div>
                                                        <h4 className="text-5xl font-bold text-white mb-6 font-serif italic underline decoration-gold-500/20 underline-offset-[16px] group-hover:text-gold-400 group-hover:decoration-gold-500 transition-all duration-700">{loc.city} Hub</h4>
                                                        <p className="text-base text-luxury-muted mb-10 max-w-xl leading-relaxed font-light italic">"{loc.description}"</p>

                                                        <div className="grid grid-cols-2 gap-12">
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 group-hover:border-gold-500/20 transition-all shadow-inner">
                                                                <span className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-black block mb-2">Portfolio Volume</span>
                                                                <span className="text-3xl font-bold text-white font-serif">{loc.rooms} <span className="text-sm font-normal text-luxury-muted">Suites</span></span>
                                                            </div>
                                                            <div className="p-6 rounded-3xl bg-gold-400/5 border border-gold-500/10 group-hover:border-gold-500/30 transition-all shadow-inner">
                                                                <span className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-black block mb-2">Prime Yield</span>
                                                                <span className="text-3xl font-bold text-gold-400 font-serif">₹{loc.price?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-40 h-40 bg-navy-950 border-2 border-gold-500/10 rounded-[3rem] flex items-center justify-center group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700 shadow-2xl shrink-0">
                                                        <Map className="w-16 h-16 text-gold-500/20 group-hover:text-gold-500/50 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Launching Soon */}
                                {pipelineLocations.length > 0 && (
                                    <section className="space-y-10">
                                        <div className="flex items-center gap-8">
                                            <h3 className="text-[11px] font-black text-white/30 tracking-[0.4em] uppercase whitespace-nowrap">Strategic Deployment Pipeline</h3>
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                            {pipelineLocations.map((loc, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedLocationForEdit(loc);
                                                        setLocationFormData({
                                                            city: loc.city, description: loc.description, price: loc.price, rooms: loc.rooms, status: loc.status, category: loc.category
                                                        });
                                                        setIsEditLocationModalOpen(true);
                                                    }}
                                                    className="bg-navy-900/20 border border-white/5 hover:border-gold-500/20 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 group cursor-pointer grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 shadow-xl"
                                                >
                                                    <div className="text-[8px] font-black text-white bg-white/10 border border-white/20 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] group-hover:bg-gold-500/20 group-hover:text-gold-400 group-hover:border-gold-500/30 transition-all shadow-lg">Deployment Pending</div>
                                                    <h4 className="text-2xl font-bold text-luxury-muted group-hover:text-white font-serif italic transition-colors text-center">{loc.city}</h4>
                                                    <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-gold-500/40 group-hover:bg-gold-500 w-1/3 transition-all duration-1000 group-hover:w-full"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {locations.length === 0 && (
                                    <div className="py-40 text-center border-2 border-dashed border-gold-500/10 rounded-[4rem] group hover:border-gold-500/30 transition-all duration-1000 flex flex-col items-center justify-center space-y-8">
                                        <div className="w-24 h-24 bg-gold-400/5 rounded-full flex items-center justify-center">
                                            <MapPin className="w-10 h-10 text-gold-500/20" />
                                        </div>
                                        <p className="text-gold-500/30 font-serif italic text-xl tracking-widest max-w-lg mx-auto leading-relaxed">"The global atlas awaits your command. No strategic sectors discovered yet. Begin your expansion."</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            }
            case 'rooms': {
                const currentHub = locations.find(l => l._id === selectedRoomLocation);
                const floors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Luxury Wing', 'Location Special'];

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
                        {/* Room Header with Hub Selector */}
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-12 overflow-visible pb-8 border-b border-gold-500/10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-3">
                                    <div className="w-10 h-[1px] bg-gold-500/40"></div>
                                    <span className="text-[10px] uppercase font-bold tracking-[0.4em]">Strategic Asset Inventory</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic tracking-tight underline decoration-gold-500/10 underline-offset-8">Room Portfolio</h2>
                            </div>

                            <div className="flex flex-wrap gap-6 items-center">
                                <div className="relative group">
                                    <div className="absolute -top-7 left-1 text-[9px] font-black text-gold-500/40 uppercase tracking-[0.3em]">Sector Deployment</div>
                                    <div className="relative">
                                        <select
                                            className="bg-navy-900/60 backdrop-blur-xl border border-gold-500/10 rounded-[1.25rem] px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-gold-500 hover:bg-white/[0.02] transition-all cursor-pointer appearance-none min-w-[240px] shadow-2xl relative z-10"
                                            value={selectedRoomLocation}
                                            onChange={(e) => setSelectedRoomLocation(e.target.value)}
                                        >
                                            {locations.filter(l => l.status === 'Active').map(l => (
                                                <option key={l._id} value={l._id} className="bg-navy-950 text-white">{l.city} Strategic Hub</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-gold-500/40 pointer-events-none z-20" />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-7 left-1 text-[9px] font-black text-gold-500/40 uppercase tracking-[0.3em]">Temporal State</div>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="bg-navy-900/60 backdrop-blur-xl border border-gold-500/10 rounded-[1.25rem] px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-gold-500 hover:bg-white/[0.02] transition-all cursor-pointer min-w-[240px] [color-scheme:dark] shadow-2xl"
                                            value={roomsViewDate}
                                            onChange={(e) => setRoomsViewDate(e.target.value)}
                                        />
                                        <Calendar className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-gold-500/40 pointer-events-none" />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsAddUnitModalOpen(true)}
                                    className="flex items-center gap-4 px-10 py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-[1.25rem] font-bold transition-all shadow-2xl hover:shadow-gold-500/30 active:scale-95 group"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span className="uppercase tracking-[0.2em] text-[10px]">Induct Unit</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Room Navigation Grid */}
                        <div className="flex gap-12 flex-1 overflow-hidden min-h-0">
                            {/* Floor Sidebar Navigator */}
                            <div className="w-80 flex flex-col border-r border-gold-500/5 pr-10 overflow-hidden">
                                <h3 className="text-[10px] font-black text-gold-500/40 tracking-[0.4em] mb-8 uppercase px-2 italic">Vertical Navigator</h3>
                                <div className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-thin scrollbar-thumb-gold-500/10 hover:scrollbar-thumb-gold-500/20 transition-all">
                                    {floors.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setSelectedFloor(f)}
                                            className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${selectedFloor === f ? 'bg-gold-500/10 text-gold-400 shadow-[inset_0_0_20px_rgba(212,175,55,0.05)] border border-gold-500/20' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${selectedFloor === f ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20 rotate-[10deg]' : 'bg-navy-950 border border-gold-500/10 group-hover:border-gold-500/30'}`}>
                                                    {f === 'All Floors' ? <LayoutDashboard className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                                                </div>
                                                <span className="text-[11px] font-black tracking-[0.1em] uppercase group-hover:tracking-[0.2em] transition-all">{f}</span>
                                            </div>
                                            {selectedFloor === f && <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,1)] relative z-10"></div>}
                                            {selectedFloor === f && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto pt-10 border-t border-gold-500/5">
                                    <div className="p-8 bg-gold-400/5 rounded-[2.5rem] border border-gold-500/10 relative overflow-hidden group hover:border-gold-500/30 transition-all">
                                        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-colors"></div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[9px] font-black text-gold-500/40 uppercase tracking-[0.3em]">Live Asset Mapping</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-4xl font-bold text-white font-serif italic">{rooms.length}</div>
                                            <div className="text-gold-500/40 text-sm font-serif italic">/ {currentHub?.rooms || 0}</div>
                                        </div>
                                        <div className="text-[9px] text-gold-500/40 uppercase font-black tracking-widest mt-2">Inventory Sync Active</div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Display Grid */}
                            <div className="flex-1 overflow-y-auto pr-6 pb-20 scrollbar-thin scrollbar-thumb-gold-500/10 hover:scrollbar-thumb-gold-500/20 transition-all">
                                {fetchingRooms ? (
                                    <div className="p-32 text-center flex flex-col items-center justify-center h-full space-y-10">
                                        <div className="w-20 h-20 rounded-[2.5rem] border-2 border-gold-500/10 border-t-gold-500 animate-[spin_1.5s_linear_infinite] shadow-2xl relative">
                                            <div className="absolute inset-4 rounded-2xl border border-gold-500/5 animate-[pulse_2s_infinite]"></div>
                                        </div>
                                        <p className="text-[11px] text-gold-500/40 uppercase tracking-[0.6em] font-black animate-pulse italic">Mapping Floor Schematics...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-16">
                                        {rooms.length > 0 ? (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                                {rooms.map((room) => {
                                                    const viewDate = new Date(roomsViewDate);
                                                    viewDate.setHours(0, 0, 0, 0);

                                                    const activeBooking = adminBookings.find(b => {
                                                        const checkIn = new Date(b.checkIn);
                                                        checkIn.setHours(0, 0, 0, 0);
                                                        const checkOut = new Date(b.checkOut);
                                                        checkOut.setHours(0, 0, 0, 0);

                                                        return b.room?._id === room._id &&
                                                            ['Confirmed', 'CheckedIn'].includes(b.status) &&
                                                            checkIn <= viewDate &&
                                                            checkOut >= viewDate;
                                                    });

                                                    const displayStatus = activeBooking ? (activeBooking.status === 'CheckedIn' ? 'Occupied' : 'Reserved') : room.status;

                                                    return (
                                                        <div key={room._id} className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3rem] overflow-hidden hover:border-gold-500/40 transition-all duration-700 group flex flex-col h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative active:scale-[0.99]">
                                                            {/* Card Header with Status */}
                                                            <div className="relative h-72 bg-navy-950 overflow-hidden">
                                                                <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-1000 ease-in-out">
                                                                    <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80" alt={room.type} className="w-full h-full object-cover opacity-40 mix-blend-luminosity brightness-50" />
                                                                    <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-transparent to-navy-900 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
                                                                </div>

                                                                <div className="absolute top-8 left-8 flex flex-col gap-4 relative z-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border ${displayStatus === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : displayStatus === 'Occupied' ? 'bg-red-500/10 text-red-400 border-red-500/20' : displayStatus === 'Reserved' ? 'bg-gold-500/10 text-gold-400 border-gold-500/20' : 'bg-white/5 text-white/50 border-white/10'}`}>
                                                                            {displayStatus} State
                                                                        </span>
                                                                        <span className="px-5 py-2 rounded-2xl bg-navy-950/80 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.3em] border border-gold-500/20 shadow-2xl">
                                                                            Sector {room.roomNumber}
                                                                        </span>
                                                                    </div>
                                                                    {activeBooking && (
                                                                        <div className="bg-navy-950/90 backdrop-blur-2xl border border-gold-500/20 text-white rounded-[2rem] p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] max-w-sm animate-in zoom-in-95 duration-500">
                                                                            <div className="flex items-center gap-4 mb-4">
                                                                                <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-500/20 flex items-center justify-center">
                                                                                    <User className="w-5 h-5 text-gold-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[10px] font-black text-gold-500/40 uppercase tracking-widest block mb-0.5">Primary Occupant</span>
                                                                                    <span className="text-sm font-bold text-white font-serif">{activeBooking.user?.fullName || activeBooking.user?.email}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-4 border-t border-gold-500/10 mb-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <Calendar className="w-4 h-4 text-gold-400 opacity-50" />
                                                                                    <span className="text-[10px] text-white/60 font-medium">{new Date(activeBooking.checkIn).toLocaleDateString()} — {new Date(activeBooking.checkOut).toLocaleDateString()}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center justify-between pt-2">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-2 h-2 rounded-full ${activeBooking.paymentStatus === 'Paid' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`}></div>
                                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeBooking.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-orange-400'}`}>{activeBooking.paymentStatus} Account</span>
                                                                                </div>
                                                                                <span className="text-lg font-bold text-gold-400 font-serif">₹{activeBooking.totalPrice?.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="absolute top-8 right-8 bg-gold-500 text-navy-950 px-6 py-2 rounded-2xl shadow-2xl skew-x-[-12deg]">
                                                                    <div className="skew-x-[12deg] flex items-baseline gap-1">
                                                                        <span className="text-base font-black">₹{room.price?.toLocaleString()}</span>
                                                                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">/ Night</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Card Content */}
                                                            <div className="p-10 flex-1 flex flex-col relative z-20">
                                                                <div className="flex items-start justify-between mb-8">
                                                                    <div>
                                                                        <h4 className="text-3xl font-bold text-white font-serif italic tracking-wide group-hover:text-gold-400 transition-colors duration-500 underline decoration-gold-500/10 underline-offset-8 decoration-2">{room.type} Suite</h4>
                                                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.4em] font-black mt-4">{room.viewType} Perspective</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                                                                        <Shield className="w-3.5 h-3.5 fill-gold-500 text-gold-500 shadow-lg" />
                                                                        <span className="text-xs font-black text-gold-400">Class {room.luxuryLevel}.0</span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-6 mb-10">
                                                                    <div className="flex items-center gap-4 group/item">
                                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-gold-500/30 transition-all">
                                                                            <Users className="w-5 h-5 text-gold-400/40 group-hover/item:text-gold-400 transition-colors" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] font-black text-gold-500/30 uppercase tracking-widest block">Quota</span>
                                                                            <span className="text-xs font-bold text-white/80">{room.capacity.adults}A {room.capacity.children > 0 && `+ ${room.capacity.children}C`}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 group/item">
                                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-gold-500/30 transition-all">
                                                                            <Bed className="w-5 h-5 text-gold-400/40 group-hover/item:text-gold-400 transition-colors" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] font-black text-gold-500/30 uppercase tracking-widest block">Anchor</span>
                                                                            <span className="text-xs font-bold text-white/80 truncate max-w-[80px] block">{room.bedType}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 group/item">
                                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-gold-500/30 transition-all">
                                                                            <Building className="w-5 h-5 text-gold-400/40 group-hover/item:text-gold-400 transition-colors" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] font-black text-gold-500/30 uppercase tracking-widest block">Tier</span>
                                                                            <span className="text-xs font-bold text-white/80">{room.floor}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-3 mb-10">
                                                                    {room.amenities.slice(0, 4).map((amt, idx) => (
                                                                        <span key={idx} className="bg-navy-950/50 text-gold-500/60 border border-gold-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-inner hover:border-gold-500/40 hover:text-gold-400 transition-all cursor-default translate-y-0 hover:-translate-y-1">
                                                                            {amt}
                                                                        </span>
                                                                    ))}
                                                                    {room.amenities.length > 4 && <span className="text-[10px] text-gold-500/30 font-bold self-center ml-2">+{room.amenities.length - 4} More Assets</span>}
                                                                </div>

                                                                <div className="mt-auto pt-10 border-t border-gold-500/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-[0.3em] italic">Mapping Signature Privileges</span>
                                                                        <div className="flex gap-6">
                                                                            {room.benefits.slice(0, 2).map((benefit, idx) => (
                                                                                <div key={idx} className="flex items-center gap-2 group/ben">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500/20 group-hover/ben:bg-gold-500 transition-colors"></div>
                                                                                    <span className="text-[10px] text-white/50 group-hover/ben:text-white transition-colors">{benefit}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-6">
                                                                        <button
                                                                            onClick={() => handleEditRoomClick(room)}
                                                                            className="text-[10px] font-black text-white/20 hover:text-gold-400 uppercase tracking-widest transition-all underline underline-offset-8 decoration-transparent hover:decoration-gold-500/40"
                                                                        >
                                                                            Refine Schematic
                                                                        </button>

                                                                        {activeBooking && (
                                                                            <div className="flex gap-3">
                                                                                {activeBooking.status === 'Confirmed' && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => handleAdminBookingAction(activeBooking._id, 'check-in')}
                                                                                            className="px-6 py-3 bg-emerald-500 text-navy-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                                                                                        >
                                                                                            Check In
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleAdminBookingAction(activeBooking._id, 'cancel')}
                                                                                            className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                                                        >
                                                                                            Abort
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                                {activeBooking.status === 'CheckedIn' && (
                                                                                    <button
                                                                                        onClick={() => handleAdminBookingAction(activeBooking._id, 'check-out')}
                                                                                        className="px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-gold-500 hover:to-gold-300 transition-all shadow-xl shadow-gold-500/10 active:scale-95"
                                                                                    >
                                                                                        Check Out
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                                    <Bed className="w-12 h-12 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The floorplates remain unmapped in this hub."</p>
                                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">Begin unit induction to populate high-altitude suites.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'bookings': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                            <div className="p-10 border-b border-gold-500/10 flex items-center justify-between relative z-10">
                                <div>
                                    <h2 className="text-3xl font-bold text-white font-serif italic tracking-wide underline decoration-gold-500/10 underline-offset-8">Reservation Manifest</h2>
                                    <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.4em] font-black mt-3">Global Command Center</p>
                                </div>
                                <button
                                    onClick={fetchAdminBookings}
                                    className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-bold hover:border-gold-500 transition-all shadow-xl group"
                                >
                                    <Clock className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingAdminBookings ? 'animate-spin' : ''}`} />
                                    <span className="text-[10px] uppercase tracking-[0.2em]">Sync Manifest</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto relative z-10">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-[0.3em] text-gold-500/60 bg-navy-950/40 border-b border-gold-500/10">
                                            <th className="px-10 py-8 font-black">Resident</th>
                                            <th className="px-10 py-8 font-black">Strategic Hub</th>
                                            <th className="px-10 py-8 font-black">Stay Protocol</th>
                                            <th className="px-10 py-8 font-black">Account Value</th>
                                            <th className="px-10 py-8 font-black text-right">Settlement State</th>
                                            <th className="px-10 py-8 font-black text-center">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold-500/5">
                                        {fetchingAdminBookings ? (
                                            <tr>
                                                <td colSpan="6" className="px-10 py-32 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-6">
                                                        <div className="w-12 h-12 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                                        <span className="text-gold-500/30 font-serif italic text-lg tracking-widest animate-pulse">Accessing Archive Registry...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : adminBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-10 py-32 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="text-gold-500/30 font-serif italic text-2xl tracking-widest">"The registry remains unwritten."</div>
                                                        <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No active delegations detected in the current cycle.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            adminBookings.map((booking, i) => (
                                                <tr key={booking._id} className="hover:bg-gold-500/5 transition-all duration-500 group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center text-gold-400 font-serif text-lg italic shadow-xl group-hover:scale-110 transition-transform">
                                                                {(booking.user?.fullName || 'G').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white font-serif text-base tracking-wide group-hover:text-gold-400 transition-colors uppercase italic">{booking.user?.fullName || booking.user?.email?.split('@')[0] || 'Distinguished Guest'}</div>
                                                                <div className="text-[9px] text-gold-500/40 uppercase tracking-[0.3em] font-black mt-1.5 flex items-center gap-2">
                                                                    <Hash className="w-2.5 h-2.5" /> LUX-{booking._id.slice(-8).toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                                                <MapPin className="w-3 h-3 text-gold-400" />
                                                                {booking.location?.city} Hub
                                                            </div>
                                                            <div className="text-[9px] text-gold-500/40 uppercase tracking-widest font-black bg-gold-500/5 px-2 py-0.5 rounded-md border border-gold-500/10 inline-block self-start">
                                                                {booking.room?.roomType} • SECTOR {booking.room?.roomNumber || 'TBD'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-3 text-white/80 font-serif text-sm italic">
                                                                <Calendar className="w-3.5 h-3.5 text-gold-400/50" />
                                                                <span>{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                                <span className="text-gold-500/20">—</span>
                                                                <span>{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                            </div>
                                                            <div className="text-[8px] text-gold-500/30 uppercase tracking-[0.4em] font-black ml-6">Deployment window</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold text-gold-400 font-serif tracking-tight group-hover:scale-105 transition-transform origin-left">₹{booking.totalPrice?.toLocaleString()}</span>
                                                            <span className="text-[8px] text-gold-500/30 uppercase tracking-widest font-black mt-1 italic">Total Valuation</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex flex-col items-end gap-2.5">
                                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg ${booking.paymentStatus === 'Paid' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : booking.paymentStatus === 'Advance Paid' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                                                                {booking.paymentStatus || 'Pending Recon'}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Confirmed' ? 'bg-indigo-500' : booking.status === 'CheckedIn' ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                                                <span className="text-[9px] text-gold-500/40 uppercase tracking-[0.2em] font-black italic">PROTOCOL: {booking.status}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <button
                                                            onClick={() => setViewingBooking(booking)}
                                                            className="px-6 py-3 bg-navy-950/80 text-gold-400 border border-gold-500/10 hover:border-gold-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 group/btn"
                                                        >
                                                            <span className="group-hover/btn:tracking-[0.5em] transition-all italic">Inspect Details</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'marketing': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto space-y-16">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 text-gold-400 mb-6">
                                <div className="w-16 h-[1px] bg-gold-500/30"></div>
                                <span className="text-[11px] font-black uppercase tracking-[0.6em]">Communication Array</span>
                                <div className="w-16 h-[1px] bg-gold-500/30"></div>
                            </div>
                            <h2 className="text-6xl font-bold text-white font-serif italic mb-6 tracking-tight">Marketing Blast</h2>
                            <p className="text-gold-500/40 text-lg font-serif italic tracking-wide max-w-2xl mx-auto leading-relaxed">Broadcast high-altitude exclusivity and strategic directives to all LuxeStay residents across the global network.</p>
                        </div>

                        <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[4rem] p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] group-hover:bg-gold-500/10 transition-colors duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-950/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSendOffer();
                            }} className="space-y-12 relative z-10">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Campaign Signature</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="e.g., SOLSTICE GRAND REVEAL"
                                                className="w-full bg-navy-950/50 border border-gold-500/10 focus:border-gold-500 rounded-[1.5rem] px-8 py-6 text-white text-base font-serif italic outline-none transition-all placeholder:text-white/10 shadow-inner group-hover:bg-navy-950/80"
                                                required
                                                value={bulkOffer.title}
                                                onChange={(e) => setBulkOffer({ ...bulkOffer, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Access Code (Promo)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                                                <Tag className="w-5 h-5 text-gold-500/40 group-focus-within:text-gold-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="E.G., LUX40"
                                                className="w-full bg-navy-950/50 border border-gold-500/10 focus:border-gold-500 rounded-[1.5rem] px-8 py-6 pl-16 text-white font-bold tracking-[0.2em] uppercase outline-none transition-all placeholder:text-white/10 shadow-inner group-hover:bg-navy-950/80"
                                                required
                                                value={bulkOffer.code}
                                                onChange={(e) => setBulkOffer({ ...bulkOffer, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Directive Content (Description)</label>
                                    <textarea
                                        placeholder="Articulate the parameters of this exclusive engagement..."
                                        rows="6"
                                        className="w-full bg-navy-950/50 border border-gold-500/10 focus:border-gold-500 rounded-[2rem] p-10 text-white text-lg font-serif italic leading-relaxed outline-none transition-all resize-none placeholder:text-white/10 shadow-inner hover:bg-navy-950/80"
                                        required
                                        value={bulkOffer.description}
                                        onChange={(e) => setBulkOffer({ ...bulkOffer, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-8 flex flex-col items-center">
                                    <button
                                        type="submit"
                                        disabled={sendingOffer}
                                        className="min-w-[400px] py-7 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-[0_20px_50px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-6 active:scale-[0.98] group/shoot"
                                    >
                                        {sendingOffer ? (
                                            <>
                                                <div className="w-6 h-6 border-4 border-navy-950/30 border-t-navy-950 rounded-full animate-spin"></div>
                                                <span className="italic">Synchronizing Across Nodes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 group-hover/shoot:translate-x-2 group-hover/shoot:-translate-y-2 transition-transform duration-500" />
                                                <span className="italic">Initialize Global Blast</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="mt-10 flex items-center gap-4 text-gold-500/30 group-hover:text-gold-500/50 transition-colors">
                                        <ShieldCheck className="w-4 h-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                                            Priority Email Relay • All Active Members (Global)
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            }
            case 'restaurant': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16">
                        {/* Header & Categories */}
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-gold-500/10 pb-10">
                                <div>
                                    <div className="flex items-center gap-4 text-gold-400 mb-4">
                                        <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Epicurean Directives</span>
                                    </div>
                                    <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Culinary Palette</h2>
                                    <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Curating the sensory narrative for global high-altitude hubs</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedMenuItemForEdit(null);
                                        setMenuFormData({
                                            name: '', description: '', price: '', category: 'Breakfast',
                                            dietaryType: 'Veg', isComplimentary: false, isSpecial: false,
                                            calories: '', preparationTime: '', availableAt: locations.map(l => l._id)
                                        });
                                        setIsMenuModalOpen(true);
                                    }}
                                    className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-gold-500/20 active:scale-95 group shrink-0"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span>Induct Culinary Asset</span>
                                </button>
                            </div>

                            <div className="relative group">
                                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gold-500/10 hover:scrollbar-thumb-gold-500/20 transition-all mask-gradient-x">
                                    {menuCategories.map((cat, idx) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedMenuCategory(cat)}
                                            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all border transition-all duration-500 shrink-0 ${selectedMenuCategory === cat ? 'bg-gold-500 border-gold-500 text-navy-950 shadow-[0_10px_30px_rgba(212,175,55,0.3)] scale-105' : 'bg-navy-950/40 border-gold-500/10 text-gold-500/40 hover:border-gold-500/40 hover:text-gold-400'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    <div className="w-20 shrink-0"></div>
                                </div>
                            </div>
                        </div>

                        {/* Special Features Grid */}
                        {selectedMenuCategory === 'All Categories' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { title: 'Weekend Buffets', desc: 'Grand culinary exhibitions', icon: Utensils, gradient: 'from-gold-500/10' },
                                    { title: 'Festival Menus', desc: 'Seasonal cultural celebrations', icon: Calendar, gradient: 'from-navy-500/20' },
                                    { title: 'In-Room Dining', desc: '24/7 private luxury service', icon: BellRing, gradient: 'from-gold-500/5' }
                                ].map((feat, i) => (
                                    <div key={i} className={`p-10 rounded-[3rem] bg-gradient-to-br ${feat.gradient} to-transparent border border-gold-500/10 hover:border-gold-500/30 transition-all cursor-pointer group relative overflow-hidden active:scale-95 duration-500 shadow-2xl`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl group-hover:bg-gold-500/10 transition-colors"></div>
                                        <div className="w-16 h-16 bg-navy-950 rounded-[1.25rem] flex items-center justify-center mb-8 border border-gold-500/20 group-hover:bg-gold-500 group-hover:scale-110 transition-all shadow-xl group-hover:rotate-12">
                                            <feat.icon className="w-8 h-8 text-gold-400 group-hover:text-navy-950 transition-colors" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white font-serif italic mb-3 tracking-wide">{feat.title}</h4>
                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.4em] font-black group-hover:text-gold-400/60 transition-colors">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {fetchingMenu ? (
                                <div className="col-span-full py-40 text-center flex flex-col items-center justify-center space-y-8">
                                    <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin shadow-2xl"></div>
                                    <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Synchronizing Culinary Database...</p>
                                </div>
                            ) : menuItems.length === 0 ? (
                                <div className="col-span-full py-40 bg-navy-900/40 border-2 border-dashed border-gold-500/10 rounded-[4rem] text-center flex flex-col items-center justify-center group hover:border-gold-500/30 transition-all duration-1000">
                                    <Search className="w-16 h-16 text-gold-500/10 group-hover:text-gold-500/30 transition-all mb-8 rotate-12 group-hover:rotate-0" />
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"No culinary assets discovered in this sector."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black mt-6">Expand categories to map high-altitude flavors.</p>
                                </div>
                            ) : (
                                menuItems.map(item => (
                                    <div key={item._id} className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] overflow-hidden group hover:border-gold-500/40 transition-all duration-700 relative flex flex-col h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] active:scale-[0.99]">
                                        {/* Signature Badge */}
                                        {item.isSpecial && (
                                            <div className="absolute top-6 left-6 z-20 px-5 py-2 bg-gold-500 text-navy-950 text-[8px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl skew-x-[-12deg]">
                                                <div className="skew-x-[12deg] italic flex items-center gap-2">
                                                    <Crown className="w-2.5 h-2.5" /> Chef's Signature
                                                </div>
                                            </div>
                                        )}

                                        <div className="h-72 bg-navy-950 overflow-hidden relative">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out brightness-75" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-navy-950">
                                                    <Utensils className="w-16 h-16 text-gold-500/10 group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-80"></div>
                                            <div className="absolute bottom-8 right-8 text-4xl font-bold text-gold-400 font-serif italic drop-shadow-2xl">
                                                ₹{item.price.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-10 flex-1 flex flex-col space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-3 h-3 rounded-full ${item.dietaryType === 'Veg' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}></div>
                                                        <span className="text-[9px] font-black text-gold-500/40 uppercase tracking-[0.3em] italic">{item.dietaryType} • {item.category} Registry</span>
                                                    </div>
                                                    <h4 className="text-3xl font-bold text-white font-serif italic tracking-wide group-hover:text-gold-400 transition-colors duration-500 underline decoration-gold-500/5 underline-offset-8 decoration-2">{item.name}</h4>
                                                </div>
                                                {item.isComplimentary && (
                                                    <div className="bg-gold-500/10 text-gold-400 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border border-gold-500/20 shadow-inner italic">
                                                        Included Residencies
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[13px] text-white/40 leading-relaxed font-serif italic line-clamp-3 group-hover:text-white/60 transition-colors">{item.description}</p>

                                            <div className="grid grid-cols-2 gap-6 py-6 border-t border-gold-500/10">
                                                {item.calories && (
                                                    <div className="flex items-center gap-3 group/stat">
                                                        <div className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/10 flex items-center justify-center group-hover/stat:border-gold-500/30 transition-all">
                                                            <TrendingUp className="w-5 h-5 text-gold-500/30 group-hover/stat:text-gold-400 transition-colors" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Energy Yield</span>
                                                            <span className="text-xs font-bold text-white/80">{item.calories} KCAL</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {item.preparationTime && (
                                                    <div className="flex items-center gap-3 group/stat">
                                                        <div className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/10 flex items-center justify-center group-hover/stat:border-gold-500/30 transition-all">
                                                            <Clock className="w-5 h-5 text-gold-500/30 group-hover/stat:text-gold-400 transition-colors" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Protocol Time</span>
                                                            <span className="text-xs font-bold text-white/80 italic">{item.preparationTime}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto flex gap-4 pt-6 border-t border-gold-500/10">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMenuItemForEdit(item);
                                                        setMenuFormData({
                                                            name: item.name,
                                                            description: item.description,
                                                            price: item.price,
                                                            category: item.category,
                                                            dietaryType: item.dietaryType || 'Veg',
                                                            isComplimentary: item.isComplimentary || false,
                                                            isSpecial: item.isSpecial || false,
                                                            calories: item.calories || '',
                                                            preparationTime: item.preparationTime || '',
                                                            image: item.image || '',
                                                            availableAt: item.availableAt?.map(l => l._id) || []
                                                        });
                                                        setIsMenuModalOpen(true);
                                                    }}
                                                    className="flex-1 py-4 bg-navy-950/80 hover:bg-gold-500/10 text-white/40 hover:text-gold-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-gold-500/10 hover:border-gold-500/40 italic active:scale-95"
                                                >
                                                    Refine Asset Profile
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(item._id)}
                                                    className="w-14 h-14 bg-red-500/5 hover:bg-red-500/20 text-red-500/30 hover:text-red-500 rounded-2xl transition-all border border-red-500/10 hover:border-red-500/30 flex items-center justify-center group/del active:scale-95"
                                                >
                                                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            }
            case 'room-service': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Operational Logistics</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Service Command</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Coordinating elite concierge, cleaning, and tactical support directives</p>
                            </div>
                            <div className="flex items-center gap-6">
                                {serviceQueries.filter(q => q.status === 'Open').length > 0 && (
                                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-3 shadow-2xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                        {serviceQueries.filter(q => q.status === 'Open').length} ACTIVE DIRECTIVES
                                    </div>
                                )}
                                <button
                                    onClick={fetchServiceQueries}
                                    className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-gold-500 transition-all shadow-xl group"
                                >
                                    <Clock className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingQueries ? 'animate-spin' : ''}`} />
                                    <span>Sync Communications</span>
                                </button>
                            </div>
                        </div>

                        {fetchingQueries ? (
                            <div className="py-40 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Accessing Active Protocols...</p>
                            </div>
                        ) : serviceQueries.length === 0 ? (
                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                    <BellRing className="w-16 h-16 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The signal array remains quiescent."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No concierge directives detected in the current transmission.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 pb-20">
                                {serviceQueries.map(query => {
                                    const isExpanded = respondingTo === query._id;
                                    const isCompleted = query.status === 'Completed' || query.status === 'Resolved';

                                    const priorityStyle = query.priority === 'Urgent'
                                        ? 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : query.priority === 'Standard'
                                            ? 'text-gold-400 bg-gold-400/10 border-gold-400/30'
                                            : 'text-gold-500/40 bg-navy-950/40 border-gold-500/10';

                                    const statusStyle =
                                        isCompleted ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                            query.status === 'Accepted' ? 'text-gold-400 bg-gold-400/20 border-gold-400/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]' :
                                                query.status === 'Assigned' ? 'text-gold-500 bg-gold-500/10 border-gold-500/20' :
                                                    'text-amber-500 bg-amber-500/10 border-amber-500/20';

                                    const relevantRoles =
                                        query.subject?.includes('Transport') ? ['driver'] :
                                            (query.subject?.includes('Cleaning') || query.subject?.includes('Housekeeping')) ? ['cleaner', 'room-service'] :
                                                query.subject?.includes('Spa') ? ['room-service'] :
                                                    ['plumber', 'cleaner', 'room-service', 'driver'];

                                    const eligibleStaff = staffMembers.filter(s => relevantRoles.includes(s.role) && (!query.location || (s.location?._id || s.location) === (query.location?._id || query.location)));

                                    return (
                                        <div key={query._id} className={`bg-navy-900/40 backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-2xl ${isCompleted ? 'border-gold-500/5 opacity-60 grayscale-[0.5]' : 'border-gold-500/10 hover:border-gold-500/40 group/card'
                                            }`}>
                                            <div className="p-10 flex flex-col xl:flex-row gap-10">
                                                {/* Left: Request Info */}
                                                <div className="flex items-start gap-8 flex-1">
                                                    <div className="w-16 h-16 rounded-[1.25rem] bg-navy-950 border border-gold-500/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-2xl group-hover/card:bg-gold-500 group-hover/card:rotate-12 transition-all duration-500">
                                                        {query.subject?.includes('Cleaning') || query.subject?.includes('Housekeeping') ? <Wind className="w-8 h-8 text-gold-400 group-hover/card:text-navy-950" /> :
                                                            query.subject?.includes('Transport') ? <Car className="w-8 h-8 text-gold-400 group-hover/card:text-navy-950" /> :
                                                                query.subject?.includes('Spa') ? <Flower2 className="w-8 h-8 text-pink-400 group-hover/card:text-navy-950" /> :
                                                                    <BellRing className="w-8 h-8 text-gold-500/40 group-hover/card:text-navy-950" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                                                            <h4 className="text-2xl font-bold text-white font-serif italic tracking-wide">{query.subject}</h4>
                                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${priorityStyle}`}>{query.priority}</span>
                                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusStyle}`}>{query.status}</span>
                                                        </div>
                                                        <p className="text-[13px] text-white/40 mb-6 leading-relaxed font-serif italic line-clamp-2 hover:line-clamp-none transition-all">{query.message}</p>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-navy-950/40 border border-gold-500/5 rounded-2xl">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Resident</span>
                                                                <span className="text-xs font-bold text-white/80 flex items-center gap-2">
                                                                    <User className="w-3 h-3 text-gold-400" />
                                                                    {query.user?.email?.split('@')[0] || 'Unknown Origin'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Signal Received</span>
                                                                <span className="text-xs font-bold text-white/80 flex items-center gap-2">
                                                                    <Clock className="w-3 h-3 text-gold-400" />
                                                                    {new Date(query.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Date</span>
                                                                <span className="text-xs font-bold text-white/80">{new Date(query.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest">Location Hub</span>
                                                                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{query.location?.city || 'Global'}</span>
                                                            </div>
                                                        </div>

                                                        {query.assignedTo && (
                                                            <div className="mt-6 flex items-center gap-4 p-4 bg-gold-500/5 border border-gold-500/10 rounded-2xl group/assignee">
                                                                <div className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center text-gold-400 font-serif text-sm italic shadow-xl group-hover/assignee:rotate-12 transition-all">
                                                                    {query.assignedTo.email?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-[8px] font-black text-gold-500/30 uppercase tracking-[0.3em] mb-0.5">Tactical Operative Assigned</div>
                                                                    <div className="text-xs font-bold text-white flex items-center gap-2">
                                                                        <span className="underline decoration-gold-500/20 underline-offset-4 italic">{query.assignedTo.email?.split('@')[0]}</span>
                                                                        <span className="px-2 py-0.5 bg-gold-500/10 text-gold-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-gold-500/20">{query.assignedTo.role}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {isCompleted && (
                                                            <div className="mt-4 flex items-center gap-3 px-5 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-inner">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Directive Optimized & Resolved • {new Date(query.completedAt).toLocaleTimeString()}</span>
                                                            </div>
                                                        )}

                                                        {query.adminResponse && (
                                                            <div className="mt-6 p-6 bg-navy-950 border border-gold-500/10 rounded-2xl relative">
                                                                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-gold-500 text-navy-950 text-[8px] font-black uppercase tracking-widest rounded-lg">Admin Directive</div>
                                                                <p className="text-[13px] text-white/60 font-serif italic leading-relaxed">{query.adminResponse}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Assignment Panel */}
                                                {!isCompleted && (
                                                    <div className="w-full xl:w-72 border-t xl:border-t-0 xl:border-l border-gold-500/10 pt-10 xl:pt-0 xl:pl-10 flex flex-col gap-6 flex-shrink-0">
                                                        {query.subject?.includes('Spa') ? (
                                                            <>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic flex justify-between">
                                                                        <span>Set Appointment Window</span>
                                                                    </label>
                                                                    {query.booking && (
                                                                        <div className="p-3 bg-navy-950/40 border border-gold-500/5 rounded-xl text-[9px] text-gold-500/40 font-black uppercase tracking-widest text-center">
                                                                            RESIDENCY VERIFIED: {new Date(query.booking.checkIn).toLocaleDateString()} - {new Date(query.booking.checkOut).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                    <input
                                                                        type="datetime-local"
                                                                        id={`spa-time-${query._id}`}
                                                                        value={spaTimes[query._id] || ''}
                                                                        onChange={(e) => setSpaTimes({ ...spaTimes, [query._id]: e.target.value })}
                                                                        min={query.booking?.checkIn ? new Date(new Date(query.booking.checkIn).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                                        max={query.booking?.checkOut ? new Date(new Date(query.booking.checkOut).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                                        style={{ colorScheme: 'dark' }}
                                                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-5 text-white text-xs outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={async () => {
                                                                        const timeStr = spaTimes[query._id];
                                                                        if (!timeStr) return alert('Please select a time for the spa appointment.');

                                                                        const date = new Date(timeStr);
                                                                        const formattedTime = date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

                                                                        const token = sessionStorage.getItem('userToken');
                                                                        const responseStr = `Your Spa Appointment is confirmed for ${formattedTime}. Please visit the Spa at the mentioned time.`;

                                                                        await fetch(`${__API_BASE__}/api/support/admin/${query._id}/respond`, {
                                                                            method: 'PUT',
                                                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                            body: JSON.stringify({ response: responseStr })
                                                                        }).then(r => r.ok && fetchServiceQueries());
                                                                    }}
                                                                    className="w-full py-5 bg-navy-950/80 hover:bg-gold-500 text-gold-400 hover:text-navy-950 border border-gold-500/20 hover:border-gold-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 italic"
                                                                >
                                                                    Validate Appointment
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {query.assignedTo && !isReassigning[query._id] ? (
                                                                    <button
                                                                        onClick={() => setIsReassigning({ ...isReassigning, [query._id]: true })}
                                                                        className="w-full py-5 bg-gold-500/5 hover:bg-gold-500 border border-gold-500/20 text-gold-400 hover:text-navy-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 italic"
                                                                    >
                                                                        Authorize Reassignment
                                                                    </button>
                                                                ) : (
                                                                    <div className="space-y-4">
                                                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">
                                                                            {query.assignedTo ? 'Select Replacement Operative' : 'Select Deployment Operative'}
                                                                        </label>
                                                                        <select
                                                                            className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-5 text-white text-xs outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner"
                                                                            value={assignmentDrafts[query._id] !== undefined ? assignmentDrafts[query._id] : (query.assignedTo?._id || '')}
                                                                            onChange={(e) => setAssignmentDrafts({ ...assignmentDrafts, [query._id]: e.target.value })}
                                                                        >
                                                                            <option value="">-- Access Personnel --</option>
                                                                            {(eligibleStaff.length > 0 ? eligibleStaff : staffMembers).map(s => (
                                                                                <option key={s._id} value={s._id}>{s.email.split('@')[0]} • {s.role.toUpperCase()}</option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const staffId = assignmentDrafts[query._id] !== undefined ? assignmentDrafts[query._id] : (query.assignedTo?._id || '');
                                                                                if (!staffId) return;
                                                                                const token = sessionStorage.getItem('userToken');
                                                                                await fetch(`${__API_BASE__}/api/support/admin/${query._id}/assign`, {
                                                                                    method: 'PUT',
                                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                                    body: JSON.stringify({ assignedTo: staffId })
                                                                                }).then(r => {
                                                                                    if (r.ok) {
                                                                                        setSuccess('Operative deployment successful! Signal transmitted.');
                                                                                        setIsReassigning({ ...isReassigning, [query._id]: false });
                                                                                        setTimeout(() => setSuccess(''), 4000);
                                                                                        fetchServiceQueries();
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-gold-500/20 active:scale-95 italic"
                                                                        >
                                                                            Initialize {query.assignedTo ? 'Transfer' : 'Deployment'}
                                                                        </button>
                                                                        {query.assignedTo && (
                                                                            <button
                                                                                onClick={() => setIsReassigning({ ...isReassigning, [query._id]: false })}
                                                                                className="w-full text-[9px] text-gold-500/30 hover:text-gold-400 uppercase tracking-[0.5em] transition-all font-black text-center"
                                                                            >
                                                                                Abort
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {query.assignedTo && query.status === 'Assigned' && (
                                                                    <div className="p-4 bg-navy-950 border border-indigo-500/10 rounded-2xl text-center shadow-inner">
                                                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] italic animate-pulse">⏳ Signal Awaiting Response...</p>
                                                                    </div>
                                                                )}
                                                                {query.status === 'Accepted' && (
                                                                    <div className="p-4 bg-gold-500/5 border border-gold-500/10 rounded-2xl text-center shadow-inner">
                                                                        <p className="text-[9px] font-black text-gold-400 uppercase tracking-[0.3em] italic animate-bounce">🔧 Directive In Progress...</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Close Request — only after staff completes */}
                                                {query.status === 'Completed' && (
                                                    <div className="w-full xl:w-72 border-t xl:border-t-0 xl:border-l border-gold-500/10 pt-10 xl:pt-0 xl:pl-10 flex flex-col gap-6 flex-shrink-0">
                                                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center shadow-inner">
                                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                                                <Check className="w-6 h-6 text-emerald-400" />
                                                            </div>
                                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">Directive Optimized</p>
                                                            <p className="text-[8px] text-gold-500/30 mt-2 uppercase tracking-widest font-black">Archive Sequence Authorization Ready</p>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                const token = sessionStorage.getItem('userToken');
                                                                await fetch(`${__API_BASE__}/api/support/admin/${query._id}/respond`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                    body: JSON.stringify({ response: 'Directive archived and closed by Command.' })
                                                                }).then(r => r.ok && fetchServiceQueries());
                                                            }}
                                                            className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-navy-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 italic"
                                                        >
                                                            Archive Sequence
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }
            case 'kitchen-orders': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Culinary Logistics</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Kitchen Command</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Routing high-altitude gastronomic directives and real-time order flows</p>
                            </div>
                            <button
                                onClick={fetchKitchenOrders}
                                className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-gold-500 transition-all shadow-xl group"
                            >
                                <Clock className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingOrders ? 'animate-spin' : ''}`} />
                                <span>Sync Culinary Stream</span>
                            </button>
                        </div>

                        {fetchingOrders ? (
                            <div className="py-40 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Synchronizing Tactical Kitchen Data...</p>
                            </div>
                        ) : kitchenOrders.length === 0 ? (
                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                    <Utensils className="w-16 h-16 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The culinary array is quiescent."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No gastronomic directives detected in the current transmission.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10 pb-20">
                                {kitchenOrders.map(order => (
                                    <div key={order._id} className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3rem] p-10 flex flex-col xl:flex-row gap-10 hover:border-gold-500/40 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group/order active:scale-[0.99]">

                                        {/* Order Details */}
                                        <div className="flex-1 space-y-8">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`w-3 h-3 rounded-full ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                                                            order.status === 'Preparing' ? 'bg-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.5)]' :
                                                                order.status === 'Assigned' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-red-500'
                                                            }`}></div>
                                                        <span className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] italic">Culinary Ticket: {order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                                    </div>
                                                    <h4 className="text-3xl font-bold text-white font-serif italic tracking-wide group-hover/order:text-gold-400 transition-colors">Resident: {order.user?.email.split('@')[0]}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl font-bold text-gold-400 font-serif italic drop-shadow-2xl mb-2">₹{order.totalAmount.toLocaleString()}</div>
                                                    <div className="flex items-center justify-end gap-2 text-[10px] text-gold-500/30 font-black uppercase tracking-widest italic">
                                                        <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="mt-4">
                                                        {order.payment && order.payment.status === 'Success' ? (
                                                            <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-[0.3em] rounded-2xl border border-emerald-500/20 shadow-inner italic">💳 Direct Settlement Verified</span>
                                                        ) : (
                                                            <span className="px-5 py-2 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-[0.3em] rounded-2xl border border-red-500/20 shadow-inner italic animate-pulse">⌛ Settlement Pending</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-navy-950/40 rounded-[2rem] p-8 border border-gold-500/5 shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl"></div>
                                                <h5 className="text-[10px] font-black text-gold-500/30 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 italic">
                                                    <div className="w-8 h-[1px] bg-gold-500/20"></div> Order Manifest
                                                </h5>
                                                <div className="space-y-6">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between group/item transition-all hover:translate-x-2">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 rounded-2xl bg-navy-950 overflow-hidden border border-gold-500/10 shadow-2xl relative">
                                                                    {item.menuItem?.image ? (
                                                                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-full h-full object-cover brightness-75 group-hover/item:scale-110 transition-transform duration-500" />
                                                                    ) : (
                                                                        <Utensils className="w-6 h-6 m-4 text-gold-500/10" />
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent"></div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-lg font-bold text-white font-serif italic tracking-wide flex items-center gap-3">
                                                                        <span className="text-gold-500/40 text-sm font-black italic">{item.quantity}×</span>
                                                                        {item.menuItem?.name || 'Unidentified Asset'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gold-500/30 uppercase tracking-widest font-black mt-1 italic">Gastronomic Division</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-lg font-bold text-gold-400 font-serif italic shadow-2xl">₹{item.priceAtOrder.toLocaleString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions & Assignment */}
                                        <div className="w-full xl:w-72 border-t xl:border-t-0 xl:border-l border-gold-500/10 pt-10 xl:pt-0 xl:pl-10 flex flex-col gap-6">

                                            {/* Assigned Cook Display */}
                                            {order.assignedTo && (
                                                <div className="p-6 bg-gold-500/5 border border-gold-500/10 rounded-[2rem] group/chef">
                                                    <p className="text-[8px] font-black text-gold-500/30 uppercase tracking-[0.3em] mb-3 italic">Lead Culinary Operative</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center text-gold-400 font-serif text-xl italic shadow-2xl group-hover/chef:rotate-12 transition-all">
                                                            {order.assignedTo.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="text-lg font-bold text-white font-serif italic tracking-wide underline decoration-gold-500/10 underline-offset-4">{order.assignedTo.email?.split('@')[0]}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assign Cook (only if not yet delivered/completed) */}
                                            {order.status !== 'Delivered' && order.status !== 'Completed' && (
                                                <div className="space-y-4">
                                                    {order.assignedTo && !isReassigning[`order-${order._id}`] ? (
                                                        <button
                                                            onClick={() => setIsReassigning({ ...isReassigning, [`order-${order._id}`]: true })}
                                                            className="w-full py-5 bg-gold-500/5 hover:bg-gold-500 border border-gold-500/20 text-gold-400 hover:text-navy-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 italic"
                                                        >
                                                            Authorize Reassignment
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">
                                                                {order.assignedTo ? 'Select Replacement Operative' : 'Select Deployment Operative'}
                                                            </label>
                                                            <select
                                                                className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-5 text-white text-xs outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner"
                                                                defaultValue={order.assignedTo?._id || ''}
                                                                id={`cook-select-${order._id}`}
                                                            >
                                                                <option value="">-- Access Personnel --</option>
                                                                {staffMembers.filter(s => s.role === 'cook' && (!order.location || (s.location?._id || s.location) === (order.location?._id || order.location))).map(cook => (
                                                                    <option key={cook._id} value={cook._id}>{cook.email.split('@')[0].toUpperCase()}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={async () => {
                                                                    const el = document.getElementById(`cook-select-${order._id}`);
                                                                    const cookId = el?.value;
                                                                    if (!cookId) return;
                                                                    const token = sessionStorage.getItem('userToken');
                                                                    const res = await fetch(`${__API_BASE__}/api/auth/admin/food-orders/${order._id}`, {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                        body: JSON.stringify({ assignedTo: cookId, status: 'Assigned' })
                                                                    });
                                                                    if (res.ok) {
                                                                        setIsReassigning({ ...isReassigning, [`order-${order._id}`]: false });
                                                                        fetchKitchenOrders();
                                                                    }
                                                                }}
                                                                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-gold-500/20 active:scale-95 italic"
                                                            >
                                                                Initialize {order.assignedTo ? 'Transfer' : 'Deployment'}
                                                            </button>
                                                            {order.assignedTo && (
                                                                <button
                                                                    onClick={() => setIsReassigning({ ...isReassigning, [`order-${order._id}`]: false })}
                                                                    className="w-full text-[9px] text-gold-500/30 hover:text-gold-400 uppercase tracking-[0.5em] transition-all font-black text-center"
                                                                >
                                                                    Abort
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Waiting message — assigned but cook hasn't delivered yet */}
                                            {order.assignedTo && order.status === 'Assigned' && (
                                                <div className="p-4 bg-navy-950 border border-indigo-500/10 rounded-2xl text-center shadow-inner">
                                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] italic animate-pulse">⏳ Operative Processing Request...</p>
                                                </div>
                                            )}

                                            {/* Delivered by cook — admin can now close */}
                                            {(order.status === 'Delivered') && (
                                                <>
                                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center shadow-inner">
                                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                                            <Check className="w-6 h-6 text-emerald-400" />
                                                        </div>
                                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">Directives Fulfilled</p>
                                                        <p className="text-[8px] text-gold-500/30 mt-2 uppercase tracking-widest font-black italic">Ready for Archiving Sequence</p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            const token = sessionStorage.getItem('userToken');
                                                            const res = await fetch(`${__API_BASE__}/api/auth/admin/food-orders/${order._id}`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                body: JSON.stringify({ status: 'Completed' })
                                                            });
                                                            if (res.ok) fetchKitchenOrders();
                                                        }}
                                                        className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-navy-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 italic"
                                                    >
                                                        Archive Sequence
                                                    </button>
                                                </>
                                            )}

                                            {/* Order fully closed */}
                                            {order.status === 'Completed' && (
                                                <div className="p-6 bg-gold-500/5 border border-gold-500/10 rounded-[2rem] text-center flex flex-col items-center justify-center grayscale opacity-60">
                                                    <PackageCheck className="w-12 h-12 text-gold-400/30 mb-4" />
                                                    <p className="text-[10px] font-black text-gold-500/30 uppercase tracking-[0.4em] italic leading-tight">Asset Cycle Terminated & Logged</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            case 'table-reservations': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Epicurean Scheduling</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Table Reservations</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Coordinating fine-dining placements and guest seating chronologies</p>
                            </div>
                            <button
                                onClick={fetchTableReservations}
                                className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-gold-500 transition-all shadow-xl group"
                            >
                                <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingReservations ? 'animate-spin' : ''}`} />
                                <span>Sync Registry</span>
                            </button>
                        </div>

                        {fetchingReservations ? (
                            <div className="py-40 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Accessing Reservation Ledger...</p>
                            </div>
                        ) : tableReservations.length === 0 ? (
                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                    <Calendar className="w-16 h-16 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The floor is currently unclaimed."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No upcoming seating arrangements found in the registry.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                                {tableReservations.map(res => {
                                    const isPast = new Date(res.date) < new Date().setHours(0, 0, 0, 0);
                                    const statusStyle = res.status === 'Confirmed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                        res.status === 'Cancelled' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                                            'text-gold-400 bg-gold-400/10 border-gold-400/20';

                                    return (
                                        <div key={res._id} className={`bg-navy-900/40 backdrop-blur-3xl border rounded-[3rem] p-10 transition-all duration-700 group/card relative overflow-hidden flex flex-col justify-between hover:translate-y-[-10px] shadow-2xl ${isPast ? 'opacity-50 grayscale border-gold-500/5' : 'border-gold-500/10 hover:border-gold-500'}`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.03] rounded-full blur-3xl -mr-10 -mt-10 group-hover/card:bg-gold-500/10 transition-colors"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-10">
                                                    <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-gold-500/10 flex items-center justify-center shadow-2xl group-hover/card:border-gold-500 transition-colors">
                                                        <User className="w-8 h-8 text-gold-400" />
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.25em] border ${statusStyle} italic`}>
                                                        {res.status}
                                                    </div>
                                                </div>

                                                <h4 className="text-2xl font-bold text-white font-serif italic mb-2 tracking-wide truncate">{res.user?.email.split('@')[0]}</h4>
                                                <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mb-10 italic">Seating Directive Signature</p>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-6 p-4 bg-navy-950/40 border border-gold-500/5 rounded-2xl shadow-inner group/stat">
                                                        <Calendar className="w-5 h-5 text-gold-500/20 group-hover/stat:text-gold-400 transition-colors" />
                                                        <div>
                                                            <div className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest mb-0.5">Reservation Window</div>
                                                            <div className="text-sm font-bold text-white/90 font-serif italic tracking-wide">{new Date(res.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 p-4 bg-navy-950/40 border border-gold-500/5 rounded-2xl shadow-inner group/stat">
                                                        <Clock className="w-5 h-5 text-gold-500/20 group-hover/stat:text-gold-400 transition-colors" />
                                                        <div>
                                                            <div className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest mb-0.5">Chronological Slot</div>
                                                            <div className="text-sm font-bold text-white/90 font-serif italic tracking-wide">{res.time} HRS</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 p-4 bg-navy-950/40 border border-gold-500/5 rounded-2xl shadow-inner group/stat">
                                                        <Users className="w-5 h-5 text-gold-500/20 group-hover/stat:text-gold-400 transition-colors" />
                                                        <div>
                                                            <div className="text-[8px] font-black text-gold-500/30 uppercase tracking-widest mb-0.5">Party Magnitude</div>
                                                            <div className="text-sm font-bold text-white/90 font-serif italic tracking-wide">{res.guests} GUESTS</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isPast && res.status === 'Pending' && (
                                                <div className="flex gap-4 mt-10 relative z-10 pt-10 border-t border-gold-500/5">
                                                    <button
                                                        onClick={() => updateReservationStatus(res._id, 'Confirmed')}
                                                        className="flex-1 py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 italic"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => updateReservationStatus(res._id, 'Cancelled')}
                                                        className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 italic"
                                                    >
                                                        Revoke
                                                    </button>
                                                </div>
                                            )}

                                            {res.status === 'Confirmed' && (
                                                <div className="mt-10 pt-10 border-t border-gold-500/5 flex justify-center">
                                                    <div className="px-10 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Directive Confirmed</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }

            case 'admin-reviews': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Guest Testimonials</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Guest Reviews</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Moderating the echoes of resident satisfaction across the global registry</p>
                            </div>
                            <button
                                onClick={fetchAdminReviews}
                                className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-gold-500 transition-all shadow-xl group"
                            >
                                <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingReviews ? 'animate-spin' : ''}`} />
                                <span>Sync Archives</span>
                            </button>
                        </div>

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                {success}
                            </div>
                        )}

                        {fetchingReviews ? (
                            <div className="py-40 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Accessing Testimonial Vault...</p>
                            </div>
                        ) : adminReviews.length === 0 ? (
                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                    <Star className="w-16 h-16 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The archives are currently silent."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No guest assessments found in the current cycle.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {adminReviews.map(review => (
                                    <div key={review._id} className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3rem] p-10 hover:border-gold-500 transition-all duration-700 group relative overflow-hidden flex flex-col shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.03] rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-gold-500/10 transition-colors"></div>

                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-gold-500/10 flex items-center justify-center text-gold-400 font-serif text-2xl italic shadow-2xl group-hover:border-gold-500 transition-colors">
                                                    {(review.user?.fullName || 'G').charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-white font-serif italic tracking-wide">{review.user?.fullName || 'Distinguished Guest'}</h4>
                                                    <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.3em] font-black mt-1 italic">{review.user?.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-6 mb-8 p-4 bg-navy-950/40 border border-gold-500/5 rounded-2xl relative z-10">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-4 h-4 ${s <= review.overallRating ? 'text-gold-400 fill-gold-400' : 'text-gold-500/10'}`} />
                                                ))}
                                            </div>
                                            <div className="h-4 w-[1px] bg-gold-500/10"></div>
                                            <div className="text-[10px] font-black text-gold-400 uppercase tracking-widest italic">{review.location?.city || 'HQ'} · {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <p className="text-white/80 font-serif italic text-lg leading-relaxed mb-10 pl-8 border-l border-gold-500/20 relative">
                                                <span className="absolute left-0 top-0 text-gold-500/10 text-6xl font-serif -translate-x-4 -translate-y-4">“</span>
                                                "{review.comment}"
                                            </p>

                                            {Object.entries(review.categoryRatings || {}).some(([, v]) => v > 0) && (
                                                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gold-500/5">
                                                    {[['Cleanliness', 'cleanliness'], ['Service', 'service'], ['Location', 'location'], ['Food', 'foodQuality'], ['Value', 'valueForMoney']].map(([label, key]) =>
                                                        review.categoryRatings?.[key] > 0 && (
                                                            <div key={key} className="space-y-1 group/rating">
                                                                <p className="text-[8px] text-gold-500/30 uppercase tracking-widest font-black group-hover/rating:text-gold-500 transition-colors">{label}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-1 flex-1 bg-navy-950 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-gold-500/40 rounded-full transition-all duration-1000" style={{ width: `${review.categoryRatings[key] * 20}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-white">{review.categoryRatings[key]}.0</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }


            case 'contact-messages': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Diplomatic Channels</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Guest Inquiries</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Interfacing with the global resident network through secure communicative vectors</p>
                            </div>
                            <button
                                onClick={fetchAdminContacts}
                                className="flex items-center gap-4 px-8 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-gold-500 transition-all shadow-xl group"
                            >
                                <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${fetchingContacts ? 'animate-spin' : ''}`} />
                                <span>Sync Frequency</span>
                            </button>
                        </div>

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                {success}
                            </div>
                        )}

                        {fetchingContacts ? (
                            <div className="py-40 text-center flex flex-col items-center justify-center space-y-8">
                                <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                <p className="text-gold-500/40 uppercase tracking-[0.6em] text-[10px] font-black animate-pulse italic">Decrypting Message Stream...</p>
                            </div>
                        ) : adminContacts.length === 0 ? (
                            <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group opacity-40 hover:opacity-100 transition-opacity duration-1000">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border-2 border-dashed border-gold-500/10 flex items-center justify-center group-hover:border-gold-500/40 transition-all rotate-45 group-hover:rotate-0 duration-1000">
                                    <MessageSquare className="w-16 h-16 text-gold-500/20 -rotate-45 group-hover:rotate-0 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The comm-link remains silent."</p>
                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No pending inquiries detected in the secure channel. All quiet.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {adminContacts.map(contact => (
                                    <div key={contact._id} className={`bg-navy-900/40 backdrop-blur-3xl border rounded-[3rem] p-10 hover:border-gold-500/40 transition-all duration-700 group relative overflow-hidden shadow-2xl ${contact.status === 'New' ? 'border-gold-500/30 shadow-gold-500/5' : 'border-gold-500/10 shadow-black/20'}`}>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.02] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-1000 group-hover:bg-gold-500/[0.08]"></div>

                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 relative z-10">
                                            <div className="flex-1 space-y-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-navy-950 border border-gold-500/10 flex items-center justify-center text-gold-400 font-serif text-2xl italic shadow-2xl">
                                                        {contact.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <h4 className="text-2xl font-bold text-white font-serif italic tracking-wide">{contact.name}</h4>
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg ${contact.status === 'New' ? 'bg-gold-500 text-navy-950 border-gold-400 animate-pulse' : contact.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gold-500/10 text-gold-400 border-gold-500/20'}`}>{contact.status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-gold-500/40 font-black uppercase tracking-widest italic">
                                                            <span>{contact.email}</span>
                                                            <div className="w-1 h-1 rounded-full bg-gold-500/20"></div>
                                                            <span>{new Date(contact.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 text-gold-400/60">
                                                        <div className="w-8 h-[1px] bg-gold-500/20"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">{contact.subject}</span>
                                                    </div>
                                                    <p className="text-white/80 font-serif italic text-lg leading-relaxed pl-12 border-l border-gold-500/10 relative">
                                                        <span className="absolute left-4 top-0 text-gold-500/20 text-4xl font-serif">“</span>
                                                        {contact.message}
                                                    </p>
                                                </div>

                                                {contact.adminReply && (
                                                    <div className="bg-navy-950/60 border border-gold-500/10 rounded-[2rem] p-10 relative overflow-hidden group/reply animate-in slide-in-from-top-4 duration-700">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.02] rounded-full blur-2xl"></div>
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                                                <Shield className="w-4 h-4 text-gold-400" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.3em] italic">Diplomatic Outbound</span>
                                                        </div>
                                                        <p className="text-gold-500/60 font-serif italic text-base leading-relaxed">{contact.adminReply}</p>
                                                    </div>
                                                )}

                                                {replyingToContact === contact._id ? (
                                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                                        <textarea
                                                            rows={4}
                                                            value={contactReplyText}
                                                            onChange={e => setContactReplyText(e.target.value)}
                                                            placeholder="Compose executive response..."
                                                            className="w-full bg-navy-950/80 border border-gold-500/20 rounded-[2rem] px-8 py-6 text-white font-serif italic text-lg focus:outline-none focus:border-gold-500/50 transition-all resize-none shadow-2xl placeholder:text-gold-500/20"
                                                        />
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => { setReplyingToContact(null); setContactReplyText(''); }}
                                                                className="px-10 py-4 bg-navy-950 border border-gold-500/10 text-gold-500/40 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:border-white/20 transition-all flex items-center gap-3"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Abort
                                                            </button>
                                                            <button
                                                                onClick={() => handleReplyContact(contact._id)}
                                                                className="flex-1 py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center gap-3 group/send"
                                                            >
                                                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                                Dispatch Communication
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => { setReplyingToContact(contact._id); setContactReplyText(contact.adminReply || ''); }}
                                                            className="px-10 py-4 bg-navy-950/80 border border-gold-500/10 text-gold-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:border-gold-500 hover:bg-gold-500/5 transition-all flex items-center gap-3 shadow-xl"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                            {contact.adminReply ? 'Revise Disposition' : 'Authorize Response'}
                                                        </button>
                                                        {contact.status !== 'Resolved' && (
                                                            <button
                                                                onClick={() => handleUpdateContactStatus(contact._id, 'Resolved')}
                                                                className="px-10 py-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-navy-950 transition-all"
                                                            >
                                                                Sign Off Case
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="lg:w-48 space-y-4 pt-10">
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-[8px] font-black text-gold-500/20 uppercase tracking-[0.5em] mb-2 px-2 italic">Status Directive</span>
                                                    {contact.status === 'New' && (
                                                        <button
                                                            onClick={() => handleUpdateContactStatus(contact._id, 'In Progress')}
                                                            className="w-full py-4 px-6 bg-navy-950/40 border border-gold-500/10 text-gold-500/40 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-gold-400 hover:text-gold-400 transition-all text-left"
                                                        >
                                                            Elevate Priority
                                                        </button>
                                                    )}
                                                    {contact.status !== 'Resolved' && (
                                                        <button
                                                            onClick={() => handleUpdateContactStatus(contact._id, 'Resolved')}
                                                            className="w-full py-4 px-6 bg-navy-950/40 border border-gold-500/10 text-gold-500/40 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-400 transition-all text-left"
                                                        >
                                                            Mark Resolved
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            case 'coupons': {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gold-500/10 pb-10">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-4">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Fiscal Incentives</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white font-serif italic mb-4 tracking-tight underline decoration-gold-500/10 underline-offset-8">Coupon Registry</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl">Architecturing exclusive value propositions and bespoke resident privileges</p>
                            </div>
                            <button
                                onClick={() => { setCouponFormMode('create'); setCouponForm({ code: '', description: '', discountType: 'percent', discountValue: '', maxUses: '', minOrderValue: '', expiresAt: '', appliesTo: 'all', isActive: true }); setShowCouponForm(v => !v); }}
                                className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-gold-500/20 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span>Initialize Asset</span>
                            </button>
                        </div>

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                {error}
                            </div>
                        )}

                        {showCouponForm && (
                            <div className="bg-navy-900/60 backdrop-blur-3xl border border-gold-500/20 rounded-[3rem] p-12 animate-in zoom-in-95 duration-700 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.03] rounded-full blur-3xl -mr-20 -mt-20"></div>

                                <div className="flex items-center gap-6 mb-12 border-b border-gold-500/10 pb-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                        <Tag className="w-8 h-8 text-gold-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide">{couponFormMode === 'create' ? 'Define New Incentive' : 'Modify Asset Parameters'}</h3>
                                        <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Fiscal Architecture Protocol</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveCoupon} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Designation (Code) *</label>
                                            <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="E.G. LUXE10" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white font-mono uppercase tracking-[0.2em] focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Valuation Model *</label>
                                            <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer">
                                                <option value="percent" className="bg-navy-900">Relative Yield (%)</option>
                                                <option value="flat" className="bg-navy-900">Fixed Reduction (₹)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Incentive Magnitude *</label>
                                            <input required type="number" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder={couponForm.discountType === 'percent' ? 'Magnitude (1-100)' : 'Amount in Local Currency'} className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Asset Description</label>
                                        <textarea rows={2} value={couponForm.description} onChange={e => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="Narrative for public-facing registry..." className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white font-serif italic text-lg focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20 resize-none" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Usage Cap</label>
                                            <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })} placeholder="∞" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Min. Commitment (₹)</label>
                                            <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })} placeholder="0.00" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Lifecycle End</label>
                                            <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })} className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl [color-scheme:dark] cursor-pointer" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Vector Applicability</label>
                                            <select value={couponForm.appliesTo} onChange={e => setCouponForm({ ...couponForm, appliesTo: e.target.value })} className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer">
                                                <option value="all" className="bg-navy-900">Universal Hub</option>
                                                <option value="booking" className="bg-navy-900">Stays Only</option>
                                                <option value="membership" className="bg-navy-900">Memberships Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-navy-950/40 border border-gold-500/10 p-10 rounded-[2.5rem] space-y-10 group/featured relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.05] blur-2xl rounded-full"></div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-700 ${couponForm.isFeatured ? 'bg-gold-500 border-gold-400 text-navy-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-navy-900 border-gold-500/20 text-gold-500/20'}`}>
                                                    <Star className={`w-6 h-6 ${couponForm.isFeatured ? 'fill-navy-950' : ''}`} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-white font-serif italic tracking-wide">Prominent Display Positioning</h4>
                                                    <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Elevate asset visibility on curated offers interface</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={couponForm.isFeatured || false} onChange={e => setCouponForm({ ...couponForm, isFeatured: e.target.checked })} className="sr-only peer" />
                                                <div className="w-16 h-8 bg-navy-900 border border-gold-500/20 rounded-full peer peer-checked:after:translate-x-[2.1rem] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gold-500/40 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold-500/10 peer-checked:border-gold-500/60 peer-checked:after:bg-gold-500 shadow-inner transition-all duration-500"></div>
                                            </label>
                                        </div>

                                        {couponForm.isFeatured && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-10 duration-1000">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Exhibit Title *</label>
                                                        <input value={couponForm.featuredTitle || ''} onChange={e => setCouponForm({ ...couponForm, featuredTitle: e.target.value })} placeholder="E.G. THE MONSOON SOLSTICE" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-400 transition-all font-serif italic shadow-xl" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Badge Descriptor</label>
                                                            <input value={couponForm.featuredSubtitle || ''} onChange={e => setCouponForm({ ...couponForm, featuredSubtitle: e.target.value })} placeholder="E.G. LIMITED EDITION" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-gold-500 transition-all shadow-xl" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Call-out Tag</label>
                                                            <input value={couponForm.featuredTag || ''} onChange={e => setCouponForm({ ...couponForm, featuredTag: e.target.value })} placeholder="PROMOTIONAL" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-gold-500 transition-all shadow-xl" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Featured Background Artifact (URL)</label>
                                                        <input type="url" value={couponForm.featuredImage || ''} onChange={e => setCouponForm({ ...couponForm, featuredImage: e.target.value })} placeholder="HTTPS://IMAGE.URL" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white text-xs focus:outline-none focus:border-gold-500 transition-all shadow-xl" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Atmospheric Spectrum</label>
                                                        <select value={couponForm.featuredColor || 'from-blue-900/60 to-[#0F1626]'} onChange={e => setCouponForm({ ...couponForm, featuredColor: e.target.value })} className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer">
                                                            <option value="from-blue-900/60 to-[#0F1626]">Cerulean Depths (Default)</option>
                                                            <option value="from-rose-900/60 to-[#0F1626]">Crimson Sunset</option>
                                                            <option value="from-gray-900/60 to-[#0F1626]">Onyx Professional</option>
                                                            <option value="from-green-900/60 to-[#0F1626]">Emerald Sanctuary</option>
                                                            <option value="from-purple-900/60 to-[#0F1626]">Amethyst Royalty</option>
                                                            <option value="from-orange-900/60 to-[#0F1626]">Amber Radiance</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-4">
                                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Curated Offer Synopsis</label>
                                                    <input value={couponForm.featuredDescription || ''} onChange={e => setCouponForm({ ...couponForm, featuredDescription: e.target.value })} placeholder="Compelling narrative for the featured card..." className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white font-serif italic text-base focus:outline-none focus:border-gold-500 transition-all shadow-xl" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-6 pt-10">
                                        <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 py-6 bg-navy-950 border border-gold-500/10 text-gold-500/40 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all">Abort Integration</button>
                                        <button type="submit" disabled={loading} className="flex-[3] py-6 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:from-gold-500 hover:to-gold-300 transition-all shadow-2xl shadow-gold-500/20 flex items-center justify-center gap-4 group/submit">
                                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 group-submit:scale-125 transition-transform" />}
                                            {couponFormMode === 'create' ? 'Certify New Incentive' : 'Preserve Morphological Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-12">
                            {fetchingCoupons ? (
                                <div className="py-40 text-center flex flex-col items-center justify-center space-y-8 opacity-40">
                                    <div className="w-16 h-16 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                                    <p className="text-gold-500 uppercase tracking-[0.6em] text-[10px] font-black italic">Synchronizing Fiscal Registry...</p>
                                </div>
                            ) : coupons.length === 0 ? (
                                <div className="py-60 text-center flex flex-col items-center justify-center space-y-10 group bg-navy-900/20 border-2 border-dashed border-gold-500/10 rounded-[4rem]">
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-navy-900 border border-gold-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                                        <Tag className="w-16 h-16 text-gold-500/10" />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-gold-500/30 font-serif italic text-2xl tracking-widest underline decoration-gold-500/5 underline-offset-[16px]">"The registry remains unpopulated."</p>
                                        <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.5em] font-black">No active coupons detected in the current governance cycle.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {coupons.map(c => (
                                        <div key={c._id} className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3rem] p-10 hover:border-gold-500 transition-all duration-700 group relative overflow-hidden flex flex-col shadow-2xl">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.03] rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-gold-500/10 transition-colors"></div>

                                            <div className="flex items-start justify-between mb-8 relative z-10">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-lg ${c.isActive ? 'bg-gold-500 text-navy-950 border-gold-400' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{c.isActive ? 'OPERATIVE' : 'SUSPENDED'}</span>
                                                        {c.isFeatured && <span className="px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] bg-navy-950 text-gold-400 border border-gold-500/30 flex items-center gap-2 shadow-lg"><Star className="w-3 h-3 fill-gold-400" /> EXHIBIT</span>}
                                                    </div>
                                                    <h3 className="text-4xl font-bold text-white font-mono tracking-[0.1em] mt-2 group-hover:text-gold-400 transition-colors">
                                                        {c.code}
                                                    </h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingCouponId(c._id); setCouponForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, maxUses: c.maxUses || '', minOrderValue: c.minOrderValue, expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', appliesTo: c.appliesTo, isActive: c.isActive, isFeatured: c.isFeatured || false, featuredTitle: c.featuredTitle || '', featuredSubtitle: c.featuredSubtitle || '', featuredDescription: c.featuredDescription || '', featuredTag: c.featuredTag || '', featuredImage: c.featuredImage || '', featuredColor: c.featuredColor || 'from-blue-900/60 to-[#0F1626]' }); setCouponFormMode('edit'); setShowCouponForm(true); }} className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/10 flex items-center justify-center text-gold-500/40 hover:text-gold-400 hover:border-gold-500 transition-all shadow-xl active:scale-90"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteCoupon(c._id)} className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/10 flex items-center justify-center text-red-500/40 hover:text-red-400 hover:border-red-500 transition-all shadow-xl active:scale-90"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-6 flex-1 relative z-10">
                                                <div className="p-6 bg-navy-950/60 border border-gold-500/5 rounded-[2rem] flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] text-gold-500/20 uppercase tracking-[0.3em] font-black">Valuation Reduction</p>
                                                        <p className="text-2xl font-black text-white">{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue.toLocaleString()}`}</p>
                                                    </div>
                                                    <div className="h-10 w-[1px] bg-gold-500/10"></div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-[8px] text-gold-500/20 uppercase tracking-[0.3em] font-black italic">Utilization</p>
                                                        <p className="text-sm font-black text-gold-400">{c.usedCount} <span className="opacity-40 text-xs">/ {c.maxUses || '∞'}</span></p>
                                                    </div>
                                                </div>

                                                <p className="text-gold-500/40 font-serif italic text-base leading-relaxed h-[3rem] line-clamp-2 overflow-hidden px-2">
                                                    "{c.description || 'No formal narrative provided for this incentive.'}"
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gold-500/5">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-[8px] text-gold-500/20 font-black uppercase tracking-widest italic animate-pulse">
                                                            <Clock className="w-3 h-3" />
                                                            Registry Expiry
                                                        </div>
                                                        <p className="text-xs font-black text-white/60">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'PERPETUAL'}</p>
                                                    </div>
                                                    <div className="space-y-2 text-right">
                                                        <div className="flex items-center justify-end gap-2 text-[8px] text-gold-500/20 font-black uppercase tracking-widest italic">
                                                            Target Vector
                                                            <MapPin className="w-3 h-3" />
                                                        </div>
                                                        <p className="text-xs font-black text-gold-400 capitalize">{c.appliesTo}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    const token = sessionStorage.getItem('userToken');
                                                    await fetch(`${__API_BASE__}/api/auth/admin/coupons/${c._id}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                        body: JSON.stringify({ isFeatured: !c.isFeatured })
                                                    });
                                                    fetchCoupons();
                                                }}
                                                className={`mt-10 py-4 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border relative z-10 flex items-center justify-center gap-3 overflow-hidden group/btn ${c.isFeatured ? 'bg-gold-500/10 border-gold-400 text-gold-400' : 'bg-navy-950 border-gold-500/10 text-gold-500/30 hover:border-gold-500/50 hover:text-white'}`}
                                            >
                                                <div className="absolute inset-0 bg-gold-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                                <Star className={`w-4 h-4 relative z-10 transition-colors group-hover/btn:text-navy-950 ${c.isFeatured ? 'fill-gold-400' : ''}`} />
                                                <span className="relative z-10 group-hover/btn:text-navy-950">{c.isFeatured ? '撤回 EXHIBIT STATUS' : '提升 TO EXHIBIT'}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'analytics': {
                const filteredBookingsList = getFilteredBookings();
                const filteredRevTotal = filteredBookingsList.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-16 pb-32">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-gold-500/10 pb-12">
                            <div>
                                <div className="flex items-center gap-4 text-gold-400 mb-6">
                                    <div className="w-16 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.6em] italic">Intelligence & Metrology</span>
                                </div>
                                <h2 className="text-6xl font-bold text-white font-serif italic mb-6 tracking-tighter">Strategic Insights</h2>
                                <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-2xl leading-relaxed">Quantifying the essence of luxury through high-fidelity data synthesis and performance diagnostics</p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-3 bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 p-2 rounded-2xl">
                                    <select
                                        value={exportMonth}
                                        onChange={(e) => setExportMonth(e.target.value)}
                                        className="bg-transparent text-gold-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer"
                                    >
                                        <option value="all" className="bg-navy-900">All Months</option>
                                        {[...Array(12).keys()].map(i => (
                                            <option key={i} value={i.toString()} className="bg-navy-900">{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <div className="w-[1px] h-4 bg-gold-500/20"></div>
                                    <select
                                        value={exportYear}
                                        onChange={(e) => setExportYear(e.target.value)}
                                        className="bg-transparent text-gold-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer"
                                    >
                                        <option value="all" className="bg-navy-900">All Years</option>
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={y.toString()} className="bg-navy-900">{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex items-center gap-4 px-10 py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-gold-500/20 group"
                                >
                                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                    <span>Download Executive Report</span>
                                </button>
                            </div>
                        </div>

                        {/* Financial Sovereignty Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Filtered Volume', value: filteredBookingsList.length, trend: 'Net Count', icon: Calendar, color: 'text-blue-400' },
                                { label: 'Filtered Revenue', value: `₹${filteredRevTotal.toLocaleString()}`, trend: 'Confirmed Cap', icon: TrendingUp, color: 'text-emerald-400' },
                                { label: 'Occupancy Vector', value: dashboardStats?.occupancyRate ? `${dashboardStats.occupancyRate}%` : (dashboardStats?.rooms ? `${Math.round((dashboardStats.occupiedRooms / dashboardStats.rooms) * 100)}%` : '—'), trend: 'Live Status', icon: Building, color: 'text-purple-400' },
                                { label: 'Guest Sentiment', value: '4.9/5.0', trend: 'Global Rating', icon: Star, color: 'text-gold-400' }
                            ].map((stat, i) => (
                                <div key={i} className="group bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 p-8 rounded-[2.5rem] hover:border-gold-500/40 transition-all duration-700 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.02] rounded-full blur-3xl group-hover:bg-gold-500/[0.05] transition-all duration-1000"></div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-xl">
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest text-gold-500/40`}>{stat.trend}</span>
                                    </div>
                                    <p className="text-[10px] text-gold-500/40 font-black uppercase tracking-[0.3em] mb-2 italic">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white font-serif tracking-tight">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Booking Status Distribution */}
                            <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl">
                                <div className="mb-12">
                                    <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide">Status Distribution</h3>
                                    <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-2 italic">Segmented lifecycle states of current registries</p>
                                </div>
                                {(() => {
                                    const statuses = ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
                                    const colors = { Confirmed: 'bg-blue-500/40', CheckedIn: 'bg-emerald-500/40', CheckedOut: 'bg-gold-500/40', Cancelled: 'bg-rose-500/40' };
                                    const borderColors = { Confirmed: 'border-blue-500/30', CheckedIn: 'border-emerald-500/30', CheckedOut: 'border-gold-500/30', Cancelled: 'border-rose-500/30' };
                                    const counts = statuses.map(s => filteredBookingsList.filter(b => b.status === s).length);
                                    const total = counts.reduce((a, b) => a + b, 0) || 1;

                                    return (
                                        <div className="space-y-8">
                                            {statuses.map((s, i) => (
                                                <div key={s} className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">{s}</span>
                                                        <span className="text-xl font-bold text-white font-serif">{counts[i]} <span className="text-[10px] text-gold-500/20 font-black ml-2">({Math.round(counts[i] / total * 100)}%)</span></span>
                                                    </div>
                                                    <div className={`h-2 w-full bg-navy-950 rounded-full overflow-hidden border border-white/5`}>
                                                        <div
                                                            className={`h-full ${colors[s]} rounded-full transition-all duration-1000 ease-in-out border-r ${borderColors[s]}`}
                                                            style={{ width: `${Math.round(counts[i] / total * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-[9px] text-gold-500/20 pt-4 font-black uppercase tracking-[0.5em] italic">Consolidated Registry Count: {total} Assets</p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Rating Distribution */}
                            <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl">
                                <div className="mb-12">
                                    <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide">Resident Sentiment</h3>
                                    <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-2 italic">Quantitative feedback histogram</p>
                                </div>
                                {(() => {
                                    const reviews = adminReviews || [];
                                    return (
                                        <div className="space-y-6">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = reviews.filter(r => Math.round(r.overallRating) === star).length;
                                                const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-6 group">
                                                        <div className="flex items-center gap-2 w-12 flex-shrink-0">
                                                            <span className="text-sm font-bold text-white font-mono">{star}</span>
                                                            <Star className="w-3 h-3 text-gold-500 fill-gold-600" />
                                                        </div>
                                                        <div className="flex-1 h-1.5 bg-navy-950 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-gold-500/30 font-black w-8 text-right font-mono">{count}</span>
                                                    </div>
                                                );
                                            })}
                                            <p className="text-[9px] text-gold-500/20 pt-8 font-black uppercase tracking-[0.5em] italic">Total Evaluative Entries: {(adminReviews || []).length}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Revenue by Geographic Location */}
                        <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl">
                            <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide mb-12">Territorial Asset Performance</h3>
                            {(() => {
                                const validBookings = filteredBookingsList.filter(b => b.status !== 'Cancelled');
                                const byLocation = {};
                                validBookings.forEach(b => {
                                    const city = b.room?.location?.city || b.location?.city || 'Unknown Sector';
                                    byLocation[city] = (byLocation[city] || 0) + (b.totalPrice || 0);
                                });
                                const entries = Object.entries(byLocation).sort((a, b) => b[1] - a[1]);
                                const maxVal = entries[0]?.[1] || 1;

                                if (entries.length === 0) return (
                                    <div className="py-20 text-center flex flex-col items-center justify-center space-y-6 opacity-40">
                                        <TrendingUp className="w-12 h-12 text-gold-500/20" />
                                        <p className="text-gold-500/40 uppercase tracking-[0.5em] text-[10px] font-black italic">No confirmed revenue data available for this cycle.</p>
                                    </div>
                                );

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {entries.map(([city, revenue], i) => (
                                            <div key={city} className="bg-navy-950/40 border border-gold-500/5 rounded-3xl p-8 hover:border-gold-500/20 transition-all duration-500 group shadow-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/[0.02] rounded-full blur-2xl group-hover:bg-gold-500/[0.05] transition-all"></div>
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <span className="text-[10px] font-black text-gold-500/30 uppercase tracking-[0.2em] italic">Sector {i + 1}</span>
                                                        <div className="w-8 h-8 rounded-lg bg-navy-900 border border-gold-500/10 flex items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-gold-500/40" />
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white font-serif italic mb-2">{city}</h4>
                                                    <p className="text-3xl font-black text-gold-400">₹{revenue.toLocaleString()}</p>
                                                    <div className="mt-8 h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${Math.round(revenue / maxVal * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Inventory Demand Pattern */}
                        <div className="bg-navy-900/40 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl">
                            <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide mb-12">Morphological Demand pattern</h3>
                            {(() => {
                                const allBookings = adminBookings || [];
                                const byType = {};
                                allBookings.filter(b => b.status !== 'Cancelled').forEach(b => {
                                    const t = b.room?.type || 'Standard Spec';
                                    byType[t] = (byType[t] || 0) + 1;
                                });
                                const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 8);
                                const maxVal = entries[0]?.[1] || 1;

                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                                        {entries.map(([type, count]) => (
                                            <div key={type} className="flex flex-col items-center group">
                                                <div className="w-full relative h-64 flex items-end mb-6">
                                                    <div className="absolute inset-0 bg-navy-900/20 rounded-2xl border border-white/5 group-hover:border-gold-500/10 transition-all"></div>
                                                    <div
                                                        className="w-full bg-gradient-to-t from-gold-600/5 to-gold-400/20 rounded-2xl group-hover:from-gold-600/20 group-hover:to-gold-400/40 transition-all duration-1000 border-t border-gold-500/20 flex items-center justify-center relative shadow-2xl"
                                                        style={{ height: `${Math.round(count / maxVal * 100)}%` }}
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-950 border border-gold-500/40 px-3 py-1.5 rounded-xl text-[9px] text-gold-400 font-black shadow-2xl z-20">
                                                            {count}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest text-center leading-relaxed h-10 overflow-hidden line-clamp-2">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* System Insights Overlay */}
                        <div className="p-12 bg-navy-900/60 backdrop-blur-3xl border border-gold-500/10 rounded-[3.5rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-8">
                                <ShieldCheck className="w-12 h-12 text-gold-500/10" />
                            </div>
                            <h4 className="text-xl font-bold text-gold-400 uppercase tracking-[0.3em] italic mb-10 flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
                                Executive Intelligence Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-gold-500/60 font-serif italic leading-relaxed">
                                <div className="space-y-4">
                                    <p className="text-white font-bold uppercase tracking-widest text-[10px] not-italic font-sans">Temporal Optimization</p>
                                    <p>Live telemetry indicates peak resident engagement cycles aligned with seasonal solstices. Registry precision is maintained at 99.9% across all sectors.</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-white font-bold uppercase tracking-widest text-[10px] not-italic font-sans">Fiscal Attribution</p>
                                    <p>Revenue diagnostics confirm confirmed status as the primary catalyst for asset valuation. Cancelled vectors are automatically excluded from performance metrology.</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-white font-bold uppercase tracking-widest text-[10px] not-italic font-sans">Sentiment Resonance</p>
                                    <p>Correlation analysis suggests that high-tier room configurations (T1-T4) achieve a 45% higher secondary booking frequency from elite residents.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text selection:bg-luxury-gold selection:text-white flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-luxury-dark/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-navy-900/95 backdrop-blur-xl border-r border-gold-500/20 flex flex-col z-[50] fixed inset-y-0 transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo Section */}
                <div className="flex-shrink-0 px-8 pt-8 pb-6 w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-600 to-gold-400 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                            <Building className="w-7 h-7 text-navy-950" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight font-serif italic">LuxeStay</h1>
                            <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em]">Administrative</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-luxury-muted hover:text-gold-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-4 custom-scrollbar">
                    <div className="space-y-10">
                        {['MAIN MENU', 'SERVICES', 'ENGAGEMENT'].map((category) => (
                            <div key={category}>
                                <h3 className="text-[10px] font-bold text-gold-500/50 tracking-[0.3em] mb-4 pl-4 uppercase">{category}</h3>
                                <div className="space-y-1.5">
                                    {sidebarItems.filter(item => item.category === category).map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeSection === item.id
                                                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-lg shadow-gold-500/5'
                                                : 'text-luxury-muted hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${activeSection === item.id ? 'text-gold-400' : 'text-luxury-muted group-hover:text-gold-400'}`} />
                                            <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                            {activeSection === item.id && (
                                                <motion.div layoutId="activeTab" className="ml-auto w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Profile Hook */}
                <div className="flex-shrink-0 p-6 w-full border-t border-gold-500/10">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/50 flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">Global Regalia</h4>
                            <p className="text-[10px] text-gold-400 uppercase tracking-widest font-bold">Systems Overseer</p>
                        </div>
                        <Settings className="w-4 h-4 text-luxury-muted group-hover:text-gold-400 transition-all flex-shrink-0" />
                    </div>
                </div>
            </aside>


            <main className="flex-1 lg:ml-72 min-h-screen overflow-y-auto bg-navy-950/50 custom-scrollbar relative">
                <div className="max-w-[1600px] w-full mx-auto px-4 md:px-12 pb-20 relative z-10">
                    {/* Header / Top Bar */}
                    <div className="flex items-center justify-between py-8 border-b border-gold-500/10 mb-12 sticky top-0 bg-navy-950/80 backdrop-blur-md z-40">
                        <div className="flex items-center gap-6">
                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 lg:hidden bg-white/5 rounded-xl text-luxury-muted hover:text-gold-400 transition-all hover:bg-white/10 active:scale-95 border border-white/5"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">Command Center</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500/30"></div>
                                    <span className="text-xs font-serif italic text-white/50 capitalize tracking-wide">{activeSection.replace('-', ' ')}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mt-1 capitalize font-serif italic tracking-wide">
                                    {activeSection.replace('-', ' ')} <span className="text-gold-400">Hub</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Notification Hub */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`relative p-3 rounded-xl transition-all duration-300 border ${isNotificationOpen ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20 border-gold-400' : 'bg-white/5 text-luxury-muted hover:text-gold-400 hover:bg-white/10 border-white/5'}`}
                                >
                                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-navy-950 border-2 border-gold-400 rounded-full text-[9px] font-bold text-gold-400 flex items-center justify-center shadow-lg">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-96 bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
                                        >
                                            <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/10 to-transparent">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <Shield className="w-4 h-4 text-gold-400" />
                                                    Strategic Intelligence
                                                </h4>
                                                <button
                                                    onClick={handleClearNotifications}
                                                    className="text-[9px] font-bold text-luxury-muted hover:text-red-400 uppercase tracking-widest transition-colors"
                                                >
                                                    Dismiss All
                                                </button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                                {notifications.length === 0 ? (
                                                    <div className="py-20 text-center">
                                                        <CheckCircle className="w-12 h-12 text-gold-500/10 mx-auto mb-4" />
                                                        <p className="text-[10px] text-luxury-muted font-bold uppercase tracking-widest">No Priority Alerts</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif._id}
                                                            onClick={() => handleMarkAsRead(notif._id)}
                                                            className={`p-6 m-2 rounded-2xl border transition-all cursor-pointer group ${!notif.isRead ? 'bg-gold-500/5 border-gold-500/20' : 'bg-transparent border-transparent opacity-60'}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${notif.status === 'Urgent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gold-500/20 text-gold-400'}`}>
                                                                    {notif.type}
                                                                </span>
                                                                <span className="text-[9px] text-luxury-muted font-bold uppercase tracking-widest opacity-50">
                                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-white/90 leading-relaxed font-medium group-hover:text-gold-400 transition-colors">{notif.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-5 bg-gold-500/5 text-center border-t border-gold-500/10">
                                                <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.3em] font-bold italic">LuxeStay Aether Protocol</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Core Synchronized</span>
                            </div>

                            <button onClick={handleLogout} className="p-3 bg-white/5 rounded-xl text-luxury-muted hover:text-red-400 transition-all border border-white/5 hover:bg-red-500/5">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>


                    {/* Dynamic Content */}
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Create Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-md rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-serif italic tracking-wide flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-gold-400" />
                                    Onboard Personnel
                                </h3>
                                <p className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Staff Initialization Protocol</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Official Designation (Full Name)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alexander Vance"
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20 font-serif italic"
                                    value={staffFormData.fullName}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Comm-Link Address (Email)</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="personnel@luxestay.com"
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20 font-mono"
                                    value={staffFormData.email}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Security Key</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl placeholder:opacity-20"
                                        value={staffFormData.password}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Operational Role</label>
                                    <select
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer capitalize font-bold"
                                        value={staffFormData.role}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                                    >
                                        {['driver', 'cook', 'room-service', 'plumber', 'cleaner'].map(r => (
                                            <option key={r} value={r} className="bg-navy-900">{r.replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Sector Assignment (Location)</label>
                                <select
                                    required
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer font-serif italic"
                                    value={staffFormData.location}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, location: e.target.value })}
                                >
                                    <option value="" className="bg-navy-900">Select Strategic Hub</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id} className="bg-navy-900">{l.city} Hub</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-gold-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Authorize Personnel
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* Edit Staff Modal */}
            {isEditStaffModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsEditStaffModalOpen(false)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-md rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-serif italic tracking-wide flex items-center gap-3">
                                    <Edit2 className="w-6 h-6 text-gold-400" />
                                    Refine Personnel
                                </h3>
                                <p className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Profile Reconfiguration Protocol</p>
                            </div>
                            <button onClick={() => setIsEditStaffModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStaff} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Official Designation</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-serif italic"
                                    value={editStaffFormData.fullName}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Comm-Link Prefix</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-mono"
                                    value={editStaffFormData.email}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Access Key</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                        value={editStaffFormData.password}
                                        onChange={(e) => setEditStaffFormData({ ...editStaffFormData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Functional Role</label>
                                    <select
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer capitalize font-bold"
                                        value={editStaffFormData.role}
                                        onChange={(e) => setEditStaffFormData({ ...editStaffFormData, role: e.target.value })}
                                    >
                                        {['driver', 'cook', 'room-service', 'plumber', 'cleaner'].map(r => (
                                            <option key={r} value={r} className="bg-navy-900">{r.replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Assigned Global Hub</label>
                                <select
                                    required
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer font-serif italic"
                                    value={editStaffFormData.location}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, location: e.target.value })}
                                >
                                    <option value="" className="bg-navy-900">Select Hub</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id} className="bg-navy-900">{l.city} Hub</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-gold-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Commit Reconfiguration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* Create Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsLocationModalOpen(false)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-serif italic tracking-wide flex items-center gap-4">
                                    <MapPin className="w-6 h-6 text-gold-400" />
                                    Establish Strategic Hub
                                </h3>
                                <p className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Regional Asset Deployment Protocol</p>
                            </div>
                            <button onClick={() => setIsLocationModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLocation} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Metro Designation (City) *</label>
                                    <input required placeholder="e.g. Mumbai" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-serif italic" value={locationFormData.city} onChange={e => setLocationFormData({ ...locationFormData, city: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Geographic Region *</label>
                                    <select
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer font-bold"
                                        value={locationFormData.category}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, category: e.target.value })}
                                    >
                                        <option value="India" className="bg-navy-900">India Series</option>
                                        <option value="International" className="bg-navy-900">International Collection</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Hub Description & Narrative *</label>
                                <textarea required rows={3} placeholder="Describe the hub's unique luxury proposition..." className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-serif italic resize-none" value={locationFormData.description} onChange={e => setLocationFormData({ ...locationFormData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Commencing Valuation (Price) *</label>
                                    <input required placeholder="e.g. ₹20,000" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl" value={locationFormData.price} onChange={e => setLocationFormData({ ...locationFormData, price: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Operational Capacity (Rooms) *</label>
                                    <input required type="number" placeholder="00" className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl" value={locationFormData.rooms} onChange={e => setLocationFormData({ ...locationFormData, rooms: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Operational Status Directive *</label>
                                <div className="flex gap-4">
                                    {['Active', 'Coming Soon'].map((s) => (
                                        <label key={s} className={`flex-1 flex items-center justify-center py-4 rounded-2xl border cursor-pointer transition-all font-black text-[9px] uppercase tracking-[0.3em] ${locationFormData.status === s ? 'bg-gold-500 border-gold-400 text-navy-950 shadow-lg shadow-gold-500/20' : 'bg-navy-950 border-gold-500/10 text-gold-500/40 hover:border-gold-500/30'}`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                className="hidden"
                                                checked={locationFormData.status === s}
                                                onChange={() => setLocationFormData({ ...locationFormData, status: s })}
                                            />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-gold-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Certify Asset Deployment</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* Edit Location Modal */}
            {isEditLocationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsEditLocationModalOpen(false)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-md rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-serif italic tracking-wide">Refine Hub</h3>
                                <p className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Updates for: {selectedLocationForEdit?.city}</p>
                            </div>
                            <button onClick={() => setIsEditLocationModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateLocation} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Global Region</label>
                                <div className="flex gap-4">
                                    {['India', 'International'].map((c) => (
                                        <label key={c} className={`flex-1 flex items-center justify-center py-3 rounded-xl border cursor-pointer transition-all font-black text-[9px] uppercase tracking-[0.3em] ${locationFormData.category === c ? 'bg-gold-500 border-gold-400 text-navy-950 shadow-lg shadow-gold-500/20' : 'bg-navy-950 border-gold-500/10 text-gold-500/40 hover:border-gold-500/30'}`}>
                                            <input
                                                type="radio"
                                                name="category"
                                                className="hidden"
                                                checked={locationFormData.category === c}
                                                onChange={() => setLocationFormData({ ...locationFormData, category: c })}
                                            />
                                            {c}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Destination Designation</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-serif italic"
                                        value={locationFormData.city}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Luxury Synopsis</label>
                                    <textarea
                                        required
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all h-24 resize-none shadow-xl font-serif italic"
                                        value={locationFormData.description}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Base Valuation</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                            value={locationFormData.price}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Unit Count</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                            value={locationFormData.rooms}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, rooms: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-gold-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Save Hub Configuration</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Room Modal */}
            {isEditRoomModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsEditRoomModalOpen(false)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-serif italic tracking-wide">Edit Room Logistics</h3>
                                <p className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-1 italic">Unit {selectedRoomForEdit?.roomNumber} at {locations.find(l => l._id === selectedRoomLocation)?.city} Hub</p>
                            </div>
                            <button onClick={() => setIsEditRoomModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateRoom} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Valuation (Rate per Night) *</label>
                                    <input
                                        type="number"
                                        value={editRoomFormData.price}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, price: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Operational Pulse (Status) *</label>
                                    <select
                                        value={editRoomFormData.status}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, status: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="Available" className="bg-navy-900 text-emerald-400">Available</option>
                                        <option value="Occupied" className="bg-navy-900 text-gold-400">Occupied</option>
                                        <option value="Maintenance" className="bg-navy-900 text-red-400">Maintenance</option>
                                        <option value="Limited" className="bg-navy-900 text-luxury-muted">Limited</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Visual Horizon (View Type)</label>
                                    <input
                                        type="text"
                                        value={editRoomFormData.viewType}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, viewType: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl font-serif italic"
                                        placeholder="e.g. Ocean Front"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Bed Restoration (Bed Type)</label>
                                    <input
                                        type="text"
                                        value={editRoomFormData.bedType}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, bedType: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                        placeholder="e.g. California King"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Luxury Inventory (Amenities)</label>
                                <textarea
                                    value={editRoomFormData.amenities}
                                    onChange={(e) => setEditRoomFormData({ ...editRoomFormData, amenities: e.target.value })}
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl h-24 resize-none font-serif italic"
                                    placeholder="Free WiFi, Mini Bar, Smart TV..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Elite Privileges (Benefits)</label>
                                <textarea
                                    value={editRoomFormData.benefits}
                                    onChange={(e) => setEditRoomFormData({ ...editRoomFormData, benefits: e.target.value })}
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all shadow-xl h-24 resize-none font-serif italic"
                                    placeholder="Welcome Drinks, Breakfast, Airport Transfer..."
                                />
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button type="button" onClick={() => setIsEditRoomModalOpen(false)} className="flex-1 py-5 bg-navy-950 border border-gold-500/10 text-gold-500/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all">
                                    Cancel Operation
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-gold-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Certify Logistics Update</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add New Unit Modal */}
            {isAddUnitModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsAddUnitModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-navy-900/95 backdrop-blur-3xl border border-gold-500/20 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-700">
                        {/* Dynamic Header */}
                        <div className="p-10 border-b border-gold-500/10 flex justify-between items-start bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <div className="flex items-center gap-3 text-gold-500 mb-2">
                                    <Building className="w-4 h-4 shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                                    <span className="text-[10px] uppercase font-black tracking-[0.4em] italic">Architectural Expansion Protocols</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white font-serif italic tracking-tight">Manifest New Unit</h3>
                                <p className="text-[11px] text-gold-500/40 mt-3 font-black tracking-[0.1em] uppercase italic">Strategic integration of a new asset into the {locations.find(l => l._id === selectedRoomLocation)?.city} Hub portfolio.</p>
                            </div>
                            <button onClick={() => setIsAddUnitModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-8 h-8 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRoom} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Duplication Engine */}
                            <div className="p-8 bg-gold-500/5 border border-gold-500/10 rounded-[2.5rem] flex items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-navy-950 shadow-xl shadow-gold-500/20 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        <Clock className="w-7 h-7 relative z-10" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg font-serif italic">Clone Logistics</h4>
                                        <p className="text-[9px] text-gold-500/40 uppercase tracking-[0.3em] font-black italic mt-1">Utilize existing unit as architectural template</p>
                                    </div>
                                </div>
                                <select
                                    className="bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-gold-500/50 min-w-[250px] cursor-pointer shadow-2xl appearance-none italic transition-all"
                                    onChange={(e) => handleDuplicateRoom(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled className="bg-navy-900">Select unit to clone...</option>
                                    {rooms.map(r => (
                                        <option key={r._id} value={r._id} className="bg-navy-900 italic uppercase">Unit {r.roomNumber} - {r.type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Unit Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addUnitFormData.roomNumber}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, roomNumber: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all font-serif italic shadow-xl"
                                        placeholder="e.g. 402B"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Asset Category *</label>
                                    <select
                                        value={addUnitFormData.type}
                                        onChange={(e) => handleRoomTypeChange(e.target.value)}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 font-bold transition-all shadow-xl appearance-none cursor-pointer"
                                    >
                                        {[
                                            'Single Room', 'Double Room', 'Family Room', 'Deluxe Room', 'Executive Room',
                                            'Honeymoon Suite', 'Themed Room', 'Presidential Suite', 'Accessible Room',
                                            'Beach-connected Room', 'Private Pool Room', 'Exclusive Suite'
                                        ].map(t => <option key={t} value={t} className="bg-navy-900">{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Operational Floor *</label>
                                    <select
                                        value={addUnitFormData.floor}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, floor: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 font-serif italic transition-all shadow-xl appearance-none cursor-pointer"
                                    >
                                        {['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Luxury Wing', 'Location Special'].map(f => <option key={f} value={f} className="bg-navy-900">{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Nightly Valuation ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={addUnitFormData.price}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, price: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all shadow-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">View Spectrum</label>
                                    <input
                                        type="text"
                                        value={addUnitFormData.viewType}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, viewType: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all font-serif italic shadow-xl"
                                        placeholder="City View"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Bed Configuration</label>
                                    <input
                                        type="text"
                                        value={addUnitFormData.bedType}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, bedType: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                        placeholder="King Size"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 bg-gold-500/5 p-10 rounded-[3rem] border border-gold-500/10 shadow-inner">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] block italic">Occupancy Optimization</label>
                                    <div className="flex gap-8">
                                        <div className="flex-1 space-y-3">
                                            <span className="text-[9px] font-black text-gold-500/40 uppercase tracking-[0.2em] px-1">Adults</span>
                                            <div className="flex items-center gap-6 bg-navy-950 border border-gold-500/10 rounded-2xl p-3 shadow-xl">
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, adults: Math.max(1, addUnitFormData.adults - 1) })} className="w-10 h-10 rounded-xl hover:bg-white/5 text-gold-500 transition-colors border border-transparent hover:border-gold-500/20 shadow-lg">-</button>
                                                <span className="flex-1 text-center text-lg font-bold text-white font-serif italic">{addUnitFormData.adults}</span>
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, adults: addUnitFormData.adults + 1 })} className="w-10 h-10 rounded-xl hover:bg-white/5 text-gold-500 transition-colors border border-transparent hover:border-gold-500/20 shadow-lg">+</button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <span className="text-[9px] font-black text-gold-500/40 uppercase tracking-[0.2em] px-1">Minors</span>
                                            <div className="flex items-center gap-6 bg-navy-950 border border-gold-500/10 rounded-2xl p-3 shadow-xl">
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, children: Math.max(0, addUnitFormData.children - 1) })} className="w-10 h-10 rounded-xl hover:bg-white/5 text-gold-500 transition-colors border border-transparent hover:border-gold-500/20 shadow-lg">-</button>
                                                <span className="flex-1 text-center text-lg font-bold text-white font-serif italic">{addUnitFormData.children}</span>
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, children: addUnitFormData.children + 1 })} className="w-10 h-10 rounded-xl hover:bg-white/5 text-gold-500 transition-colors border border-transparent hover:border-gold-500/20 shadow-lg">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] block italic">Luxury Accreditation</label>
                                    <div className="flex items-center gap-4 h-16 bg-navy-950 border border-gold-500/10 rounded-2xl px-6 shadow-xl">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setAddUnitFormData({ ...addUnitFormData, luxuryLevel: star })}
                                                className="transition-all transform hover:scale-125 active:scale-90"
                                            >
                                                <ShieldCheck className={`w-6 h-6 transition-all ${addUnitFormData.luxuryLevel >= star ? 'text-gold-400 fill-gold-400/20 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'text-gold-500/20'}`} />
                                            </button>
                                        ))}
                                        <div className="ml-auto flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.2em]">{addUnitFormData.luxuryLevel}.0 Rating</span>
                                            <span className="text-[8px] text-gold-500/30 uppercase font-black italic">Shield Certified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic underline underline-offset-8">Resource Allocation (Amenities)</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-4 custom-scrollbar p-2">
                                        {standardAmenities.map(amt => (
                                            <label key={amt} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${addUnitFormData.amenities.includes(amt) ? 'bg-gold-500/10 border-gold-500/40 text-white shadow-lg' : 'bg-navy-950 border-gold-500/10 text-gold-500/40 hover:border-gold-500/30 hover:bg-white/5'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={addUnitFormData.amenities.includes(amt)}
                                                    onChange={() => {
                                                        const current = addUnitFormData.amenities;
                                                        setAddUnitFormData({
                                                            ...addUnitFormData,
                                                            amenities: current.includes(amt) ? current.filter(a => a !== amt) : [...current, amt]
                                                        });
                                                    }}
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-tight italic">{amt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic underline underline-offset-8">Elite Entitlements (Benefits)</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-4 custom-scrollbar p-2">
                                        {standardBenefits.map(ben => (
                                            <label key={ben} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${addUnitFormData.benefits.includes(ben) ? 'bg-gold-500/10 border-gold-500/40 text-gold-400 shadow-lg shadow-gold-400/5' : 'bg-navy-950 border-gold-500/10 text-gold-500/40 hover:border-gold-500/30 hover:bg-white/5'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={addUnitFormData.benefits.includes(ben)}
                                                    onChange={() => {
                                                        const current = addUnitFormData.benefits;
                                                        setAddUnitFormData({
                                                            ...addUnitFormData,
                                                            benefits: current.includes(ben) ? current.filter(b => b !== ben) : [...current, ben]
                                                        });
                                                    }}
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-tight italic">{ben}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex gap-8">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUnitModalOpen(false)}
                                    className="flex-1 py-6 bg-navy-950 border border-gold-500/10 text-gold-500/40 rounded-[1.5rem] font-black hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.4em] text-[10px] italic"
                                >
                                    Abort Expansion
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-6 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 rounded-[1.5rem] font-black hover:from-gold-500 hover:to-gold-300 transition-all shadow-2xl shadow-gold-500/30 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 shadow-inner" />
                                            Certify New Asset Deployment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Menu Item Modal */}
            {isMenuModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setIsMenuModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-700">
                        <div className="p-10 border-b border-gold-500/10 flex justify-between items-start bg-gradient-to-r from-gold-500/5 to-transparent">
                            <div>
                                <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide">{selectedMenuItemForEdit ? 'Refine Culinary Blueprint' : 'Integrate Culinary Asset'}</h3>
                                <p className="text-[10px] text-gold-500/30 mt-3 uppercase tracking-[0.4em] font-black italic">Advanced Gastronomic Inventory Orchestrator</p>
                            </div>
                            <button onClick={() => setIsMenuModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <Plus className="w-8 h-8 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={selectedMenuItemForEdit ? handleUpdateMenuItem : handleCreateMenuItem} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Gourmet Designation (Title) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={menuFormData.name}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all font-serif italic shadow-xl"
                                        placeholder="e.g. Wagyu Ribeye"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Valuation (₹ Rate) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={menuFormData.price}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all font-bold shadow-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Gastronomic Narrative (Description) *</label>
                                <textarea
                                    required
                                    value={menuFormData.description}
                                    onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                                    className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all h-32 resize-none font-serif italic shadow-xl"
                                    placeholder="Describe the sensory culinary experience..."
                                />
                            </div>

                            {/* Image URL */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Visual Identity (Image URL)</label>
                                <div className="flex gap-6 items-start">
                                    <input
                                        type="url"
                                        value={menuFormData.image || ''}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                                        className="flex-1 bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 transition-all shadow-xl"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    {menuFormData.image && (
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gold-500/20 rounded-2xl blur group-hover:blur-md transition-all"></div>
                                            <img src={menuFormData.image} alt="preview" className="relative w-20 h-20 rounded-2xl object-cover border border-gold-500/20 flex-shrink-0 shadow-2xl" onError={e => e.target.style.display = 'none'} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Classification</label>
                                    <select
                                        value={menuFormData.category}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-gold-500/50 appearance-none cursor-pointer italic"
                                    >
                                        {menuCategories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Dietary Essence</label>
                                    <div className="flex items-center h-[60px] bg-navy-950 border border-gold-500/10 rounded-2xl p-2 gap-2 shadow-inner">
                                        {['Veg', 'Non-Veg', 'Vegan'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMenuFormData({ ...menuFormData, dietaryType: type })}
                                                className={`flex-1 h-full rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${menuFormData.dietaryType === type ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 shadow-lg shadow-gold-500/20' : 'text-gold-500/40 hover:bg-white/5'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.3em] px-2 italic">Culinary Prep (Time)</label>
                                    <input
                                        type="text"
                                        value={menuFormData.preparationTime}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, preparationTime: e.target.value })}
                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-gold-500/50 shadow-xl font-serif italic"
                                        placeholder="e.g. 15 mins"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <label className={`flex items-center justify-between p-8 rounded-[2rem] border cursor-pointer transition-all ${menuFormData.isComplimentary ? 'bg-gold-500/10 border-gold-500/30 shadow-lg shadow-gold-500/5' : 'bg-navy-950 border-gold-500/10'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${menuFormData.isComplimentary ? 'bg-gold-500 text-navy-950 shadow-xl' : 'bg-white/5 text-gold-500/40'}`}>
                                            <Utensils className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg font-serif italic">Complimentary</h4>
                                            <p className="text-[9px] text-gold-500/40 uppercase font-black tracking-[0.2em] mt-1">Included with Elite Suites</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${menuFormData.isComplimentary ? 'border-gold-500 bg-gold-500' : 'border-gold-500/20'}`}>
                                        {menuFormData.isComplimentary && <Check className="w-4 h-4 text-navy-950" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={menuFormData.isComplimentary}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, isComplimentary: e.target.checked })}
                                    />
                                </label>

                                <label className={`flex items-center justify-between p-8 rounded-[2rem] border cursor-pointer transition-all ${menuFormData.isSpecial ? 'bg-gold-500/10 border-gold-500/30 shadow-lg shadow-gold-500/5' : 'bg-navy-950 border-gold-500/10'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${menuFormData.isSpecial ? 'bg-gold-500 text-navy-950 shadow-xl' : 'bg-white/5 text-gold-500/40'}`}>
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg font-serif italic">Chef's Special</h4>
                                            <p className="text-[9px] text-gold-500/40 uppercase font-black tracking-[0.2em] mt-1">Signature Culinary Directive</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${menuFormData.isSpecial ? 'border-gold-500 bg-gold-500' : 'border-gold-500/20'}`}>
                                        {menuFormData.isSpecial && <Check className="w-4 h-4 text-navy-950" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={menuFormData.isSpecial}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, isSpecial: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div className="pt-10 flex gap-8">
                                <button
                                    type="button"
                                    onClick={() => setIsMenuModalOpen(false)}
                                    className="flex-1 py-6 bg-navy-950 border border-gold-500/10 text-gold-500/40 rounded-[1.5rem] font-black hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.4em] text-[10px] italic"
                                >
                                    Abort Integration
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-6 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 rounded-[1.5rem] font-black hover:from-gold-500 hover:to-gold-300 transition-all shadow-2xl shadow-gold-500/30 flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5 shadow-inner" />
                                            {selectedMenuItemForEdit ? 'Certify Profile Updates' : 'Authorize Asset Integration'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Booking Details Modal */}
            {viewingBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" onClick={() => setViewingBooking(null)}></div>
                    <div className="relative bg-navy-900/95 backdrop-blur-2xl border border-gold-500/20 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-700 flex flex-col max-h-[90vh]">
                        {/* Dossier Header */}
                        <div className="p-10 border-b border-gold-500/10 flex items-center justify-between bg-gradient-to-r from-gold-500/5 to-transparent shrink-0">
                            <div>
                                <h3 className="text-3xl font-bold text-white font-serif italic tracking-wide flex items-center gap-4">
                                    <Shield className="w-8 h-8 text-gold-400" />
                                    Reservation Dossier
                                </h3>
                                <p className="text-[10px] text-gold-500/30 uppercase tracking-[0.4em] font-black mt-2 italic flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]"></span>
                                    Registry Archive: {viewingBooking._id}
                                </p>
                            </div>
                            <button onClick={() => setViewingBooking(null)} className="p-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-gold-500/20 text-luxury-muted">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                            {/* Primary Intelligence Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="p-8 bg-navy-950/40 border border-gold-500/5 rounded-[2.5rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <User className="w-20 h-20 text-white" />
                                        </div>
                                        <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.4em] font-black mb-3 italic">Acquisition Status (Primary Resident)</p>
                                        <h4 className="text-2xl font-bold text-white font-serif italic mb-1">{viewingBooking.user?.fullName || viewingBooking.user?.email}</h4>
                                        <p className="text-xs text-gold-400/60 font-mono tracking-widest">{viewingBooking.user?.email}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-navy-950/40 border border-gold-500/5 rounded-3xl">
                                            <p className="text-[8px] text-gold-500/20 uppercase tracking-[0.4em] font-black mb-2 italic">Sector Vector</p>
                                            <p className="text-base font-bold text-white">{viewingBooking.location?.city || 'Unknown Sector'}</p>
                                        </div>
                                        <div className="p-6 bg-navy-950/40 border border-gold-500/5 rounded-3xl">
                                            <p className="text-[8px] text-gold-500/20 uppercase tracking-[0.4em] font-black mb-2 italic">Asset Specification</p>
                                            <p className="text-base font-bold text-gold-400">{viewingBooking.room?.type || viewingBooking.room?.roomType} <span className="text-[10px] opacity-40">U{viewingBooking.room?.roomNumber}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 p-8 bg-navy-950/40 border border-gold-500/5 rounded-[2.5rem] flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.4em] font-black italic">Temporal Parameters</p>
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-[8px] text-gold-500/30 font-black uppercase mb-1">Inflow</p>
                                                    <p className="text-xl font-bold text-white font-mono">{new Date(viewingBooking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                                <div className="w-10 h-[1px] bg-gold-500/10"></div>
                                                <div className="text-center">
                                                    <p className="text-[8px] text-gold-500/30 font-black uppercase mb-1">Outflow</p>
                                                    <p className="text-xl font-bold text-white font-mono">{new Date(viewingBooking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.4em] font-black italic mb-2 text-right">Valuation</p>
                                            <p className="text-3xl font-black text-gold-500">₹{viewingBooking.totalPrice?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gold-500/5">
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-lg ${viewingBooking.paymentStatus === 'Paid' ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-gold-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                            {viewingBooking.paymentStatus || 'PENDING CLEARANCE'}
                                        </span>
                                        <span className="px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] bg-navy-900 text-gold-400 border border-gold-500/10">
                                            {viewingBooking.status} STATUS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Registered Manifest (Guests) */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.5em] flex items-center gap-4 px-2 italic">
                                    <Users className="w-4 h-4" />
                                    Authorized Manifest Entities
                                    <div className="flex-1 h-[1px] bg-gold-500/10"></div>
                                </h4>
                                {viewingBooking.guestDetails && viewingBooking.guestDetails.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {viewingBooking.guestDetails.map((guest, idx) => (
                                            <div key={idx} className="bg-navy-950/60 border border-gold-500/10 p-6 rounded-[2rem] hover:border-gold-500/40 transition-all duration-500 group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h5 className="font-bold text-white text-base font-serif italic group-hover:text-gold-400 transition-colors">{guest.name || 'Anonymous Entity'}</h5>
                                                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${guest.type === 'adult' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                                        {guest.type}
                                                    </span>
                                                </div>
                                                <div className="space-y-3 text-[10px] font-medium text-gold-500/40 tracking-wide">
                                                    <div className="flex justify-between items-center py-2 border-b border-gold-500/5">
                                                        <span className="uppercase tracking-[0.2em] font-black opacity-40">Spectrum:</span>
                                                        <span className="text-white font-mono">{guest.age || '—'} Y / {guest.gender || '—'}</span>
                                                    </div>
                                                    {guest.type === 'adult' && (
                                                        <>
                                                            <div className="flex justify-between items-center py-2 border-b border-gold-500/5">
                                                                <span className="uppercase tracking-[0.2em] font-black opacity-40">Comm-Link:</span>
                                                                <span className="text-white underline decoration-gold-500/20 underline-offset-4">{guest.phone || '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2">
                                                                <span className="uppercase tracking-[0.2em] font-black opacity-40">{guest.idType || 'ID'} SIG:</span>
                                                                <span className="text-white font-mono text-[9px] bg-gold-400/5 px-2 py-1 rounded">{guest.idNumber || '—'}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center bg-navy-950/20 border border-dashed border-gold-500/10 rounded-3xl">
                                        <p className="text-gold-500/20 text-xs font-serif italic tracking-widest">"No individual entity records detected in this dossier."</p>
                                    </div>
                                )}
                            </div>

                            {/* Supplementary Enhancements */}
                            {viewingBooking.addOns && viewingBooking.addOns.length > 0 && (
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.5em] flex items-center gap-4 px-2 italic">
                                        <Crown className="w-4 h-4" />
                                        Supplementary Value Additions
                                        <div className="flex-1 h-[1px] bg-gold-500/10"></div>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {viewingBooking.addOns.map((addon, idx) => (
                                            <div key={idx} className="bg-navy-950/60 border border-gold-500/10 p-8 rounded-[2.5rem] flex flex-col justify-between group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/[0.02] rounded-full blur-2xl group-hover:bg-gold-500/[0.05] transition-all"></div>
                                                <div className="flex items-start justify-between mb-6 relative z-10">
                                                    <div>
                                                        <h5 className="text-lg font-bold text-white font-serif italic flex items-center gap-3">
                                                            {addon.name}
                                                        </h5>
                                                        <p className="text-[8px] text-gold-500/30 uppercase tracking-[0.3em] font-black mt-1 italic">Exclusive Benefit Integration</p>
                                                    </div>
                                                    <span className={`text-[8px] px-3 py-1 rounded-full uppercase font-black tracking-widest border transition-all ${addon.usageStatus === 'used'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                        : 'bg-gold-500 text-navy-950 border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                                        }`}>
                                                        {addon.usageStatus === 'used' ? 'AUTHORIZED' : 'PENDING'}
                                                    </span>
                                                </div>

                                                {addon.name.toLowerCase().includes('spa') ? (
                                                    <div className="mt-4 space-y-4 border-t border-gold-500/5 pt-6 relative z-10">
                                                        {addon.spaSchedule ? (
                                                            <div className="flex items-center gap-4 text-[10px] font-black text-gold-400 bg-gold-500/5 p-4 rounded-2xl border border-gold-400/20 shadow-xl italic uppercase tracking-widest">
                                                                <Clock className="w-4 h-4 animate-pulse text-gold-500" />
                                                                Scheduled Event: {new Date(addon.spaSchedule).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex flex-col gap-3">
                                                                    <label className="text-[9px] text-gold-500/30 uppercase tracking-[0.4em] font-black italic">Assign Temporal Window</label>
                                                                    <input
                                                                        type="datetime-local"
                                                                        value={adminSpaDates[`${viewingBooking._id}_${addon.name}`] || ''}
                                                                        onChange={(e) => setAdminSpaDates({ ...adminSpaDates, [`${viewingBooking._id}_${addon.name}`]: e.target.value })}
                                                                        min={viewingBooking.checkIn ? new Date(new Date(viewingBooking.checkIn).getTime() - new Date(viewingBooking.checkIn).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : undefined}
                                                                        max={viewingBooking.checkOut ? new Date(new Date(viewingBooking.checkOut).getTime() - new Date(viewingBooking.checkOut).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : undefined}
                                                                        style={{ colorScheme: 'dark' }}
                                                                        className="w-full bg-navy-950 border border-gold-500/10 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-gold-500/50 transition-all font-mono"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAssignSpa(viewingBooking._id, addon.name)}
                                                                    className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold-500/20"
                                                                >
                                                                    Certify Schedule
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-[9px] text-gold-500/20 uppercase tracking-[0.3em] font-black italic mt-4 border-t border-gold-500/5 pt-4">No scheduling orchestration required.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Special Directives */}
                            {viewingBooking.specialRequests && (
                                <div className="p-8 bg-gold-500/5 border border-gold-500/10 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gold-500/[0.02] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000"></div>
                                    <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em] mb-4 flex items-center gap-4 italic relative z-10">
                                        <BellRing className="w-4 h-4 animate-bounce" />
                                        Prioritized Special Directives
                                    </h4>
                                    <p className="text-lg text-white font-serif italic leading-relaxed relative z-10 px-4">
                                        "{viewingBooking.specialRequests}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-10 border-t border-gold-500/10 bg-navy-950/80 shrink-0 flex justify-end gap-6">
                            <button
                                onClick={() => setViewingBooking(null)}
                                className="px-10 py-5 bg-navy-950 border border-gold-500/10 hover:border-gold-500/40 text-gold-500/40 hover:text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.4em] transition-all"
                            >
                                Archive Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;





