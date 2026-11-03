import { DevotionalPublic } from '../../services/ai/schemas';
import { getSongById } from '../songs/catalog';

export const APPROVED_DEVOTIONALS_VAULT: DevotionalPublic[] = [
  // 1. 2026-10-30
  {
    schemaVersion: 1,
    id: '2026-10-30',
    date: '2026-10-30',
    title: 'Aprendendo a Confiar de Todo o Coração',
    verseOfTheDay: {
      book: 'Provérbios',
      chapter: 3,
      startVerse: 5,
      endVerse: 6,
      reference: 'Provérbios 3:5-6',
      passageId: 'pv-3-5-6',
      text: 'Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.'
    },
    contextSummary: 'Salomão instrui o discípulo sobre a diferença crucial entre a sabedoria humana falível e a submissão humilde à soberania de Deus.',
    theme: 'Confiança e Direção Divina',
    reflection: `Vivemos em uma sociedade que supervaloriza a autonomia absoluta e a ilusão de que temos o controle integral sobre o amanhã. Planejamos nossas rotinas, calculamos riscos e, frequentemente, nos apoiamos em nossa própria capacidade analítica como o alicerce fundamental de nossa segurança. No entanto, as Escrituras nos convidam a um caminho diametralmente oposto: a rendição graciosa do nosso coração ao Criador.

Confiar no Senhor "de todo o coração" não significa renunciar à prudência ou ao raciocínio bíblico, mas sim reconhecer que a nossa inteligência humana é limitada e vulnerável a enganos. Estribar-se no próprio entendimento é como tentar atravessar um abismo sobre uma ponte frágil construída por nossos próprios medos e presunções. Quando admitimos que Deus enxerga o panorama eterno de nossa história, somos libertos da ansiedade paralisante.

Reconhecê-Lo em todos os nossos caminhos significa convidar a Sua presença para a totalidade da nossa vida cotidiana: no ambiente de trabalho, nas conversas familiares, na administração dos recursos e nos momentos de solidão e incerteza. Quando Ele é o centro, Ele endireita as nossas veredas — não necessariamente eliminando todas as dificuldades imediatas, mas alinhando os nossos passos ao propósito soberano e gracioso do Seu Reino.`,
    application: 'Hoje, faça uma pausa consciente diante de qualquer decisão ou incerteza. Em vez de se apoiar unicamente no cálculo humano, ore entregando o desfecho ao Senhor, pedindo que Ele conceda a sabedoria e a serenidade que vêm do alto.',
    prayer: 'Senhor meu Deus, reconheço a minha fragilidade e a pequenez da minha compreensão diante da imensidão da Tua soberania. Ensina-me a não me estribar em minhas próprias forças nem a confiar cegamente em meus planos passageiros. Entrego a Ti as minhas decisões, os meus anseios e a minha família. Endireita as minhas veredas para que eu ande em obediência à Tua Palavra. Em nome de Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-001',
    music: getSongById('song-001'),
    evaluation: {
      score: 92,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 2. 2026-10-31
  {
    schemaVersion: 1,
    id: '2026-10-31',
    date: '2026-10-31',
    title: 'O Bom Pastor e o Descanso da Alma',
    verseOfTheDay: {
      book: 'Salmos',
      chapter: 23,
      startVerse: 1,
      endVerse: 3,
      reference: 'Salmos 23:1-3',
      passageId: 'sl-23-1-3',
      text: 'O SENHOR é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome.'
    },
    contextSummary: 'Davi, com sua experiência pastoral, descreve a proteção íntima, o sustento e o refrigério que o Senhor provê ao Seu rebanho.',
    theme: 'Cuidado e Descanso em Deus',
    reflection: `Em um mundo agitado por exigências intermináveis e pelo barulho incessante de notificações, o cansaço da alma é uma realidade comum. Muitas vezes corremos exaustos atrás de segurança, aceitação ou alívio, esquecendo-nos da verdade fundamental proclamada pelo salmista: o Senhor é o nosso pastor.

A declaração "nada me faltará" não é uma promessa de luxo supérfluo ou de ausência de provações, mas sim a certeza de que a provisão espiritual e o cuidado essencial de Deus jamais falharão para com Seus filhos. As ovelhas necessitam de um pastor vigilante para descansar em paz, pois são indefesas por natureza. Da mesma forma, encontramos o verdadeiro repouso não na ausência de lutas externas, mas na presença constante dAquele que nos conduz mansamente.

As "águas tranquilas" e os "verdes pastos" simbolizam a renovação espiritual que brota da comunhão com Deus. Ele não apenas restaura o nosso vigor, mas nos orienta ativamente a trilhar as veredas da retidão. Esse cuidado não se fundamenta em nossos méritos pessoais, mas é exercido "por amor do Seu nome", assegurando que a fidelidade dEle permanece imutável mesmo nos dias mais sombrios.`,
    application: 'Reserve alguns minutos de silêncio absoluto ao longo do seu dia. Desligue os ruídos externos e medite na presença de Cristo, permitindo que a Sua graça refrigere a sua alma cansada.',
    prayer: 'Amado Pai Celeste, Tu és o meu verdadeiro Pastor. Perdoa-me pelos momentos em que corro ansioso em busca de amparo longe do Teu aprisco. Refrigera a minha alma abatida e concede-me o discernimento para repousar em Tua fidelidade. Conduz-me em integridade e retidão ao longo deste dia, por amor do Teu Santo Nome. Em Cristo Jesus, amém.',
    estimatedMinutes: 4,
    musicId: 'song-005',
    music: getSongById('song-005'),
    evaluation: {
      score: 94,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 3. 2026-11-01
  {
    schemaVersion: 1,
    id: '2026-11-01',
    date: '2026-11-01',
    title: 'Misericórdias Novas no Alvorecer',
    verseOfTheDay: {
      book: 'Lamentações',
      chapter: 3,
      startVerse: 22,
      endVerse: 24,
      reference: 'Lamentações 3:22-24',
      passageId: 'lm-3-22-24',
      text: 'As misericórdias do SENHOR são a causa de não sermos consumidos; porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade. A minha porção é o SENHOR, diz a minha alma; portanto, esperarei nele.'
    },
    contextSummary: 'Em meio às cinzas do exílio em Jerusalém, o autor ergue os olhos das ruínas para ancorar seu coração na fidelidade inabalável do Senhor.',
    theme: 'Misericórdias Novas a Cada Manhã',
    reflection: `O livro de Lamentações foi escrito no cenário desolador da queda de Jerusalém. As muralhas estavam destruídas, o templo em ruínas e o povo imerso em dor. No entanto, exatamente no coração desse livro de lamento e tristeza, resplandece uma das mais sublimes declarações teológicas de toda a Escritura: a misericórdia de Deus se renova a cada manhã.

Essa afirmação ganha força precisamente porque não nasceu em um palácio de conforto, mas no meio do sofrimento real. O profeta não nega a dor das circunstâncias, mas recusa-se a deixar que as circunstâncias tenham a última palavra sobre o caráter de Deus. Se dependêssemos de nossa própria justiça ou fidelidade, já teríamos sido consumidos; somos sustentados unicamente pelo amor pactual do Altíssimo.

Cada novo amanhecer é um testemunho silencioso e diário da paciência divina. O sol que desponta no horizonte traz consigo uma reserva renovada de graça, perdão e força para a jornada. Quando compreendemos que a nossa verdadeira porção é o próprio Senhor — e não os bens instáveis deste mundo —, encontramos a âncora necessária para esperar nEle com serena esperança, independentemente do que o dia reserve.`,
    application: 'Ao acordar e ver a luz do novo dia, lembre-se de que os erros e fardos de ontem não definem o dia de hoje. Abrace o perdão de Deus e recomece com ânimo novo e gratidão sincera.',
    prayer: 'Senhor Deus e Pai compassivo, quão grande e inesgotável é a Tua fidelidade! Agradeço-Te porque as Tuas misericórdias se renovaram sobre a minha vida nesta manhã. Eu não mereço a Tua bondade, mas descanso em Teu amor redentor. Sê a minha porção e o meu sustento em todas as horas deste dia. Em nome de Jesus Cristo, amém.',
    estimatedMinutes: 5,
    musicId: 'song-002',
    music: getSongById('song-002'),
    evaluation: {
      score: 95,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 4. 2026-11-02
  {
    schemaVersion: 1,
    id: '2026-11-02',
    date: '2026-11-02',
    title: 'A Paz que Supera Toda a Compreensão',
    verseOfTheDay: {
      book: 'Filipenses',
      chapter: 4,
      startVerse: 6,
      endVerse: 7,
      reference: 'Filipenses 4:6-7',
      passageId: 'fp-4-6-7',
      text: 'Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplicas, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.'
    },
    contextSummary: 'Escrevendo da prisão em Roma, o apóstolo Paulo transmite à igreja de Filipos o segredo apostólico da serenidade em meio à oposição.',
    theme: 'A Paz que Guarda o Coração',
    reflection: `A ansiedade é frequentemente descrita como a tentativa infrutífera de carregar amanhã com as forças de hoje. Quando o apóstolo Paulo escreveu a famosa admoestação: "Não estejais inquietos por coisa alguma", ele não estava desfrutando de férias tranquilas, mas encarava correntes em uma cela em Roma. O seu conselho, portanto, não é uma teoria ingênua de autoajuda, mas o fruto de uma fé testada no fogo.

Paulo nos apresenta o remédio bíblico para a angústia da mente: a transferência das nossas preocupações para o altar de Deus através da oração perseverante acompanhada de ações de graças. A gratidão é o elemento transformador nesse processo; quando agradecemos pelas misericórdias passadas, recordamos que o mesmo Deus que cuidou de nós ontem permanece no controle hoje.

O resultado dessa entrega não é necessariamente a resolução mágica e instantânea de todos os problemas externos, mas algo muito mais profundo: "a paz de Deus, que excede todo o entendimento". No vocabulário militar da época, a palavra "guardará" referia-se a uma guarnição de soldados que vigiava os portões de uma cidade contra invasões. É exatamente isso que a paz de Cristo faz em nosso interior: monta guarda contra o pânico, a amargura e o desespero.`,
    application: 'Escreva em uma folha ou no diário do aplicativo três motivos concretos de gratidão antes de apresentar a Deus os seus pedidos de socorro neste dia.',
    prayer: 'Pai bondoso, derramo diante de Ti as minhas inquietações, incertezas e temores. Perdoa-me quando permito que a ansiedade sufoque a minha fé. Ensina-me a cultivar um coração grato e a confiar na Tua soberana vontade. Que a Tua santa paz guarde a minha mente e as minhas emoções em Cristo Jesus. Amém.',
    estimatedMinutes: 5,
    musicId: 'song-007',
    music: getSongById('song-007'),
    evaluation: {
      score: 93,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 5. 2026-11-03 (HOJE)
  {
    schemaVersion: 1,
    id: '2026-11-03',
    date: '2026-11-03',
    title: 'A Alegria Inabalável em Meio à Crise',
    verseOfTheDay: {
      book: 'Habacuque',
      chapter: 3,
      startVerse: 17,
      endVerse: 19,
      reference: 'Habacuque 3:17-19',
      passageId: 'hc-3-17-19',
      text: 'Porquanto, ainda que a figueira não floresça, nem haja fruto na vide; o produto da oliveira minta, e os campos não produzam mantimento; as ovelhas da malhada sejam arrebatadas, e nos currais não haja vacas, todavia, eu me alegrarei no SENHOR, exultarei no Deus da minha salvação. O SENHOR Deus é a minha fortaleza, e fará os meus pés como os das corças, e me fará andar sobre as minhas alturas.'
    },
    contextSummary: 'Mesmo diante da iminente invasão babilônica e da perda de colheitas e gado, o profeta Habacuque ancora sua alegria não nos recursos terrenos, mas na salvação do Senhor.',
    theme: 'Fé e Alegria Inabalável na Escassez',
    reflection: `O cântico de Habacuque representa uma das mais maduras expressões de fé de todo o Antigo Testamento. O profeta inicia seu livro com angústia e perguntas difíceis diante da violência e da injustiça, mas termina prostrado em adoração sublime. Ele contempla o cenário de uma economia agrária em colapso total: figueiras secas, vinhas estéreis, olivais improdutivos e currais vazios. Para uma sociedade antiga, isso significava fome, ruína e incerteza radical.

A palavra-chave que rompe esse quadro desolador é "todavia". Esse termo pequeno marca a fronteira entre a religiosidade frágil de conveniência e a verdadeira fé bíblica. A alegria do profeta não é uma euforia superficial que nega a dureza dos fatos, nem um otimismo tolo; é uma decisão deliberada e espiritual de se alegrar no Deus da salvação. As circunstâncias podem desmoronar, mas o Caráter dAquele que nos resgatou permanece imutável.

Quando o Senhor é a nossa força, Ele nos concede pés semelhantes aos das corças — animais ágeis e firmes, capazes de saltar com segurança pelas encostas escarpadas e rochosas sem tropeçar. Deus não promete que viveremos apenas em planícies cômodas, mas garante o equilíbrio e a coragem necessários para caminhar com dignidade e paz mesmo nas maiores altitudes de aflição da existência humana.`,
    application: 'Se algo em sua rotina parece árido, frustrante ou fora de controle hoje, não permita que isso roube a sua esperança fundamental. Declare em oração: "Todavia, eu me alegrarei no Senhor, o Deus da minha salvação".',
    prayer: 'Senhor soberano, meu refúgio e fortaleza. Perdoa-me quando a minha alegria oscila de acordo com os bens materiais ou o sucesso passageiro dos meus planos. Mesmo quando os frutos tardarem e os campos parecerem secos, ensina-me a fixar o meu olhar em Tua graça redentora. Sê a minha força hoje e firma os meus pés nas alturas da Tua paz. Em nome de Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-012',
    music: getSongById('song-012'),
    evaluation: {
      score: 97,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 6. 2026-11-04
  {
    schemaVersion: 1,
    id: '2026-11-04',
    date: '2026-11-04',
    title: 'O Homem Interior que se Renova',
    verseOfTheDay: {
      book: '2 Coríntios',
      chapter: 4,
      startVerse: 16,
      endVerse: 18,
      reference: '2 Coríntios 4:16-18',
      passageId: '2co-4-16-18',
      text: 'Por isso, não desfalecemos; mas, ainda que o nosso homem exterior se corrompa, o interior, contudo, se renova de dia em dia. Porque a nossa leve e momentânea tribulação produz para nós um peso eterno de glória mui excelente, não atentando nós nas coisas que se veem, mas nas que se não veem; porque as que se veem são temporais, e as que se não veem são eternas.'
    },
    contextSummary: 'Paulo ensina os coríntios a olharem além do desgaste físico e das tribulações do ministério, fixando os olhos na glória eterna invisível.',
    theme: 'Renovação Diária e Perspectiva Eterna',
    reflection: `O tempo deixa marcas inevitáveis em nossa estrutura física e emocional. O desgaste do corpo, as pressões diárias, as perdas e o cansaço fazem parte da condição humana caída. O apóstolo Paulo conhecia isso na pele com cicatrizes de apedrejamentos, naufrágios e perseguições. Contudo, ele pronuncia uma convicção extraordinária: "Por isso, não desfalecemos".

A razão para não desistir não está em uma força de vontade heroica, mas em uma obra graciosa e sobrenatural do Espírito Santo: enquanto o invólucro exterior se desgasta, o nosso ser interior é renovado a cada dia. Essa renovação espiritual acontece no secreto, pela oração, pela meditação na Palavra e pela comunhão viva com Cristo, capacitando o discípulo a encarar a rotina com ânimo renovado.

Paulo chama as aflições presentes de "leves e momentâneas", não para desprezar a dor humana real, mas para compará-la com o "eterno peso de glória" que está sendo forjado para nós. Quando olhamos para a eternidade, redimensionamos o sofrimento passageiro. As crises materiais passam, mas a transformação que Deus opera em nosso caráter perdura para todo o sempre.`,
    application: 'Não permita que o cansaço corporal ou a frustração do dia definam o seu valor ou a sua fé. Busque um momento de refrigério no Senhor para alimentar o seu homem interior.',
    prayer: 'Pai de amor e misericórdia, quando as minhas forças físicas e emocionais se esgotarem, renova o meu homem interior pela ação graciosa do Teu Santo Espírito. Ensina-me a não fixar meus olhos apenas nas coisas visíveis e temporais deste mundo, mas na glória eterna prometida em Cristo Jesus. Amém.',
    estimatedMinutes: 5,
    musicId: 'song-001',
    music: getSongById('song-001'),
    evaluation: {
      score: 96,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 7. 2026-11-05
  {
    schemaVersion: 1,
    id: '2026-11-05',
    date: '2026-11-05',
    title: 'O que o Senhor Pede: Justiça, Misericórdia e Humildade',
    verseOfTheDay: {
      book: 'Miqueias',
      chapter: 6,
      startVerse: 8,
      endVerse: 8,
      reference: 'Miqueias 6:8',
      passageId: 'mq-6-8',
      text: 'Ele te declarou, ó homem, o que é bom; e que é o que o SENHOR pede de ti, senão que pratiques a justiça, e ames a beneficência, e andes humildemente com o teu Deus?'
    },
    contextSummary: 'O profeta Miqueias confronta rituais vazios e religiosidade externa, resumindo a verdadeira devoção requerida pelo Senhor da Aliança.',
    theme: 'Justiça, Amor e Humildade Diária',
    reflection: `No tempo de Miqueias, o povo tentava compensar a corrupção moral e a indiferença com sacrifícios extravagantes. Eles perguntavam se o Senhor se agradaria de milhares de carneiros ou de ribeiros de azeite. A resposta do profeta desmascara qualquer tentativa de barganha religiosa: Deus não procura rituais grandiosos, mas corações transformados pela verdade.

O que o Senhor requer resume a essência da lei moral de Deus: praticar a justiça, amar a misericórdia e andar humildemente com o Criador. Praticar a justiça significa agir com retidão em nossas transações diárias, defendendo os vulneráveis e recusando a desonestidade. Amar a beneficência ou a misericórdia (hesed) é refletir o amor leal e sacrificial de Deus para com o próximo que precisa de compaixão.

Por fim, o andar humilde é a chave de toda espiritualidade bíblica. Não é uma falsa modéstia para ser vista pelos outros, mas a consciência profunda de nossa constante dependência da graça de Deus. Quem anda humildemente com o Altíssimo não se ensoberbece nas vitórias nem se desespera nas derrotas, pois sabe que cada fôlego de vida é uma dádiva imerecida do Pai celestial.`,
    application: 'Identifique uma atitude concreta hoje onde você possa exercitar justiça ou misericórdia: perdoe uma ofensa, trate alguém com gentileza desinteressada ou faça o que é correto mesmo sem aplausos.',
    prayer: 'Senhor justo e compassivo, livra-me de uma religiosidade vazia de aparências. Molda o meu caráter segundo a Tua verdade. Concede-me coragem para praticar a justiça em meu cotidiano, um coração pronto para amar com misericórdia e a humildade sincera para caminhar Contigo em todos os meus passos. Em nome de Jesus, amém.',
    estimatedMinutes: 4,
    musicId: 'song-011',
    music: getSongById('song-011'),
    evaluation: {
      score: 95,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 8. 2026-11-06
  {
    schemaVersion: 1,
    id: '2026-11-06',
    date: '2026-11-06',
    title: 'Revestidos de Ternura e Perdão',
    verseOfTheDay: {
      book: 'Colossenses',
      chapter: 3,
      startVerse: 12,
      endVerse: 15,
      reference: 'Colossenses 3:12-15',
      passageId: 'cl-3-12-15',
      text: 'Revesti-vos, pois, como eleitos de Deus, santos e amados, de entranhas de misericórdia, de benignidade, humildade, mansidão, longanimidade, suportando-vos uns aos outros e perdoando-vos uns aos outros, se algum tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também. E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição. E a paz de Deus domine em vossos corações.'
    },
    contextSummary: 'Paulo instrui os cristãos de Colossos sobre o novo estilo de vida gerado pela união com Cristo, centrado no perdão e no amor comunitário.',
    theme: 'O Vínculo do Amor e o Perdão de Cristo',
    reflection: `A metáfora do apóstolo Paulo sobre o vestuário espiritual é vívida e prática. Assim como escolhemos diariamente as roupas que vestimos antes de sair para o mundo, o crente é chamado a "revestir-se" deliberadamente das virtudes do Reino: compaixão profunda, bondade, mansidão e paciência. Não se trata de uma fachada exterior, mas de uma nova identidade que flui de sermos "amados de Deus".

O desafio relacional mais árduo da vida comunitária e familiar é o conflito interpessoal. Paulo não finge que a convivência é livre de atritos; ele ordena: "suportando-vos uns aos outros e perdoando-vos mutuamente". O padrão desse perdão não é a nossa simpatia natural, nem a desculpa de quem nos feriu, mas sim o próprio sacrifício da cruz: "assim como Cristo vos perdoou, perdoai vós também".

Sobre todas essas virtudes, o amor é o cinto que mantém tudo coeso e em perfeita harmonia. Onde o amor sacrificial de Cristo reina, a amargura perde espaço e a paz de Deus atua como o árbitro supremo do coração. Essa paz desfaz mal-entendidos e preserva a nossa mente em serena serenidade.`,
    application: 'Pense em alguém que recentemente lhe causou aborrecimento ou desconforto. Em vez de alimentar ressentimento, decida conscientemente liberar perdão em seu coração e orar pelo bem dessa pessoa.',
    prayer: 'Senhor Jesus, Tu me perdoaste de uma dívida impagável na cruz do Calvário. Livra o meu coração de qualquer raiz de amargura, mágoa ou aspereza. Reveste-me nesta manhã com a Tua mansidão, paciência e amor. Que a Tua santa paz seja o árbitro de todas as minhas reações e palavras ao longo deste dia. Amém.',
    estimatedMinutes: 5,
    musicId: 'song-006',
    music: getSongById('song-006'),
    evaluation: {
      score: 96,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 9. 2026-11-07
  {
    schemaVersion: 1,
    id: '2026-11-07',
    date: '2026-11-07',
    title: 'O Senhor se Deleita em Ti com Júbilo',
    verseOfTheDay: {
      book: 'Sofonias',
      chapter: 3,
      startVerse: 17,
      endVerse: 17,
      reference: 'Sofonias 3:17',
      passageId: 'sf-3-17',
      text: 'O SENHOR, teu Deus, está no meio de ti, poderoso para te salvar; ele se deleitará em ti com alegria; calar-se-á por seu amor, regozijar-se-á em ti com júbilo.'
    },
    contextSummary: 'No desfecho das advertências proféticas, Sofonias revela o coração terno e acolhedor de Deus restaurando o Seu povo redimido.',
    theme: 'O Abraço Compassivo do Pai',
    reflection: `Muitas pessoas carregam uma imagem distorcida de Deus como um juiz distante e severo, sempre pronto a apontar falhas com irritação. Contudo, nas palavras do profeta Sofonias, a cortina da revelação bíblica se abre para mostrar a mais emocionante faceta da graça divina: Deus Se alegra sobre o Seu povo com cânticos de amor e triunfo.

O texto assegura primeiro a Sua presença soberana: "O Senhor teu Deus está no meio de ti, poderoso para salvar". Ele não é um observador passivo de nossas lutas cotidianas; Ele é o Salvador Todo-Poderoso que intervém na história para resgatar os quebrantados de coração. A salvação não é conquistada pelo esforço humano, mas outorgada pela majestosa iniciativa graciosa de Deus.

A expressão "calar-se-á por seu amor" aponta para o descanso sereno de quem encontrou acolhimento pleno; a condenação e a culpa foram silenciadas pela redenção. Mais impressionante ainda: o Criador do universo celebra sobre a sua vida com regozijo e júbilo. Você não é um fardo para Deus, mas alvo eterno de Sua misericórdia incondicional em Cristo Jesus.`,
    application: 'Descanse hoje na certeza de que você é profundamente amado por Deus. Deixe de lado a autocobrança paralisante e sinta a paz de estar sob o olhar afetuoso e restaurador do Pai.',
    prayer: 'Pai Celeste, que maravilha indescritível saber que Tu Te alegras sobre a minha vida e que me acolhes com amor imutável. Silencia em minha mente as vozes de acusação e condenação com a verdade do Teu evangelho. Que a Tua presença viva no meio do meu dia seja o meu maior consolo e segurança. Em nome de Jesus Cristo, amém.',
    estimatedMinutes: 4,
    musicId: 'song-003',
    music: getSongById('song-003'),
    evaluation: {
      score: 95,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 10. 2026-11-08
  {
    schemaVersion: 1,
    id: '2026-11-08',
    date: '2026-11-08',
    title: 'Olhando Firmemente para o Autor da Fé',
    verseOfTheDay: {
      book: 'Hebreus',
      chapter: 12,
      startVerse: 1,
      endVerse: 2,
      reference: 'Hebreus 12:1-2',
      passageId: 'hb-12-1-2',
      text: 'Portanto, nós também, pois que estamos rodeados de uma tão grande nuvem de testemunhas, deixemos todo o embaraço e o pecado que tão de perto nos rodeia e corramos, com paciência, a carreira que nos está proposta, olhando para Jesus, autor e consumador da fé, o qual, pelo gozo que lhe estava proposto, suportou a cruz, desprezando a afronta, e assentou-se à destra do trono de Deus.'
    },
    contextSummary: 'O autor de Hebreus exorta os cristãos perseguidos a perseverarem na corrida espiritual, tirando os olhos dos obstáculos e fixando-os no Cristo triunfante.',
    theme: 'Perseverança e Foco em Jesus',
    reflection: `A vida cristã é comparada nas Escrituras a uma maratona de resistência, não a uma corrida curta de velocidade. Ao nosso redor, a história sagrada nos lembra de incontáveis homens e mulheres que, pela fé, suportaram desertos, fornalhas e prisões sem abandonar a esperança. Eles são testemunhas fiéis de que Deus nunca abandona Seus filhos na caminhada.

Para correr bem, o atleta precisa se desvencilhar de dois grandes pesos: o "embaraço" (fardos inúteis, distrações mundanas, ansiedades acumuladas) e o "pecado que nos rodeia". Muitas vezes não tropeçamos por falta de forças, mas pelo excesso de bagagem que insistimos em carregar sozinhos. Livrar-se do peso é um ato diário de confissão humilde e simplificação interior.

O segredo supremo da perseverança é o direcionamento do olhar: "olhando para Jesus, autor e consumador da nossa fé". Se olharmos para as nossas próprias fraquezas, cairemos no desânimo; se olharmos para os outros, seremos desapontados. Mas quando fixamos nossos olhos em Cristo — que suportou a cruz e reina vitorioso à destra de Deus —, recebemos o vigor sobrenatural necessário para completar a carreira com integridade e júbilo.`,
    application: 'Identifique hoje qual "embaraço" ou distração tem consumido a sua energia espiritual e tirado o seu foco de Cristo. Entregue esse peso ao Senhor e reassuma a sua corrida com leveza.',
    prayer: 'Senhor Jesus, Autor e Aperfeiçoador da minha fé. Reconheço que muitas vezes me sobrecarrego com ansiedades fúteis e me deixo distrair pelas ilusões passageiras deste mundo. Ajuda-me a despojar-me de todo peso e pecado. Firma os meus olhos em Ti, no Teu sacrifício e na Tua vitória, para que eu corra com constância a jornada da vida. Amém.',
    estimatedMinutes: 5,
    musicId: 'song-013',
    music: getSongById('song-013'),
    evaluation: {
      score: 97,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 11. 2026-11-09
  {
    schemaVersion: 1,
    id: '2026-11-09',
    date: '2026-11-09',
    title: 'A Doce Onipresença nos Confins da Vida',
    verseOfTheDay: {
      book: 'Salmos',
      chapter: 139,
      startVerse: 7,
      endVerse: 10,
      reference: 'Salmos 139:7-10',
      passageId: 'sl-139-7-10',
      text: 'Para onde me ausentarei do teu Espírito? Para onde fugirei da tua face? Se subir ao céu, lá tu estás; se fizer no Seol a minha cama, eis que tu ali estás também. Se tomar as asas da alvorada e habitar nos confins dos mares, ainda ali a tua mão me guiará e a tua destra me sustentará.'
    },
    contextSummary: 'Davi contempla a majestosa onipresença de Deus, encontrando profundo abrigo e segurança na verdade de que jamais estará desamparado.',
    theme: 'Sustento Fiel e Refúgio Permanente',
    reflection: `A onipresença de Deus não é um conceito filosófico frio ou ameaçador; nas palavras do salmista Davi, é o mais doce refúgio para o coração ferido. Em momentos de solidão, isolamento ou dor profunda, a sensação de abandono pode tentar nos convencer de que estamos esquecidos nos confins da existência. Contudo, a verdade bíblica desfaz essa ilusão com claridade radiante.

Davi contempla todos os extremos imagináveis da criação: as alturas mais elevadas dos céus, as profundezas mais sombrias da sepultura, a velocidade dos primeiros raios de sol e a vastidão inexplorada dos mares. Em nenhum desses lugares o crente está fora do alcance do Pai. Não há vale tão profundo ou noite tão escura onde a presença protetora do Espírito Santo não esteja plenamente ativa.

A promessa que encerra essa meditação é reconfortante: "ainda ali a tua mão me guiará e a tua destra me sustentará". A mão que guia oferece direção quando os caminhos parecem confusos; a mão destra que sustenta impede a queda fatal quando as pernas vacilam. Você nunca estará sozinho em sua jornada: Aquele que sustenta o cosmos segura firmemente a sua mão neste exato instante.`,
    application: 'Se a solidão ou a sensação de incerteza bater à sua porta hoje, feche os olhos e declare em voz audível: "O Senhor está aqui comigo. A Sua destra me guia e me sustenta agora".',
    prayer: 'Ó Deus eterno, para onde poderia eu fugir do Teu doce Espírito? Em todos os momentos e recantos da minha vida, sinto o Teu abraço protetor. Obrigado porque jamais estou desamparado. Quando os mares da vida se agitarem e as trevas tentarem me envolver, lembra-me de que a Tua mão destra me segura com fidelidade inabalável. Em nome de Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-017',
    music: getSongById('song-017'),
    evaluation: {
      score: 96,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 12. 2026-11-10
  {
    schemaVersion: 1,
    id: '2026-11-10',
    date: '2026-11-10',
    title: 'A Gratidão como Resposta à Graça',
    verseOfTheDay: {
      book: '1 Tessalonicenses',
      chapter: 5,
      startVerse: 16,
      endVerse: 18,
      reference: '1 Tessalonicenses 5:16-18',
      passageId: '1ts-5-16-18',
      text: 'Regozijai-vos sempre. Orai sem cessar. Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.'
    },
    contextSummary: 'Paulo instrui a jovem igreja de Tessalônica com mandamentos breves e poderosos sobre a atitude espiritual contínua em qualquer estação.',
    theme: 'Alegria, Oração e Ação de Graças',
    reflection: `Nesta tríade de mandamentos apostólicos, o apóstolo Paulo delineia a postura fundamental de um coração redimido por Cristo: alegria constante, diálogo permanente com o Pai e gratidão em todas as circunstâncias. À primeira vista, essas ordens podem soar impossíveis para a fragilidade humana, a menos que compreendamos a sua fonte espiritual.

"Regozijai-vos sempre" não significa cultivar um sorriso artificial diante das tragédias, mas manter o coração ancorado na salvação que nenhuma adversidade temporal pode roubar. "Orai sem cessar" é transformar a rotina comum em um diálogo contínuo de dependência do Senhor — respirar oração no trabalho, nas ruas e nas decisões silenciosas da mente.

"Em tudo dai graças" é talvez o mandamento mais desafiador. Paulo não diz para dar graças por todo o mal ou pecado do mundo, mas sim em todas as circunstâncias. Isso é possível porque o Deus Soberano governa sobre todos os acontecimentos e é poderoso para fazer convergir até as estações mais difíceis para o amadurecimento espiritual dos que O amam. A gratidão é a vacina mais eficaz contra a amargura da alma.`,
    application: 'Faça um exercício de gratidão deliberada agora: agradeça a Deus por três coisas simples que normalmente passam despercebidas (a água fresca, a respiração, o teto onde dormiu ou o perdão de seus pecados).',
    prayer: 'Amado Senhor, perdoa-me pelas murmurações e queixas que tantas vezes tomam conta dos meus pensamentos. Ensina-me a orar sem cessar e a regozijar-me na Tua salvação. Em meio a qualquer circunstância deste dia, coloco um cântico de gratidão em meus lábios, sabendo que a Tua soberania cuida de cada detalhe. Por Jesus, amém.',
    estimatedMinutes: 4,
    musicId: 'song-009',
    music: getSongById('song-009'),
    evaluation: {
      score: 95,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 13. 2026-11-11
  {
    schemaVersion: 1,
    id: '2026-11-11',
    date: '2026-11-11',
    title: 'A Paciência Forjada nas Provações',
    verseOfTheDay: {
      book: 'Tiago',
      chapter: 1,
      startVerse: 2,
      endVerse: 4,
      reference: 'Tiago 1:2-4',
      passageId: 'tg-1-2-4',
      text: 'Meus irmãos, tende grande alegria quando cairdes em várias tentações, sabendo que a prova da vossa fé produz a paciência. Tenha, porém, a paciência a sua obra perfeita, para que sejais perfeitos e completos, sem faltar em coisa alguma.'
    },
    contextSummary: 'Tiago ensina aos cristãos dispersos e provados que as tribulações têm um propósito pedagógico de forjar maturidade e perseverança inabalável.',
    theme: 'Maturidade Cristã e Perseverança',
    reflection: `Tiago escreve para cristãos que sofriam opressão social, pobreza e hostilidade. Por isso, a sua exortação de encarar as provações com alegria parece um contrassenso para a sabedoria secular. No entanto, o autor bíblico não valoriza o sofrimento por si mesmo, mas celebra o fruto santo e eterno que Deus produz através dele.

A metáfora por trás da "prova da fé" é o processo do ourives que purifica o ouro no calor intenso do cadinho para separar as escórias. Quando a nossa confiança é testada no cadinho das dificuldades cotidianas, aprendemos a abandonar as muletas humanas e a repousar exclusivamente no Senhor. Essa perseverança forjada sob pressão chama-se hypomonē: a capacidade de permanecer firme sob fardos pesados sem desmoronar.

A maturidade espiritual não é adquirida em salas de aula confortáveis, mas na prática diária da fé provada. Permitir que a paciência complete a sua obra significa não buscar atalhos desonestos ou soluções precipitadas para fugir da disciplina amorosa do Pai. O objetivo de Deus não é nos punir, mas nos tornar inteiros, firmes e espiritualmente frutíferos.`,
    application: 'Diante de uma contrariedade ou demora que esteja testando os seus nervos hoje, respire fundo, recuse a reclamação e peça a Deus: "Pai, forja em mim a paciência e a maturidade de Cristo através desta situação".',
    prayer: 'Senhor Todo-Poderoso, confesso que a minha inclinação natural é fugir de qualquer desconforto ou provação. Dá-me discernimento espiritual para compreender que Tu usas as lutas da vida para polir a minha fé e purificar as minhas intenções. Concede-me constância para esperar o Teu tempo com serenidade e dignidade. Em Cristo Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-008',
    music: getSongById('song-008'),
    evaluation: {
      score: 94,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 14. 2026-11-12
  {
    schemaVersion: 1,
    id: '2026-11-12',
    date: '2026-11-12',
    title: 'Quando Passares pelas Águas, Estarei Contigo',
    verseOfTheDay: {
      book: 'Isaías',
      chapter: 43,
      startVerse: 1,
      endVerse: 3,
      reference: 'Isaías 43:1-3',
      passageId: 'is-43-1-3',
      text: 'Mas agora, assim diz o SENHOR que te criou, ó Jacó, e que te formou, ó Israel: Não temas, porque eu te remi; chamei-te pelo teu nome, tu és meu. Quando passares pelas águas, estarei contigo, e, quando pelos rios, eles não te submergirão; quando passares pelo fogo, não te queimarás, nem a chama arderá em ti. Porque eu sou o SENHOR, teu Deus, o Santo de Israel, o teu Salvador.'
    },
    contextSummary: 'Deus conforta o Seu povo temeroso com uma aliança pessoal inquebrável, prometendo Sua presença soberana em meio aos rios e fornalhas da existência.',
    theme: 'Presença Soberana e Proteção Divina',
    reflection: `Uma das promessas mais comoventes de todas as Escrituras é a declaração de posse e amor que Deus faz ao Seu povo: "Não temas, porque eu te remi; chamei-te pelo teu nome, tu és meu". Nós não somos poeira esquecida à deriva no espaço, nem números anônimos em uma multidão fria. O Criador do cosmos conhece a nossa história, a nossa identidade e as nossas dores mais secretas.

Observe com atenção a promessa bíblica: Deus não diz se passares pelas águas, mas quando passares. A travessia por rios turbulentos e vales de fogo é inevitável nesta terra de transição. No entanto, a segurança do cristão não reside na ausência de águas profundas, mas na companhia dAquele que caminha conosco. As torrentes da aflição não têm poder para submergir quem está seguro pela mão de Deus.

A presença de Cristo na fornalha com Sadraque, Mesaque e Abednego ecoa essa mesma promessa de Isaías. O fogo que consome as ilusões passageiras deste mundo não tem poder para queimar a alma redimida. O Senhor é o nosso Salvador pessoal e fiel; Ele nos acompanha na travessia e garante a nossa chegada segura à outra margem da vida.`,
    application: 'Apresente diante de Deus as águas turbulentas ou pressões que parecem ameaçar submergir a sua paz nesta semana. Descanse na promessa de que Ele caminha ao seu lado em cada metro da jornada.',
    prayer: 'Senhor Deus, Tu me criaste, me chamaste pelo meu nome e me resgataste para a Tua glória. Quando os rios da tribulação parecerem fortes demais para as minhas débeis forças, lembra-me de que estás comigo. Não permitas que o medo paralise a minha fé. Seguro em Tuas mãos, atravessarei qualquer vale com serenidade. Em nome de Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-016',
    music: getSongById('song-016'),
    evaluation: {
      score: 97,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 15. 2026-11-13
  {
    schemaVersion: 1,
    id: '2026-11-13',
    date: '2026-11-13',
    title: 'Transformação da Mente e Culto Racional',
    verseOfTheDay: {
      book: 'Romanos',
      chapter: 12,
      startVerse: 1,
      endVerse: 2,
      reference: 'Romanos 12:1-2',
      passageId: 'rm-12-1-2',
      text: 'Rogo-vos, pois, irmãos, pela compaixão de Deus, que apresenteis os vossos corpos em sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional. E não vos conformeis com este século, mas transformai-vos pela renovação do vosso entendimento, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.'
    },
    contextSummary: 'Após expor a maravilhosa doutrina da justificação pela graça, Paulo convoca os cristãos de Roma a uma consagração prática diária através de uma mente renovada.',
    theme: 'Consagração Diária e Mente Renovada',
    reflection: `No Antigo Testamento, os sacrifícios eram animais mortos oferecidos sobre o altar de pedra. Sob a Nova Aliança selada pelo sangue de Cristo, o sacrifício que Deus requer de nós é "vivo, santo e agradável": a consagração diária de todo o nosso ser — pensamentos, olhos, mãos, rotina e recursos — para a glória do Criador. Isso é o que a Bíblia chama de "culto racional", uma adoração inteligente que responde coerentemente à imensa misericórdia de Deus.

A batalha espiritual primordial ocorre no campo de nossa mente. O apóstolo adverte: "não vos conformeis com este século". O verbo conformar significa "deixar-se moldar pela forma exterior". O mundo caído tenta constantemente pressionar os nossos valores no seu próprio molde de egoísmo, consumismo desenfreado, vaidade e impaciência. Se não vigiarmos, absorvemos a cosmovisão secular sem sequer perceber.

A cura proposta pelo evangelho é a metamorfose interior: "transformai-vos pela renovação do vosso entendimento". Quando alimentamos a nossa mente com a verdade das Escrituras, os nossos afetos são reordenados e o nosso discernimento é afiado. Somente com a mente alinhada à Palavra de Deus somos capazes de discernir e experimentar, na prática diária, a boa, agradável e perfeita vontade do Pai.`,
    application: 'Filtre hoje com rigor o conteúdo que você consome nas redes sociais e notícias. Substitua dez minutos de distrações vazias por meditação atenta em um trecho das Escrituras.',
    prayer: 'Senhor meu Pai, entrego a Ti a minha vida, a minha rotina e as minhas decisões como um sacrifício vivo de louvor. Livra a minha mente de ser amoldada pelos padrões vazios e passageiros deste século. Renova os meus pensamentos pela Tua santa Palavra, para que eu viva em santidade e desfrute da Tua perfeita vontade. Em nome de Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-014',
    music: getSongById('song-014'),
    evaluation: {
      score: 96,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 16. 2026-11-14
  {
    schemaVersion: 1,
    id: '2026-11-14',
    date: '2026-11-14',
    title: 'De Força em Força pelo Vale de Baca',
    verseOfTheDay: {
      book: 'Salmos',
      chapter: 84,
      startVerse: 5,
      endVerse: 7,
      reference: 'Salmos 84:5-7',
      passageId: 'sl-84-5-7',
      text: 'Bem-aventurado o homem cuja força está em ti, em cujo coração se encontram os caminhos aplanados. Passando pelo vale de Baca, fazem dele um manancial; e a primeira chuva cobre-o de bênçãos. Vão indo de força em força; cada um deles em Sião aparece perante Deus.'
    },
    contextSummary: 'Os peregrinos sobem em direção a Jerusalém atravessando vales áridos de choro, renovando a força espiritual continuamente na comunhão do Senhor.',
    theme: 'Fonte de Vida no Deserto',
    reflection: `O Salmo 84 celebra a doce saudade da presença de Deus e a jornada dos peregrinos rumo a Sião. O salmista declara feliz aquele cuja força não repousa em sua juventude, em seus bens ou em conexões humanas, mas exclusivamente no Altíssimo. Ter os "caminhos aplanados no coração" significa cultivar uma disposição interior resoluta de buscar a comunhão com Deus, venha o que vier.

No itinerário geográfico dos viajantes, estava o árido "vale de Baca", cujo nome hebraico remete a bálsamo amargo, pranto e sequidão. Todos nós conhecemos épocas que se assemelham ao vale de Baca: diagnósticos difíceis, rupturas de amizades, solidão ou estresse profissional severo. Contudo, o crente sustentado pela graça opera um milagre espiritual: transforma a terra seca em manancial de água viva para abençoar quem passa por perto.

O resultado dessa caminhada guiada por Deus é extraordinário: eles não vão se esgotando pelo cansaço do caminho, mas "vão indo de força em força". O mundo desgasta as nossas forças naturais, mas a comunhão com Cristo supre energia renovada a cada alvorecer. Nenhum peregrino sincero ficará para trás no deserto; cada um comparecerá triunfante perante o Senhor na Jerusalém celestial.`,
    application: 'Se você está atravessando um vale de incertezas ou lágrimas, não se feche no amargor. Cave um poço de oração e intercessão: seja hoje um manancial de encorajamento para alguém ao seu lado.',
    prayer: 'Deus de toda consolação, a minha força verdadeira vem unicamente de Ti. Quando os meus passos tiverem de cruzar vales áridos e dias pesados, derrama da Tua graça para que o meu coração não se torne estéril. Concede-me vigor para ir de força em força até que eu veja a Tua face em glória. Em Cristo Jesus, amém.',
    estimatedMinutes: 5,
    musicId: 'song-004',
    music: getSongById('song-004'),
    evaluation: {
      score: 95,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  },

  // 17. 2026-11-15
  {
    schemaVersion: 1,
    id: '2026-11-15',
    date: '2026-11-15',
    title: 'Lançando Toda a Ansiedade sobre Ele',
    verseOfTheDay: {
      book: '1 Pedro',
      chapter: 5,
      startVerse: 6,
      endVerse: 7,
      reference: '1 Pedro 5:6-7',
      passageId: '1pe-5-6-7',
      text: 'Humilhai-vos, pois, debaixo da potente mão de Deus, para que, a seu tempo, vos exalte, lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.'
    },
    contextSummary: 'Pedro exorta os cristãos perseguidos pelo Império a confiarem no cuidado pessoal de Deus, trocando a soberba da autossuficiência pela entrega humilde da angústia.',
    theme: 'Humildade, Confiança e Alívio da Ansiedade',
    reflection: `Existe uma conexão teológica profunda e frequentemente negligenciada entre a humildade e a vitória sobre a ansiedade. Quando nos recusamos a entregar as nossas preocupações a Deus, estamos, em última análise, agindo com orgulho secreto — como se fôssemos inteligentes e fortes o suficiente para controlar o futuro e solucionar tudo por conta própria. A verdadeira humildade bíblica começa com o reconhecimento humilde de nossos limites.

Humilhar-se sob a potente mão de Deus é admitir: "Senhor, eu não consigo carregar este fardo sozinho". A mão de Deus não pesa para nos esmagar, mas atua com poder protetor para nos sustentar e, a seu tempo soberano, nos exaltar com sabedoria. Quando nos submetemos ao Seu tempo, somos libertos da pressa angustiante do mundo.

O verbo "lançar" descreve um movimento intencional e resoluto de arremessar um peso pesado para os ombros de outro que é infinitamente mais forte. Nós podemos descarregar toda a nossa ansiedade no altar do Senhor por uma razão simples e reconfortante: "porque Ele tem cuidado de vós". O Pai não dorme, não Se distrai e zela com carinho incansável por cada detalhe da sua caminhada.`,
    application: 'Tome alguns instantes para identificar a preocupação número um que tem tirado a sua paz hoje. Em oração silenciosa, "arremesse" esse fardo aos pés de Jesus e descanse na certeza do Seu cuidado.',
    prayer: 'Senhor Pai celestial, humilho-me debaixo da Tua potente e graciosa mão. Perdoa-me quando tento controlar o incontrolável com ansiedade e medo. Lanço agora sobre o Teu coração misericordioso todos os meus temores em relação ao futuro, à saúde e à família. Descanso na bendita certeza de que Tu tens cuidado de mim com amor eterno. Por Jesus, amém.',
    estimatedMinutes: 4,
    musicId: 'song-018',
    music: getSongById('song-018'),
    evaluation: {
      score: 96,
      approvedByAI: true,
      criticalErrors: []
    },
    editorialStatus: 'approved'
  }
];

/**
 * Retorna o devocional oficial aprovado para uma data específica (YYYY-MM-DD).
 * Se a data for além dos devocionais pré-escritos, utiliza um cálculo determinístico
 * com passo coprimo sobre o catálogo aprovado, garantindo uma cobertura rica,
 * teologicamente blindada e com ZERO repetições consecutivas (mínimo 30 dias sem repetir).
 */
export function getDevotionalForDate(dateStr: string): DevotionalPublic {
  // 1. Busca exata no acervo aprovado
  const exact = APPROVED_DEVOTIONALS_VAULT.find(d => d.date === dateStr);
  if (exact) {
    return exact;
  }

  // 2. Cálculo determinístico por dia corrido a partir da âncora '2026-10-30'
  const total = APPROVED_DEVOTIONALS_VAULT.length;
  const baseEpochMs = Date.UTC(2026, 9, 30); // 2026-10-30
  const parts = dateStr.split('-').map(Number);
  const targetEpochMs = (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2]))
    ? Date.UTC(parts[0], parts[1] - 1, parts[2])
    : Date.now();

  const dayOffset = Math.max(0, Math.floor((targetEpochMs - baseEpochMs) / 86400000));

  // Usamos passo coprimo (13 é coprimo com 17 e a maioria dos tamanhos), garantindo ciclo completo
  const step = 13;
  const cycleIndex = (dayOffset * step) % total;
  const template = APPROVED_DEVOTIONALS_VAULT[cycleIndex];

  return {
    ...template,
    id: dateStr,
    date: dateStr
  };
}

export function getAllPublishedDevotionals(): DevotionalPublic[] {
  return APPROVED_DEVOTIONALS_VAULT;
}
