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
 * 1. Altere o número de `version` abaixo (ex: '2.2.1' -> '2.2.2')
 * 2. Atualize a data, resumo e os tópicos em `changes`
 * 
 * O app detectará automaticamente a nova versão e exibirá o card de atualização
 * para todos os usuários, permitindo recarregar sem cache e sem perder notas/nome.
 * ==============================================================================
 */
export const CURRENT_UPDATE: AppUpdateInfo = {
  version: '2.2.1',
  releaseDate: '10 de Novembro de 2026',
  badge: 'v2.2.1 • Novidades',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Notificações com prioridade máxima para chegar com o app 100% fechado, teste extreme desacoplado e recarregamento seguro sem falhas.',
  changes: [
    '🔔 Notificações com app fechado: prioridade máxima (Urgency: High) configurada para despertar o celular e exibir a notificação mesmo com o app encerrado e tela bloqueada.',
    '⚡ Teste Extreme na Nuvem: agora o agendamento é disparado em background pelo servidor, permitindo que você feche o app imediatamente após agendar.',
    '🔄 Recarregamento Seguro: corrigido o erro que ocorria ao atualizar o app. A atualização agora é limpa e imediata, preservando suas notas, nome e diário.',
    '🛡️ Resiliência no Service Worker: proteção contra rejeições de notificação no Android e ativação automática da nova versão.'
  ]
};
