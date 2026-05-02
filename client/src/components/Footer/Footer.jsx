import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="ft-wrapper">
      <div className="ft-inner">
        <div className="ft-brand">
          <img src="/logo.png" alt="RoamSquad" className="ft-logo-img" />
        </div>

        <div className="ft-links-group">
          <div className="ft-col">
            <span className="ft-col-title">Explore</span>
            <a href="/packages" className="ft-link">Packages</a>
            <a href="/events" className="ft-link">Events</a>
            <a href="/planner" className="ft-link">Trip Planner</a>
            <a href="/wishlist" className="ft-link">Wishlist</a>
          </div>
          <div className="ft-col">
            <span className="ft-col-title">Company</span>
            <a href="#" className="ft-link">About Us</a>
            <a href="#" className="ft-link">How It Works</a>
            <a href="#" className="ft-link">Contact</a>
          </div>
          <div className="ft-col">
            <span className="ft-col-title">Legal</span>
            <a href="#" className="ft-link">Privacy Policy</a>
            <a href="#" className="ft-link">Terms of Service</a>
          </div>
        </div>
      </div>

      <div className="ft-bottom">
        <span>&#169; 2025 RoamSquad. All rights reserved.</span>
        <div className="ft-socials">
          <a href="#" className="ft-social-link">Instagram</a>
          <a href="#" className="ft-social-link">Twitter</a>
          <a href="#" className="ft-social-link">YouTube</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
