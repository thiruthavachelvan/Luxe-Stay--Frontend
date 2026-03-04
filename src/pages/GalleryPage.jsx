import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Filter, X, Image as ImageIcon } from 'lucide-react';
import Footer from '../components/Footer';

const GalleryPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('userData'));
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);

    const categories = ['All', 'Exterior', 'Rooms & Suites', 'Dining', 'Spa & Wellness', 'Facilities'];

    // Gallery Data with high-quality unsplash images matching the luxury theme
    const galleryItems = [
        { id: 1, title: 'Grand Exterior Entrance', category: 'Exterior', image: 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80', span: 'col-span-2 row-span-2' },
        { id: 2, title: 'Presidential Suite Bedroom', category: 'Rooms & Suites', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 3, title: 'The Grand Brasserie', category: 'Dining', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-2' },
        { id: 4, title: 'LuxeStay Spa Reception', category: 'Spa & Wellness', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 5, title: 'Infinity Pool', category: 'Facilities', image: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&q=80', span: 'col-span-2 row-span-1' },
        { id: 6, title: 'Ocean View Balcony', category: 'Rooms & Suites', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 7, title: 'Craft Cocktails at the Bar', category: 'Dining', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 8, title: 'Thermal Stone Massage', category: 'Spa & Wellness', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 9, title: 'State-of-the-art Fitness Center', category: 'Facilities', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80', span: 'col-span-1 row-span-1' },
        { id: 10, title: 'Executive Lounge', category: 'Facilities', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', span: 'col-span-2 row-span-1' },
    ];

    const filteredGallery = selectedCategory === 'All'
        ? galleryItems
        : galleryItems.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-[#0F1626] font-sans text-white">
            {/* Nav Header */}
            <header className="fixed top-0 w-full z-50 bg-[#0F1626]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="container mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center bg-white/5">
                                <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-wider">
                                LuxeStay<span className="font-serif italic text-white/70 ml-1 font-normal">Gallery</span>
                            </span>
                        </div>
                        <nav className="hidden lg:flex gap-8">
                            <button onClick={() => navigate('/restaurant')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Dining</button>
                            <button onClick={() => navigate('/rooms')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Rooms</button>
                            <button onClick={() => navigate('/spa')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Spa</button>
                            <button className="text-white font-bold text-sm">Gallery</button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-yellow-200 border-2 border-[#0F1626] flex items-center justify-center font-bold text-[#0F1626] cursor-pointer" onClick={() => navigate('/dashboard')}>
                                {(user.name || 'G')[0].toUpperCase()}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0F1626] rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
                                <User className="w-4 h-4" />
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
                {/* Hero / Intro */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold font-serif italic text-white mb-6">
                        Visual Journey
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Explore the meticulous design, elegant atmospheres, and breathtaking views that define the LuxeStay experience.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                    <div className="flex items-center gap-2 mr-4 text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">Filter by:</span>
                    </div>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === category
                                    ? 'bg-white text-[#0F1626] shadow-lg shadow-white/10'
                                    : 'bg-[#1A2235] text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Masonry-style Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:auto-rows-[250px]">
                    {filteredGallery.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500 border border-white/10 border-dashed rounded-3xl">
                            No images available in this category yet.
                        </div>
                    ) : (
                        filteredGallery.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-[#1A2235] border border-white/5 ${selectedCategory === 'All' ? item.span : 'col-span-1 row-span-1'
                                    }`}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626]/90 via-[#0F1626]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1">{item.category}</span>
                                    <h3 className="text-lg font-bold text-white font-serif">{item.title}</h3>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1626]/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-6xl w-full px-8 flex flex-col items-center">
                        <img
                            src={selectedImage.image}
                            alt={selectedImage.title}
                            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl mb-6"
                        />
                        <div className="text-center">
                            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-2 block">{selectedImage.category}</span>
                            <h2 className="text-3xl font-bold font-serif italic text-white">{selectedImage.title}</h2>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default GalleryPage;





