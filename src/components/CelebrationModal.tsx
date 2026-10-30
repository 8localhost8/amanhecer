import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Heart, Share2, Sparkles, X } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotional: DevotionalPublic;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, devotional }) => {
  useEffect(() => {
    if (isOpen) {
      // Fire subtle, joyful confetti with gold and sky dawn colors
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38abf8', '#0e90e6', '#facc15', '#fef08a', '#ffffff'],
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
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Leitura Concluída!
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Parabéns por reservar esse momento com Deus hoje. Que a Palavra dEle habite ricamente em seu coração e guie cada um dos seus passos.
        </p>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-midnight-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
          <span className="text-[10px] font-bold text-dawn-600 dark:text-dawn-400 uppercase tracking-wider block">
            Devocional de Hoje
          </span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {devotional.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {devotional.verseOfTheDay.reference}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/20 flex items-center justify-center space-x-2 text-sm transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar Bênção</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-xs transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};
