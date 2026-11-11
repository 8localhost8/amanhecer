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
  version: '2.3.2',
  releaseDate: '11 de Novembro de 2026',
  badge: 'v2.3.2 • Apoio & Melhorias',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Pop-up de apoio comunitário via Pix na inicialização e atualização instantânea sem retenção de card.',
  changes: [
    '💖 Apoio Voluntário via Pix: conheça a nova forma de apoiar os desenvolvedores mantendo o app 100% gratuito e sem anúncios.',
    '⚡ Atualização Instantânea: fechamento imediato do modal de atualização ao clicar no botão atualizar.',
    '🛡️ Transparência e LGPD: central de métricas anônimas em /colossenses323analytics.',
    '🔄 Recarregamento Seguro PWA: seus dados locais, diário de oração, notas e histórico de leituras continuam 100% preservados.'
  ]
};
