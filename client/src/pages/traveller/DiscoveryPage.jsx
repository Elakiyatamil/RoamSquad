import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PlannerPortalSection from '../../components/PlannerPortal/PlannerPortalSection';
import TypographicHeroSection from '../../components/TypoHero/TypographicHeroSection';
import CloudNavbarSection from '../../components/TypoHero/CloudNavbarSection';
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

    const toggleWishlist = (e, dest) => {
        e.preventDefault();
        e.stopPropagation();
        let updated;
        if (wishlist.find(item => item.id === dest.id)) {
            updated = wishlist.filter(item => item.id !== dest.id);
        } else {
            updated = [...wishlist, { 
                id: dest.id, 
                name: dest.name, 
                location: dest.location, 
                image: dest.coverImage, 
                type: 'Destination',
                path: `/destinations/${dest.slug}`
            }];
        }
        setWishlist(updated);
        localStorage.setItem('roam_wishlist', JSON.stringify(updated));
    };

    return (
        <div className="discovery-cosmos-parent relative">
            {/* Editorial Typographic Arch Hero */}
            <TypographicHeroSection />
            <PlannerPortalSection />
            <CloudNavbarSection />

            <ExpandingCards />
            <SocialProofSection />
        </div>
    );
};

export default DiscoveryPage;
