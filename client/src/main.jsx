import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { LoaderProvider } from './context/LoaderContext.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoaderProvider>
          <App />
        </LoaderProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

// Subtle Scroll Animations
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, observerOptions);

const observeSections = () => {
  document.querySelectorAll('section').forEach(section => {
    if (!section.classList.contains('fade-in-section')) {
      section.classList.add('fade-in-section');
      observer.observe(section);
    }
  });
};

window.addEventListener('DOMContentLoaded', observeSections);

// Periodically check for new sections (for SPA navigation)
setInterval(observeSections, 1000);

// Sleek Auto-Hide Scrollbar Logic
let scrollTimeout;
window.addEventListener('scroll', () => {
  document.body.classList.add('is-scrolling');
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    document.body.classList.remove('is-scrolling');
  }, 1500); // 1.5s timeout as requested
}, { passive: true });

