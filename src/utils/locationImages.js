export const locationImages = {
    'Mumbai': 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80',
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80',
    'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80',
    'Delhi': 'https://upload.wikimedia.org/wikipedia/commons/0/09/India_Gate_in_New_Delhi_03-2016.jpg',
    'Bangalore': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/M._Chinnaswamy_Stadium.jpg',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80',
    'New York': 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&q=80',
    'Tokyo': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80',
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
    'Singapore': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Marina_Bay_Sands_in_the_evening_-_20101120.jpg',
    'Melbourne': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Flinders_Street_Station%2C_Melbourne.jpg',
    'Auckland': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Auckland_Sky_Tower_2006.jpg',
    'Maldives': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Maldives_-_Kuramathi_Resort.jpg',
    'default': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'
};

export const getLocationImage = (city) => {
    return locationImages[city] || locationImages['default'];
};
