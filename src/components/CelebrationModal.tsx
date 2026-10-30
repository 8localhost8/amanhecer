import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Share2, X } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotional: DevotionalPublic;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, devotional }) => {
  useEffect(() => {
    if (isOpen) {
      // Subtle confetti in sage, sand, and cream tones
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#82917B', '#D9C7A3', '#50604B', '#F7F3EA', '#CAD5C4'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const text = `📖 Devocional de Hoje no Amanhecer: "${devotional.title}"\n${devotional.verseOfTheDay.reference}: "${devotional.verseOfTheDay.text.slice(0, 100)}..."\n\nLeia gratuitamente em: https://amanhecer.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: devotional.title,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-sm w-full p-6 shadow-xl relative overflow-hidden text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 p-1.5 rounded-full"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center mx-auto mb-3.5 ring-6 ring-sage-50 dark:ring-sage-950/40">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold font-serif text-graphite-700 dark:text-graphite-50">
          Leitura Concluída
        </h3>

        <p className="text-xs text-graphite-500 dark:text-graphite-400 mt-1.5 leading-relaxed">
          Que a Palavra de Deus habite ricamente em seu coração e ilumine as suas decisões hoje.
        </p>

        <div className="mt-4 p-3.5 bg-cream-50 dark:bg-graphite-900 rounded-2xl border border-sand-200/60 dark:border-graphite-700 text-left">
          <span className="text-[10px] font-bold text-sage-700 dark:text-sage-400 uppercase tracking-wider block">
            Devocional Lido
          </span>
          <p className="text-sm font-semibold font-serif text-graphite-700 dark:text-graphite-100 truncate mt-0.5">
            {devotional.title}
          </p>
          <p className="text-xs text-graphite-400">
            {devotional.verseOfTheDay.reference}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar Bênção</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-sand-100 dark:bg-graphite-700 hover:bg-sand-200 text-graphite-600 dark:text-graphite-300 font-semibold rounded-full text-xs transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};
