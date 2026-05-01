import React from 'react';
import RoamgHero from '../../components/RoamgHero/RoamgHero';
import './CosmosLayout.css';

const DiscoveryPage = () => {
    return (
        <div className="discovery-cosmos-parent relative bg-white">
            <RoamgHero />
            {/* The "Companion Selector" is now integrated into the bottom of RoamgHero */}
        </div>
    );
};

export default DiscoveryPage;
