import React from 'react';
import RoamgHero from '../../components/RoamgHero/RoamgHero';
import FeaturedSection from '../../components/FeaturedSection/FeaturedSection';
import LoveFromTheSquad from '../../components/LoveFromTheSquad/LoveFromTheSquad';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import AboutUs from '../../components/AboutUs/AboutUs';
import Footer from '../../components/Footer/Footer';
import './CosmosLayout.css';

const DiscoveryPage = () => {
    return (
        <div className="discovery-cosmos-parent relative">
            <RoamgHero />
            <FeaturedSection />
            <LoveFromTheSquad />
            <WhyChooseUs />
            <AboutUs />
            <Footer />
        </div>
    );
};

export default DiscoveryPage;
