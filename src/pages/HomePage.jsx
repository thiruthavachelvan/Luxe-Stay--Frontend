import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import GlobalPresence from '../components/GlobalPresence';
import DiscoverRooms from '../components/DiscoverRooms';
import Amenities from '../components/Amenities';
import Offers from '../components/Offers';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import { motion, useScroll, useSpring } from "motion/react";

const HomePage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="bg-navy-950 min-h-screen text-white selection:bg-gold-400/30 selection:text-gold-200">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gold-400 origin-left z-[100]"
                style={{ scaleX }}
            />

            <Navbar />
            <main>
                <Hero />
                <GlobalPresence />
                <DiscoverRooms />
                <Amenities />
                <Offers />
                <Testimonials />
                <Newsletter />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
