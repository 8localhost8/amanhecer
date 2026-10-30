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
    youtubeUrl: buildYouTubeSearchUrl('Porque Ele Vive', 'Harpa Cristã Bill Gloria Gaither'),
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
    youtubeUrl: buildYouTubeSearchUrl('Amazing Grace Graça Sublime', 'John Newton Português'),
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
  }
];

export function getSongById(id: string): ChristianSong | undefined {
  return VERIFIED_SONGS_CATALOG.find(s => s.id === id);
}

export function findSongByTheme(theme: string): ChristianSong {
  const normTheme = theme.toLowerCase();
  const match = VERIFIED_SONGS_CATALOG.find(s => 
    s.theme.toLowerCase().includes(normTheme) || 
    normTheme.includes(s.theme.toLowerCase())
  );
  return match || VERIFIED_SONGS_CATALOG[0];
}
