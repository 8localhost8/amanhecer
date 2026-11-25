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
  version: '2.4.6',
  releaseDate: '25 de Novembro de 2026',
  badge: 'v2.4.6 • Controles do Liquid Glass & Performance 120fps',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Novo painel de personalização completa da Barra Inferior (Liquid Glass) em Configurações e motor óptico otimizado via GPU para rodar leve e fluido em qualquer celular.',
  changes: [
    '🎛️ Controles da Barra Inferior (Liquid Glass): ajuste Intensidade da Borda, Aro, Base, Cantos, Onda Líquida, Desfoque, Película, Mola e Lupa Central em Configurações.',
    '⚡ Performance Mobile 120fps: barra otimizada via GPU com passe único e zero re-renders por quadro para máxima fluidez sem travamentos.',
    '🖼️ Papéis de Parede Full HD (1080×1920): 70 paisagens sem perda de nitidez, prévia real da interface e envio da galeria.',
    '🔄 Persistência Garantida: seu papel de parede, ajustes da barra, nome e diário continuam 100% salvos após atualizar.'
  ]
};
