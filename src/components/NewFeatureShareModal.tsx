import React, { useState, useEffect, useRef } from 'react';
import { Share2, X, Sparkles, ImageIcon } from 'lucide-react';

interface NewFeatureShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewFeatureShareModal: React.FC<NewFeatureShareModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => setIsVisible(true));
      const video = videoRef.current;
      if (video) {
        video.play().catch(() => {});
      }
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 transition-opacity duration-200 ease-out select-none cursor-pointer ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-share-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        className="surface-editorial rounded-3xl max-w-sm w-full max-h-[92vh] overflow-y-auto relative shadow-2xl transition-opacity duration-200 ease-out cursor-default"
      >
        {/* Top bar with demo video strictly centered */}
        <div className="w-full bg-[#1e271c] dark:bg-graphite-950 flex flex-col items-center justify-center pt-5 pb-3 px-4 rounded-t-3xl overflow-hidden relative">
          <button
            onClick={handleClose}
            className="ae-btn absolute top-3 right-3 z-20 p-1.5 rounded-full bg-graphite-950/70 text-cream-50 hover:bg-graphite-950/90 transition-colors shadow-md"
            aria-label="Fechar novidade"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Centered phone video mockup */}
          <div className="relative w-auto flex items-center justify-center mx-auto">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/news/compartilhar-versiculo-poster.jpg"
              style={{ objectFit: 'contain', objectPosition: 'center', margin: '0 auto', display: 'block' }}
              className="max-h-[46vh] w-auto max-w-[260px] rounded-2xl shadow-2xl mx-auto block pointer-events-none border border-sand-300/15"
              aria-label="Demonstração: como compartilhar o versículo em imagem"
            >
              <source src="/news/compartilhar-versiculo.mp4" type="video/mp4" />
              <source src="/news/compartilhar-versiculo.webm" type="video/webm" />
            </video>
          </div>
        </div>

        <div className="p-5 space-y-3 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sage-100/80 dark:bg-cream-100/10 border border-sage-200/80 dark:border-sand-300/35 text-[10px] font-bold uppercase tracking-widest text-sage-800 dark:text-sand-200">
            <Sparkles className="w-3 h-3" />
            <span>Novidade</span>
          </div>

          <h2
            id="news-share-title"
            className="text-xl font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
          >
            Compartilhe em imagem
          </h2>

          <p className="text-xs text-graphite-600 dark:text-cream-200/90 leading-relaxed">
            Agora o <strong>Versículo do Dia</strong> e o <strong>Devocional</strong> viram uma
            imagem linda, pronta para enviar no WhatsApp, Instagram e onde você quiser. Toque em{' '}
            <span className="inline-flex items-center align-middle space-x-1 font-semibold text-sage-800 dark:text-sand-200">
              <Share2 className="w-3 h-3" />
              <span>Compartilhar</span>
            </span>{' '}
            e escolha o app.
          </p>

          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-graphite-500 dark:text-sand-300/90">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>A imagem é criada na hora, direto no seu celular.</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-1 py-3 px-6 rounded-full font-bold text-sm btn-tactile-sage ae-btn"
          >
            Entendi, vou testar!
          </button>
        </div>
      </div>
    </div>
  );
};
