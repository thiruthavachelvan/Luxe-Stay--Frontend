export const MEMBERSHIP_DISCOUNTS = {
    'Silver': 0.05,
    'Gold': 0.10,
    'Platinum': 0.15,
    'Diamond': 0.20,
    'Black Card': 0.30,
    'None': 0
};

export const calculateMemberPrice = (price, tier) => {
    const discount = MEMBERSHIP_DISCOUNTS[tier] || 0;
    return price * (1 - discount);
};

export const getTierDiscount = (tier) => {
    return (MEMBERSHIP_DISCOUNTS[tier] || 0) * 100;
};

export const TIER_BENEFITS = {
    'Silver': ['5% off all bookings', 'Priority check-in', 'Welcome drink on arrival'],
    'Gold': ['10% off bookings & dining', 'Lounge access', 'Late checkout', 'Complimentary breakfast (1 day)'],
    'Platinum': ['15% off all services', 'Spa credits ₹2,000', 'Room upgrades on availability', 'Complimentary breakfast (3 days)', 'Airport pickup'],
    'Diamond': ['20% off all services', 'Butler service', 'Airport transfer (both ways)', 'Complimentary breakfast (7 days)', 'Dedicated concierge line'],
    'Black Card': ['30% off all services', 'Personal concierge 24/7', 'Exclusive member events', 'Unlimited room upgrades', 'Complimentary all meals', 'Private transfers'],
};
