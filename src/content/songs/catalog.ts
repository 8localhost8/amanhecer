export interface ChristianSong {
  id: string;
  title: string;
  artist: string;
  theme: string;
  recommendationReason: string;
  youtubeUrl: string;
  spotifyUrl: string;
  theologicalAlignmentNotes: string;
}

export function buildYouTubeSearchUrl(title: string, artist: string): string {
  const query = `${title} ${artist}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function buildSpotifySearchUrl(title: string, artist: string): string {
  const query = `${title} ${artist}`.trim();
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

export const VERIFIED_SONGS_CATALOG: ChristianSong[] = [
  {
    id: 'song-001',
    title: 'Porque Ele Vive',
    artist: 'Harpa Cristã / Bill & Gloria Gaither',
    theme: 'Esperança, Ressurreição e Confiança no Amanhã',
    recommendationReason: 'Hino clássico que conforta o coração ao lembrar que o Cristo ressurreto sustenta o nosso futuro.',
    youtubeUrl: buildYouTubeSearchUrl('Porque Ele Vive', 'Harpa Cristã'),
    spotifyUrl: buildSpotifySearchUrl('Porque Ele Vive', 'Harpa Cristã'),
    theologicalAlignmentNotes: 'Centrado na ressurreição de Cristo e na paz contra o medo do amanhã.'
  },
  {
    id: 'song-002',
    title: 'Grande é a Tua Fidelidade',
    artist: 'Thomas Chisholm / Harpa Cristã',
    theme: 'Fidelidade de Deus e Misericórdias Matinais',
    recommendationReason: 'Inspirado diretamente em Lamentações 3:22-23, celebra a fidelidade incondicional do Senhor.',
    youtubeUrl: buildYouTubeSearchUrl('Grande é a Tua Fidelidade', 'Harpa Cristã'),
    spotifyUrl: buildSpotifySearchUrl('Grande é a Tua Fidelidade', 'Harpa Cristã'),
    theologicalAlignmentNotes: 'Exaltação da graça divina renovada diariamente, sem triunfalismo material.'
  },
  {
    id: 'song-003',
    title: 'O Teu Amor Não Falha',
    artist: 'Nivea Soares',
    theme: 'O Amor Incondicional de Deus',
    recommendationReason: 'Baseado na certeza de Romanos 8:38-39 de que nada nos separará do amor do Pai.',
    youtubeUrl: buildYouTubeSearchUrl('O Teu Amor Não Falha', 'Nivea Soares'),
    spotifyUrl: buildSpotifySearchUrl('O Teu Amor Não Falha', 'Nivea Soares'),
    theologicalAlignmentNotes: 'Reconhece a soberania de Deus em meio às tempestades da vida.'
  },
  {
    id: 'song-004',
    title: 'Tu És Fiel, Senhor',
    artist: 'Cantor Cristão',
    theme: 'Soberania e Provisão Espiritual',
    recommendationReason: 'Louvor solene que recorda a presença contínua de Deus ao longo de todas as estações.',
    youtubeUrl: buildYouTubeSearchUrl('Tu És Fiel Senhor', 'Cantor Cristão'),
    spotifyUrl: buildSpotifySearchUrl('Tu És Fiel Senhor', 'Cantor Cristão'),
    theologicalAlignmentNotes: 'Enfatiza a imutabilidade do caráter de Deus.'
  },
  {
    id: 'song-005',
    title: 'Ele Me Guia (Salmo 23)',
    artist: 'Voz da Verdade',
    theme: 'Cuidado Pastoral de Jesus',
    recommendationReason: 'Expressão devocional inspirada no Salmo 23, trazendo refrigério e paz interior.',
    youtubeUrl: buildYouTubeSearchUrl('Ele Me Guia Salmo 23', 'Voz da Verdade'),
    spotifyUrl: buildSpotifySearchUrl('Ele Me Guia Salmo 23', 'Voz da Verdade'),
    theologicalAlignmentNotes: 'Foco no Bom Pastor que conduz por veredas de justiça.'
  },
  {
    id: 'song-006',
    title: 'Graça Que Livra (Amazing Grace)',
    artist: 'John Newton',
    theme: 'Salvação pela Graça',
    recommendationReason: 'O hino atemporal que resume a maravilha de sermos alcançados pela graça redentora.',
    youtubeUrl: buildYouTubeSearchUrl('Amazing Grace Graça Sublime', 'Harpa Cristã'),
    spotifyUrl: buildSpotifySearchUrl('Amazing Grace Português', 'Harpa'),
    theologicalAlignmentNotes: 'Sublinha a salvação exclusivamente pela graça mediante a fé (Efésios 2:8-9).'
  },
  {
    id: 'song-007',
    title: 'Descansarei',
    artist: 'Reuben Morgan / Tradução Hillsong',
    theme: 'Paz e Descanso no Poder Soberano',
    recommendationReason: 'Canção serena que convida a alma a aquietar-se e confiar na soberania divina.',
    youtubeUrl: buildYouTubeSearchUrl('Descansarei', 'Hillsong Português'),
    spotifyUrl: buildSpotifySearchUrl('Descansarei', 'Hillsong'),
    theologicalAlignmentNotes: 'Harmoniza com o Salmo 46: "Aquietai-vos e sabei que eu sou Deus".'
  },
  {
    id: 'song-008',
    title: 'Castelo Forte',
    artist: 'Martinho Lutero',
    theme: 'Deus como Refúgio e Fortaleza',
    recommendationReason: 'Hino histórico da Reforma Protestante baseado no Salmo 46, fortalecendo a convicção na vitória de Cristo.',
    youtubeUrl: buildYouTubeSearchUrl('Castelo Forte é Nosso Deus', 'Martinho Lutero'),
    spotifyUrl: buildSpotifySearchUrl('Castelo Forte é Nosso Deus', 'Cantor Cristão'),
    theologicalAlignmentNotes: 'Cristocêntrico, proclama a suficiência de Cristo contra as forças espirituais.'
  },
  {
    id: 'song-009',
    title: 'Bondade de Deus',
    artist: 'Isaías Saad',
    theme: 'Fidelidade, Gratidão e Constância',
    recommendationReason: 'Declaração sincera de gratidão pela misericórdia de Deus que nos acompanha em cada amanhecer.',
    youtubeUrl: buildYouTubeSearchUrl('Bondade de Deus', 'Isaías Saad'),
    spotifyUrl: buildSpotifySearchUrl('Bondade de Deus', 'Isaías Saad'),
    theologicalAlignmentNotes: 'Reconhecimento da providência paternal de Deus em todas as fases da vida.'
  },
  {
    id: 'song-010',
    title: 'Lugar Secreto',
    artist: 'Gabriela Rocha',
    theme: 'Intimidade, Oração e Comunhão',
    recommendationReason: 'Inspirada em Mateus 6:6, conduz a alma ao silêncio e à devoção sincera com o Pai.',
    youtubeUrl: buildYouTubeSearchUrl('Lugar Secreto', 'Gabriela Rocha'),
    spotifyUrl: buildSpotifySearchUrl('Lugar Secreto', 'Gabriela Rocha'),
    theologicalAlignmentNotes: 'Busca interior centrada na pessoa de Jesus Cristo, longe de ostentação espiritual.'
  },
  {
    id: 'song-011',
    title: 'É Tudo Sobre Você',
    artist: 'Morada',
    theme: 'Cristocentrismo e Adoração Pura',
    recommendationReason: 'Relembra que toda a história e o nosso respirar convergem para a glória de Jesus.',
    youtubeUrl: buildYouTubeSearchUrl('É Tudo Sobre Você', 'Morada'),
    spotifyUrl: buildSpotifySearchUrl('É Tudo Sobre Você', 'Morada'),
    theologicalAlignmentNotes: 'Antropocentrismo combatido; Cristo exaltado como o centro de tudo.'
  },
  {
    id: 'song-012',
    title: 'Todavia Me Alegrarei',
    artist: 'Samuel Messias',
    theme: 'Fé em Tempos Difíceis e Esperança em Deus',
    recommendationReason: 'Inspirado em Habacuque 3:17-18, ensina a louvar a Deus mesmo quando a figueira não floresce.',
    youtubeUrl: buildYouTubeSearchUrl('Todavia Me Alegrarei', 'Samuel Messias'),
    spotifyUrl: buildSpotifySearchUrl('Todavia Me Alegrarei', 'Samuel Messias'),
    theologicalAlignmentNotes: 'Fidelidade bíblica diante do sofrimento; confiança inabalável sem promessas fáceis.'
  },
  {
    id: 'song-013',
    title: 'Oceanos (Onde Meus Pés Podem Falhar)',
    artist: 'Ana Nóbrega / Hillsong',
    theme: 'Fé, Confiança e Dependência Total',
    recommendationReason: 'Inspirada em Pedro caminhando sobre as águas, um convite a olhar firmemente para Jesus.',
    youtubeUrl: buildYouTubeSearchUrl('Oceanos', 'Ana Nóbrega'),
    spotifyUrl: buildSpotifySearchUrl('Oceanos', 'Ana Nóbrega'),
    theologicalAlignmentNotes: 'Foco na dependência da graça de Cristo em meio às incertezas humanas.'
  },
  {
    id: 'song-014',
    title: 'A Casa É Sua',
    artist: 'Casa Worship',
    theme: 'Rendição e Acolhimento do Espírito Santo',
    recommendationReason: 'Canção de boas-vindas à presença santa e transformadora do Senhor em nosso coração.',
    youtubeUrl: buildYouTubeSearchUrl('A Casa É Sua', 'Casa Worship'),
    spotifyUrl: buildSpotifySearchUrl('A Casa É Sua', 'Casa Worship'),
    theologicalAlignmentNotes: 'Reconhece o corpo e a mente como templo do Espírito Santo.'
  },
  {
    id: 'song-015',
    title: 'Raridade',
    artist: 'Anderson Freire',
    theme: 'Valor Humano perante Deus e Graça Redentora',
    recommendationReason: 'Conforta corações abatidos recordando o sacrifício e o cuidado individual de Deus.',
    youtubeUrl: buildYouTubeSearchUrl('Raridade', 'Anderson Freire'),
    spotifyUrl: buildSpotifySearchUrl('Raridade', 'Anderson Freire'),
    theologicalAlignmentNotes: 'O amor gracioso do Pai que restaura vidas pelo valor do sangue de Cristo.'
  },
  {
    id: 'song-016',
    title: 'Deus de Promessas',
    artist: 'Davi Sacer',
    theme: 'Fidelidade às Alianças Bíblicas',
    recommendationReason: 'Baseado na verdade de Números 23:19: Deus não é homem para que minta, Ele cumpre o que diz.',
    youtubeUrl: buildYouTubeSearchUrl('Deus de Promessas', 'Davi Sacer'),
    spotifyUrl: buildSpotifySearchUrl('Deus de Promessas', 'Davi Sacer'),
    theologicalAlignmentNotes: 'Confiança na Palavra imutável de Deus sem exigir barganhas.'
  },
  {
    id: 'song-017',
    title: 'Em Teus Braços',
    artist: 'Laura Souguellis',
    theme: 'Descanso, Acolhimento e Paz',
    recommendationReason: 'Canção íntima que expressa a paz de descansar na paternidade perfeita de Deus.',
    youtubeUrl: buildYouTubeSearchUrl('Em Teus Braços', 'Laura Souguellis'),
    spotifyUrl: buildSpotifySearchUrl('Em Teus Braços', 'Laura Souguellis'),
    theologicalAlignmentNotes: 'Filiação divina e descanso espiritual na soberana graça de Deus.'
  },
  {
    id: 'song-018',
    title: 'Escudo',
    artist: 'Voz da Verdade',
    theme: 'Proteção Divina e Oração',
    recommendationReason: 'Baseada nos Salmos que declaram o Senhor como o escudo que nos protege em qualquer provação.',
    youtubeUrl: buildYouTubeSearchUrl('Escudo', 'Voz da Verdade'),
    spotifyUrl: buildSpotifySearchUrl('Escudo', 'Voz da Verdade'),
    theologicalAlignmentNotes: 'Deus como refúgio e fortaleza constante.'
  },
  {
    id: 'song-019',
    title: 'Eu Navegarei',
    artist: 'Harpa Cristã',
    theme: 'Sensibilidade Espiritual e Oração Matinal',
    recommendationReason: 'Cântico clássico de devoção que convida o Espírito Santo a guiar os pensamentos e decisões.',
    youtubeUrl: buildYouTubeSearchUrl('Eu Navegarei', 'Harpa Cristã'),
    spotifyUrl: buildSpotifySearchUrl('Eu Navegarei', 'Harpa Cristã'),
    theologicalAlignmentNotes: 'Dependência da direção e da unção do Espírito Santo.'
  },
  {
    id: 'song-020',
    title: 'Foi na Cruz',
    artist: 'Harpa Cristã',
    theme: 'Redenção, Cruz e Perdão',
    recommendationReason: 'Celebra o cerne do Evangelho: o sacrifício vicário de Cristo que nos concedeu a verdadeira luz.',
    youtubeUrl: buildYouTubeSearchUrl('Foi na Cruz', 'Harpa Cristã'),
    spotifyUrl: buildSpotifySearchUrl('Foi na Cruz', 'Harpa Cristã'),
    theologicalAlignmentNotes: 'Doutrina da justificação pela fé e reconciliação com o Pai pela cruz.'
  }
];

export function getSongById(id: string): ChristianSong | undefined {
  return VERIFIED_SONGS_CATALOG.find(s => s.id === id);
}

export function findSongByTheme(theme: string): ChristianSong {
  const normTheme = theme.toLowerCase().trim();
  const match = VERIFIED_SONGS_CATALOG.find(s => 
    s.theme.toLowerCase().includes(normTheme) || 
    normTheme.includes(s.theme.toLowerCase())
  );
  return match || VERIFIED_SONGS_CATALOG[0];
}

/**
 * Resolves a song recommendation strictly against the verified catalog.
 * Guarantees that the AI NEVER presents an invented or non-existent song.
 */
export function resolveVerifiedSong(musicIdOrQuery?: string, theme?: string): ChristianSong {
  if (!musicIdOrQuery || musicIdOrQuery.trim() === '') {
    return findSongByTheme(theme || '');
  }

  const clean = musicIdOrQuery.trim();

  // 1. Direct ID match
  const byId = getSongById(clean);
  if (byId) return byId;

  // 2. Case-insensitive match in Title or Artist
  const lower = clean.toLowerCase();
  const byMatch = VERIFIED_SONGS_CATALOG.find(s => 
    s.id.toLowerCase() === lower ||
    s.title.toLowerCase().includes(lower) ||
    lower.includes(s.title.toLowerCase()) ||
    s.artist.toLowerCase().includes(lower)
  );
  if (byMatch) return byMatch;

  // 3. Thematic fallback (100% verified real song)
  return findSongByTheme(theme || '');
}
