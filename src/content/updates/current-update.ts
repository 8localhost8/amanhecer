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
  version: '2.3.0',
  releaseDate: '10 de Novembro de 2026',
  badge: 'v2.3.0 • Novidades',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Controles completos de Privacidade e Dados (LGPD), páginas públicas de transparência e melhorias de estabilidade e desempenho.',
  changes: [
    '🛡️ Privacidade por Padrão (LGPD): controle total sobre métricas anônimas de uso em Configurações → Privacidade e Dados, com revogação e exclusão imediata.',
    '📜 Transparência Pública: novas páginas dedicadas de Termos de Uso, Política de Privacidade e Política de Cookies e Armazenamento Local.',
    '🔔 Notificações com app fechado: prioridade máxima (Urgency: High) configurada para despertar o celular mesmo com a tela bloqueada.',
    '🔄 Recarregamento Seguro: atualização limpa e imediata, preservando suas notas privadas, favoritos, sequência e diário.'
  ]
};
