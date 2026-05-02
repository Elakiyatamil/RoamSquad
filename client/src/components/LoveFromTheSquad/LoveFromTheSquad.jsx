import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LoveFromTheSquad.css';

// Files are in /public/videos/ — served at /videos/*.mp4 by Vite
// import.meta.glob does NOT work for /public, so we hardcode the paths.
const videosList = [
  { id: 1, url: '/videos/12313766_1080_1920_30fps.mp4',   name: 'Squad Moments',   tag: 'TRAVEL' },
  { id: 2, url: '/videos/14784793_1920_1080_24fps.mp4',   name: 'Golden Horizons',  tag: 'EXPLORE' },
  { id: 3, url: '/videos/6317314-uhd_2160_3840_25fps.mp4', name: 'Into the Wild',   tag: 'ADVENTURE' },
  { id: 4, url: '/videos/7815139-uhd_2160_3840_30fps.mp4', name: 'Roam Together',   tag: 'JOURNEY' },
  { id: 5, url: '/videos/7823708-uhd_2160_3840_30fps.mp4', name: 'Sun & Summit',    tag: 'ESCAPE' },
];

const VideoCard = ({ video }) => {
  const videoRef = useRef(null);

  // Autoplay as soon as the card enters viewport
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    videoRef.current.paused
      ? videoRef.current.play().catch(() => {})
      : videoRef.current.pause();
  };

  return (
    <div className="lfts-video-card" onClick={togglePlay}>
      <video
        ref={videoRef}
        className="lfts-video-element"
        src={video.url}
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="lfts-video-overlay" />
      <div className="lfts-video-info">
        <div className="lfts-video-name">{video.name}</div>
      </div>
    </div>
  );
};

const LoveFromTheSquad = () => {
  return (
    <section className="lfts-wrapper">
      {/* Animated SVG Background Waves */}
      <div className="lfts-waves-bg" aria-hidden="true">
        <svg className="lfts-wave wave-1" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M0,100 Q250,20 500,100 T1000,100 T1500,100 T2000,100" />
        </svg>
        <svg className="lfts-wave wave-2" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M0,60 Q250,160 500,60 T1000,60 T1500,60 T2000,60" />
        </svg>
        <svg className="lfts-wave wave-3" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M0,140 Q250,40 500,140 T1000,140 T1500,140 T2000,140" />
        </svg>
      </div>

      <div className="lfts-content-layer">
        {/* HEADER */}
        <motion.div
          className="lfts-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="lfts-title">
            <span className="lfts-love">Love</span> from the{' '}
            <span className="lfts-squad-wrap">
              Squad
              <svg className="lfts-circle-svg" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="lfts-circle-path"
                  d="M155,30 C155,12 128,4 80,4 C32,4 5,12 5,30 C5,48 32,56 80,56 C128,56 155,48 155,30 Z"
                />
              </svg>
            </span>
          </h2>
        </motion.div>

        {/* VIDEO CAROUSEL */}
        <motion.div
          className="lfts-carousel-track"
          initial="hidden"
          style={{ justifyContent: 'center' }}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {videosList.map((video) => (
            <motion.div
              key={video.id}
              className="lfts-card-wrapper"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LoveFromTheSquad;
