import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DiscoverRooms from '../components/DiscoverRooms';
import Amenities from '../components/Amenities';
import GlobalPresence from '../components/GlobalPresence';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <DiscoverRooms />
                <Amenities />
                <GlobalPresence />
            </main>
            <Footer />
        </>
    );
};

export default HomePage;




