export interface AppUpdateInfo {
  version: string;
  releaseDate: string;
  badge: string;
  title: string;
  subtitle: string;
  summary: string;
  changes: string[];
}

/**
 * ==============================================================================
 * SISTEMA CENTRAL DE ATUALIZAÇÕES DO AMANHECER
 * ==============================================================================
 * A cada novo deploy / atualização na Vercel:
 * 1. Altere o número de `version` abaixo (ex: '2.3.1' -> '2.3.2')
 * 2. Atualize a data, resumo e os tópicos em `changes`
 * ==============================================================================
 */
export const CURRENT_UPDATE: AppUpdateInfo = {
  version: '2.4.5',
  releaseDate: '25 de Novembro de 2026',
  badge: 'v2.4.5 • Nova Barra Liquid Glass & Física de Mola',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Nova barra inferior com efeito Liquid Glass real (refratando o papel de parede e os cards da interface), gota de lente interativa ao tocar ou arrastar e física de mola fluida.',
  changes: [
    '💧 Barra Inferior Liquid Glass: novo acabamento translúcido com refração óptica real sobre o papel de parede e os cards da HUD, com suporte a toque e arraste contínuo e física de mola.',
    '🖼️ Papéis de Parede Full HD (1080×1920): 70 paisagens sem perda de nitidez, prévia real da interface, ajuste de opacidade e envio da galeria.',
    '🔔 Pontualidade nas Notificações: envio sincronizado rigorosamente com o horário de Brasília.',
    '🔄 Persistência Garantida: seu papel de parede, nome, diário e notas continuam 100% salvos após atualizar.'
  ]
};
