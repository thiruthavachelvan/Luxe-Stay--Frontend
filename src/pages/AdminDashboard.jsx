import { useEffect, useState } from 'react';
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
    Tag
} from 'lucide-react';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
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
    const [respondingTo, setRespondingTo] = useState(null);
    const [spaTimes, setSpaTimes] = useState({});
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
            const response = await fetch('__API_BASE__/api/auth/admin/locations', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/food-orders', {
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
            const res = await fetch('__API_BASE__/api/support/admin/all', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/reservations', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/menu', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/notifications', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/notifications', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/rooms', {
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
            const res = await fetch('__API_BASE__/api/reviews/admin/all', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setAdminReviews(await res.json());
        } catch (err) { console.error(err); } finally { setFetchingReviews(false); }
    };

    const fetchAdminBookings = async () => {
        setFetchingAdminBookings(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch('__API_BASE__/api/auth/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } });
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
            const res = await fetch('__API_BASE__/api/contact/admin/all', { headers: { 'Authorization': `Bearer ${token}` } });
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
            const response = await fetch('__API_BASE__/api/auth/admin/create-staff', {
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
            const response = await fetch('__API_BASE__/api/auth/admin/locations', {
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

    if (!user) return null;

    // ── Coupon CRUD helpers ─────────────────────────────────
    const fetchCoupons = async () => {
        setFetchingCoupons(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch('__API_BASE__/api/auth/admin/coupons', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setCoupons(await res.json());
        } catch (err) { console.error(err); } finally { setFetchingCoupons(false); }
    };

    const handleSaveCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const url = couponFormMode === 'create'
                ? '__API_BASE__/api/auth/admin/coupons'
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
        { id: 'restaurant', label: 'Restaurant Menu', icon: Utensils, category: 'SERVICES' },
        { id: 'kitchen-orders', label: 'Kitchen Orders', icon: Clock, category: 'SERVICES' },
        { id: 'room-service', label: 'Room Service', icon: BellRing, category: 'SERVICES' },
        { id: 'table-reservations', label: 'Table Reservations', icon: Utensils, category: 'SERVICES' },
        { id: 'admin-reviews', label: 'Guest Reviews', icon: Star, category: 'ENGAGEMENT' },
        { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquare, category: 'ENGAGEMENT' },
        { id: 'coupons', label: 'Coupon Mgmt', icon: Tag, category: 'ENGAGEMENT' },
        { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp, category: 'ENGAGEMENT' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Grid */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white font-serif italic">Operational Insights</h2>
                            <div className="flex bg-luxury-card border border-luxury-border p-1 rounded-lg">
                                <button
                                    onClick={() => setRevenueRange('month')}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${revenueRange === 'month' ? 'bg-luxury-gold text-white shadow-lg' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    This Month
                                </button>
                                <button
                                    onClick={() => setRevenueRange('year')}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${revenueRange === 'year' ? 'bg-luxury-gold text-white shadow-lg' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    This Year
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
                            {[
                                { label: 'Total Residents', value: dashboardStats.totalResidents.toLocaleString(), icon: Users, color: 'text-luxury-gold', bg: 'bg-blue-400/5', border: 'border-luxury-gold/20' },
                                { label: 'In-House Guests', value: (dashboardStats.activeStays || 0).toLocaleString(), icon: Clock, color: 'text-luxury-gold', bg: 'bg-luxury-gold/5', border: 'border-luxury-gold/20' },
                                { label: 'Upcoming Arrivals', value: (dashboardStats.upcomingArrivals || 0).toLocaleString(), icon: Calendar, color: 'text-luxury-blue', bg: 'bg-luxury-blue/5', border: 'border-luxury-blue/20' },
                                { label: `${revenueRange === 'month' ? 'Monthly' : 'Annual'} Revenue`, value: `₹${(dashboardStats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/20' },
                                { label: 'Staff Roster', value: (dashboardStats.staffOnline || 0).toLocaleString(), icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/5', border: 'border-purple-400/20' },
                            ].map((stat, i) => (
                                <div key={i} className={`bg-luxury-card/50 backdrop-blur-sm border ${stat.border} p-5 rounded-xl hover:border-luxury-blue/50 transition-all duration-300 group`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-0.5 tracking-tight">{stat.value}</h3>
                                    <p className="text-[10px] text-luxury-muted uppercase tracking-[0.15em] font-bold">{stat.label}</p>
                                </div>
                            ))}
                        </div>


                        {/* System Overview Details */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-8 border-b border-luxury-border flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                    <Map className="w-5 h-5 text-luxury-gold" />
                                    Active Branch Occupancy
                                </h2>
                                <button
                                    onClick={() => setActiveSection('branch-occupancy')}
                                    className="text-luxury-blue hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    View Detailed Occupancy &rarr;
                                </button>
                            </div>
                            <div className="p-8 flex flex-col gap-6">
                                {dashboardStats.locationStats && dashboardStats.locationStats.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {dashboardStats.locationStats.map((loc, idx) => (
                                            <div key={idx} className="bg-luxury-dark border border-luxury-border/50 p-6 rounded-xl hover:border-luxury-blue/30 transition-all group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-white font-bold text-lg mb-0.5">{loc.city}</h3>
                                                        <p className="text-[9px] text-luxury-muted uppercase tracking-[0.2em]">Branch Location</p>
                                                    </div>
                                                    <div className="p-2 bg-luxury-blue/10 rounded-lg text-luxury-blue group-hover:scale-110 transition-transform">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-luxury-border/30">
                                                    <div>
                                                        <div className="text-2xl font-bold text-luxury-gold">{loc.activeStays || 0}</div>
                                                        <p className="text-[8px] text-luxury-muted uppercase tracking-widest mt-1 font-bold">In-House</p>
                                                    </div>
                                                    <div className="text-right border-l border-luxury-border/30 pl-4">
                                                        <div className="text-2xl font-bold text-luxury-blue">{loc.upcomingArrivals || 0}</div>
                                                        <p className="text-[8px] text-luxury-muted uppercase tracking-widest mt-1 font-bold">Upcoming</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-luxury-muted text-sm italic font-serif">"No live occupancy activity detected across global branches."</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'branch-occupancy':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif italic">Branch Occupancy</h2>
                                <p className="text-sm text-luxury-muted">Monitor active residents across all hotel locations.</p>
                            </div>
                            <div className="flex gap-4">
                                <select
                                    className="bg-luxury-dark border border-luxury-border rounded-lg px-4 py-2 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-luxury-blue transition-all"
                                    value={occupancyStatusFilter}
                                    onChange={(e) => setOccupancyStatusFilter(e.target.value)}
                                >
                                    <option value="CheckedIn">Currently In-House (Stays)</option>
                                    <option value="Confirmed">Upcoming Arrivals</option>
                                </select>
                                <select
                                    className="bg-luxury-dark border border-luxury-border rounded-lg px-4 py-2 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-luxury-blue transition-all"
                                    value={branchOccupancyFilter}
                                    onChange={(e) => setBranchOccupancyFilter(e.target.value)}
                                >
                                    <option value="all">All Locations</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id}>{l.city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {fetchingAdminBookings ? (
                            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-t-2 border-luxury-gold animate-spin"></div></div>
                        ) : (
                            <div className="space-y-4">
                                {adminBookings
                                    .filter(b => b.status === occupancyStatusFilter)
                                    .filter(b => branchOccupancyFilter === 'all' || b.location?._id === branchOccupancyFilter)
                                    .length === 0 ? (
                                    <div className="text-center py-16 bg-luxury-card border border-luxury-border rounded-xl">
                                        <p className="text-luxury-muted mb-4 italic font-serif">
                                            {occupancyStatusFilter === 'CheckedIn'
                                                ? '"Tranquility prevails. No active guests currently staying in this branch."'
                                                : '"The calm before the grandeur. No upcoming arrivals booked for this selection."'}
                                        </p>
                                    </div>
                                ) : (
                                    adminBookings
                                        .filter(b => b.status === occupancyStatusFilter)
                                        .filter(b => branchOccupancyFilter === 'all' || b.location?._id === branchOccupancyFilter)
                                        .map(booking => (
                                            <div key={booking._id} className="bg-luxury-card border border-luxury-border p-6 rounded-xl hover:border-luxury-blue/30 transition-all flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white">{booking.user?.fullName || 'Guest'}</h3>
                                                            <p className="text-sm text-luxury-muted">{booking.user?.email}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-luxury-gold uppercase tracking-widest">{booking.location?.city}</p>
                                                            <p className="text-[10px] text-luxury-muted uppercase tracking-widest mt-1">Branch</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-luxury-border/50">
                                                        <div>
                                                            <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-1">Room</p>
                                                            <p className="text-white text-sm font-bold">{booking.room?.roomNumber || 'N/A'}</p>
                                                            <p className="text-xs text-luxury-muted">{booking.room?.type}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-2">Residents</p>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-white text-sm font-bold bg-white/5 py-1 px-2 rounded-md border border-white/10 w-fit">
                                                                    <Users className="w-3.5 h-3.5 text-luxury-gold" />
                                                                    <span>{booking.guests?.adults || 1} Adult{(booking.guests?.adults || 1) > 1 ? 's' : ''}</span>
                                                                </div>
                                                                {(booking.guests?.children > 0) && (
                                                                    <div className="flex items-center gap-2 text-luxury-muted text-xs bg-white/5 py-1 px-2 rounded-md border border-white/10 w-fit">
                                                                        <Users className="w-3.5 h-3.5 text-luxury-blue" />
                                                                        <span>{booking.guests.children} Children</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-1">Duration</p>
                                                            <p className="text-white text-sm font-bold">{new Date(booking.checkIn).toLocaleDateString()}</p>
                                                            <p className="text-xs text-luxury-muted">to {new Date(booking.checkOut).toLocaleDateString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-1">Payment</p>
                                                            <p className="text-luxury-gold text-sm font-bold">₹{booking.totalPrice?.toLocaleString()}</p>
                                                            <p className="text-xs font-bold tracking-widest uppercase mt-1">
                                                                {booking.paymentStatus === 'Paid' ? (
                                                                    <span className="text-green-400">💳 Full Paid</span>
                                                                ) : booking.paymentStatus === 'Advance Paid' ? (
                                                                    <span className="text-yellow-400">💳 25% Adv</span>
                                                                ) : (
                                                                    <span className="text-red-400">⌛ Pending</span>
                                                                )}
                                                            </p>
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
            case 'staff':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif italic">Staff Management</h2>
                                <p className="text-sm text-luxury-muted">Provision and manage luxury service personnel.</p>
                            </div>
                            <div className="flex gap-4">
                                <select
                                    className="bg-luxury-dark border border-luxury-border rounded-lg px-4 py-2 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-luxury-blue transition-all"
                                    value={staffFilter}
                                    onChange={(e) => setStaffFilter(e.target.value)}
                                >
                                    <option value="all">All Locations</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id}>{l.city}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg hover:bg-luxury-blue-hover transition-all font-bold shadow-lg"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Staff Member
                                </button>
                            </div>
                        </div>

                        <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden shadow-xl">
                            {fetchingStaff ? (
                                <div className="p-20 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-luxury-muted animate-pulse">Retrieving staff roster...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-luxury-dark/50">
                                            <tr className="text-[10px] uppercase tracking-widest text-luxury-muted border-b border-luxury-border">
                                                <th className="px-8 py-4">Member</th>
                                                <th className="px-8 py-4">Role</th>
                                                <th className="px-8 py-4">Location</th>
                                                <th className="px-8 py-4">Login Credentials</th>
                                                <th className="px-8 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-luxury-border">
                                            {staffMembers.length > 0 ? staffMembers.map((staff, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-luxury-blue/20 flex items-center justify-center text-luxury-blue font-bold text-xs uppercase">
                                                                {staff.fullName?.charAt(0) || staff.email.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white">{staff.fullName || staff.email.split('@')[0]}</div>
                                                                <div className="text-[10px] text-luxury-muted">Joined {new Date(staff.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-medium text-luxury-text capitalize">{staff.role.replace('-', ' ')}</span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-2 text-luxury-muted text-[10px] uppercase tracking-wider">
                                                            <MapPin className="w-3 h-3 text-luxury-gold" />
                                                            {staff.location?.city || 'Global Hub'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold text-luxury-muted uppercase w-12">User:</span>
                                                                <span className="text-[10px] font-mono text-luxury-blue font-bold">{staff.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold text-luxury-muted uppercase w-12">Pass:</span>
                                                                <span className="text-[10px] font-mono text-luxury-gold font-bold">{staff.staffPassword || '********'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => handleEditStaffClick(staff)}
                                                                className="text-luxury-muted hover:text-luxury-blue transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStaff(staff._id)}
                                                                className="text-luxury-muted hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-20 text-center text-luxury-muted italic font-serif">
                                                        No staff members onboarded yet.
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
            case 'locations':
                const indiaLocations = locations.filter(l => l.category === 'India' && l.status === 'Active');
                const internationalLocations = locations.filter(l => l.category === 'International' && l.status === 'Active');
                const pipelineLocations = locations.filter(l => l.status === 'Coming Soon');

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20">
                        <div className="flex items-center justify-between border-b border-luxury-border pb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-serif italic">Global Portfolio</h2>
                                <p className="text-sm text-luxury-muted">Manage the world's most coveted destinations.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setLocationFormData({ city: '', description: '', price: '', status: 'Active', rooms: 0, category: 'India' });
                                    setIsLocationModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-lg font-bold hover:bg-luxury-blue-hover transition-all shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Add Location
                            </button>
                        </div>

                        {fetchingLocations ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-luxury-muted animate-pulse font-serif italic">Curating global portfolio...</p>
                            </div>
                        ) : (
                            <>
                                {/* India Locations */}
                                {indiaLocations.length > 0 && (
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-bold text-luxury-gold tracking-[0.3em] uppercase flex items-center gap-4">
                                            India Locations
                                            <span className="h-[1px] flex-1 bg-luxury-gold/20"></span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                                    className="bg-luxury-card border border-luxury-border rounded-xl p-6 hover:border-luxury-blue/50 transition-all group relative overflow-hidden cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="p-2 bg-luxury-blue/10 rounded-lg text-luxury-blue">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded tracking-widest uppercase">{loc.status}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-luxury-blue transition-colors">{loc.city}</h4>
                                                    <p className="text-[10px] text-luxury-muted mb-4 uppercase tracking-tighter line-clamp-2">{loc.description}</p>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] text-luxury-muted uppercase font-bold">Inventory</span>
                                                        <span className="text-xs font-bold text-white">{loc.rooms} Rooms</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-luxury-border/30">
                                                        <span className="text-[10px] text-luxury-muted uppercase font-bold">Starts @</span>
                                                        <span className="text-sm font-bold text-luxury-gold">{loc.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* International Locations */}
                                {internationalLocations.length > 0 && (
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-bold text-luxury-gold tracking-[0.3em] uppercase flex items-center gap-4">
                                            International Locations
                                            <span className="h-[1px] flex-1 bg-luxury-gold/20"></span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                                    className="bg-luxury-card border border-luxury-border rounded-2xl p-8 hover:border-luxury-blue/50 transition-all flex items-center justify-between group cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <span className="w-2 h-2 rounded-full bg-luxury-blue animate-pulse"></span>
                                                            <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest">Global Diamond Property</span>
                                                        </div>
                                                        <h4 className="text-3xl font-bold text-white mb-2 font-serif italic underline decoration-luxury-gold/20 underline-offset-8 group-hover:text-luxury-blue transition-colors">{loc.city}</h4>
                                                        <p className="text-sm text-luxury-muted mb-6 max-w-lg">{loc.description}</p>
                                                        <div className="flex items-center gap-8 mb-6">
                                                            <div>
                                                                <span className="text-[10px] text-luxury-muted uppercase tracking-widest font-bold block mb-1">Total Inventory</span>
                                                                <span className="text-xl font-bold text-white">{loc.rooms} Rooms</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-luxury-muted uppercase tracking-widest font-bold block mb-1">Base Rate</span>
                                                                <span className="text-xl font-bold text-luxury-gold">{loc.price}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 bg-luxury-dark rounded-full border border-luxury-border/50 group-hover:rotate-12 group-hover:scale-110 transition-transform hidden lg:block">
                                                        <Map className="w-12 h-12 text-luxury-gold/20" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Launching Soon */}
                                {pipelineLocations.length > 0 && (
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-bold text-red-500/50 tracking-[0.3em] uppercase flex items-center gap-4">
                                            Strategic Pipeline (Soon)
                                            <span className="h-[1px] flex-1 bg-red-500/10"></span>
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                                                    className="bg-luxury-dark/30 border border-luxury-border/50 hover:border-luxury-blue/50 hover:grayscale-0 rounded-xl p-8 flex flex-col items-center gap-4 group cursor-pointer grayscale transition-all"
                                                >
                                                    <div className="text-[10px] font-bold text-white bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest opacity-50 group-hover:opacity-100 group-hover:bg-luxury-blue/20 group-hover:text-luxury-blue transition-all">Coming Soon</div>
                                                    <h4 className="text-xl font-bold text-luxury-muted group-hover:text-white transition-colors">{loc.city}</h4>
                                                    <div className="w-12 h-1 bg-luxury-border rounded-full overflow-hidden">
                                                        <div className="h-full bg-luxury-gold/20 group-hover:bg-luxury-blue w-1/3 transition-colors"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {locations.length === 0 && (
                                    <div className="p-20 text-center border-2 border-dashed border-luxury-border rounded-3xl">
                                        <p className="text-luxury-muted font-serif italic">No locations discovered yet. Begin your global expansion.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 'rooms':
                const currentHub = locations.find(l => l._id === selectedRoomLocation);
                const floors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Luxury Wing', 'Location Special'];

                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
                        {/* Room Header with Hub Selector */}
                        <div className="flex items-center justify-between mb-8 overflow-visible">
                            <div>
                                <div className="flex items-center gap-3 text-luxury-gold mb-1">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Operational Asset Management</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white font-serif italic">Room Inventory</h2>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative group">
                                    <div className="absolute -top-6 left-0 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Active Sector</div>
                                    <select
                                        className="bg-luxury-dark border border-luxury-border rounded-xl px-6 py-3 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-luxury-blue hover:bg-white/[0.02] transition-all cursor-pointer appearance-none min-w-[200px]"
                                        value={selectedRoomLocation}
                                        onChange={(e) => setSelectedRoomLocation(e.target.value)}
                                    >
                                        {locations.filter(l => l.status === 'Active').map(l => (
                                            <option key={l._id} value={l._id} className="bg-luxury-dark">{l.city} Hub</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -top-6 left-0 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Inventory Date</div>
                                    <input
                                        type="date"
                                        className="bg-luxury-dark border border-luxury-border rounded-xl px-6 py-3 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-luxury-blue hover:bg-white/[0.02] transition-all cursor-pointer min-w-[200px] [color-scheme:dark]"
                                        value={roomsViewDate}
                                        onChange={(e) => setRoomsViewDate(e.target.value)}
                                    />
                                    <Calendar className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-luxury-muted pointer-events-none" />
                                </div>

                                <button
                                    onClick={() => setIsAddUnitModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-luxury-blue text-white rounded-xl font-bold hover:bg-luxury-blue-hover transition-all shadow-lg active:scale-95 group"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Add New Unit
                                </button>
                            </div>
                        </div>

                        {/* Main Room Navigation Grid */}
                        <div className="flex gap-8 flex-1 overflow-hidden min-h-0">
                            {/* Floor Sidebar Navigator */}
                            <div className="w-64 flex flex-col border-r border-luxury-border/30 pr-8 overflow-hidden">
                                <h3 className="text-[10px] font-bold text-luxury-muted tracking-[0.2em] mb-4 uppercase">Floor Navigator</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pb-6 scrollbar-thin scrollbar-thumb-luxury-border">
                                    {floors.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setSelectedFloor(f)}
                                            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 group ${selectedFloor === f ? 'bg-luxury-blue/10 text-luxury-blue shadow-inner' : 'text-luxury-muted hover:text-white hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedFloor === f ? 'bg-luxury-blue text-white' : 'bg-luxury-dark group-hover:bg-luxury-blue/10'}`}>
                                                    {f === 'All Floors' ? <LayoutDashboard className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                                                </div>
                                                <span className="text-xs font-bold tracking-wide">{f}</span>
                                            </div>
                                            {selectedFloor === f && <ChevronRight className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-luxury-border/10">
                                    <div className="p-6 bg-luxury-blue/5 rounded-2xl border border-luxury-blue/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Real-time Stats</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">{rooms.length}/{currentHub?.rooms || 0}</div>
                                        <div className="text-[10px] text-luxury-muted uppercase font-medium">Assets Mapped</div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Display Grid */}
                            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-luxury-border">
                                {fetchingRooms ? (
                                    <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                                        <div className="animate-spin w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full mb-6"></div>
                                        <p className="text-luxury-muted animate-pulse font-serif italic text-lg text-luxury-gold">Mapping sector floors...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 pb-12">
                                        {rooms.length > 0 ? (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                                                        <div key={room._id} className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden hover:border-luxury-blue/30 transition-all group flex flex-col h-full shadow-2xl">
                                                            {/* Card Header with Status */}
                                                            <div className="relative h-56 bg-luxury-dark/50 overflow-hidden">
                                                                <div className="absolute inset-0 bg-luxury-dark/40 group-hover:scale-110 transition-transform duration-700">
                                                                    <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80" alt={room.type} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                                                                </div>
                                                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                                    <div className="flex gap-2">
                                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg ${displayStatus === 'Available' ? 'bg-green-500 text-white' : displayStatus === 'Occupied' ? 'bg-red-500 text-white' : displayStatus === 'Reserved' ? 'bg-luxury-gold text-white' : 'bg-luxury-muted text-white'}`}>
                                                                            {displayStatus}
                                                                        </span>
                                                                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/20">
                                                                            Room {room.roomNumber}
                                                                        </span>
                                                                    </div>
                                                                    {activeBooking && (
                                                                        <div className="bg-black/50 backdrop-blur-md border border-red-500/30 text-white rounded-lg p-3 shadow-xl max-w-xs mt-1">
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <User className="w-3 h-3 text-red-400" />
                                                                                <span className="text-[10px] font-bold text-red-100">{activeBooking.user?.fullName || activeBooking.user?.email}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <Calendar className="w-3 h-3 text-red-400/70" />
                                                                                <span className="text-[9px] text-white/80">{new Date(activeBooking.checkIn).toLocaleDateString()} - {new Date(activeBooking.checkOut).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-[9px] font-bold">
                                                                                <span className={activeBooking.paymentStatus === 'Paid' ? 'text-green-400' : 'text-orange-400'}>{activeBooking.paymentStatus}</span>
                                                                                <span className="text-white/30">•</span>
                                                                                <span className="text-luxury-gold">₹{activeBooking.totalPrice?.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="absolute bottom-4 right-4 bg-white px-4 py-1 rounded shadow-lg">
                                                                    <span className="text-xs font-bold text-zinc-900">₹{room.price}</span>
                                                                    <span className="text-[9px] text-zinc-500 font-bold uppercase ml-1">/ Night</span>
                                                                </div>
                                                            </div>

                                                            {/* Card Content */}
                                                            <div className="p-6 flex-1 flex flex-col">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="text-lg font-bold text-white group-hover:text-luxury-blue transition-colors">{room.type}</h4>
                                                                    <div className="flex items-center gap-1 text-luxury-gold">
                                                                        <Shield className="w-3 h-3 fill-luxury-gold" />
                                                                        <span className="text-xs font-bold">{room.luxuryLevel}.0</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mb-4 text-luxury-muted">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="w-4 h-4" />
                                                                        <span className="text-[10px] font-bold uppercase tracking-wide">{room.capacity.adults} Adults {room.capacity.children > 0 && `+ ${room.capacity.children} Child`}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Bed className="w-4 h-4" />
                                                                        <span className="text-[10px] font-bold uppercase tracking-wide">{room.bedType}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Building className="w-4 h-4" />
                                                                        <span className="text-[10px] font-bold uppercase tracking-wide">{room.floor}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-2 mb-4">
                                                                    {room.amenities.slice(0, 3).map((amt, idx) => (
                                                                        <span key={idx} className="bg-luxury-blue/5 text-luxury-blue border border-luxury-blue/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">
                                                                            {amt}
                                                                        </span>
                                                                    ))}
                                                                </div>

                                                                <div className="mb-6">
                                                                    <div className="text-[8px] font-bold text-luxury-muted uppercase tracking-[0.2em] mb-2">Included Privileges</div>
                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                                        {room.benefits.slice(0, 2).map((benefit, idx) => (
                                                                            <div key={idx} className="flex items-center gap-1.5">
                                                                                <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                                                                                <span className="text-[10px] text-white/70">{benefit}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="mt-auto space-y-3">
                                                                    <div className="h-[1px] bg-luxury-border/30 w-full mb-4"></div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 text-luxury-muted">
                                                                            <MapPin className="w-3 h-3 text-luxury-gold" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{room.viewType}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleEditRoomClick(room)}
                                                                            className="text-xs font-bold text-white/50 hover:text-white transition-colors"
                                                                        >
                                                                            Edit Logistics
                                                                        </button>
                                                                    </div>

                                                                    {activeBooking && (
                                                                        <div className="pt-2 flex gap-2">
                                                                            {activeBooking.status === 'Confirmed' && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => handleAdminBookingAction(activeBooking._id, 'check-in')}
                                                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                                                                                    >
                                                                                        Check In
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleAdminBookingAction(activeBooking._id, 'cancel')}
                                                                                        className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            {activeBooking.status === 'CheckedIn' && (
                                                                                <button
                                                                                    onClick={() => handleAdminBookingAction(activeBooking._id, 'check-out')}
                                                                                    className="flex-1 bg-luxury-gold hover:bg-luxury-gold-hover text-zinc-900 text-[10px] font-bold py-2 rounded-lg transition-all"
                                                                                >
                                                                                    Check Out
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-luxury-border rounded-3xl opacity-50 h-full">
                                                <div className="w-16 h-16 bg-luxury-dark rounded-full flex items-center justify-center mb-6">
                                                    <Bed className="w-8 h-8 text-luxury-muted" />
                                                </div>
                                                <h5 className="text-xl font-bold text-white font-serif mb-2">No Units Discovered</h5>
                                                <p className="text-sm text-luxury-muted">This floor section is currently unassigned or under maintenance. Use the global hubs to expand.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'bookings':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-luxury-border flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Reservation Manifest</h2>
                                <button
                                    onClick={fetchAdminBookings}
                                    className="flex items-center gap-2 px-4 py-2 bg-luxury-dark border border-luxury-border text-white rounded-xl font-bold hover:border-luxury-blue transition-all"
                                >
                                    <Clock className={`w-4 h-4 ${fetchingAdminBookings ? 'animate-spin' : ''}`} />
                                    <span className="text-[10px] uppercase tracking-widest">Refresh</span>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-widest text-luxury-muted bg-luxury-dark/30 border-b border-luxury-border">
                                            <th className="px-8 py-5">Guest</th>
                                            <th className="px-8 py-5">Location</th>
                                            <th className="px-8 py-5">Stay Period</th>
                                            <th className="px-8 py-5">Value</th>
                                            <th className="px-8 py-5 text-right">Payment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-luxury-border/50">
                                        {fetchingAdminBookings ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center text-luxury-muted italic">Downloading manifest...</td>
                                            </tr>
                                        ) : adminBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center text-luxury-muted italic">No bookings found in the manifest.</td>
                                            </tr>
                                        ) : (
                                            adminBookings.map((booking, i) => (
                                                <tr key={booking._id} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold text-white">{booking.user?.fullName || booking.user?.email?.split('@')[0] || 'Unknown Guest'}</div>
                                                        <div className="text-[10px] text-luxury-muted uppercase tracking-widest">ID: #{booking._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-sm font-bold text-white">{booking.location?.city}</div>
                                                        <div className="text-[10px] text-luxury-muted uppercase tracking-widest">{booking.room?.roomType} ({booking.room?.roomNumber || 'TBD'})</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-sm text-white font-medium">{new Date(booking.checkIn).toLocaleDateString('en-GB')} - {new Date(booking.checkOut).toLocaleDateString('en-GB')}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-luxury-gold">₹{booking.totalPrice?.toLocaleString()}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${booking.paymentStatus === 'Paid' ? 'border-green-500/30 text-green-500 bg-green-500/5' : booking.paymentStatus === 'Advance Paid' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                                                            {booking.paymentStatus || 'Pending'}
                                                        </span>
                                                        <div className="text-[9px] mt-1 text-luxury-muted uppercase tracking-widest">
                                                            Status: {booking.status}
                                                        </div>
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
            case 'restaurant':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        {/* Header & Categories */}
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white font-serif italic mb-2">Culinary Palette</h2>
                                    <p className="text-sm text-luxury-muted uppercase tracking-[0.3em] font-medium max-w-xl">Curating the dining narrative for global centers</p>
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
                                    className="flex items-center gap-3 px-8 py-4 bg-luxury-blue text-white rounded-xl font-bold hover:bg-luxury-blue-hover transition-all shadow-xl shadow-luxury-blue/20 active:scale-95 group shrink-0"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    Integrate New Asset
                                </button>
                            </div>

                            <div className="relative">
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                    {menuCategories.map((cat, idx) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedMenuCategory(cat)}
                                            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border shrink-0 ${selectedMenuCategory === cat ? 'bg-luxury-gold border-luxury-gold text-zinc-900 shadow-lg' : 'bg-luxury-card border-luxury-border text-luxury-muted hover:border-luxury-gold/50'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    {/* Scroll buffer */}
                                    <div className="w-12 shrink-0"></div>
                                </div>
                            </div>
                        </div>

                        {/* Special Features Grid (Featured in Plan) */}
                        {selectedMenuCategory === 'All Categories' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { title: 'Weekend Buffets', desc: 'Grand culinary exhibitions', icon: Utensils, gradient: 'from-orange-500/20' },
                                    { title: 'Festival Menus', desc: 'Seasonal cultural celebrations', icon: Calendar, gradient: 'from-blue-500/20' },
                                    { title: 'In-Room Dining', desc: '24/7 private luxury service', icon: BellRing, gradient: 'from-purple-500/20' }
                                ].map((feat, i) => (
                                    <div key={i} className={`p-8 rounded-[2rem] bg-gradient-to-br ${feat.gradient} to-transparent border border-luxury-border hover:border-luxury-gold/30 transition-all cursor-pointer group`}>
                                        <div className="w-12 h-12 bg-luxury-dark rounded-xl flex items-center justify-center mb-6 border border-luxury-border group-hover:bg-luxury-blue transition-colors">
                                            <feat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white font-serif italic mb-2">{feat.title}</h4>
                                        <p className="text-xs text-luxury-muted uppercase tracking-widest">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {fetchingMenu ? (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-12 h-12 border-4 border-luxury-blue/30 border-t-luxury-blue rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-luxury-muted uppercase tracking-widest text-xs font-bold">Synchronizing Culinary Database...</p>
                                </div>
                            ) : menuItems.length === 0 ? (
                                <div className="col-span-full py-20 bg-luxury-card border border-luxury-border border-dashed rounded-3xl text-center">
                                    <Search className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                                    <p className="text-luxury-muted font-bold text-sm tracking-widest uppercase">No assets found in this category</p>
                                </div>
                            ) : (
                                menuItems.map(item => (
                                    <div key={item._id} className="bg-luxury-card border border-luxury-border rounded-[2rem] overflow-hidden group hover:border-luxury-blue/50 transition-all relative">
                                        {/* Premium Badge */}
                                        {item.isSpecial && (
                                            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-luxury-blue text-white text-[8px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                                                Chef's Signature
                                            </div>
                                        )}

                                        <div className="h-56 bg-luxury-dark overflow-hidden relative">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-luxury-blue/5">
                                                    <Utensils className="w-12 h-12 text-luxury-muted/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-luxury-card to-transparent opacity-60"></div>
                                            <div className="absolute bottom-4 right-4 text-2xl font-bold text-white font-serif">
                                                ₹{item.price.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${item.dietaryType === 'Veg' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                                                        <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest">{item.dietaryType} • {item.category}</span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white font-serif italic">{item.name}</h4>
                                                </div>
                                                {item.isComplimentary && (
                                                    <div className="bg-luxury-gold/10 text-luxury-gold px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider border border-luxury-gold/30">
                                                        Included with Room
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs text-luxury-muted leading-relaxed line-clamp-2">{item.description}</p>

                                            <div className="flex items-center gap-6 pt-4 border-t border-luxury-border">
                                                {item.calories && (
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3 text-luxury-muted" />
                                                        <span className="text-[10px] text-luxury-muted font-bold">{item.calories} KCAL</span>
                                                    </div>
                                                )}
                                                {item.preparationTime && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-luxury-muted" />
                                                        <span className="text-[10px] text-luxury-muted font-bold">{item.preparationTime}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3 pt-2">
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
                                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-luxury-border"
                                                >
                                                    Edit Profile
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMenuItem(item._id)}
                                                    className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'room-service':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-serif italic mb-2">Guest Service Requests</h2>
                                <p className="text-sm text-luxury-muted uppercase tracking-[0.2em]">Cleaning, Transport, Spa & Support Queries</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {serviceQueries.filter(q => q.status === 'Open').length > 0 && (
                                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                        {serviceQueries.filter(q => q.status === 'Open').length} Open
                                    </span>
                                )}
                                <button
                                    onClick={fetchServiceQueries}
                                    className="flex items-center gap-2 px-6 py-3 bg-luxury-dark border border-luxury-border text-white rounded-xl font-bold hover:border-luxury-blue transition-all"
                                >
                                    <Clock className={`w-4 h-4 ${fetchingQueries ? 'animate-spin' : ''}`} />
                                    <span className="text-xs uppercase tracking-widest">Refresh</span>
                                </button>
                            </div>
                        </div>

                        {fetchingQueries ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-luxury-muted animate-pulse font-serif italic">Loading service requests...</p>
                            </div>
                        ) : serviceQueries.length === 0 ? (
                            <div className="p-20 text-center bg-luxury-card border-2 border-dashed border-luxury-border rounded-3xl">
                                <BellRing className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                                <p className="text-luxury-muted font-bold text-sm tracking-widest uppercase">No Service Requests Yet</p>
                                <p className="text-luxury-muted/50 text-xs mt-2">Requests submitted by guests will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceQueries.map(query => {
                                    const isExpanded = respondingTo === query._id;
                                    const isCompleted = query.status === 'Completed' || query.status === 'Resolved';

                                    const priorityStyle = query.priority === 'Urgent'
                                        ? 'text-red-400 bg-red-400/10 border-red-400/30'
                                        : query.priority === 'Standard'
                                            ? 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/30'
                                            : 'text-luxury-muted bg-white/5 border-luxury-border';

                                    const statusStyle =
                                        isCompleted ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                                            query.status === 'Accepted' ? 'text-luxury-gold bg-[#D4AF37]/10 border-luxury-gold/30' :
                                                query.status === 'Assigned' ? 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/30' :
                                                    'text-red-400 bg-red-400/10 border-red-400/30';

                                    const relevantRoles =
                                        query.subject?.includes('Transport') ? ['driver'] :
                                            (query.subject?.includes('Cleaning') || query.subject?.includes('Housekeeping')) ? ['cleaner', 'room-service'] :
                                                query.subject?.includes('Spa') ? ['room-service'] :
                                                    ['plumber', 'cleaner', 'room-service', 'driver'];

                                    const eligibleStaff = staffMembers.filter(s => relevantRoles.includes(s.role) && (!query.location || (s.location?._id || s.location) === (query.location?._id || query.location)));

                                    return (
                                        <div key={query._id} className={`bg-luxury-card border rounded-2xl overflow-hidden transition-all shadow-xl ${isCompleted ? 'border-luxury-border/40 opacity-70' : 'border-luxury-border hover:border-luxury-blue/30'
                                            }`}>
                                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                                {/* Left: Request Info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-luxury-dark border border-luxury-border flex items-center justify-center flex-shrink-0 mt-1">
                                                        {query.subject?.includes('Cleaning') || query.subject?.includes('Housekeeping') ? <Wind className="w-5 h-5 text-luxury-gold" /> :
                                                            query.subject?.includes('Transport') ? <Car className="w-5 h-5 text-luxury-gold" /> :
                                                                query.subject?.includes('Spa') ? <Flower2 className="w-5 h-5 text-pink-400" /> :
                                                                    <BellRing className="w-5 h-5 text-luxury-muted" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                            <h4 className="text-sm font-bold text-white">{query.subject}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${priorityStyle}`}>{query.priority}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusStyle}`}>{query.status}</span>
                                                        </div>
                                                        <p className="text-xs text-luxury-muted mb-2 leading-relaxed">{query.message}</p>
                                                        <div className="flex items-center gap-4 text-[10px] text-luxury-muted flex-wrap">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{query.user?.email?.split('@')[0] || 'Guest'}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(query.createdAt).toLocaleString()}</span>
                                                        </div>

                                                        {query.assignedTo && (
                                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg">
                                                                <span className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Assigned:</span>
                                                                <span className="text-xs font-bold text-white">{query.assignedTo.email?.split('@')[0]}</span>
                                                                <span className="text-[9px] text-luxury-muted capitalize">({query.assignedTo.role})</span>
                                                            </div>
                                                        )}

                                                        {isCompleted && (
                                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                                                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">✅ Task Completed</span>
                                                                {query.completedAt && <span className="text-[9px] text-luxury-muted">{new Date(query.completedAt).toLocaleString()}</span>}
                                                            </div>
                                                        )}

                                                        {query.adminResponse && (
                                                            <div className="mt-3 p-3 bg-luxury-blue/5 border border-luxury-blue/20 rounded-lg">
                                                                <p className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest mb-1">Admin Note</p>
                                                                <p className="text-xs text-white">{query.adminResponse}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Assignment Panel */}
                                                {!isCompleted && (
                                                    <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-luxury-border/50 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 flex-shrink-0">
                                                        {query.subject?.includes('Spa') ? (
                                                            <>
                                                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest">Set Spa Time</label>
                                                                <input
                                                                    type="datetime-local"
                                                                    id={`spa-time-${query._id}`}
                                                                    value={spaTimes[query._id] || ''}
                                                                    onChange={(e) => setSpaTimes({ ...spaTimes, [query._id]: e.target.value })}
                                                                    style={{ colorScheme: 'dark' }}
                                                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2.5 px-3 text-white text-xs outline-none focus:border-luxury-blue transition-all"
                                                                />
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
                                                                    className="w-full py-2.5 bg-luxury-blue/10 hover:bg-luxury-blue border border-luxury-blue/30 text-luxury-blue hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                                                                >
                                                                    Confirm Time
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {query.assignedTo && !isReassigning[query._id] ? (
                                                                    <button
                                                                        onClick={() => setIsReassigning({ ...isReassigning, [query._id]: true })}
                                                                        className="w-full py-2.5 bg-luxury-gold/10 hover:bg-luxury-gold border border-luxury-gold/30 text-luxury-gold hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                                    >
                                                                        Reassign Another Staff
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest">
                                                                            {query.assignedTo ? 'Select New Associate' : 'Assign Staff'}
                                                                        </label>
                                                                        <select
                                                                            className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2.5 px-3 text-white text-xs outline-none focus:border-luxury-blue transition-all"
                                                                            value={assignmentDrafts[query._id] !== undefined ? assignmentDrafts[query._id] : (query.assignedTo?._id || '')}
                                                                            onChange={(e) => setAssignmentDrafts({ ...assignmentDrafts, [query._id]: e.target.value })}
                                                                        >
                                                                            <option value="">-- Select Staff --</option>
                                                                            {(eligibleStaff.length > 0 ? eligibleStaff : staffMembers).map(s => (
                                                                                <option key={s._id} value={s._id}>{s.email.split('@')[0]} ({s.role})</option>
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
                                                                                        setSuccess('Staff assignment successfully updated! Dispatch notification triggered.');
                                                                                        setIsReassigning({ ...isReassigning, [query._id]: false });
                                                                                        setTimeout(() => setSuccess(''), 4000);
                                                                                        fetchServiceQueries();
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="w-full py-2.5 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                                                                        >
                                                                            Confirm {query.assignedTo ? 'Reassignment' : 'Assignment'}
                                                                        </button>
                                                                        {query.assignedTo && (
                                                                            <button
                                                                                onClick={() => setIsReassigning({ ...isReassigning, [query._id]: false })}
                                                                                className="text-[9px] text-luxury-muted hover:text-white uppercase tracking-widest transition-all"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {/* Status indicator while waiting */}
                                                                {query.assignedTo && query.status === 'Assigned' && (
                                                                    <div className="p-2 bg-luxury-blue/5 border border-luxury-blue/20 rounded-lg text-center">
                                                                        <p className="text-[9px] font-bold text-luxury-blue uppercase tracking-widest">⏳ Waiting for staff...</p>
                                                                    </div>
                                                                )}
                                                                {query.status === 'Accepted' && (
                                                                    <div className="p-2 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg text-center">
                                                                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">🔧 Staff is working...</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Close Request — only after staff completes */}
                                                {query.status === 'Completed' && (
                                                    <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-luxury-border/50 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 flex-shrink-0">
                                                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                                                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">✅ Staff Completed</p>
                                                            <p className="text-[9px] text-luxury-muted mt-1">Ready to close</p>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                const token = sessionStorage.getItem('userToken');
                                                                await fetch(`${__API_BASE__}/api/support/admin/${query._id}/respond`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                    body: JSON.stringify({ response: 'Closed by admin.' })
                                                                }).then(r => r.ok && fetchServiceQueries());
                                                            }}
                                                            className="w-full py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                        >
                                                            Close Request
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
            case 'kitchen-orders':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-serif italic mb-2">Kitchen Command Center</h2>
                                <p className="text-sm text-luxury-muted uppercase tracking-[0.2em]">Manage and route culinary requests</p>
                            </div>
                            <button
                                onClick={fetchKitchenOrders}
                                className="flex items-center gap-2 px-6 py-3 bg-luxury-dark border border-luxury-border text-white rounded-xl font-bold hover:border-luxury-blue transition-all"
                            >
                                <Clock className={`w-4 h-4 ${fetchingOrders ? 'animate-spin' : ''}`} />
                                <span className="text-xs uppercase tracking-widest">Refresh Stream</span>
                            </button>
                        </div>

                        {fetchingOrders ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-luxury-muted animate-pulse font-serif italic">Synchronizing kitchen datalink...</p>
                            </div>
                        ) : kitchenOrders.length === 0 ? (
                            <div className="p-20 text-center bg-luxury-card border-2 border-dashed border-luxury-border rounded-3xl">
                                <Utensils className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                                <p className="text-luxury-muted font-bold text-sm tracking-widest uppercase">No Active Culinary Orders</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {kitchenOrders.map(order => (
                                    <div key={order._id} className="bg-luxury-card border border-luxury-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-luxury-blue/30 transition-all shadow-xl">

                                        {/* Order Details */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500' :
                                                            order.status === 'Preparing' ? 'bg-luxury-blue' :
                                                                order.status === 'Assigned' ? 'bg-luxury-gold' : 'bg-red-500'
                                                            }`}></span>
                                                        <span className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Order Ticket: {order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white">Guest: {order.user?.email.split('@')[0]}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-luxury-gold">₹{order.totalAmount.toLocaleString()}</div>
                                                    <div className="text-[10px] text-luxury-muted uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                                    <div className="mt-1">
                                                        {order.payment && order.payment.status === 'Success' ? (
                                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 font-bold uppercase tracking-widest rounded text-[9px]">💳 Paid in Full</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 font-bold uppercase tracking-widest rounded text-[9px]">⌛ Payment Pending</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-luxury-dark/50 rounded-xl p-4 border border-luxury-border/50">
                                                <h5 className="text-[10px] font-bold text-luxury-muted uppercase tracking-[0.2em] mb-3">Order Manifest</h5>
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-luxury-dark overflow-hidden cover border border-luxury-border">
                                                                    {item.menuItem?.image ? (
                                                                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Utensils className="w-4 h-4 m-2 text-luxury-muted/50" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-white">{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-luxury-muted font-bold">₹{item.priceAtOrder.toLocaleString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions & Assignment */}
                                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-luxury-border pt-6 md:pt-0 md:pl-6 flex flex-col gap-4">

                                            {/* Assigned Cook Display */}
                                            {order.assignedTo && (
                                                <div className="p-3 bg-luxury-gold/10 border border-luxury-gold/30 rounded-xl">
                                                    <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-0.5">Assigned Cook</p>
                                                    <p className="text-sm font-bold text-white">{order.assignedTo.email?.split('@')[0]}</p>
                                                </div>
                                            )}

                                            {/* Assign Cook (only if not yet delivered/completed) */}
                                            {order.status !== 'Delivered' && order.status !== 'Completed' && (
                                                <div className="space-y-2">
                                                    {order.assignedTo && !isReassigning[`order-${order._id}`] ? (
                                                        <button
                                                            onClick={() => setIsReassigning({ ...isReassigning, [`order-${order._id}`]: true })}
                                                            className="w-full py-2.5 bg-luxury-gold/10 hover:bg-luxury-gold border border-luxury-gold/30 text-luxury-gold hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                        >
                                                            Reassign Another Cook
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest block">
                                                                {order.assignedTo ? 'Select New Cook' : 'Assign Cook'}
                                                            </label>
                                                            <select
                                                                className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white text-xs outline-none focus:border-luxury-blue"
                                                                defaultValue={order.assignedTo?._id || ''}
                                                                id={`cook-select-${order._id}`}
                                                            >
                                                                <option value="">-- Select Cook --</option>
                                                                {staffMembers.filter(s => s.role === 'cook' && (!order.location || (s.location?._id || s.location) === (order.location?._id || order.location))).map(cook => (
                                                                    <option key={cook._id} value={cook._id}>{cook.email.split('@')[0]}</option>
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
                                                                className="w-full py-2.5 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                                                            >
                                                                Confirm {order.assignedTo ? 'Reassignment' : 'Assignment'}
                                                            </button>
                                                            {order.assignedTo && (
                                                                <button
                                                                    onClick={() => setIsReassigning({ ...isReassigning, [`order-${order._id}`]: false })}
                                                                    className="w-full text-[9px] text-luxury-muted hover:text-white uppercase tracking-widest transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Waiting message — assigned but cook hasn't delivered yet */}
                                            {order.assignedTo && order.status === 'Assigned' && (
                                                <div className="p-3 bg-luxury-blue/5 border border-luxury-blue/20 rounded-xl text-center">
                                                    <p className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest">⏳ Waiting for cook to deliver...</p>
                                                </div>
                                            )}

                                            {/* Delivered by cook — admin can now close */}
                                            {(order.status === 'Delivered') && (
                                                <>
                                                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">✅ Cook Delivered</p>
                                                        <p className="text-[9px] text-luxury-muted mt-1">Ready to close</p>
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
                                                        className="w-full py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                    >
                                                        Close Order
                                                    </button>
                                                </>
                                            )}

                                            {/* Order fully closed */}
                                            {order.status === 'Completed' && (
                                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">🎉 Order Completed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'table-reservations':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-serif italic mb-2">Table Reservations</h2>
                                <p className="text-sm text-luxury-muted uppercase tracking-[0.2em]">Manage restaurant bookings and pre-orders</p>
                            </div>
                            <button
                                onClick={fetchTableReservations}
                                className="flex items-center gap-2 px-6 py-3 bg-luxury-dark border border-luxury-border text-white rounded-xl font-bold hover:border-luxury-blue transition-all"
                            >
                                <Clock className={`w-4 h-4 ${fetchingReservations ? 'animate-spin' : ''}`} />
                                <span className="text-xs uppercase tracking-widest">Refresh</span>
                            </button>
                        </div>

                        {fetchingReservations ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-luxury-muted animate-pulse font-serif italic">Loading reservations...</p>
                            </div>
                        ) : tableReservations.length === 0 ? (
                            <div className="p-20 text-center bg-luxury-card border-2 border-dashed border-luxury-border rounded-3xl">
                                <Utensils className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                                <p className="text-luxury-muted font-bold text-sm tracking-widest uppercase">No Table Reservations</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {tableReservations.map(reservation => (
                                    <div key={reservation._id} className="bg-luxury-card border border-luxury-border rounded-2xl p-6 flex flex-col xl:flex-row gap-6 hover:border-luxury-blue/30 transition-all shadow-xl">

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${reservation.status === 'Confirmed' ? 'bg-green-500' : reservation.status === 'Cancelled' ? 'bg-red-500' : 'bg-luxury-gold'}`}></span>
                                                        <span className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Reservation ID: {reservation._id.substring(reservation._id.length - 6).toUpperCase()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white">Guest: {reservation.user?.fullName || reservation.user?.email.split('@')[0]}</h4>
                                                    <div className="text-sm text-luxury-muted mt-1">Contact: {reservation.user?.email}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${reservation.status === 'Confirmed' ? 'border-green-500/30 text-green-500 bg-green-500/5' : reservation.status === 'Cancelled' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5'}`}>
                                                        {reservation.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-luxury-dark/30 rounded-xl p-4 border border-luxury-border/50">
                                                <div>
                                                    <div className="text-[10px] text-luxury-muted uppercase tracking-widest mb-1">Date</div>
                                                    <div className="text-sm font-bold text-white">{reservation.date}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-luxury-muted uppercase tracking-widest mb-1">Time</div>
                                                    <div className="text-sm font-bold text-white">{reservation.time}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-luxury-muted uppercase tracking-widest mb-1">Guests</div>
                                                    <div className="text-sm font-bold text-white"><Users className="w-3 h-3 inline mr-1 text-luxury-gold" />{reservation.guests}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-luxury-muted uppercase tracking-widest mb-1">Created</div>
                                                    <div className="text-sm font-bold text-luxury-muted">{new Date(reservation.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            {reservation.specialRequests && (
                                                <div className="bg-luxury-blue/5 border border-luxury-blue/20 rounded-xl p-4">
                                                    <div className="text-[10px] text-luxury-blue uppercase tracking-widest font-bold mb-1">Special Requests</div>
                                                    <p className="text-sm text-white/90 italic">"{reservation.specialRequests}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-luxury-border pt-6 xl:pt-0 xl:pl-6 flex flex-col">
                                            {reservation.preBookedMeals && reservation.preBookedMeals.length > 0 ? (
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="text-[10px] font-bold text-luxury-gold uppercase tracking-[0.2em]">Pre-ordered Meals</h5>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-luxury-gold">₹{reservation.totalPreBookedAmount?.toLocaleString() || 0}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${reservation.totalPreBookedAmount > 0 && reservation.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/30' : reservation.totalPreBookedAmount === 0 ? 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                                                {reservation.totalPreBookedAmount === 0 ? 'Complimentary' : (reservation.paymentStatus || 'Pending')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-6 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                                                        {reservation.preBookedMeals.map((meal, idx) => (
                                                            <div key={idx} className="flex justify-between items-start text-sm">
                                                                <span className="text-white/80"><span className="text-luxury-muted font-bold mr-2">{meal.quantity}x</span>{meal.menuItem?.name || 'Unknown Item'}</span>
                                                                <span className="text-luxury-muted font-bold text-xs">₹{meal.menuItem?.price?.toLocaleString() || 0}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center p-4 bg-luxury-dark/30 rounded-xl border border-luxury-border border-dashed mb-6">
                                                    <p className="text-[10px] text-luxury-muted uppercase tracking-widest font-bold">No Pre-ordered Meals</p>
                                                </div>
                                            )}

                                            {reservation.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleConfirmReservation(reservation._id)}
                                                    className="w-full py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)] mt-auto"
                                                >
                                                    Confirm Reservation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'admin-reviews':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white font-serif italic">Guest Reviews</h2>
                            <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Manage & Moderate Guest Feedback</p>
                        </div>
                        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-6 py-3 rounded-xl">{success}</div>}
                        {fetchingReviews ? (
                            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-luxury-blue border-t-transparent rounded-full" /></div>
                        ) : adminReviews.length === 0 ? (
                            <div className="p-16 text-center bg-luxury-card rounded-[2.5rem] border border-luxury-border/30">
                                <Star className="w-16 h-16 text-luxury-muted/20 mx-auto mb-4" />
                                <p className="text-luxury-muted">No reviews submitted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {adminReviews.map(review => (
                                    <div key={review._id} className="bg-luxury-card p-8 rounded-[2.5rem] border border-luxury-border/30 shadow-xl">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-white">{review.user?.fullName || 'Anonymous'}</p>
                                                <p className="text-[10px] text-luxury-muted uppercase tracking-widest mt-0.5">{review.user?.email}</p>
                                                <p className="text-xs text-luxury-muted mt-1">{review.location?.city} · {new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= review.overallRating ? 'text-amber-400 fill-amber-400' : 'text-luxury-border'}`} />)}
                                                </div>
                                                <button onClick={() => handleDeleteReview(review._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-luxury-muted italic leading-relaxed border-l-2 border-luxury-blue/40 pl-4">"{review.comment}"</p>
                                        {Object.entries(review.categoryRatings || {}).some(([, v]) => v > 0) && (
                                            <div className="mt-4 pt-4 border-t border-luxury-border/20 flex flex-wrap gap-4">
                                                {[['Cleanliness', 'cleanliness'], ['Service', 'service'], ['Location', 'location'], ['Food', 'foodQuality'], ['Value', 'valueForMoney']].map(([label, key]) =>
                                                    review.categoryRatings?.[key] > 0 && (
                                                        <div key={key} className="text-center">
                                                            <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-1">{label}</p>
                                                            <p className="text-xs font-bold text-white">{review.categoryRatings[key]}.0</p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'contact-messages':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white font-serif italic">Contact Messages</h2>
                            <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Guest Inquiries & Support Requests</p>
                        </div>
                        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-6 py-3 rounded-xl">{success}</div>}
                        {fetchingContacts ? (
                            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-luxury-blue border-t-transparent rounded-full" /></div>
                        ) : adminContacts.length === 0 ? (
                            <div className="p-16 text-center bg-luxury-card rounded-[2.5rem] border border-luxury-border/30">
                                <MessageSquare className="w-16 h-16 text-luxury-muted/20 mx-auto mb-4" />
                                <p className="text-luxury-muted">No contact messages received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {adminContacts.map(contact => (
                                    <div key={contact._id} className={`bg-luxury-card p-8 rounded-[2.5rem] border shadow-xl transition-all ${contact.status === 'New' ? 'border-luxury-blue/40 shadow-luxury-blue/5' : 'border-luxury-border/30'}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-bold text-white">{contact.name}</p>
                                                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${contact.status === 'New' ? 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/30' : contact.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>{contact.status}</span>
                                                </div>
                                                <p className="text-xs text-luxury-muted">{contact.email} · {new Date(contact.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-luxury-muted uppercase tracking-widest mt-1 font-bold">{contact.subject}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {contact.status === 'New' && <button onClick={() => handleUpdateContactStatus(contact._id, 'In Progress')} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-bold border border-orange-500/20 hover:bg-orange-500/20 transition-all">Mark In-Progress</button>}
                                                {contact.status !== 'Resolved' && <button onClick={() => handleUpdateContactStatus(contact._id, 'Resolved')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-bold border border-green-500/20 hover:bg-green-500/20 transition-all">Mark Resolved</button>}
                                            </div>
                                        </div>

                                        <p className="text-sm text-luxury-muted leading-relaxed mb-4">{contact.message}</p>

                                        {contact.adminReply && (
                                            <div className="bg-luxury-blue/5 border border-luxury-blue/20 rounded-xl p-4 mb-4">
                                                <p className="text-[9px] text-luxury-blue font-bold uppercase tracking-widest mb-2">Your Reply</p>
                                                <p className="text-xs text-white">{contact.adminReply}</p>
                                            </div>
                                        )}

                                        {replyingToContact === contact._id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    rows={3}
                                                    value={contactReplyText}
                                                    onChange={e => setContactReplyText(e.target.value)}
                                                    placeholder="Type your reply..."
                                                    className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue/50 transition-all resize-none"
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setReplyingToContact(null); setContactReplyText(''); }} className="px-4 py-2 text-xs text-luxury-muted hover:text-white transition-colors font-bold">Cancel</button>
                                                    <button onClick={() => handleReplyContact(contact._id)} className="px-6 py-2 bg-luxury-blue text-white rounded-lg text-xs font-bold hover:bg-luxury-blue-hover transition-all">Send Reply</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setReplyingToContact(contact._id); setContactReplyText(contact.adminReply || ''); }} className="flex items-center gap-2 text-xs text-luxury-blue font-bold hover:underline">
                                                <Mail className="w-3.5 h-3.5" />
                                                {contact.adminReply ? 'Edit Reply' : 'Reply'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'coupons':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-serif italic">Coupon Management</h2>
                                <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Create & manage discount codes</p>
                            </div>
                            <button
                                onClick={() => { setCouponFormMode('create'); setCouponForm({ code: '', description: '', discountType: 'percent', discountValue: '', maxUses: '', minOrderValue: '', expiresAt: '', appliesTo: 'all', isActive: true }); setShowCouponForm(v => !v); }}
                                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> New Coupon
                            </button>
                        </div>

                        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-6 py-3 rounded-xl">{success}</div>}
                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-6 py-3 rounded-xl">{error}</div>}

                        {/* Create/Edit Form */}
                        {showCouponForm && (
                            <div className="bg-luxury-card border border-[#D4AF37]/20 rounded-2xl p-8 animate-in slide-in-from-top-2 duration-300">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Tag className="w-4 h-4 text-[#D4AF37]" /> {couponFormMode === 'create' ? 'Create New Coupon' : 'Edit Coupon'}</h3>
                                <form onSubmit={handleSaveCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Coupon Code *</label>
                                        <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="e.g. LUXE10" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:border-[#D4AF37] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Discount Type *</label>
                                        <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all">
                                            <option value="percent">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Discount Value *</label>
                                        <input required type="number" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder={couponForm.discountType === 'percent' ? 'e.g. 10' : '₹ e.g. 500'} className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Description</label>
                                        <input value={couponForm.description} onChange={e => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="Short description shown to users" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Max Uses (blank = unlimited)</label>
                                        <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })} placeholder="e.g. 100" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Min Order Value (₹)</label>
                                        <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })} placeholder="e.g. 5000" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Expiry Date</label>
                                        <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all [color-scheme:dark]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Applies To</label>
                                        <select value={couponForm.appliesTo} onChange={e => setCouponForm({ ...couponForm, appliesTo: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all">
                                            <option value="all">All (Booking & Membership)</option>
                                            <option value="booking">Booking Only</option>
                                            <option value="membership">Membership Only</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })} className="w-5 h-5 accent-[#D4AF37]" />
                                            <span className="text-sm font-bold text-white">Active</span>
                                        </label>
                                    </div>
                                    {/* Featured in Offers Page */}
                                    <div className="md:col-span-3">
                                        <label className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${couponForm.isFeatured ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40' : 'bg-luxury-dark border-luxury-border'}`}>
                                            <div>
                                                <p className="text-sm font-bold text-white">⭐ Feature on Offers Page</p>
                                                <p className="text-[10px] text-luxury-muted uppercase tracking-widest mt-0.5">Show this coupon in Curated Packages section</p>
                                            </div>
                                            <input type="checkbox" checked={couponForm.isFeatured || false} onChange={e => setCouponForm({ ...couponForm, isFeatured: e.target.checked })} className="w-5 h-5 accent-[#D4AF37]" />
                                        </label>
                                    </div>
                                    {couponForm.isFeatured && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Display Title *</label>
                                                <input value={couponForm.featuredTitle || ''} onChange={e => setCouponForm({ ...couponForm, featuredTitle: e.target.value })} placeholder="e.g. Monsoon Retreat" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Subtitle / Badge</label>
                                                <input value={couponForm.featuredSubtitle || ''} onChange={e => setCouponForm({ ...couponForm, featuredSubtitle: e.target.value })} placeholder="e.g. SPA SPECIAL" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Tag Label</label>
                                                <input value={couponForm.featuredTag || ''} onChange={e => setCouponForm({ ...couponForm, featuredTag: e.target.value })} placeholder="e.g. Limited Time" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Featured Description</label>
                                                <input value={couponForm.featuredDescription || ''} onChange={e => setCouponForm({ ...couponForm, featuredDescription: e.target.value })} placeholder="Short description for the offer card" className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Background Image URL</label>
                                                <input type="url" value={couponForm.featuredImage || ''} onChange={e => setCouponForm({ ...couponForm, featuredImage: e.target.value })} placeholder="https://images.unsplash.com/..." className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Color Gradient</label>
                                                <select value={couponForm.featuredColor || 'from-blue-900/60 to-[#0F1626]'} onChange={e => setCouponForm({ ...couponForm, featuredColor: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-all">
                                                    <option value="from-blue-900/60 to-[#0F1626]">Blue (Default)</option>
                                                    <option value="from-rose-900/60 to-[#0F1626]">Rose / Pink</option>
                                                    <option value="from-gray-900/60 to-[#0F1626]">Grey / Business</option>
                                                    <option value="from-green-900/60 to-[#0F1626]">Green / Nature</option>
                                                    <option value="from-purple-900/60 to-[#0F1626]">Purple / Luxury</option>
                                                    <option value="from-orange-900/60 to-[#0F1626]">Orange / Warm</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    <div className="md:col-span-3 flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 py-3 bg-luxury-dark border border-luxury-border text-white rounded-xl font-bold text-sm hover:bg-white/5 transition-all">Cancel</button>
                                        <button type="submit" disabled={loading} className="flex-[2] py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50">{loading ? 'Saving...' : couponFormMode === 'create' ? 'Create Coupon' : 'Save Changes'}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Coupons Table */}
                        {fetchingCoupons ? (
                            <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full" /></div>
                        ) : coupons.length === 0 ? (
                            <div className="p-16 text-center bg-luxury-card border-2 border-dashed border-luxury-border rounded-3xl">
                                <Tag className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                                <p className="text-luxury-muted font-bold uppercase tracking-widest text-sm">No coupons created yet</p>
                                <p className="text-luxury-muted/50 text-xs mt-2">Click "New Coupon" to create your first discount code</p>
                            </div>
                        ) : (
                            <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-luxury-border/30">
                                                {['Code', 'Discount', 'Applies To', 'Uses', 'Expiry', 'Featured', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-5 py-4 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-luxury-border/10">
                                            {coupons.map(c => (
                                                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-5 py-4">
                                                        <span className="font-mono font-bold text-[#D4AF37] text-sm tracking-widest bg-[#D4AF37]/10 px-2 py-1 rounded-lg">{c.code}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-white font-bold text-sm">
                                                        {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue.toLocaleString()}`}
                                                        {c.minOrderValue > 0 && <span className="text-luxury-muted text-xs block font-normal">Min ₹{c.minOrderValue.toLocaleString()}</span>}
                                                    </td>
                                                    <td className="px-5 py-4 text-luxury-muted text-xs capitalize">{c.appliesTo}</td>
                                                    <td className="px-5 py-4 text-luxury-muted text-xs">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ' / ∞'}</td>
                                                    <td className="px-5 py-4 text-luxury-muted text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${c.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                            {c.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
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
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${c.isFeatured
                                                                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                                                : 'bg-white/5 text-luxury-muted border-luxury-border hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
                                                                }`}
                                                        >
                                                            {c.isFeatured ? '★ Featured' : '☆ Feature'}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => { setEditingCouponId(c._id); setCouponForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, maxUses: c.maxUses || '', minOrderValue: c.minOrderValue, expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', appliesTo: c.appliesTo, isActive: c.isActive, isFeatured: c.isFeatured || false, featuredTitle: c.featuredTitle || '', featuredSubtitle: c.featuredSubtitle || '', featuredDescription: c.featuredDescription || '', featuredTag: c.featuredTag || '', featuredImage: c.featuredImage || '', featuredColor: c.featuredColor || 'from-blue-900/60 to-[#0F1626]' }); setCouponFormMode('edit'); setShowCouponForm(true); }}
                                                                className="p-2 rounded-lg bg-luxury-blue/10 text-luxury-blue hover:bg-luxury-blue/20 transition-all"
                                                            ><Edit2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'analytics':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white font-serif italic">Analytics & Reporting</h2>
                            <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Booking Trends · Occupancy · Revenue · Reviews</p>
                        </div>

                        {/* KPI Summary Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[
                                { label: 'Total Bookings', value: dashboardStats?.totalBookings ?? '—', sub: 'All time', icon: Calendar, color: 'from-blue-500/20 to-transparent', iconColor: 'text-luxury-blue' },
                                { label: 'Total Revenue', value: dashboardStats?.totalRevenue ? `₹${Number(dashboardStats.totalRevenue).toLocaleString('en-IN')}` : '—', sub: 'All time', icon: TrendingUp, color: 'from-green-500/20 to-transparent', iconColor: 'text-green-400' },
                                { label: 'Avg Occupancy', value: dashboardStats?.occupancyRate ? `${dashboardStats.occupancyRate}%` : (dashboardStats?.rooms ? `${Math.round((dashboardStats.occupiedRooms / dashboardStats.rooms) * 100)}%` : '—'), sub: 'Current period', icon: Building, color: 'from-purple-500/20 to-transparent', iconColor: 'text-purple-400' },
                                { label: 'Total Reviews', value: dashboardStats?.totalReviews ?? (adminReviews?.length ?? '—'), sub: 'Submitted', icon: Star, color: 'from-amber-500/20 to-transparent', iconColor: 'text-amber-400' },
                            ].map((kpi, i) => {
                                const Icon = kpi.icon;
                                return (
                                    <div key={i} className={`bg-luxury-card border border-luxury-border rounded-2xl p-6 bg-gradient-to-br ${kpi.color}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">{kpi.label}</p>
                                                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                                                <p className="text-[10px] text-luxury-muted mt-1">{kpi.sub}</p>
                                            </div>
                                            <Icon className={`w-8 h-8 ${kpi.iconColor} opacity-40`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Booking Status Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-luxury-card border border-luxury-border rounded-2xl p-8">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-luxury-blue" /> Booking Status Distribution</h3>
                                {(() => {
                                    const statuses = ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
                                    const colors = { Confirmed: 'bg-blue-500', CheckedIn: 'bg-green-500', CheckedOut: 'bg-amber-400', Cancelled: 'bg-red-500' };
                                    const counts = statuses.map(s => (adminBookings || []).filter(b => b.status === s).length);
                                    const total = counts.reduce((a, b) => a + b, 0) || 1;
                                    return (
                                        <div className="space-y-4">
                                            {statuses.map((s, i) => (
                                                <div key={s}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-luxury-muted font-bold">{s}</span>
                                                        <span className="text-white font-bold">{counts[i]} <span className="text-luxury-muted/60">({Math.round(counts[i] / total * 100)}%)</span></span>
                                                    </div>
                                                    <div className="h-2 bg-luxury-dark rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[s]} rounded-full transition-all duration-700`} style={{ width: `${Math.round(counts[i] / total * 100)}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-[10px] text-luxury-muted/50 mt-4 uppercase tracking-widest">Total {total} booking{total !== 1 ? 's' : ''} on record</p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Review Rating Distribution */}
                            <div className="bg-luxury-card border border-luxury-border rounded-2xl p-8">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Review Rating Distribution</h3>
                                {(() => {
                                    const reviews = adminReviews || [];
                                    return [5, 4, 3, 2, 1].map(star => {
                                        const count = reviews.filter(r => Math.round(r.overallRating) === star).length;
                                        const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3 mb-3">
                                                <span className="text-white font-bold text-xs w-4">{star}</span>
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                                                <div className="flex-1 h-2 bg-luxury-dark rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-luxury-muted text-[10px] w-8 text-right">{count}</span>
                                            </div>
                                        );
                                    });
                                })()}
                                <p className="text-[10px] text-luxury-muted/50 mt-3 uppercase tracking-widest">{(adminReviews || []).length} total reviews</p>
                            </div>
                        </div>

                        {/* Revenue by Location */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" /> Revenue by Location</h3>
                            {(() => {
                                const bookings = (adminBookings || []).filter(b => b.status !== 'Cancelled');
                                const byLocation = {};
                                bookings.forEach(b => {
                                    const city = b.room?.location?.city || b.location?.city || 'Unknown';
                                    byLocation[city] = (byLocation[city] || 0) + (b.totalPrice || 0);
                                });
                                const entries = Object.entries(byLocation).sort((a, b) => b[1] - a[1]);
                                const maxVal = entries[0]?.[1] || 1;
                                if (entries.length === 0) return <p className="text-luxury-muted text-sm">No booking revenue data available yet.</p>;
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {entries.map(([city, revenue]) => (
                                            <div key={city}>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-white font-bold">{city}</span>
                                                    <span className="text-green-400 font-bold">₹{revenue.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="h-2 bg-luxury-dark rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${Math.round(revenue / maxVal * 100)}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Room Type Performance */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Bed className="w-5 h-5 text-purple-400" /> Most Booked Room Types</h3>
                            {(() => {
                                const bookings = adminBookings || [];
                                const byType = {};
                                bookings.filter(b => b.status !== 'Cancelled').forEach(b => {
                                    const t = b.room?.type || 'Unknown';
                                    byType[t] = (byType[t] || 0) + 1;
                                });
                                const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 6);
                                const maxVal = entries[0]?.[1] || 1;
                                if (entries.length === 0) return <p className="text-luxury-muted text-sm">No data yet.</p>;
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {entries.map(([type, count], i) => (
                                            <div key={type} className="p-5 bg-luxury-dark rounded-xl border border-luxury-border">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-white font-bold text-sm">{type}</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-luxury-blue/10 text-luxury-blue border border-luxury-blue/20">
                                                        #{i + 1}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full mb-2">
                                                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.round(count / maxVal * 100)}%` }} />
                                                </div>
                                                <p className="text-[10px] text-luxury-muted">{count} bookings</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Insights */}
                        <div className="p-6 bg-luxury-blue/5 border border-luxury-blue/20 rounded-2xl">
                            <h4 className="text-sm font-bold text-luxury-blue uppercase tracking-widest mb-3">💡 System Insights</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-luxury-muted">
                                <div><p className="text-white font-bold mb-1">Peak Booking Period</p><p>Data updates in real-time from the bookings database. Filter by date in the main dashboard view.</p></div>
                                <div><p className="text-white font-bold mb-1">Revenue Attribution</p><p>Only confirmed & checked-in/out bookings are counted toward revenue figures.</p></div>
                                <div><p className="text-white font-bold mb-1">Review Impact</p><p>Higher-rated rooms (4★+) see 2.3× more repeat bookings. Encourage guest reviews.</p></div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text selection:bg-luxury-gold selection:text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-[#11141D] border-r border-luxury-border flex flex-col z-[50] fixed inset-y-0 hidden lg:flex">
                {/* Logo Section — fixed at top */}
                <div className="flex-shrink-0 px-8 pt-8 pb-6 w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-luxury-blue rounded-xl flex items-center justify-center shadow-lg shadow-luxury-blue/20">
                            <Building className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Hotel Central</h1>
                    </div>
                </div>

                {/* Navigation Menu — scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-4 custom-scrollbar">
                    <div className="space-y-10">
                        {['MAIN MENU', 'SERVICES', 'ENGAGEMENT'].map((category) => (
                            <div key={category}>
                                <h3 className="text-[10px] font-bold text-luxury-muted tracking-[0.2em] mb-4 pl-4">{category}</h3>
                                <div className="space-y-1">
                                    {sidebarItems.filter(item => item.category === category).map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeSection === item.id ? 'bg-luxury-blue/10 text-luxury-blue' : 'text-luxury-muted hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${activeSection === item.id ? 'text-luxury-blue' : 'text-luxury-muted group-hover:text-luxury-blue'}`} />
                                            <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                            {activeSection === item.id && (
                                                <span className="ml-auto w-1 h-1 rounded-full bg-luxury-blue"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Profile Hook — pinned at bottom */}
                <div className="flex-shrink-0 p-6 w-full border-t border-luxury-border/50">
                    <div className="p-4 rounded-2xl bg-white/[0.02] flex items-center gap-4 group cursor-pointer hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-luxury-gold/50 flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">Admin</h4>
                            <p className="text-[10px] text-luxury-muted uppercase tracking-widest font-bold">Global Admin</p>
                        </div>
                        <Settings className="w-4 h-4 text-luxury-muted group-hover:text-luxury-gold transition-all flex-shrink-0" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 h-screen overflow-y-auto bg-luxury-dark/50 custom-scrollbar">
                <div className="max-w-[1600px] w-full mx-auto mt-6 px-4 md:px-12 pb-20">
                    {/* Top Bar Decoration */}
                    <div className="flex items-center justify-between mb-12 py-6 border-b border-luxury-border">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-luxury-muted uppercase tracking-widest">Admin Command Center</span>
                            <span className="w-1 h-1 rounded-full bg-luxury-blue"></span>
                            <span className="text-xs font-serif italic text-luxury-gold capitalize">{activeSection.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Notification Hub */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`relative p-3 rounded-xl transition-all duration-300 ${isNotificationOpen ? 'bg-luxury-gold text-zinc-900 shadow-lg shadow-luxury-gold/20' : 'bg-white/5 text-luxury-muted hover:text-white hover:bg-white/10'}`}
                                >
                                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-luxury-dark rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-4 w-96 bg-luxury-card border border-luxury-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
                                        <div className="p-6 border-b border-luxury-border flex items-center justify-between bg-gradient-to-r from-luxury-gold/5 to-transparent">
                                            <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-luxury-gold" />
                                                System Alerts
                                            </h4>
                                            <button
                                                onClick={handleClearNotifications}
                                                className="text-[10px] font-bold text-luxury-muted hover:text-red-500 uppercase tracking-widest transition-colors"
                                            >
                                                Purge All
                                            </button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <CheckCircle className="w-10 h-10 text-luxury-muted/20 mx-auto mb-4" />
                                                    <p className="text-xs text-luxury-muted font-bold uppercase tracking-widest">Aether is Silent</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif._id}
                                                        onClick={() => handleMarkAsRead(notif._id)}
                                                        className={`p-6 border-b border-luxury-border/50 hover:bg-white/5 transition-all cursor-pointer group ${!notif.isRead ? 'bg-luxury-blue/5 border-l-2 border-l-luxury-blue' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${notif.status === 'Urgent' ? 'bg-red-500 text-white' : 'bg-luxury-blue/20 text-luxury-blue'}`}>
                                                                {notif.type}
                                                            </span>
                                                            <span className="text-[9px] text-luxury-muted font-medium">
                                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-white leading-relaxed group-hover:text-luxury-gold transition-colors">{notif.message}</p>
                                                        {!notif.isRead && <div className="mt-3 text-[8px] font-bold text-luxury-blue uppercase tracking-widest">Mark as observed</div>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-4 bg-luxury-dark/50 text-center border-t border-luxury-border">
                                                <p className="text-[9px] text-luxury-muted uppercase tracking-widest font-bold">End of Log Stream</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">System Online</span>
                            </div>
                            <button onClick={handleLogout} className="text-luxury-muted hover:text-red-500 transition-colors">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-luxury-dark/90 backdrop-blur-sm">
                    <div className="bg-luxury-card border border-luxury-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-luxury-border flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-5 h-5 text-luxury-blue" />
                                Onboard New Staff
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-luxury-muted hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
                            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg">{error}</div>}
                            {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg">{success}</div>}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Jean-Luc Picard"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={staffFormData.fullName}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="staff@luxestay.com"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={staffFormData.email}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                        value={staffFormData.password}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Assign Role</label>
                                    <select
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all capitalize"
                                        value={staffFormData.role}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                                    >
                                        {['driver', 'cook', 'room-service', 'plumber', 'cleaner'].map(r => (
                                            <option key={r} value={r} className="bg-luxury-dark">{r.replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Assigned Location</label>
                                <select
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={staffFormData.location}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, location: e.target.value })}
                                >
                                    <option value="">Select a Global Hub</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id} className="bg-luxury-dark">{l.city}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Provisioning Assets...' : 'Authorize Personnel'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {isEditStaffModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-luxury-dark/90 backdrop-blur-sm">
                    <div className="bg-luxury-card border border-luxury-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-luxury-border flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-luxury-gold" />
                                Modify Personnel Profile
                            </h3>
                            <button onClick={() => setIsEditStaffModalOpen(false)} className="text-luxury-muted hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStaff} className="p-8 space-y-6">
                            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg">{error}</div>}
                            {success && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg">{success}</div>}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={editStaffFormData.fullName}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Base ID / Email Prefix</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={editStaffFormData.email}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Access Key</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-gold transition-all"
                                        value={editStaffFormData.password}
                                        onChange={(e) => setEditStaffFormData({ ...editStaffFormData, password: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Service Role</label>
                                    <select
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all capitalize"
                                        value={editStaffFormData.role}
                                        onChange={(e) => setEditStaffFormData({ ...editStaffFormData, role: e.target.value })}
                                    >
                                        {['driver', 'cook', 'room-service', 'plumber', 'cleaner'].map(r => (
                                            <option key={r} value={r} className="bg-luxury-dark">{r.replace('-', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Global Sector</label>
                                <select
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={editStaffFormData.location}
                                    onChange={(e) => setEditStaffFormData({ ...editStaffFormData, location: e.target.value })}
                                >
                                    <option value="">Select a Hub</option>
                                    {locations.filter(l => l.status === 'Active').map(l => (
                                        <option key={l._id} value={l._id} className="bg-luxury-dark">{l.city}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-luxury-gold hover:bg-luxury-gold/80 text-zinc-900 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Synchronizing Archive...' : 'Push Configuration Updates'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-luxury-dark/90 backdrop-blur-sm">
                    <div className="bg-luxury-card border border-luxury-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-luxury-border flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Plus className="w-5 h-5 text-luxury-blue" />
                                Establish New Property
                            </h3>
                            <button onClick={() => setIsLocationModalOpen(false)} className="text-luxury-muted hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLocation} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {error && <div className="col-span-full p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg">{error}</div>}
                            {success && <div className="col-span-full p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg">{success}</div>}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">City Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Monaco"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.city}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Region / Category</label>
                                <select
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.category}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, category: e.target.value })}
                                >
                                    <option value="India">India Series</option>
                                    <option value="International">International Collection</option>
                                </select>
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Brand Narrative / Description</label>
                                <textarea
                                    required
                                    placeholder="The ultimate urban escape with breathtaking views..."
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all h-24"
                                    value={locationFormData.description}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Starting Price</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. ₹20,000"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.price}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, price: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Total Room Count</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.rooms}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, rooms: e.target.value })}
                                />
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Operational Status</label>
                                <div className="flex gap-4">
                                    {['Active', 'Coming Soon'].map((s) => (
                                        <label key={s} className={`flex-1 flex items-center justify-center py-3 rounded-lg border cursor-pointer transition-all font-bold text-[10px] uppercase tracking-widest ${locationFormData.status === s ? 'bg-luxury-blue border-luxury-blue text-white shadow-lg' : 'bg-luxury-dark border-luxury-border text-luxury-muted hover:border-luxury-blue/50'}`}>
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
                                className="col-span-full py-4 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Acquiring Land...' : 'Establish Location'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Location Modal */}
            {isEditLocationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-luxury-dark/80 backdrop-blur-xl" onClick={() => setIsEditLocationModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-luxury-border flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white font-serif italic">Edit Location</h3>
                                <p className="text-xs text-luxury-muted mt-1">Update details for {selectedLocationForEdit?.city}</p>
                            </div>
                            <button onClick={() => setIsEditLocationModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <Plus className="w-6 h-6 text-luxury-muted rotate-45" />
                            </button>
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm text-center font-bold tracking-wide">{error}</div>}
                        {success && <div className="p-4 bg-green-500/10 border-b border-green-500/20 text-green-400 text-sm text-center font-bold tracking-wide">{success}</div>}

                        <form onSubmit={handleUpdateLocation} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Global Region</label>
                                <div className="flex gap-4">
                                    {['India', 'International'].map((c) => (
                                        <label key={c} className={`flex-1 flex items-center justify-center py-2 rounded-lg border cursor-pointer transition-all font-bold text-[10px] uppercase tracking-widest ${locationFormData.category === c ? 'bg-luxury-gold border-luxury-gold text-zinc-900 shadow-lg' : 'bg-luxury-dark border-luxury-border text-luxury-muted hover:border-luxury-gold/50'}`}>
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

                            <div className="space-y-1 col-span-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Destination Name / City</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Maldives"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.city}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })}
                                />
                            </div>

                            <div className="col-span-full space-y-1">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Luxury Profile Description</label>
                                <textarea
                                    required
                                    placeholder="Describe the experience..."
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-luxury-blue h-20 resize-none transition-all"
                                    value={locationFormData.description}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Base Rate Symbol/Price</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. ₹20,000"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.price}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, price: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Total Room Count</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-luxury-blue transition-all"
                                    value={locationFormData.rooms}
                                    onChange={(e) => setLocationFormData({ ...locationFormData, rooms: e.target.value })}
                                />
                            </div>

                            <div className="col-span-full space-y-1">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Operational Status</label>
                                <div className="flex gap-4">
                                    {['Active', 'Coming Soon'].map((s) => (
                                        <label key={s} className={`flex-1 flex items-center justify-center py-2 rounded-lg border cursor-pointer transition-all font-bold text-[10px] uppercase tracking-widest ${locationFormData.status === s ? 'bg-luxury-blue border-luxury-blue text-white shadow-lg' : 'bg-luxury-dark border-luxury-border text-luxury-muted hover:border-luxury-blue/50'}`}>
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
                                className="col-span-full py-3 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg text-sm font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Room Modal */}
            {isEditRoomModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-luxury-dark/80 backdrop-blur-xl" onClick={() => setIsEditRoomModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-luxury-card border border-luxury-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-luxury-border flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white font-serif italic">Edit Room Logistics</h3>
                                <p className="text-xs text-luxury-muted">Unit {selectedRoomForEdit?.roomNumber} at {locations.find(l => l._id === selectedRoomLocation)?.city}</p>
                            </div>
                            <button onClick={() => setIsEditRoomModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <Plus className="w-6 h-6 text-luxury-muted rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateRoom} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Rate per Night ($)</label>
                                    <input
                                        type="number"
                                        value={editRoomFormData.price}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, price: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Occupancy Status</label>
                                    <select
                                        value={editRoomFormData.status}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, status: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Limited">Limited</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">View Perspective</label>
                                    <input
                                        type="text"
                                        value={editRoomFormData.viewType}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, viewType: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue"
                                        placeholder="e.g. Ocean View"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Bed Configuration</label>
                                    <input
                                        type="text"
                                        value={editRoomFormData.bedType}
                                        onChange={(e) => setEditRoomFormData({ ...editRoomFormData, bedType: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue"
                                        placeholder="e.g. King Size"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Included Amenities (comma separated)</label>
                                <textarea
                                    value={editRoomFormData.amenities}
                                    onChange={(e) => setEditRoomFormData({ ...editRoomFormData, amenities: e.target.value })}
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue h-20 resize-none"
                                    placeholder="Free WiFi, Mini Bar, Smart TV..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Elite Privileges (comma separated)</label>
                                <textarea
                                    value={editRoomFormData.benefits}
                                    onChange={(e) => setEditRoomFormData({ ...editRoomFormData, benefits: e.target.value })}
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-luxury-blue h-20 resize-none"
                                    placeholder="Welcome Drinks, Breakfast, Airport Transfer..."
                                />
                            </div>

                            <div className="pt-4 border-t border-luxury-border flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditRoomModalOpen(false)}
                                    className="flex-1 py-4 bg-luxury-dark text-white rounded-xl font-bold hover:bg-white/5 transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 bg-luxury-gold text-zinc-900 rounded-xl font-bold hover:bg-luxury-gold/90 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            Certify Logistics
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add New Unit Modal */}
            {isAddUnitModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-luxury-dark/90 backdrop-blur-2xl" onClick={() => setIsAddUnitModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-luxury-card border border-luxury-border rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
                        {/* Dynamic Header */}
                        <div className="p-10 border-b border-luxury-border flex justify-between items-start bg-gradient-to-r from-luxury-blue/5 to-transparent">
                            <div>
                                <div className="flex items-center gap-3 text-luxury-gold mb-2">
                                    <Building className="w-4 h-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Architectural Expansion</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white font-serif italic">Manifest New Unit</h3>
                                <p className="text-sm text-luxury-muted mt-2">Integrating a new asset into the {locations.find(l => l._id === selectedRoomLocation)?.city} Hub portfolio.</p>
                            </div>
                            <button onClick={() => setIsAddUnitModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-luxury-border">
                                <Plus className="w-6 h-6 text-luxury-muted rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRoom} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Duplication Engine */}
                            <div className="p-6 bg-luxury-blue/5 border border-luxury-blue/20 rounded-2xl flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-luxury-blue flex items-center justify-center text-white shadow-lg">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Clone Logistics</h4>
                                        <p className="text-[10px] text-luxury-muted uppercase tracking-wider font-bold">Use existing unit as architectural template</p>
                                    </div>
                                </div>
                                <select
                                    className="bg-luxury-dark border border-luxury-border rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-luxury-blue min-w-[200px]"
                                    onChange={(e) => handleDuplicateRoom(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select unit to clone...</option>
                                    {rooms.map(r => (
                                        <option key={r._id} value={r._id}>Unit {r.roomNumber} - {r.type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Unit Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={addUnitFormData.roomNumber}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, roomNumber: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 transition-all"
                                        placeholder="e.g. 402B"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Asset Category</label>
                                    <select
                                        value={addUnitFormData.type}
                                        onChange={(e) => handleRoomTypeChange(e.target.value)}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-blue"
                                    >
                                        {[
                                            'Single Room', 'Double Room', 'Family Room', 'Deluxe Room', 'Executive Room',
                                            'Honeymoon Suite', 'Themed Room', 'Presidential Suite', 'Accessible Room',
                                            'Beach-connected Room', 'Private Pool Room', 'Exclusive Suite'
                                        ].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Operational Floor</label>
                                    <select
                                        value={addUnitFormData.floor}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, floor: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-blue"
                                    >
                                        {['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Luxury Wing', 'Location Special'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Rate per Night ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={addUnitFormData.price}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, price: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-blue"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">View Spectrum</label>
                                    <input
                                        type="text"
                                        value={addUnitFormData.viewType}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, viewType: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-blue"
                                        placeholder="City View"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Bed Configuration</label>
                                    <input
                                        type="text"
                                        value={addUnitFormData.bedType}
                                        onChange={(e) => setAddUnitFormData({ ...addUnitFormData, bedType: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-blue"
                                        placeholder="King Size"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 bg-white/[0.02] p-8 rounded-3xl border border-luxury-border">
                                <div className="space-y-6">
                                    <label className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em] block">Occupancy Capacity</label>
                                    <div className="flex gap-6">
                                        <div className="flex-1 space-y-2">
                                            <span className="text-[9px] font-bold text-luxury-muted uppercase">Adults</span>
                                            <div className="flex items-center gap-4 bg-luxury-dark border border-luxury-border rounded-xl p-2">
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, adults: Math.max(1, addUnitFormData.adults - 1) })} className="w-8 h-8 rounded-lg hover:bg-white/5 text-white">-</button>
                                                <span className="flex-1 text-center text-sm font-bold text-white">{addUnitFormData.adults}</span>
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, adults: addUnitFormData.adults + 1 })} className="w-8 h-8 rounded-lg hover:bg-white/5 text-white">+</button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <span className="text-[9px] font-bold text-luxury-muted uppercase">Children</span>
                                            <div className="flex items-center gap-4 bg-luxury-dark border border-luxury-border rounded-xl p-2">
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, children: Math.max(0, addUnitFormData.children - 1) })} className="w-8 h-8 rounded-lg hover:bg-white/5 text-white">-</button>
                                                <span className="flex-1 text-center text-sm font-bold text-white">{addUnitFormData.children}</span>
                                                <button type="button" onClick={() => setAddUnitFormData({ ...addUnitFormData, children: addUnitFormData.children + 1 })} className="w-8 h-8 rounded-lg hover:bg-white/5 text-white">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <label className="text-xs font-bold text-luxury-gold uppercase tracking-[0.2em] block">Luxury Tier</label>
                                    <div className="flex items-center gap-2 h-12 bg-luxury-dark border border-luxury-border rounded-xl px-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setAddUnitFormData({ ...addUnitFormData, luxuryLevel: star })}
                                                className="transition-transform active:scale-95"
                                            >
                                                <Shield className={`w-5 h-5 transition-colors ${addUnitFormData.luxuryLevel >= star ? 'text-luxury-gold fill-luxury-gold' : 'text-luxury-muted/30'}`} />
                                            </button>
                                        ))}
                                        <span className="ml-auto text-[10px] font-bold text-luxury-gold uppercase tracking-widest">{addUnitFormData.luxuryLevel}.0 Shield Rating</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Included Amenities</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {standardAmenities.map(amt => (
                                            <label key={amt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${addUnitFormData.amenities.includes(amt) ? 'bg-luxury-blue/10 border-luxury-blue/40 text-white' : 'bg-luxury-dark border-luxury-border text-luxury-muted hover:border-luxury-muted/50'}`}>
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
                                                <span className="text-[10px] font-bold tracking-tight">{amt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-1">Elite Privileges</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {standardBenefits.map(ben => (
                                            <label key={ben} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${addUnitFormData.benefits.includes(ben) ? 'bg-luxury-gold/10 border-luxury-gold/40 text-luxury-gold' : 'bg-luxury-dark border-luxury-border text-luxury-muted hover:border-luxury-muted/50'}`}>
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
                                                <span className="text-[10px] font-bold tracking-tight">{ben}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex gap-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUnitModalOpen(false)}
                                    className="flex-1 py-5 bg-luxury-dark border border-luxury-border text-white rounded-2xl font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel Expansion
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-5 bg-luxury-blue text-white rounded-2xl font-bold hover:bg-luxury-blue-hover transition-all shadow-xl shadow-luxury-blue/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            Certify New Asset
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
                    <div className="absolute inset-0 bg-luxury-dark/95 backdrop-blur-2xl" onClick={() => setIsMenuModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-luxury-card border border-luxury-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-luxury-border flex justify-between items-start bg-gradient-to-r from-luxury-gold/5 to-transparent">
                            <div>
                                <h3 className="text-3xl font-bold text-white font-serif italic">{selectedMenuItemForEdit ? 'Update Culinary Profile' : 'Integrate New Asset'}</h3>
                                <p className="text-sm text-luxury-muted mt-2 uppercase tracking-widest font-bold text-[10px]">Culinary Inventory Management System</p>
                            </div>
                            <button onClick={() => setIsMenuModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-luxury-border">
                                <Plus className="w-6 h-6 text-luxury-muted rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={selectedMenuItemForEdit ? handleUpdateMenuItem : handleCreateMenuItem} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Dish Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={menuFormData.name}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-luxury-gold transition-all"
                                        placeholder="e.g. Wagyu Ribeye"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Rate (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={menuFormData.price}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-luxury-gold transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Gastronomic Narrative (Description)</label>
                                <textarea
                                    required
                                    value={menuFormData.description}
                                    onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                                    className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-luxury-gold transition-all h-28 resize-none"
                                    placeholder="Describe the culinary experience..."
                                />
                            </div>

                            {/* Image URL */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Dish Image URL</label>
                                <div className="flex gap-3 items-start">
                                    <input
                                        type="url"
                                        value={menuFormData.image || ''}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                                        className="flex-1 bg-luxury-dark border border-luxury-border rounded-xl px-6 py-4 text-white text-sm outline-none focus:border-luxury-gold transition-all"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    {menuFormData.image && (
                                        <img src={menuFormData.image} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-luxury-border flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Classification</label>
                                    <select
                                        value={menuFormData.category}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-luxury-blue"
                                    >
                                        {menuCategories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Dietary Type</label>
                                    <div className="flex items-center h-14 bg-luxury-dark border border-luxury-border rounded-xl p-1 gap-1">
                                        {['Veg', 'Non-Veg', 'Vegan'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMenuFormData({ ...menuFormData, dietaryType: type })}
                                                className={`flex-1 h-full rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${menuFormData.dietaryType === type ? 'bg-luxury-gold text-zinc-900 shadow-lg' : 'text-luxury-muted hover:bg-white/5'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest px-2">Preparation (Mins)</label>
                                    <input
                                        type="text"
                                        value={menuFormData.preparationTime}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, preparationTime: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-luxury-gold"
                                        placeholder="e.g. 15 mins"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <label className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all ${menuFormData.isComplimentary ? 'bg-luxury-gold/10 border-luxury-gold/50' : 'bg-luxury-dark border-luxury-border'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${menuFormData.isComplimentary ? 'bg-luxury-gold text-white' : 'bg-white/5 text-luxury-muted'}`}>
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Complimentary</h4>
                                            <p className="text-[10px] text-luxury-muted uppercase font-bold tracking-widest">Included with specific suites</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-luxury-gold"
                                        checked={menuFormData.isComplimentary}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, isComplimentary: e.target.checked })}
                                    />
                                </label>

                                <label className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all ${menuFormData.isSpecial ? 'bg-luxury-blue/10 border-luxury-blue/50' : 'bg-luxury-dark border-luxury-border'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${menuFormData.isSpecial ? 'bg-luxury-blue text-white' : 'bg-white/5 text-luxury-muted'}`}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Chef's Special</h4>
                                            <p className="text-[10px] text-luxury-muted uppercase font-bold tracking-widest">Featured on seasonal highlights</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-luxury-blue"
                                        checked={menuFormData.isSpecial}
                                        onChange={(e) => setMenuFormData({ ...menuFormData, isSpecial: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div className="pt-10 flex gap-6">
                                <button
                                    type="button"
                                    onClick={() => setIsMenuModalOpen(false)}
                                    className="flex-1 py-5 bg-luxury-dark border border-luxury-border text-white rounded-2xl font-bold hover:bg-white/5 transition-all uppercase tracking-[0.2em] text-xs"
                                >
                                    Cancel Operations
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-5 bg-luxury-gold text-zinc-900 rounded-2xl font-bold hover:bg-luxury-gold/90 transition-all shadow-xl shadow-luxury-gold/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            {selectedMenuItemForEdit ? 'Certify Profile' : 'Integrate Asset'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;




