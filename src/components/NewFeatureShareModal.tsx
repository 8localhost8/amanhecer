import React, { useEffect, useRef } from 'react';
import { Share2, X, Sparkles, ImageIcon } from 'lucide-react';

interface NewFeatureShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewFeatureShareModal: React.FC<NewFeatureShareModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // autoplay bloqueado: o usuário pode tocar no vídeo
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="ae-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-share-title"
    >
      <div className="ae-modal-card surface-editorial rounded-3xl max-w-sm w-full max-h-[92vh] overflow-y-auto relative shadow-xl">
        <button
          onClick={onClose}
          className="ae-btn absolute top-3 right-3 z-10 p-1.5 rounded-full bg-graphite-950/55 text-cream-50 hover:bg-graphite-950/75"
          aria-label="Fechar novidade"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Demo video */}
        <div className="relative bg-sage-900 rounded-t-3xl overflow-hidden">
          <video
            ref={videoRef}
            src="/news/compartilhar-versiculo.mp4"
            poster="/news/compartilhar-versiculo-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="w-full max-h-[52vh] object-contain mx-auto block"
            aria-label="Demonstração: como compartilhar o versículo em imagem"
          >
            <source src="/news/compartilhar-versiculo.mp4" type="video/mp4" />
            <source src="/news/compartilhar-versiculo.webm" type="video/webm" />
          </video>
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
            onClick={onClose}
            className="w-full mt-1 py-3 px-6 rounded-full font-bold text-sm btn-tactile-sage ae-btn ae-btn-shimmer"
          >
            Entendi, vou testar!
          </button>
        </div>
      </div>
    </div>
  );
};
