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
  version: '2.4.3',
  releaseDate: '18 de Novembro de 2026',
  badge: 'v2.4.3 • 70 Fundos Full HD (1080×1920)',
  title: 'Nova Atualização Disponível',
  subtitle: 'Atualize para ter a versão mais recente do Amanhecer.',
  summary: 'Nova galeria de Papéis de Parede com prévia ao vivo e envio da galeria, barra inferior com animação líquida, ícones animados e Configurações organizadas em seções.',
  changes: [
    '🖼️ Papéis de Parede (Wallpapers): escolha entre 38 paisagens (Amanhecer, Céu Estrelado, Montanhas, Florestas, Oceanos e Desertos) ou suba sua própria foto da galeria com controle de opacidade e prévia real.',
    '⚙️ Configurações em Seções: novo menu organizado estilo ajustes do celular para acesso rápido e limpo.',
    '✨ Barra Inferior Líquida & Ícones Animados: nova animação fluida na navegação principal e microinterações nos ícones.',
    '🔄 Persistência Garantida: seu papel de parede, nome, diário e notas continuam 100% salvos após atualizar.'
  ]
};
