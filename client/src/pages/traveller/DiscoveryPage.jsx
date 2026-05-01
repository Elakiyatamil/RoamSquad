import React from 'react';
import RoamgHero from '../../components/RoamgHero/RoamgHero';
import DestinationStack from '../../components/DestinationStack/DestinationStack';
import StickySearch from '../../components/StickySearch/StickySearch';
import './CosmosLayout.css';

const DiscoveryPage = () => {
    return (
        <div className="discovery-cosmos-parent relative bg-black">
            <StickySearch />
            <RoamgHero />
            <DestinationStack />
        </div>
    );
};

export default DiscoveryPage;
