import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ResponsiveVideo.css'; // Vom crea acest fișier pentru a ne asigura că stilurile noastre sunt prioritare

const ResponsiveVideo = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => console.log("Nu se poate reda nici mut."));
      });
    }
  }, []);

  return (
    <div className="hero-video-container">
      {/* Video background */}
      <video 
        ref={videoRef}
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        src="/videos/video2.mp4"
      />

      {/* Overlay pentru contrast */}
      <div className="hero-overlay"></div>
      
      {/* Conținutul hero - text și butoane */}
      <div className="hero-content">
        <h1>Find Your Perfect Ride</h1>
        <h2>Rent or buy high-quality bikes for any terrain or occasion</h2>
        <div className="hero-buttons">
          <Link to="/rentals" className="btn-primary">Rent a Bike</Link>
          <Link to="/shop" className="btn-secondary">Browse Shop</Link>
        </div>
      </div>
      
      {/* Săgeată pentru scroll */}
      <div className="scroll-arrow" onClick={() => {
        // Calculăm înălțimea secțiunii hero pentru a ști unde să facem scroll
        const heroHeight = document.querySelector('.hero-video-container').offsetHeight;
        
        // Implementăm un scroll lin folosind window.scrollTo cu o durată calculată
        const scrollToPosition = heroHeight;
        const duration = 1000; // milisecunde pentru durata animației
        const startPosition = window.pageYOffset;
        const distance = scrollToPosition - startPosition;
        
        let startTime = null;
        
        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Folosim o funcție de easing pentru un efect mai natural
          const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          
          window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }
        
        requestAnimationFrame(animation);
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </div>
  );
};

export default ResponsiveVideo;