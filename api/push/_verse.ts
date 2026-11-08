export interface BiblicalPassage {
  id: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  reference: string;
  text: string;
  contextSummary: string;
  theme: string;
  testament: 'AT' | 'NT';
  category: string;
}

export const VERIFIED_PASSAGES_CATALOG: BiblicalPassage[] = [
  // POÉTICOS E SABEDORIA
  {
    id: 'pv-3-5-6',
    book: 'Provérbios',
    chapter: 3,
    startVerse: 5,
    endVerse: 6,
    reference: 'Provérbios 3:5-6',
    text: 'Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    contextSummary: 'Salomão aconselha seu filho a colocar a confiança primordial em Deus, em contraste com a autossuficiência humana.',
    theme: 'Confiança e Direção Divina',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-23-1-3',
    book: 'Salmos',
    chapter: 23,
    startVerse: 1,
    endVerse: 3,
    reference: 'Salmos 23:1-3',
    text: 'O SENHOR é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome.',
    contextSummary: 'Davi reflete sobre o cuidado pastoral e constante de Deus sobre a vida do crente em meio aos vales e desafios.',
    theme: 'Cuidado e Descanso em Deus',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-46-1-2',
    book: 'Salmos',
    chapter: 46,
    startVerse: 1,
    endVerse: 2,
    reference: 'Salmos 46:1-2',
    text: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia. Pelo que não temeremos, ainda que a terra se mude, e ainda que os montes se transportem para o meio dos mares.',
    contextSummary: 'Hino dos filhos de Coré expressando a soberana proteção de Deus sobre Seu povo em tempos de instabilidade.',
    theme: 'Refúgio na Tempestade',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-121-1-2',
    book: 'Salmos',
    chapter: 121,
    startVerse: 1,
    endVerse: 2,
    reference: 'Salmos 121:1-2',
    text: 'Levantarei os meus olhos para os montes: de onde me virá o socorro? O meu socorro vem do SENHOR, que fez o céu e a terra.',
    contextSummary: 'Cântico de peregrinação entoado pelos viajantes a caminho de Jerusalém, reconhecendo o Criador como guardião fiel.',
    theme: 'Socorro Fiel do Criador',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-139-7-10',
    book: 'Salmos',
    chapter: 139,
    startVerse: 7,
    endVerse: 10,
    reference: 'Salmos 139:7-10',
    text: 'Para onde me ausentarei do teu Espírito? Para onde fugirei da tua face? Se subir ao céu, lá tu estás; se fizer no Seol a minha cama, eis que tu ali estás também. Se tomar as asas da alvorada e habitar nos confins dos mares, ainda ali a tua mão me guiará e a tua destra me sustentará.',
    contextSummary: 'Davi contempla a doce onipresença de Deus, encontrando abrigo no fato de que jamais estará distante dos olhos do Pai.',
    theme: 'A Doce Onipresença de Deus',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-84-5-7',
    book: 'Salmos',
    chapter: 84,
    startVerse: 5,
    endVerse: 7,
    reference: 'Salmos 84:5-7',
    text: 'Bem-aventurado o homem cuja força está em ti, em cujo coração se encontram os caminhos aplanados. Passando pelo vale de Baca, fazem dele um manancial; e a primeira chuva cobre-o de bênçãos. Vão indo de força em força; cada um deles em Sião aparece perante Deus.',
    contextSummary: 'Os peregrinos transformam o árido vale de lágrimas em fonte de água viva, renovando a força unicamente no Senhor.',
    theme: 'Força no Vale de Lágrimas',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-63-1-3',
    book: 'Salmos',
    chapter: 63,
    startVerse: 1,
    endVerse: 3,
    reference: 'Salmos 63:1-3',
    text: 'Ó Deus, tu és o meu Deus; de madrugada te buscarei; a minha alma tem sede de ti; a minha carne te deseja muito em uma terra seca e cansada, onde não há água. Para ver a tua fortaleza e a tua glória, como te vi no santuário. Porque a tua benignidade é melhor do que a vida; os meus lábios te louvarão.',
    contextSummary: 'No deserto de Judá, Davi expressa que a comunhão sincera com Deus é superior a qualquer alívio físico.',
    theme: 'Sede da Presença de Deus',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'sl-103-1-4',
    book: 'Salmos',
    chapter: 103,
    startVerse: 1,
    endVerse: 4,
    reference: 'Salmos 103:1-4',
    text: 'Bendize, ó minha alma, ao SENHOR, e tudo o que há em mim bendiga o seu santo nome. Bendize, ó minha alma, ao SENHOR, e não te esqueças de nenhum de seus benefícios. É ele quem perdoa todas as tuas iniquidades, quem sara todas as tuas enfermidades, quem redime a tua vida da perdição, quem te coroa de benignidade e de misericórdia.',
    contextSummary: 'Davi instrui a própria alma a combater o esquecimento espiritual, recordando a generosidade do perdão divino.',
    theme: 'Memória Grata da Graça Divina',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'jo-19-25-26',
    book: 'Jó',
    chapter: 19,
    startVerse: 25,
    endVerse: 26,
    reference: 'Jó 19:25-26',
    text: 'Porque eu sei que o meu Redentor vive, e que por fim se levantará sobre a terra. E, depois de consumida a minha pele, contudo, ainda em minha carne verei a Deus.',
    contextSummary: 'No auge da dor física e da incompreensão dos amigos, Jó ancora sua alma na certeza escatológica de um Salvador vivo.',
    theme: 'A Certeza de que o Redentor Vive',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'ec-3-1-4',
    book: 'Eclesiastes',
    chapter: 3,
    startVerse: 1,
    endVerse: 4,
    reference: 'Eclesiastes 3:1-4',
    text: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu: há tempo de nascer e tempo de morrer; tempo de plantar e tempo de arrancar o que se plantou; tempo de chorar e tempo de rir; tempo de prantear e tempo de dançar.',
    contextSummary: 'Reflexão sobre a soberania divina em administrar as diferentes estações e fases da existência humana.',
    theme: 'O Tempo Determinado por Deus',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },
  {
    id: 'pv-4-23',
    book: 'Provérbios',
    chapter: 4,
    startVerse: 23,
    endVerse: 23,
    reference: 'Provérbios 4:23',
    text: 'Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as fontes da vida.',
    contextSummary: 'O coração bíblico como centro das afeições, intenções e decisões que determinam o rumo de toda a vida.',
    theme: 'A Guarda do Coração',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
  },

  // PROFETAS MAIORES E MENORES (SEM GENEALOGIAS, COM PROFUNDIDADE)
  {
    id: 'hab-3-17-19',
    book: 'Habacuque',
    chapter: 3,
    startVerse: 17,
    endVerse: 19,
    reference: 'Habacuque 3:17-19',
    text: 'Porquanto, ainda que a figueira não floresça, nem haja fruto na vide; o produto da oliveira minta, e os campos não produzam mantimento; as ovelhas da malhada sejam arrebatadas, e nos currais não haja vacas, todavia, eu me alegrarei no SENHOR, exultarei no Deus da minha salvação. O SENHOR Deus é a minha força, e fará os meus pés como os das cervas, e me fará andar sobre as minhas alturas.',
    contextSummary: 'O profeta culmina seu livro com um cântico triunfante de fé, decidindo alegrar-se em Deus mesmo diante da escassez material total.',
    theme: 'A Alegria Inabalável em Meio à Crise',
    testament: 'AT',
    category: 'Profetas Menores'
  },
  {
    id: 'mq-6-8',
    book: 'Miqueias',
    chapter: 6,
    startVerse: 8,
    endVerse: 8,
    reference: 'Miqueias 6:8',
    text: 'Ele te declarou, ó homem, o que é bom; e que é o que o SENHOR pede de ti, senão que pratiques a justiça, e ames a misericórdia, e andes humildemente com o teu Deus?',
    contextSummary: 'Contra rituais religiosos vazios, o profeta sintetiza o coração da verdadeira adoração: retidão ética, amor prático e humildade sincera.',
    theme: 'O que o Senhor Pede de Ti',
    testament: 'AT',
    category: 'Profetas Menores'
  },
  {
    id: 'sf-3-17',
    book: 'Sofonias',
    chapter: 3,
    startVerse: 17,
    endVerse: 17,
    reference: 'Sofonias 3:17',
    text: 'O SENHOR, teu Deus, está no meio de ti, poderoso para salvar; ele se deleitará em ti com alegria; calar-se-á por seu amor, regozijar-se-á em ti com júbilo.',
    contextSummary: 'Uma das mais ternas revelações do carinho paternal de Deus, que não apenas acolhe o Seu povo, mas canta de alegria sobre ele.',
    theme: 'O Cuidado e o Júbilo do Senhor',
    testament: 'AT',
    category: 'Profetas Menores'
  },
  {
    id: 'is-40-29-31',
    book: 'Isaías',
    chapter: 40,
    startVerse: 29,
    endVerse: 31,
    reference: 'Isaías 40:29-31',
    text: 'Dá força ao cansado e multiplica as forças ao que não tem nenhum vigor. Os jovens se cansarão e se fatigarão, e os mancebos certamente cairão; mas os que esperam no SENHOR renovarão as forças, subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    contextSummary: 'Promessa de restauração ao povo exausto no exílio, contrastando o limite da energia humana com a fonte inesgotável da graça.',
    theme: 'Renovação das Forças no Senhor',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'is-43-18-19',
    book: 'Isaías',
    chapter: 43,
    startVerse: 18,
    endVerse: 19,
    reference: 'Isaías 43:18-19',
    text: 'Não vos lembreis das coisas passadas, nem considereis as antigas. Eis que faço uma coisa nova; agora sairá à luz; porventura não a percebeis? Eis que porei um caminho no deserto e rios no ermo.',
    contextSummary: 'Deus convida o Seu povo a não ficar refém das dores e tropeços do passado, pois Ele está abrindo fontes em meio à aridez.',
    theme: 'Caminho Novo no Deserto',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'is-30-15',
    book: 'Isaías',
    chapter: 30,
    startVerse: 15,
    endVerse: 15,
    reference: 'Isaías 30:15',
    text: 'Porque assim diz o Senhor DEUS, o Santo de Israel: Em vos converterdes e em sossegardes, estaria a vossa salvação; na tranquilidade e na confiança, estaria a vossa força.',
    contextSummary: 'Contra o ativismo ansioso que busca alianças no poder humano, Deus ensina que a verdadeira vitória brota do sossego e da confiança.',
    theme: 'Tranquilidade e Confiança',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'jr-17-7-8',
    book: 'Jeremias',
    chapter: 17,
    startVerse: 7,
    endVerse: 8,
    reference: 'Jeremias 17:7-8',
    text: 'Bendito o homem que confia no SENHOR, e cuja esperança é o SENHOR. Porque será como a árvore plantada junto às águas, que estende as suas raízes para o ribeiro e não receia quando vem o calor, mas a sua folha fica verde; e, no ano de sequidão, não se afadiga, nem deixa de dar fruto.',
    contextSummary: 'Jeremias contrasta quem vive apoiado na fragilidade humana com quem aprofunda suas raízes na fidelidade permanente de Deus.',
    theme: 'A Árvore Plantada Junto às Águas',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'lm-3-22-24',
    book: 'Lamentações',
    chapter: 3,
    startVerse: 22,
    endVerse: 24,
    reference: 'Lamentações 3:22-24',
    text: 'As misericórdias do SENHOR são a causa de não sermos consumidos; porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade. A minha porção é o SENHOR, diz a minha alma; portanto, esperarei nele.',
    contextSummary: 'Em meio às ruínas de Jerusalém, o autor ergue o olhar e declara que a graça divina se renova ao raiar de cada sol.',
    theme: 'Misericórdias Novas a Cada Manhã',
    testament: 'AT',
    category: 'Profetas Maiores'
  },

  // EVANGELHOS
  {
    id: 'mt-6-33-34',
    book: 'Mateus',
    chapter: 6,
    startVerse: 33,
    endVerse: 34,
    reference: 'Mateus 6:33-34',
    text: 'Mas buscai primeiro o Reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas. Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal.',
    contextSummary: 'Parte do Sermão da Montanha onde Jesus ensina sobre as prioridades do discípulo e a libertação da ansiedade material.',
    theme: 'Prioridades e Paz contra a Ansiedade',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'mt-11-28-30',
    book: 'Mateus',
    chapter: 11,
    startVerse: 28,
    endVerse: 30,
    reference: 'Mateus 11:28-30',
    text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração, e encontrareis descanso para a vossa alma. Porque o meu jugo é suave, e o meu fardo é leve.',
    contextSummary: 'Convite terno de Cristo àqueles que estão sobrecarregados pelo peso do fardo legalista e das lutas da existência.',
    theme: 'O Convite ao Descanso em Cristo',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'lc-12-22-26',
    book: 'Lucas',
    chapter: 12,
    startVerse: 22,
    endVerse: 26,
    reference: 'Lucas 12:22-26',
    text: 'E disse aos seus discípulos: Portanto, vos digo: não estejais inquietos pela vossa vida, pelo que haveis de comer, nem pelo corpo, pelo que haveis de vestir. Mais é a vida do que o sustento, e o corpo, mais do que as vestes. Considerai os corvos, que nem semeiam, nem segam; contudo, Deus os alimenta. Quanto mais valeis vós do que as aves?',
    contextSummary: 'Jesus ensina a contemplar a providência minuciosa de Deus na criação como antídoto para a inquietação diária.',
    theme: 'O Valor da Vida sob o Olhar do Pai',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'jo-14-27',
    book: 'João',
    chapter: 14,
    startVerse: 27,
    endVerse: 27,
    reference: 'João 14:27',
    text: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
    contextSummary: 'No cenáculo, prestes a ser entregue, Jesus lega aos discípulos uma paz sobrenatural que não depende das circunstâncias externas.',
    theme: 'A Paz que o Mundo Não Pode Dar',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'jo-15-4-5',
    book: 'João',
    chapter: 15,
    startVerse: 4,
    endVerse: 5,
    reference: 'João 15:4-5',
    text: 'Estai em mim, e eu, em vós; como a vara de si mesma não pode dar fruto, se não estiver na videira, assim também vós, se não estiverdes em mim. Eu sou a videira, vós, as varas; quem está em mim, e eu nele, este dá muito fruto, porque sem mim nada podeis fazer.',
    contextSummary: 'A metáfora da videira verdadeira ilustra a dependência vital e contínua que o cristão possui da seiva espiritual de Cristo.',
    theme: 'Permanecer na Videira Verdadeira',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'mc-4-39-40',
    book: 'Marcos',
    chapter: 4,
    startVerse: 39,
    endVerse: 40,
    reference: 'Marcos 4:39-40',
    text: 'E ele, despertando, repreendeu o vento e disse ao mar: Cala-te, aquieta-te. E o vento se aquietou, e houve grande bonança. E disse-lhes: Por que sois tão tímidos? Ainda não tendes fé?',
    contextSummary: 'Em meio à tempestade violenta no Mar da Galileia, Jesus manifesta Sua soberania sobre as forças da natureza e conforta os discípulos.',
    theme: 'Aquele que Acalma a Tempestade',
    testament: 'NT',
    category: 'Evangelhos'
  },

  // EPÍSTOLAS PAULINAS
  {
    id: 'rm-8-31-35',
    book: 'Romanos',
    chapter: 8,
    startVerse: 31,
    endVerse: 35,
    reference: 'Romanos 8:31-35',
    text: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós? Aquele que nem mesmo a seu próprio Filho poupou, antes, o entregou por todos nós, como nos não dará também com ele todas as coisas? Quem nos separará do amor de Cristo? A tribulação, ou a angústia, ou a perseguição, ou a fome, ou a nudez, ou o perigo, ou a espada?',
    contextSummary: 'O hino triunfante de Paulo assegurando a inabalável segurança do crente fundamentada no sacrifício vicário de Cristo.',
    theme: 'A Segurança Eterna no Amor de Deus',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'rm-12-9-12',
    book: 'Romanos',
    chapter: 12,
    startVerse: 9,
    endVerse: 12,
    reference: 'Romanos 12:9-12',
    text: 'O amor seja não fingido. Aborrecei o mal e apegai-vos ao bem. Amai-vos cordialmente uns aos outros com amor fraternal, preferindo-vos em honra uns aos outros. Não sejais vagarosos no cuidado; sede fervorosos no espírito, servindo ao Senhor; alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.',
    contextSummary: 'Instruções práticas para a vida comunitária da igreja, unindo ética, ternura, perseverança e fervor espiritual.',
    theme: 'Vida Cristã Autêntica e Paciência',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: '2co-4-16-18',
    book: '2 Coríntios',
    chapter: 4,
    startVerse: 16,
    endVerse: 18,
    reference: '2 Coríntios 4:16-18',
    text: 'Por isso, não desfalecemos; mas, ainda que o nosso homem exterior se corrompa, o interior, contudo, se renova de dia em dia. Porque a nossa leve e momentânea tribulação produz para nós um peso eterno de glória mui excelente, não atentando nós nas coisas que se veem, mas nas que se não veem; porque as que se veem são temporais, e as que se não veem são eternas.',
    contextSummary: 'Paulo revela a perspectiva da eternidade, onde as aflições passageiras são confrontadas com a glória incorruptível que há de vir.',
    theme: 'Renovação Interior e o Peso de Glória',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: '2co-12-9-10',
    book: '2 Coríntios',
    chapter: 12,
    startVerse: 9,
    endVerse: 10,
    reference: '2 Coríntios 12:9-10',
    text: 'E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza. De boa vontade, pois, me gloriarei nas minhas fraquezas, para que em mim habite o poder de Cristo. Porque, quando estou fraco, então, sou forte.',
    contextSummary: 'A resposta de Deus ao espinho na carne de Paulo, demonstrando que a fragilidade humana é o cenário perfeito para a manifestação do poder de Cristo.',
    theme: 'A Suficiência da Graça na Fraqueza',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'gl-6-9-10',
    book: 'Gálatas',
    chapter: 6,
    startVerse: 9,
    endVerse: 10,
    reference: 'Gálatas 6:9-10',
    text: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido. Então, enquanto temos tempo, façamos o bem a todos, mas principalmente aos domésticos da fé.',
    contextSummary: 'Encorajamento aos crentes exaustos a perseverarem na prática da generosidade e do amor, certos da colheita no tempo de Deus.',
    theme: 'Perseverar sem Desfalecer no Bem',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'ef-3-16-19',
    book: 'Efésios',
    chapter: 3,
    startVerse: 16,
    endVerse: 19,
    reference: 'Efésios 3:16-19',
    text: 'Para que, segundo as riquezas da sua glória, vos conceda que sejais corroborados com poder pelo seu Espírito no homem interior; a fim de que Cristo habite, pela fé, no vosso coração; para que, estando arraigados e fundados em amor, possais perfeitamente compreender, com todos os santos, qual seja a largura, e o comprimento, e a altura, e a profundidade e conhecer o amor de Cristo, que excede todo entendimento.',
    contextSummary: 'Oração apostólica pedindo que os discípulos tenham as faculdades espirituais fortalecidas para experimentar a imensidão do amor de Deus.',
    theme: 'Fortalecidos no Homem Interior',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'fp-2-3-5',
    book: 'Filipenses',
    chapter: 2,
    startVerse: 3,
    endVerse: 5,
    reference: 'Filipenses 2:3-5',
    text: 'Nada façais por contenda ou por vanglória, mas por humildade; cada um considere os outros superiores a si mesmo. Não atente cada um para o que é propriamente seu, mas cada qual também para o que é dos outros. De sorte que haja em vós o mesmo sentimento que houve também em Cristo Jesus.',
    contextSummary: 'Paulo propõe o Cristo encarnado como padrão supremo de desprendimento, humildade e serviço ao próximo.',
    theme: 'O Sentimento Humilde de Cristo',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'fp-4-6-7',
    book: 'Filipenses',
    chapter: 4,
    startVerse: 6,
    endVerse: 7,
    reference: 'Filipenses 4:6-7',
    text: 'Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplicas, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.',
    contextSummary: 'O apóstolo preso em Roma ensina a transferir as aflições para Deus com gratidão, recebendo a paz que monta guarda na alma.',
    theme: 'A Paz que Guarda o Coração',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'cl-3-12-15',
    book: 'Colossenses',
    chapter: 3,
    startVerse: 12,
    endVerse: 15,
    reference: 'Colossenses 3:12-15',
    text: 'Revesti-vos, pois, como eleitos de Deus, santos e amados, de entranhas de misericórdia, de benignidade, humildade, mansidão, longanimidade, suportando-vos uns aos outros e perdoando-vos uns aos outros, se algum tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também. E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição. E a paz de Deus domine em vossos corações.',
    contextSummary: 'A roupa espiritual do crente: perdão radical fundamentado no perdão recebido de Cristo e a paz governando as decisões da comunidade.',
    theme: 'Revestidos de Mansidão e Perdão',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: '1ts-5-16-18',
    book: '1 Tessalonicenses',
    chapter: 5,
    startVerse: 16,
    endVerse: 18,
    reference: '1 Tessalonicenses 5:16-18',
    text: 'Regozijai-vos sempre. Orai sem cessar. Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
    contextSummary: 'Tríade devocional contínua da vida cristã: alegria constante no Senhor, diálogo ininterrupto em oração e gratidão em todas as circunstâncias.',
    theme: 'Alegria, Oração e Gratidão Contínua',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: '2tm-1-7',
    book: '2 Timóteo',
    chapter: 1,
    startVerse: 7,
    endVerse: 7,
    reference: '2 Timóteo 1:7',
    text: 'Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação.',
    contextSummary: 'Paulo encoraja o jovem Timóteo a não recuar diante da timidez ou perseguição, pois o Espírito Santo confere coragem e sobriedade.',
    theme: 'Fortaleza, Amor e Moderação',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },

  // EPÍSTOLAS GERAIS E OUTROS
  {
    id: 'hb-4-15-16',
    book: 'Hebreus',
    chapter: 4,
    startVerse: 15,
    endVerse: 16,
    reference: 'Hebreus 4:15-16',
    text: 'Porque não temos um sumo sacerdote que não possa compadecer-se das nossas fraquezas; porém um que, como nós, em tudo foi tentado, mas sem pecado. Cheguemos, pois, com confiança ao trono da graça, para que possamos alcançar misericórdia e achar graça, a fim de sermos ajudados em tempo oportuno.',
    contextSummary: 'A humanidade real e a vitória de Jesus nos autorizam a orar sem medo de rejeição, encontrando socorro exato no momento da aflição.',
    theme: 'Confiança Diante do Trono da Graça',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: 'hb-12-1-2',
    book: 'Hebreus',
    chapter: 12,
    startVerse: 1,
    endVerse: 2,
    reference: 'Hebreus 12:1-2',
    text: 'Portanto, nós também, pois que estamos rodeados de uma tão grande nuvem de testemunhas, deixemos todo o embaraço e o pecado que tão de perto nos rodeia e corramos, com paciência, a carreira que nos está proposta, olhando para Jesus, autor e consumador da fé.',
    contextSummary: 'Exortação final a correr a jornada cristã desvencilhando-se do pecado e fixando os olhos em Cristo.',
    theme: 'Olhando Firmemente para Jesus',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: 'tg-1-2-4',
    book: 'Tiago',
    chapter: 1,
    startVerse: 2,
    endVerse: 4,
    reference: 'Tiago 1:2-4',
    text: 'Meus irmãos, tende grande alegria quando cairdes em várias tentações, sabendo que a prova da vossa fé produz a paciência. Tenha, porém, a paciência a sua obra perfeita, para que sejais perfeitos e completos, sem faltar em coisa alguma.',
    contextSummary: 'Tiago ensina o valor pedagógico das tribulações no amadurecimento do caráter cristão.',
    theme: 'Perseverança e Maturidade nas Provações',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: 'tg-3-17-18',
    book: 'Tiago',
    chapter: 3,
    startVerse: 17,
    endVerse: 18,
    reference: 'Tiago 3:17-18',
    text: 'Mas a sabedoria que vem do alto é, primeiramente, pura, depois, pacífica, moderada, tratável, cheia de misericórdia e de bons frutos, sem parcialidade e sem hipocrisia. Ora, o fruto da justiça semeia-se na paz, para os que exercitam a paz.',
    contextSummary: 'Tiago contrasta a sabedoria terrena, invejosa e facciosa, com a sabedoria celestial caracterizada pela serenidade e integridade.',
    theme: 'A Sabedoria que Vem do Alto',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: '1pe-1-3-6',
    book: '1 Pedro',
    chapter: 1,
    startVerse: 3,
    endVerse: 6,
    reference: '1 Pedro 1:3-6',
    text: 'Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo, que, segundo a sua grande misericórdia, nos gerou de novo para uma viva esperança, pela ressurreição de Jesus Cristo dentre os mortos, para uma herança incorruptível, incontaminável e que se não pode murchar, guardada nos céus para vós.',
    contextSummary: 'Pedro celebra o renascimento espiritual e a herança celestial incorruptível que sustenta a fé em meio às provações terrenas.',
    theme: 'Uma Viva Esperança em Cristo',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: '1pe-5-6-7',
    book: '1 Pedro',
    chapter: 5,
    startVerse: 6,
    endVerse: 7,
    reference: '1 Pedro 5:6-7',
    text: 'Humilhai-vos, pois, debaixo da potente mão de Deus, para que, a seu tempo, vos exalte, lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
    contextSummary: 'Pedro exorta os cristãos perseguidos a confiarem no cuidado pessoal de Deus entregando-Lhe as ansiedades.',
    theme: 'Humildade e Entrega da Ansiedade',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: '1jo-4-18-19',
    book: '1 João',
    chapter: 4,
    startVerse: 18,
    endVerse: 19,
    reference: '1 João 4:18-19',
    text: 'No amor não há temor; antes, o perfeito amor lança fora o temor; porque o temor tem consigo a pena, e o que teme não é perfeito em amor. Nós o amamos porque ele nos amou primeiro.',
    contextSummary: 'O apóstolo do amor demonstra que o amor sacrificial do Pai desfaz o pavor do juízo e da condenação, gerando paz relacional.',
    theme: 'O Perfeito Amor que Lança Fora o Medo',
    testament: 'NT',
    category: 'Epístolas Gerais'
  },
  {
    id: 'ap-21-3-5',
    book: 'Apocalipse',
    chapter: 21,
    startVerse: 3,
    endVerse: 5,
    reference: 'Apocalipse 21:3-5',
    text: 'E ouvi uma grande voz do céu, que dizia: Eis aqui o tabernáculo de Deus com os homens, pois com eles habitará, e eles serão o seu povo, e o mesmo Deus estará com eles e será o seu Deus. E Deus limpará de seus olhos toda lágrima, e não haverá mais morte, nem pranto, nem clamor, nem dor, porque já as primeiras coisas são passadas. E o que estava assentado sobre o trono disse: Eis que faço novas todas as coisas.',
    contextSummary: 'A visão da consumação de todas as coisas, onde a presença de Deus elimina para sempre o sofrimento, o luto e a dor.',
    theme: 'Eis que Faço Novas Todas as Coisas',
    testament: 'NT',
    category: 'Profecia'
  }
];

