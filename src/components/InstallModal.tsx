import React, { useState } from 'react';
import { X, Smartphone, Apple, Monitor, HelpCircle, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, deferredPrompt }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-dawn-100 dark:bg-dawn-950/80 text-dawn-600 dark:text-dawn-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Como Instalar o Amanhecer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesse mesmo offline e sem cadastro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full focus:ring-2 focus:ring-dawn-500"
            aria-label="Fechar ajuda de instalação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-midnight-950 p-1 rounded-2xl mt-4">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Computador</span>
          </button>
        </div>

        {/* Instructions Body */}
        <div className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Toque no menu do Chrome</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toque nos três pontinhos verticais (⋮) no canto superior direito do navegador.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Selecione "Instalar aplicativo"</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ou "Adicionar à tela inicial" caso a opção anterior não esteja visível.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Confirme a instalação</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">O ícone do Amanhecer será adicionado junto aos seus aplicativos favoritos.</p>
                </div>
              </div>

              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full mt-2 py-3 px-4 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Instalar Agora no Android</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                    <span>Abra no Safari e toque em Compartilhar</span>
                    <Share2 className="w-4 h-4 text-dawn-500 inline" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">O botão de compartilhamento é o quadrado com uma seta apontando para cima, na barra inferior.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                    <span>Toque em "Adicionar à Tela de Início"</span>
                    <PlusSquare className="w-4 h-4 text-dawn-500 inline" />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Role um pouco a lista de opções para encontrar este botão.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Toque em "Adicionar"</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No canto superior direito. Pronto! O app abrirá em tela cheia sem barra de navegador.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Localize o ícone de instalação</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No Chrome ou Edge, clique no ícone de computador com uma seta na barra de endereço (à direita).</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-midnight-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dawn-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Clique em "Instalar"</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">O Amanhecer terá sua própria janela limpa e atalho na sua área de trabalho.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl text-sm transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
