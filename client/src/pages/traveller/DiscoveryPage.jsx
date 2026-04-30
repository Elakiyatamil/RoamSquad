import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import RoamgHero from '../../components/RoamgHero/RoamgHero';
import ExpandingCards from '../../components/ExpandingCards/ExpandingCards';
import SocialProofSection from '../../components/SocialProof/SocialProofSection';
import './CosmosLayout.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api/public`;

const DiscoveryPage = () => {
    const { data: destinations = [], isLoading } = useQuery({
        queryKey: ['public-destinations'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/destinations`);
            return res.data.data || [];
        }
    });

    const [wishlist, setWishlist] = React.useState([]);

    React.useEffect(() => {
        const saved = localStorage.getItem('roam_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    return (
        <div className="discovery-cosmos-parent relative bg-white">
            <RoamgHero />
            <div className="mt-12 bg-white">
                <ExpandingCards />
                <SocialProofSection />
            </div>
        </div>
    );
};

export default DiscoveryPage;
