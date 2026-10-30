export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'AT' | 'NT';
  category: 
    | 'Pentateuco'
    | 'Históricos'
    | 'Poéticos e Sabedoria'
    | 'Profetas Maiores'
    | 'Profetas Menores'
    | 'Evangelhos'
    | 'História'
    | 'Epístolas Paulinas'
    | 'Epístolas Gerais'
    | 'Profecia';
  chapters: number;
}

export const PROTESTANT_CANON_66: BibleBook[] = [
  // Antigo Testamento (39 Livros)
  { id: 'GN', name: 'Gênesis', abbreviation: 'Gn', testament: 'AT', category: 'Pentateuco', chapters: 50 },
  { id: 'EX', name: 'Êxodo', abbreviation: 'Êx', testament: 'AT', category: 'Pentateuco', chapters: 40 },
  { id: 'LV', name: 'Levítico', abbreviation: 'Lv', testament: 'AT', category: 'Pentateuco', chapters: 27 },
  { id: 'NM', name: 'Números', abbreviation: 'Nm', testament: 'AT', category: 'Pentateuco', chapters: 36 },
  { id: 'DT', name: 'Deuteronômio', abbreviation: 'Dt', testament: 'AT', category: 'Pentateuco', chapters: 34 },
  { id: 'JS', name: 'Josué', abbreviation: 'Js', testament: 'AT', category: 'Históricos', chapters: 24 },
  { id: 'JZ', name: 'Juízes', abbreviation: 'Jz', testament: 'AT', category: 'Históricos', chapters: 21 },
  { id: 'RT', name: 'Rute', abbreviation: 'Rt', testament: 'AT', category: 'Históricos', chapters: 4 },
  { id: '1SM', name: '1 Samuel', abbreviation: '1Sm', testament: 'AT', category: 'Históricos', chapters: 31 },
  { id: '2SM', name: '2 Samuel', abbreviation: '2Sm', testament: 'AT', category: 'Históricos', chapters: 24 },
  { id: '1RS', name: '1 Reis', abbreviation: '1Rs', testament: 'AT', category: 'Históricos', chapters: 22 },
  { id: '2RS', name: '2 Reis', abbreviation: '2Rs', testament: 'AT', category: 'Históricos', chapters: 25 },
  { id: '1CR', name: '1 Crônicas', abbreviation: '1Cr', testament: 'AT', category: 'Históricos', chapters: 29 },
  { id: '2CR', name: '2 Crônicas', abbreviation: '2Cr', testament: 'AT', category: 'Históricos', chapters: 36 },
  { id: 'ED', name: 'Esdras', abbreviation: 'Ed', testament: 'AT', category: 'Históricos', chapters: 10 },
  { id: 'NE', name: 'Neemias', abbreviation: 'Ne', testament: 'AT', category: 'Históricos', chapters: 13 },
  { id: 'ET', name: 'Ester', abbreviation: 'Et', testament: 'AT', category: 'Históricos', chapters: 10 },
  { id: 'JO', name: 'Jó', abbreviation: 'Jó', testament: 'AT', category: 'Poéticos e Sabedoria', chapters: 42 },
  { id: 'SL', name: 'Salmos', abbreviation: 'Sl', testament: 'AT', category: 'Poéticos e Sabedoria', chapters: 150 },
  { id: 'PV', name: 'Provérbios', abbreviation: 'Pv', testament: 'AT', category: 'Poéticos e Sabedoria', chapters: 31 },
  { id: 'EC', name: 'Eclesiastes', abbreviation: 'Ec', testament: 'AT', category: 'Poéticos e Sabedoria', chapters: 12 },
  { id: 'CT', name: 'Cânticos', abbreviation: 'Ct', testament: 'AT', category: 'Poéticos e Sabedoria', chapters: 8 },
  { id: 'IS', name: 'Isaías', abbreviation: 'Is', testament: 'AT', category: 'Profetas Maiores', chapters: 66 },
  { id: 'JR', name: 'Jeremias', abbreviation: 'Jr', testament: 'AT', category: 'Profetas Maiores', chapters: 52 },
  { id: 'LM', name: 'Lamentações', abbreviation: 'Lm', testament: 'AT', category: 'Profetas Maiores', chapters: 5 },
  { id: 'EZ', name: 'Ezequiel', abbreviation: 'Ez', testament: 'AT', category: 'Profetas Maiores', chapters: 48 },
  { id: 'DN', name: 'Daniel', abbreviation: 'Dn', testament: 'AT', category: 'Profetas Maiores', chapters: 12 },
  { id: 'OS', name: 'Oséias', abbreviation: 'Os', testament: 'AT', category: 'Profetas Menores', chapters: 14 },
  { id: 'JL', name: 'Joel', abbreviation: 'Jl', testament: 'AT', category: 'Profetas Menores', chapters: 3 },
  { id: 'AM', name: 'Amós', abbreviation: 'Am', testament: 'AT', category: 'Profetas Menores', chapters: 9 },
  { id: 'OB', name: 'Obadias', abbreviation: 'Ob', testament: 'AT', category: 'Profetas Menores', chapters: 1 },
  { id: 'JN', name: 'Jonas', abbreviation: 'Jn', testament: 'AT', category: 'Profetas Menores', chapters: 4 },
  { id: 'MQ', name: 'Miquéias', abbreviation: 'Mq', testament: 'AT', category: 'Profetas Menores', chapters: 7 },
  { id: 'NA', name: 'Naum', abbreviation: 'Na', testament: 'AT', category: 'Profetas Menores', chapters: 3 },
  { id: 'HC', name: 'Habacuque', abbreviation: 'Hc', testament: 'AT', category: 'Profetas Menores', chapters: 3 },
  { id: 'SF', name: 'Sofonias', abbreviation: 'Sf', testament: 'AT', category: 'Profetas Menores', chapters: 3 },
  { id: 'AG', name: 'Ageu', abbreviation: 'Ag', testament: 'AT', category: 'Profetas Menores', chapters: 2 },
  { id: 'ZC', name: 'Zacarias', abbreviation: 'Zc', testament: 'AT', category: 'Profetas Menores', chapters: 14 },
  { id: 'ML', name: 'Malaquias', abbreviation: 'Ml', testament: 'AT', category: 'Profetas Menores', chapters: 4 },

  // Novo Testamento (27 Livros)
  { id: 'MT', name: 'Mateus', abbreviation: 'Mt', testament: 'NT', category: 'Evangelhos', chapters: 28 },
  { id: 'MC', name: 'Marcos', abbreviation: 'Mc', testament: 'NT', category: 'Evangelhos', chapters: 16 },
  { id: 'LC', name: 'Lucas', abbreviation: 'Lc', testament: 'NT', category: 'Evangelhos', chapters: 24 },
  { id: 'JOA', name: 'João', abbreviation: 'Jo', testament: 'NT', category: 'Evangelhos', chapters: 21 },
  { id: 'AT', name: 'Atos', abbreviation: 'At', testament: 'NT', category: 'História', chapters: 28 },
  { id: 'RM', name: 'Romanos', abbreviation: 'Rm', testament: 'NT', category: 'Epístolas Paulinas', chapters: 16 },
  { id: '1CO', name: '1 Coríntios', abbreviation: '1Co', testament: 'NT', category: 'Epístolas Paulinas', chapters: 16 },
  { id: '2CO', name: '2 Coríntios', abbreviation: '2Co', testament: 'NT', category: 'Epístolas Paulinas', chapters: 13 },
  { id: 'GL', name: 'Gálatas', abbreviation: 'Gl', testament: 'NT', category: 'Epístolas Paulinas', chapters: 6 },
  { id: 'EF', name: 'Efésios', abbreviation: 'Ef', testament: 'NT', category: 'Epístolas Paulinas', chapters: 6 },
  { id: 'FP', name: 'Filipenses', abbreviation: 'Fp', testament: 'NT', category: 'Epístolas Paulinas', chapters: 4 },
  { id: 'CL', name: 'Colossenses', abbreviation: 'Cl', testament: 'NT', category: 'Epístolas Paulinas', chapters: 4 },
  { id: '1TS', name: '1 Tessalonicenses', abbreviation: '1Ts', testament: 'NT', category: 'Epístolas Paulinas', chapters: 5 },
  { id: '2TS', name: '2 Tessalonicenses', abbreviation: '2Ts', testament: 'NT', category: 'Epístolas Paulinas', chapters: 3 },
  { id: '1TM', name: '1 Timóteo', abbreviation: '1Tm', testament: 'NT', category: 'Epístolas Paulinas', chapters: 6 },
  { id: '2TM', name: '2 Timóteo', abbreviation: '2Tm', testament: 'NT', category: 'Epístolas Paulinas', chapters: 4 },
  { id: 'TT', name: 'Tito', abbreviation: 'Tt', testament: 'NT', category: 'Epístolas Paulinas', chapters: 3 },
  { id: 'FM', name: 'Filemom', abbreviation: 'Fm', testament: 'NT', category: 'Epístolas Paulinas', chapters: 1 },
  { id: 'HB', name: 'Hebreus', abbreviation: 'Hb', testament: 'NT', category: 'Epístolas Gerais', chapters: 13 },
  { id: 'TG', name: 'Tiago', abbreviation: 'Tg', testament: 'NT', category: 'Epístolas Gerais', chapters: 5 },
  { id: '1PE', name: '1 Pedro', abbreviation: '1Pe', testament: 'NT', category: 'Epístolas Gerais', chapters: 5 },
  { id: '2PE', name: '2 Pedro', abbreviation: '2Pe', testament: 'NT', category: 'Epístolas Gerais', chapters: 3 },
  { id: '1JO', name: '1 João', abbreviation: '1Jo', testament: 'NT', category: 'Epístolas Gerais', chapters: 5 },
  { id: '2JO', name: '2 João', abbreviation: '2Jo', testament: 'NT', category: 'Epístolas Gerais', chapters: 1 },
  { id: '3JO', name: '3 João', abbreviation: '3Jo', testament: 'NT', category: 'Epístolas Gerais', chapters: 1 },
  { id: 'JD', name: 'Judas', abbreviation: 'Jd', testament: 'NT', category: 'Epístolas Gerais', chapters: 1 },
  { id: 'AP', name: 'Apocalipse', abbreviation: 'Ap', testament: 'NT', category: 'Profecia', chapters: 22 }
];

export function findBookByNameOrAbbreviation(query: string): BibleBook | undefined {
  const normalized = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return PROTESTANT_CANON_66.find(book => {
    const bookNorm = book.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const abbrNorm = book.abbreviation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return bookNorm === normalized || abbrNorm === normalized;
  });
}
