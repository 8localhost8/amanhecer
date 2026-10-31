import React, { useState } from 'react';
import { X, Smartphone, Apple, Monitor, HelpCircle, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, deferredPrompt }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [installed, setInstalled] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalled(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-sand-100 dark:border-graphite-700/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs ring-1 ring-sand-200 dark:ring-graphite-700 flex items-center justify-center flex-shrink-0">
              <img
                src="/icons/amanhecer-claro.png"
                alt="Amanhecer"
                className="w-full h-full object-cover block dark:hidden"
              />
              <img
                src="/icons/amanhecer-escuro.png"
                alt="Amanhecer"
                className="w-full h-full object-cover hidden dark:block"
              />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-base font-bold font-serif text-graphite-700 dark:text-graphite-50">
                Como Instalar o Amanhecer
              </h2>
              <p className="text-[11px] text-graphite-400 dark:text-graphite-400">
                Para leitura offline e acesso instantâneo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 p-1.5 rounded-full"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex bg-sand-100 dark:bg-graphite-850 p-1 rounded-full mt-4">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400 dark:hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Computador</span>
          </button>
        </div>

        {/* Instructions Body */}
        <div className="mt-4 space-y-3 text-xs text-graphite-600 dark:text-graphite-300">
          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Abra o menu do Chrome</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">Toque nos três pontinhos verticais (⋮) no canto superior direito.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Toque em "Instalar aplicativo"</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">Ou "Adicionar à tela inicial" no menu de opções.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Pronto!</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">O ícone do Amanhecer aparecerá junto aos seus aplicativos favoritos.</p>
                </div>
              </div>

              {deferredPrompt && !installed && (
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-1 py-3 px-4 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instalar Agora no Android</span>
                </button>
              )}

              {installed && (
                <div className="p-2.5 bg-sage-100 text-sage-900 rounded-full text-center font-bold text-xs">
                  ✓ Aplicativo instalado com sucesso!
                </div>
              )}
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100 flex items-center space-x-1">
                    <span>Abra no Safari e toque em Compartilhar</span>
                    <Share2 className="w-3.5 h-3.5 text-sage-600 inline" />
                  </p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">O ícone de quadrado com seta para cima na barra inferior do Safari.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100 flex items-center space-x-1">
                    <span>Toque em "Adicionar à Tela de Início"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-sage-600 inline" />
                  </p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">Role as opções para baixo até encontrar esta opção.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Confirme em "Adicionar"</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">No canto superior direito. O Amanhecer abrirá como aplicativo independente.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Ícone na barra de endereço</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">No Chrome ou Edge, clique no ícone de monitor com seta na barra de endereços (à direita).</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 bg-sand-50 dark:bg-graphite-850/60 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700/60">
                <span className="w-5 h-5 rounded-full bg-sage-800 text-cream-50 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-graphite-700 dark:text-graphite-100">Clique em "Instalar"</p>
                  <p className="text-[11px] text-graphite-400 dark:text-graphite-400 mt-0.5">O Amanhecer terá janela limpa própria e atalho na sua Área de Trabalho.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-sand-100 dark:border-graphite-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-sand-100 dark:bg-graphite-700 hover:bg-sand-200 text-graphite-700 dark:text-graphite-200 font-semibold rounded-full text-xs transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
