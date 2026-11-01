import React from 'react';
import { ShieldCheck, X, Lock, BarChart3, Bell, Smartphone, Trash2 } from 'lucide-react';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="ae-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-privacy-title"
    >
      <div className="ae-modal-card surface-editorial rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-sand-200/80 dark:border-sand-300/20 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl btn-tactile-sage flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="terms-privacy-title"
                className="text-base sm:text-lg font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
              >
                Termos de Uso e Privacidade
              </h2>
              <p className="text-[11px] text-graphite-500 dark:text-sand-300">
                Conformidade com a LGPD (Lei nº 13.709/2018)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ae-btn p-2 rounded-full text-graphite-400 hover:text-graphite-700 dark:text-sand-300 dark:hover:text-cream-50"
            aria-label="Fechar Termos de Uso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-graphite-600 dark:text-cream-100 leading-relaxed">
          <p className="text-graphite-700 dark:text-cream-50 font-medium">
            Ao instalar ou utilizar o aplicativo <strong>Amanhecer — Devocional Diário</strong>, você declara estar ciente e de acordo com as práticas de transparência e proteção de dados descritas abaixo:
          </p>

          {/* 1. Contador de Instalações */}
          <div className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-graphite-800 dark:text-sand-300">
              <BarChart3 className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>1. Contabilização Anônima de Downloads e Instalações</span>
            </div>
            <p className="text-graphite-600 dark:text-cream-200/90">
              Para exibir no site quantas pessoas já instalaram o aplicativo, coletamos um <strong>incremento numérico estritamente anônimo (+1)</strong> quando o app é instalado ou aberto como aplicativo pela primeira vez. Também gravamos um marcador técnico local no seu navegador (<code>amanhecer_install_counted_v1</code>) unicamente para evitar que o mesmo aparelho seja contado repetidas vezes. Nenhum nome, CPF, e-mail, número de telefone ou endereço físico é coletado nessa contagem.
            </p>
          </div>

          {/* 2. Notificações Web Push */}
          <div className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-graphite-800 dark:text-sand-300">
              <Bell className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>2. Dados Técnicos de Notificação (Opcional)</span>
            </div>
            <p className="text-graphite-600 dark:text-cream-200/90">
              Caso você opte por ativar os lembretes diários e o Versículo do Dia (06:06), o seu navegador gera uma chave técnica anônima de entrega (<code>endpoint</code> Web Push e chaves criptográficas <code>p256dh</code> / <code>auth</code>), além do fuso horário do aparelho e a data da sua última leitura concluída (usada exclusivamente para silenciar lembretes repetidos no mesmo dia).
            </p>
          </div>

          {/* 3. Dados 100% Locais no Aparelho */}
          <div className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-graphite-800 dark:text-sand-300">
              <Smartphone className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>3. Dados Guardados Apenas no Seu Celular</span>
            </div>
            <p className="text-graphite-600 dark:text-cream-200/90">
              O seu <strong>nome ou apelido</strong>, suas anotações pessoais no <strong>Diário de Oração</strong>, seus devocionais <strong>Favoritos</strong> e seu <strong>Histórico de Leitura</strong> ficam armazenados exclusivamente na memória interna do seu próprio dispositivo (via <code>IndexedDB</code> e <code>localStorage</code>). Nós não temos acesso nem lemos suas orações pessoais.
            </p>
          </div>

          {/* 4. Não Comercialização e Segurança */}
          <div className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-graphite-800 dark:text-sand-300">
              <Lock className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>4. Finalidade Não Comercial e Sem Anúncios</span>
            </div>
            <p className="text-graphite-600 dark:text-cream-200/90">
              O Amanhecer é um projeto cristão gratuito e sem fins lucrativos. Não vendemos, alugamos ou compartilhamos dados com redes de publicidade ou terceiros.
            </p>
          </div>

          {/* 5. Revogação e Exclusão (Direitos LGPD) */}
          <div className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-graphite-800 dark:text-sand-300">
              <Trash2 className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>5. Seus Direitos (Art. 18 da LGPD)</span>
            </div>
            <p className="text-graphite-600 dark:text-cream-200/90">
              Você pode revogar o recebimento de notificações a qualquer momento na aba <strong>Ajustes</strong> (o que remove sua inscrição de envio) e pode apagar todos os dados locais desinstalando o aplicativo ou limpando os dados do site nas configurações do navegador.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 sm:p-5 border-t border-sand-200/80 dark:border-sand-300/20">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full font-bold text-xs sm:text-sm btn-tactile-sage ae-btn"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};
