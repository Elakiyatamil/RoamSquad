import React from 'react';
import RoamgHero from '../../components/RoamgHero/RoamgHero';
import DestinationStack from '../../components/DestinationStack/DestinationStack';
import StickySearch from '../../components/StickySearch/StickySearch';
import FeaturedSection from '../../components/FeaturedSection/FeaturedSection';
import LoveFromTheSquad from '../../components/LoveFromTheSquad/LoveFromTheSquad';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import AboutUs from '../../components/AboutUs/AboutUs';
import Footer from '../../components/Footer/Footer';
import './CosmosLayout.css';

const DiscoveryPage = () => {
    return (
        <div className="discovery-cosmos-parent relative bg-black">
            <StickySearch />
            <RoamgHero />
            <DestinationStack />
            <div style={{ 
              height: '60px', 
              background: '#FAF8F4',
              borderRadius: '60px 60px 0 0',
              marginTop: '-60px',
              position: 'relative',
              zIndex: 2
            }} />
            <FeaturedSection />
            <LoveFromTheSquad />
            <WhyChooseUs />
            <AboutUs />
            <Footer />
        </div>
    );
};

export default DiscoveryPage;
