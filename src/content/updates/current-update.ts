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
 * 1. Altere o número de `version` abaixo (ex: '2.2.0' -> '2.2.1')
 * 2. Atualize a data, resumo e os tópicos em `changes`
 * 
 * O app detectará automaticamente a nova versão e exibirá o card de atualização
 * para todos os usuários, permitindo recarregar sem cache e sem perder notas/nome.
 * ==============================================================================
 */
export const CURRENT_UPDATE: AppUpdateInfo = {
  version: '2.2.0',
  releaseDate: '08 de Novembro de 2026',
  badge: 'v2.2.0 • Nova Versão',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Notificações 100% ativas em segundo plano no servidor, modo Testar Notificação Extreme e novo sistema de atualização segura.',
  changes: [
    '🔔 Notificações em segundo plano: salvas com segurança no Vercel Blob, prontas para chegar pontualmente às 06:06 com o celular bloqueado.',
    '⚡ Testar Notificação Extreme: agende notificações de teste para o horário ou segundos que quiser direto na tela de Configurações.',
    '🔄 Atualização Segura: recarregue a versão mais nova limpando o cache, preservando 100% do seu nome, diário de oração, favoritos e leituras.',
    '🚀 Melhorias de estabilidade e conexão direta com a nuvem da Vercel.'
  ]
};
