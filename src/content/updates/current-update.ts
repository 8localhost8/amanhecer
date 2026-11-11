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
 * 1. Altere o número de `version` abaixo (ex: '2.3.0' -> '2.3.1')
 * 2. Atualize a data, resumo e os tópicos em `changes`
 * 
 * O app detectará automaticamente a nova versão e exibirá o card de atualização
 * a cada inicialização para todos os usuários, até que marquem a opção de não exibir novamente.
 * ==============================================================================
 */
export const CURRENT_UPDATE: AppUpdateInfo = {
  version: '2.3.1',
  releaseDate: '11 de Novembro de 2026',
  badge: 'v2.3.1 • Apoio & Novidades',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Card oficial de apoio voluntário via Pix, controle aprimorado de avisos de atualização e melhorias de estabilidade.',
  changes: [
    '💖 Apoie o Projeto Amanhecer: adicione sua contribuição voluntária via chave Pix oficial para apoiar os desenvolvedores e manter o app 100% gratuito e livre de anúncios.',
    '✨ Controle de Avisos de Atualização: opção de manter o aviso ativo a cada abertura ou marcar para não exibir novamente.',
    '🛡️ Central de Métricas e LGPD: total conformidade com a LGPD e transparência com a nova rota administrativa /colossenses323analytics.',
    '🔄 Recarregamento Seguro PWA: seus dados locais, diário de oração, notas e histórico de leituras continuam 100% preservados.'
  ]
};
