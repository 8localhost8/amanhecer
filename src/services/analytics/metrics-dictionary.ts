/**
 * Dicionário Oficial de Métricas e Confiabilidade de Dados — Amanhecer Analytics
 * Atende aos requisitos da Seção 17 (Confiabilidade dos Dados) e Seção 30 (Governança).
 */

export type DataConfidenceLevel = 'confirmed' | 'estimated' | 'unavailable';

export interface MetricDefinition {
  id: string;
  label: string;
  category:
    | 'overview'
    | 'acquisition'
    | 'install'
    | 'reading'
    | 'verse'
    | 'share'
    | 'retention'
    | 'technical';
  confidence: DataConfidenceLevel;
  definition: string;
  sourceEvents: string[];
  calculationMethod: string;
  limitations: string;
  coverage: string;
  imprecisionSources: string;
}

export const METRIC_DICTIONARY: Record<string, MetricDefinition> = {
  unique_visitors: {
    id: 'unique_visitors',
    label: 'Visitantes Únicos',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Número de identificadores pseudônimos distintos (`visitorId`) que interagiram com o Amanhecer no período selecionado após conceder consentimento.',
    sourceEvents: ['landing_viewed', 'app_opened', 'page_viewed'],
    calculationMethod: 'COUNT(DISTINCT visitorId) dentro do intervalo temporal selecionado.',
    limitations:
      'Contabiliza apenas visitantes que aceitaram analytics opcionais. Se o usuário limpar os dados do navegador ou usar outro aparelho, gera novo visitorId.',
    coverage: 'Landing page e PWA (usuários com consentimento ativo).',
    imprecisionSources: 'Troca de navegador, navegação anônima ou limpeza de localStorage.',
  },
  total_visits: {
    id: 'total_visits',
    label: 'Visitas Totais (Sessões)',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Total de sessões iniciadas no período (janela de inatividade de 30 minutos).',
    sourceEvents: ['landing_viewed', 'app_opened', 'page_viewed'],
    calculationMethod: 'COUNT(DISTINCT sessionId) no período selecionado.',
    limitations: 'Restrito a sessões com consentimento analítico concedido.',
    coverage: 'Landing page e aplicativo PWA.',
    imprecisionSources: 'Sessões offline sincronizadas posteriormente.',
  },
  pageviews: {
    id: 'pageviews',
    label: 'Visualizações de Páginas',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Total de telas visualizadas na Landing Page e nas abas internas da PWA.',
    sourceEvents: ['landing_viewed', 'page_viewed'],
    calculationMethod: 'Soma dos eventos `landing_viewed` e `page_viewed` deduplicados por `eventId`.',
    limitations: 'Exclui prefetches automáticos do Service Worker e bots.',
    coverage: 'Todas as rotas monitoradas após consentimento.',
    imprecisionSources: 'Navegação offline ainda não sincronizada com o servidor.',
  },
  new_visitors: {
    id: 'new_visitors',
    label: 'Novos Visitantes',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Visitantes cujo primeiro registro (`firstSeenDate`) ocorreu dentro do período selecionado.',
    sourceEvents: ['landing_viewed', 'app_opened'],
    calculationMethod: 'COUNT(DISTINCT visitorId WHERE firstSeenDate IN period).',
    limitations: 'Limpeza de dados locais faz um usuário recorrente parecer novo.',
    coverage: 'Usuários com consentimento ativo.',
    imprecisionSources: 'Reinstalação de navegador ou uso de múltiplos dispositivos.',
  },
  returning_visitors: {
    id: 'returning_visitors',
    label: 'Visitantes Recorrentes',
    category: 'retention',
    confidence: 'confirmed',
    definition:
      'Visitantes ativos no período cujo primeiro acesso ocorreu em data anterior ou que possuem 2+ dias ativos.',
    sourceEvents: ['app_opened', 'page_viewed', 'devotional_completed'],
    calculationMethod: 'unique_visitors - new_visitors (ou activeDates.length >= 2).',
    limitations: 'Depende da persistência do localStorage no dispositivo.',
    coverage: 'Web e PWA standalone.',
    imprecisionSources: 'Exclusão manual de cache pelo usuário.',
  },
  active_now: {
    id: 'active_now',
    label: 'Usuários Ativos Agora (5 min)',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Visitantes distintos que enviaram pelo menos um evento nos últimos 5 minutos.',
    sourceEvents: ['* (qualquer evento recebido nos últimos 5 minutos)'],
    calculationMethod: 'COUNT(DISTINCT visitorId WHERE occurredAt >= NOW - 5 minutes).',
    limitations:
      'Leitores em modo offline ou sem interação nos últimos 5 minutos não aparecem até enviarem novo evento ou heartbeat.',
    coverage: 'Dispositivos conectados com consentimento ativo.',
    imprecisionSources: 'Latência de lote (até 8s) ou leitura offline.',
  },
  dau: {
    id: 'dau',
    label: 'Usuários Ativos Hoje (DAU)',
    category: 'retention',
    confidence: 'confirmed',
    definition: 'Visitantes únicos com atividade registrada na data de hoje (fuso America/Sao_Paulo).',
    sourceEvents: ['app_opened', 'page_viewed', 'devotional_opened', 'devotional_completed'],
    calculationMethod: 'COUNT(DISTINCT visitorId) no dia corrente.',
    limitations: 'Apenas usuários com consentimento.',
    coverage: 'Global (consentidos).',
    imprecisionSources: 'Eventos offline pendentes de sincronização.',
  },
  wau: {
    id: 'wau',
    label: 'Usuários Ativos 7d (WAU)',
    category: 'retention',
    confidence: 'confirmed',
    definition: 'Visitantes únicos com atividade nos últimos 7 dias corridos.',
    sourceEvents: ['app_opened', 'page_viewed', 'devotional_completed'],
    calculationMethod: 'COUNT(DISTINCT visitorId) nos últimos 7 dias.',
    limitations: 'Apenas usuários com consentimento.',
    coverage: 'Global (consentidos).',
    imprecisionSources: 'Múltiplos aparelhos por pessoa.',
  },
  mau: {
    id: 'mau',
    label: 'Usuários Ativos 30d (MAU)',
    category: 'retention',
    confidence: 'confirmed',
    definition: 'Visitantes únicos com atividade nos últimos 30 dias corridos.',
    sourceEvents: ['app_opened', 'page_viewed', 'devotional_completed'],
    calculationMethod: 'COUNT(DISTINCT visitorId) nos últimos 30 dias.',
    limitations: 'Apenas usuários com consentimento.',
    coverage: 'Global (consentidos).',
    imprecisionSources: 'Limpeza de armazenamento local em janelas longas.',
  },
  avg_session_duration: {
    id: 'avg_session_duration',
    label: 'Duração Média da Sessão',
    category: 'overview',
    confidence: 'estimated',
    definition:
      'Tempo médio em segundos entre o início da sessão e o último evento ou heartbeat registrado.',
    sourceEvents: ['app_opened', 'session_heartbeat', 'devotional_completed'],
    calculationMethod: 'AVG(session.durationSec) para sessões com duração > 0s.',
    limitations:
      'Sessões de página única sem segundo evento ou sem disparo de visibilitychange podem subestimar o tempo.',
    coverage: 'Sessões com 2+ eventos ou heartbeat de saída.',
    imprecisionSources: 'Fechamento abrupto do processo pelo SO móvel.',
  },
  engagement_rate: {
    id: 'engagement_rate',
    label: 'Taxa de Engajamento',
    category: 'overview',
    confidence: 'confirmed',
    definition:
      'Percentual de sessões engajadas (duração >= 10s, ou 2+ telas vistas, ou leitura/compartilhamento realizado).',
    sourceEvents: ['page_viewed', 'reading_started', 'devotional_completed', 'share_initiated'],
    calculationMethod: '(Sessões Engajadas / Total de Sessões) * 100.',
    limitations: 'Baseado nos critérios de sessão engajada.',
    coverage: 'Todas as sessões consentidas.',
    imprecisionSources: 'Leituras rápidas sem rolagem.',
  },
  installs_detected: {
    id: 'installs_detected',
    label: 'Instalações Confirmadas Detectáveis',
    category: 'install',
    confidence: 'confirmed',
    definition:
      'Instalações confirmadas diretamente pelo evento nativo `appinstalled` do navegador ou aceitação direta do prompt `beforeinstallprompt`.',
    sourceEvents: ['pwa_appinstalled_detected', 'install_prompt_outcome'],
    calculationMethod: 'COUNT(DISTINCT visitorId) que dispararam `pwa_appinstalled_detected`.',
    limitations:
      'O Safari no iOS não dispara o evento `appinstalled`. Portanto, representa apenas navegadores baseados em Chromium (Android/Desktop).',
    coverage: 'Chrome, Edge, Samsung Internet (Android e Desktop).',
    imprecisionSources: 'Não cobre instalações manuais via Safari no iOS.',
  },
  installs_estimated: {
    id: 'installs_estimated',
    label: 'Instalações Estimadas (Total)',
    category: 'install',
    confidence: 'estimated',
    definition:
      'Estimativa combinada de instalações considerando o contador global anônimo de instalações + dispositivos únicos que abriram em modo standalone + instalações detectadas.',
    sourceEvents: ['pwa_appinstalled_detected', 'pwa_standalone_opened'],
    calculationMethod: 'MAX(contador_global_instalacoes, union(installed_visitors, standalone_visitors)).',
    limitations:
      'Estimativa estatística; uma PWA não dispõe de API universal da Apple/Google para listar instalações silenciosas.',
    coverage: 'Android, iOS e Desktop.',
    imprecisionSources: 'Reinstalações em navegadores com limpeza de storage.',
  },
  pwa_standalone_sessions: {
    id: 'pwa_standalone_sessions',
    label: 'Sessões em Modo PWA Instalada',
    category: 'install',
    confidence: 'confirmed',
    definition:
      'Sessões abertas com `display-mode: standalone` ou `navigator.standalone === true` (ícone na tela inicial).',
    sourceEvents: ['pwa_standalone_opened', 'app_opened'],
    calculationMethod: 'COUNT(DISTINCT sessionId WHERE isStandalone = true).',
    limitations: 'Mede quem efetivamente abriu o ícone instalado, não quem apenas instalou e nunca abriu.',
    coverage: 'Android, iOS Safari Home Screen e Desktop PWA.',
    imprecisionSources: 'Webviews customizadas que ocultam a barra de navegação.',
  },
  devotionals_started: {
    id: 'devotionals_started',
    label: 'Devocionais Iniciados',
    category: 'reading',
    confidence: 'confirmed',
    definition:
      'Leituras em que o usuário abriu a tela do devocional (`devotional_opened`) e iniciou a leitura (`reading_started`).',
    sourceEvents: ['devotional_opened', 'reading_started'],
    calculationMethod: 'COUNT(eventos `devotional_opened`).',
    limitations: 'Abrir o devocional não significa concluir a leitura.',
    coverage: 'Tela de leitura do devocional.',
    imprecisionSources: 'Aberturas acidentais rápidas.',
  },
  devotionals_completed: {
    id: 'devotionals_completed',
    label: 'Devocionais Concluídos (Confirmados)',
    category: 'reading',
    confidence: 'confirmed',
    definition:
      'Leituras efetivamente confirmadas pelo clique real do usuário no botão "Concluí a leitura de hoje".',
    sourceEvents: ['devotional_completed'],
    calculationMethod: 'COUNT(eventos `devotional_completed`).',
    limitations: 'Usuários que leem até o fim mas não clicam no botão de confirmação não são contados aqui.',
    coverage: 'Botão de conclusão na página do devocional.',
    imprecisionSources: 'Leitores que esquecem de tocar no botão final.',
  },
  reading_completion_rate: {
    id: 'reading_completion_rate',
    label: 'Taxa de Conclusão de Leitura',
    category: 'reading',
    confidence: 'confirmed',
    definition:
      'Proporção de devocionais abertos que resultaram em confirmação real de leitura pelo botão.',
    sourceEvents: ['devotional_opened', 'devotional_completed'],
    calculationMethod: '(Visitantes que concluíram / Visitantes que abriram devocional) * 100.',
    limitations: 'Reflete apenas confirmações explícitas pelo botão.',
    coverage: 'Jornada de leitura.',
    imprecisionSources: 'Múltiplas aberturas do mesmo devocional antes da conclusão.',
  },
  verses_viewed: {
    id: 'verses_viewed',
    label: 'Versículos Visualizados',
    category: 'verse',
    confidence: 'confirmed',
    definition: 'Visualizações do card Versículo do Dia na tela inicial da PWA.',
    sourceEvents: ['verse_viewed'],
    calculationMethod: 'COUNT(eventos `verse_viewed`).',
    limitations: 'Registrado uma vez por exibição da Home na sessão.',
    coverage: 'HomePage da PWA.',
    imprecisionSources: 'Usuários que abrem a Home sem rolar até o card em telas muito pequenas.',
  },
  verses_shared: {
    id: 'verses_shared',
    label: 'Versículos Compartilhados',
    category: 'share',
    confidence: 'confirmed',
    definition:
      'Ações de compartilhamento do Versículo do Dia concluídas (folha nativa do SO, download de imagem ou cópia de texto).',
    sourceEvents: ['share_completed', 'share_initiated'],
    calculationMethod: 'COUNT(eventos `share_completed` WHERE content_type = "verse").',
    limitations:
      'Alguns sistemas operacionais resolvem `navigator.share` ao escolher o app de destino, sem confirmar se a mensagem foi enviada dentro do WhatsApp/Instagram.',
    coverage: 'Web Share API, Download de Imagem e Clipboard.',
    imprecisionSources: 'Limitação de retorno da API nativa `navigator.share` do sistema operacional.',
  },
  devotionals_shared: {
    id: 'devotionals_shared',
    label: 'Devocionais Compartilhados',
    category: 'share',
    confidence: 'confirmed',
    definition: 'Ações de compartilhamento de devocional concluídas (imagem + legenda).',
    sourceEvents: ['share_completed'],
    calculationMethod: 'COUNT(eventos `share_completed` WHERE content_type = "devotional").',
    limitations: 'Mesma limitação técnica da Web Share API do sistema operacional.',
    coverage: 'Tela do Devocional e Modal de Celebração.',
    imprecisionSources: 'Cancelamento dentro do app de terceiros após o resolve do SO.',
  },
  retention_d1_d7_d30: {
    id: 'retention_d1_d7_d30',
    label: 'Retenção D1, D7, D14 e D30',
    category: 'retention',
    confidence: 'confirmed',
    definition:
      'Percentual de visitantes de uma coorte de aquisição que retornaram exatamente 1, 7, 14 ou 30 dias após o primeiro acesso (apenas para coortes que já completaram a janela temporal).',
    sourceEvents: ['app_opened', 'page_viewed', 'devotional_completed'],
    calculationMethod:
      'Para coortes com idade >= N dias: (Visitantes com atividade no dia firstSeenDate + N / Total da coorte elegível) * 100.',
    limitations:
      'Se nenhuma coorte tiver completado N dias ainda, o indicador informa "Coorte em maturação (Indisponível)" em vez de exibir 0% enganoso.',
    coverage: 'Visitantes consentidos com identificador persistente.',
    imprecisionSources: 'Troca de aparelho ou limpeza de localStorage.',
  },
};
