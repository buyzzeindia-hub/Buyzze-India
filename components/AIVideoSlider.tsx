"use client";
import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Video sub-component
const AIVideoCard = ({ video }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Mobile me autoplay strictly chalane ke liye
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay was prevented:", error);
      });
    }
  }, []);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className="
        snap-center shrink-0 
        w-[75vw] sm:w-[320px] md:w-full /* Mobile me 75vw width taki side videos ke corners dikhein */
        aspect-video /* 16:9 Aspect Ratio */
        relative rounded-[20px] overflow-hidden 
        bg-gray-900 shadow-md shadow-black/5 
        border border-gray-200 dark:border-gray-800 
        transition-transform duration-300 hover:scale-[1.02]
      "
    >
      <video
        ref={videoRef}
        src={video.src}
        autoPlay
        loop
        muted // Initial autoplay ke liye muted hona zaroori hai
        playsInline
        webkit-playsinline="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 pointer-events-none">
        <span className="text-white/70 text-[10px] md:text-[11px] font-light px-2.5 py-1 bg-black/30 backdrop-blur-sm rounded-md border border-white/10 uppercase tracking-widest">
          AI GENERATED
        </span>
      </div>

      <button 
        onClick={toggleAudio}
        className="
          absolute bottom-3 right-3 md:bottom-4 md:right-4 
          w-8 h-8 rounded-full 
          bg-black/30 backdrop-blur-md 
          flex items-center justify-center 
          border border-white/10 
          shadow-lg 
          transition-all duration-200 
          hover:bg-black/50 hover:border-white/20 
          z-10
        "
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? (
          <VolumeX size={16} className="text-white/80" />
        ) : (
          <Volume2 size={16} className="text-white" />
        )}
      </button>
    </div>
  );
};

// Data array
const aiVideos = [
  { id: 1, src: "/Videos/scam-free-ad.mp4" },
  { id: 2, src: "/Videos/verified-seller-ad.mp4" },
  { id: 3, src: "/Videos/ai-pricing-ad.mp4" },
];

export default function AIVideoSlider() {
  return (
    <section className="w-full py-8 bg-transparent overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Beige box hata diya hai, ab videos direct container me hain */}
        <div className="
          flex md:grid md:grid-cols-3 
          gap-4 md:gap-6 
          overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory md:snap-none 
          no-scrollbar
        ">
          {aiVideos.map((video) => (
            <AIVideoCard key={video.id} video={video} />
          ))}
          
          {/* Mobile scroll padding fix */}
          <div className="shrink-0 w-1 md:hidden" />
        </div>
      </div>
    </section>
  );
}