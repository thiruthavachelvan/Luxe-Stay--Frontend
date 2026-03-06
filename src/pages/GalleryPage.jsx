import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Filter, X, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
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
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            <main className="pt-40 pb-24 px-6 container mx-auto relative overflow-hidden">
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Hero / Intro */}
                <div className="max-w-4xl mb-24 relative z-10">
                    <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">The Visual Registry</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-8 tracking-tight leading-[0.9] animate-in fade-in slide-in-from-top-8 duration-1000">
                        A study in <br />
                        <span className="text-gold-400">excellence.</span>
                    </h1>

                    <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Explore the meticulous architecture and curated atmospheres that define our global sanctuaries. Each frame a testament to the art of luxury.
                    </p>
                </div>

                {/* Filters - Glassmorphism Pills */}
                <div className="flex flex-wrap items-center gap-4 mb-20 relative z-10">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${selectedCategory === category
                                ? 'bg-gold-400 border-gold-400 text-navy-950 shadow-2xl shadow-gold-400/20'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Cinematic Masonry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:auto-rows-[300px] relative z-10">
                    {filteredGallery.length === 0 ? (
                        <div className="col-span-full py-32 glass-panel flex flex-col items-center justify-center gap-6 border-dashed border-white/10">
                            <ImageIcon className="w-12 h-12 text-white/10" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Registry entries coming soon</p>
                        </div>
                    ) : (
                        filteredGallery.map((item, i) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className={`group relative rounded-[32px] overflow-hidden cursor-pointer glass-panel border-white/10 animate-in fade-in zoom-in-95 duration-700 ${selectedCategory === 'All' ? item.span : 'col-span-1 row-span-1'
                                    }`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0">
                                    <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.3em] mb-4 block translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">{item.category}</span>
                                    <h3 className="text-2xl font-serif italic text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200">{item.title}</h3>

                                    <div className="mt-8 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-300">
                                        <span>Full Preview</span>
                                        <div className="h-px w-8 bg-gold-400/30" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Lightbox Modal - Immersive Cinema Mode */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-10 right-10 w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white/40 hover:text-white transition-all z-50 group hover:border-gold-400/50"
                    >
                        <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 animate-in zoom-in-95 duration-700">
                        <div className="w-full md:w-2/3 glass-panel p-2 rotate-1 group hover:rotate-0 transition-transform duration-1000">
                            <img
                                src={selectedImage.image}
                                alt={selectedImage.title}
                                className="w-full h-auto object-contain rounded-[24px] shadow-[0_0_100px_rgba(212,175,55,0.1)]"
                            />
                        </div>

                        <div className="w-full md:w-1/3 space-y-8">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">{selectedImage.category}</span>
                                <h2 className="text-5xl font-serif italic text-white leading-tight">{selectedImage.title}</h2>
                            </div>

                            <div className="h-px w-24 bg-gold-400/20" />

                            <p className="text-white/40 font-light leading-relaxed">
                                Experience the pinnacle of cinematic living. Our {selectedImage.category.toLowerCase()} are engineered to provide an atmosphere of profound tranquility and absolute luxury.
                            </p>

                            <button onClick={() => setSelectedImage(null)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-400 hover:text-white transition-colors flex items-center gap-4 group">
                                <div className="w-12 h-px bg-gold-400/30 group-hover:w-16 transition-all" />
                                Return to Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default GalleryPage;