export function getPassageById(id: string): BiblicalPassage | undefined {
  return VERIFIED_PASSAGES_CATALOG.find(p => p.id === id);
}



/**
 * MurmurHash3 / FNV-1a seeded hash generator for deterministic date selection
 */
function hashDateString(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG initialized with a 32-bit seed
 */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Selects the Daily Verse for a given date string (YYYY-MM-DD)
 * 1. Fully reproducible: same date produces the identical verse for all users globally.
 * 2. Guaranteed coverage of verified Protestant canon passages.
 * 3. Anti-repetition: ensures consecutive days do not pick the same passage or immediate book repeat.
 */
export function selectDailyVerse(dateStr: string, recentHistoryIds: string[] = []): BiblicalPassage {
  if (!VERIFIED_PASSAGES_CATALOG || VERIFIED_PASSAGES_CATALOG.length === 0) {
    throw new Error('O catálogo de passagens verificadas está vazio.');
  }

  const catalog = VERIFIED_PASSAGES_CATALOG;
  const seed = hashDateString(dateStr);
  const prng = mulberry32(seed);

  // Filter out recent history to avoid repeating recent passages (e.g., last 14 days)
  const available = catalog.filter(p => !recentHistoryIds.slice(-14).includes(p.id));
  const pool = available.length > 0 ? available : catalog;

  const selectedIndex = Math.floor(prng() * pool.length);
  return pool[selectedIndex];
}

/**
 * Gets today's date in America/Sao_Paulo timezone as YYYY-MM-DD
 */
export function getSaoPauloDateString(customDate?: Date): string {
  const d = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}
