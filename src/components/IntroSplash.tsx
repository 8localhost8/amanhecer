import React, { useState, useEffect, useRef } from 'react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasFinishedRef = useRef(false);

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 200); // Transição ultrarrápida e leve de 200ms
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.warn('Autoplay prevented or interrupted:', err);
      });
    }

    // Safety timeout: encerra com folga caso o evento onEnded demore
    const timer = setTimeout(() => {
      handleFinish();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={handleFinish}
      style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#384736] transition-opacity duration-200 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Introdução Amanhecer"
      role="banner"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center max-w-sm sm:max-w-md mx-auto px-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-contain max-h-[85vh] pointer-events-none"
          onEnded={handleFinish}
          onError={handleFinish}
        >
          <source src="/intro/intro-amanhecer.mp4" type="video/mp4" />
          <source src="/intro/intro-amanhecer.webm" type="video/webm" />
          <source src="/intro/intro-amanhecer-hevc.mp4" type="video/mp4" />
        </video>

        {/* Subtle skip button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="absolute bottom-6 right-6 px-3.5 py-1.5 rounded-full bg-cream-50/20 hover:bg-cream-50/30 text-cream-50/80 hover:text-cream-50 text-xs font-sans tracking-wide transition-colors"
          aria-label="Pular introdução"
        >
          Pular
        </button>
      </div>
    </div>
  );
};
