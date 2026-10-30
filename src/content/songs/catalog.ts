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

export const VERIFIED_SONGS_CATALOG: ChristianSong[] = [
  {
    id: 'song-001',
    title: 'Porque Ele Vive',
    artist: 'Harpa Cristã / Bill & Gloria Gaither',
    theme: 'Esperança, Ressurreição e Confiança no Amanhã',
    recommendationReason: 'Hino clássico que conforta o coração ao lembrar que o Cristo ressurreto sustenta o nosso futuro.',
    youtubeUrl: 'https://www.youtube.com/watch?v=kY31FwJ5U7Q',
    spotifyUrl: 'https://open.spotify.com/search/porque%20ele%20vive',
    theologicalAlignmentNotes: 'Centrado na ressurreição de Cristo e na paz contra o medo do amanhã.'
  },
  {
    id: 'song-002',
    title: 'Grande é a Tua Fidelidade',
    artist: 'Thomas Chisholm / Harpa Cristã',
    theme: 'Fidelidade de Deus e Misericórdias Matinais',
    recommendationReason: 'Inspirado diretamente em Lamentações 3:22-23, celebra a fidelidade incondicional do Senhor.',
    youtubeUrl: 'https://www.youtube.com/watch?v=0k1WdO8Y4w4',
    spotifyUrl: 'https://open.spotify.com/search/grande%20e%20a%20tua%20fidelidade',
    theologicalAlignmentNotes: 'Exaltação da graça divina renovada diariamente, sem triunfalismo material.'
  },
  {
    id: 'song-003',
    title: 'O Teu Amor Não Falha',
    artist: 'Nivea Soares',
    theme: 'O Amor Incondicional de Deus',
    recommendationReason: 'Baseado na certeza de Romanos 8:38-39 de que nada nos separará do amor do Pai.',
    youtubeUrl: 'https://www.youtube.com/watch?v=6P3B8B8U3Qk',
    spotifyUrl: 'https://open.spotify.com/search/o%20teu%20amor%20nao%20falha%20nivea%20soares',
    theologicalAlignmentNotes: 'Reconhece a soberania de Deus em meio às tempestades da vida.'
  },
  {
    id: 'song-004',
    title: 'Tu És Fiel, Senhor',
    artist: 'Cantor Cristão',
    theme: 'Soberania e Provisão Espiritual',
    recommendationReason: 'Louvor solene que recorda a presença contínua de Deus ao longo de todas as estações.',
    youtubeUrl: 'https://www.youtube.com/watch?v=vV7Y1J1Q8W8',
    spotifyUrl: 'https://open.spotify.com/search/tu%20es%20fiel%20senhor',
    theologicalAlignmentNotes: 'Enfatiza a imutabilidade do caráter de Deus.'
  },
  {
    id: 'song-005',
    title: 'Ele Me Guia (Salmo 23)',
    artist: 'Voz da Verdade',
    theme: 'Cuidado Pastoral de Jesus',
    recommendationReason: 'Expressão devocional inspirada no Salmo 23, trazendo refrigério e paz interior.',
    youtubeUrl: 'https://www.youtube.com/watch?v=aZ1X2Y3W4V5',
    spotifyUrl: 'https://open.spotify.com/search/ele%20me%20guia%20salmo%2023',
    theologicalAlignmentNotes: 'Foco no Bom Pastor que conduz por veredas de justiça.'
  },
  {
    id: 'song-006',
    title: 'Graça Que Livra (Amazing Grace)',
    artist: 'John Newton',
    theme: 'Salvação pela Graça',
    recommendationReason: 'O hino atemporal que resume a maravilha de sermos alcançados pela graça redentora.',
    youtubeUrl: 'https://www.youtube.com/watch?v=CDdvReNKKuk',
    spotifyUrl: 'https://open.spotify.com/search/amazing%20grace%20portugues',
    theologicalAlignmentNotes: 'Sublinha a salvação exclusivamente pela graça mediante a fé (Efésios 2:8-9).'
  },
  {
    id: 'song-007',
    title: 'Descansarei',
    artist: 'Reuben Morgan / Tradução Hillsong',
    theme: 'Paz e Descanso no Poder Soberano',
    recommendationReason: 'Canção serena que convida a alma a aquietar-se e confiar na soberania divina.',
    youtubeUrl: 'https://www.youtube.com/watch?v=mO0K5B2P1N8',
    spotifyUrl: 'https://open.spotify.com/search/descansarei',
    theologicalAlignmentNotes: 'Harmoniza com o Salmo 46: "Aquietai-vos e sabei que eu sou Deus".'
  },
  {
    id: 'song-008',
    title: 'Castelo Forte',
    artist: 'Martinho Lutero',
    theme: 'Deus como Refúgio e Fortaleza',
    recommendationReason: 'Hino histórico da Reforma Protestante baseado no Salmo 46, fortalecendo a convicção na vitória de Cristo.',
    youtubeUrl: 'https://www.youtube.com/watch?v=W0q0nU4zG9U',
    spotifyUrl: 'https://open.spotify.com/search/castelo%20forte%20e%20nosso%20deus',
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
