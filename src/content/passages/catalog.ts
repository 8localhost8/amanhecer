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
    id: 'ec-3-1-4',
    book: 'Eclesiastes',
    chapter: 3,
    startVerse: 1,
    endVerse: 4,
    reference: 'Eclesiastes 3:1-4',
    text: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu: há tempo de nascer e tempo de morrer; tempo de plantar e tempo de arrancar o que se plantou; tempo de matar e tempo de curar; tempo de chorar e tempo de rir.',
    contextSummary: 'Reflexão sobre a soberania divina em administrar as diferentes estações e fases da existência humana.',
    theme: 'O Tempo Determinado por Deus',
    testament: 'AT',
    category: 'Poéticos e Sabedoria'
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
    text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas. Porque o meu jugo é suave, e o meu fardo é leve.',
    contextSummary: 'Convite gracioso de Cristo aos sobrecarregados pelo legalismo religioso e pelas lutas da vida.',
    theme: 'Descanso e Mansidão em Cristo',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'jo-14-1-3',
    book: 'João',
    chapter: 14,
    startVerse: 1,
    endVerse: 3,
    reference: 'João 14:1-3',
    text: 'Não se turbe o vosso coração; credes em Deus, crede também em mim. Na casa de meu Pai há muitas moradas; se não fosse assim, eu vo-lo teria dito. Vou preparar-vos lugar. E, quando eu for e vos preparar lugar, virei outra vez e vos levarei para mim mesmo, para que onde eu estiver estejais vós também.',
    contextSummary: 'Discurso de despedida de Jesus no Cenáculo, consolando os discípulos com a esperança eterna.',
    theme: 'Consolo e Esperança Eterna',
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
    text: 'Permanecei em mim, e eu permanecerei em vós; como a vara de si mesma não pode dar fruto, se não estiver na videira, assim também vós, se não permanecerdes em mim. Eu sou a videira, vós sois as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer.',
    contextSummary: 'A metáfora da videira verdadeira ensinando sobre a comunhão vital e dependência diária de Jesus para frutificação espiritual.',
    theme: 'Permanecer na Videira Verdadeira',
    testament: 'NT',
    category: 'Evangelhos'
  },
  {
    id: 'mc-10-43-45',
    book: 'Marcos',
    chapter: 10,
    startVerse: 43,
    endVerse: 45,
    reference: 'Marcos 10:43-45',
    text: 'Mas entre vós não será assim; antes, qualquer que entre vós quiser ser grande será vosso serviçal; e qualquer que dentre vós quiser ser o primeiro será servo de todos. Porque o Filho do Homem também não veio para ser servido, mas para servir e dar a sua vida em resgate de muitos.',
    contextSummary: 'Jesus repreende a disputa de poder entre os discípulos e estabelece o serviço humilde como marca da verdadeira grandeza no Reino.',
    theme: 'A Humildade do Serviço',
    testament: 'NT',
    category: 'Evangelhos'
  },

  // EPÍSTOLAS PAULINAS
  {
    id: 'rm-8-28-29',
    book: 'Romanos',
    chapter: 8,
    startVerse: 28,
    endVerse: 29,
    reference: 'Romanos 8:28-29',
    text: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito. Porque os que dantes conheceu, também os predestinou para serem conformes à imagem de seu Filho, a fim de que ele seja o primogênito entre muitos irmãos.',
    contextSummary: 'Paulo assegura aos crentes romanos a providência soberana de Deus, cujo propósito supremo é moldar-nos à semelhança de Cristo.',
    theme: 'A Providência Soberana de Deus',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'rm-8-38-39',
    book: 'Romanos',
    chapter: 8,
    startVerse: 38,
    endVerse: 39,
    reference: 'Romanos 8:38-39',
    text: 'Porque estou certo de que, nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir, nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus, nosso Senhor.',
    contextSummary: 'O clímax da certeza da salvação: nenhuma força no universo pode romper o pacto de amor incondicional em Cristo.',
    theme: 'O Amor Inseparável de Deus',
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
    contextSummary: 'Paulo, escrevendo da prisão, ensina como a gratidão e a oração contínua substituem a ansiedade pela paz guardiã de Deus.',
    theme: 'A Paz que Guarda o Coração',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'fp-4-12-13',
    book: 'Filipenses',
    chapter: 4,
    startVerse: 12,
    endVerse: 13,
    reference: 'Filipenses 4:12-13',
    text: 'Sei estar abatido e sei também ter abundância; em toda a maneira e em todas as coisas, estou instruído, tanto a ter fartura como a ter fome, tanto a ter abundância como a padecer necessidade. Posso todas as coisas naquele que me fortalece.',
    contextSummary: 'O segredo bíblico do contentamento: não se trata de triunfo material arbitrário, mas da força espiritual para ser fiel em qualquer circunstância.',
    theme: 'Contentamento e Força em Cristo',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'ef-2-8-10',
    book: 'Efésios',
    chapter: 2,
    startVerse: 8,
    endVerse: 10,
    reference: 'Efésios 2:8-10',
    text: 'Porque pela graça sois salvos, por meio da fé; e isso não vem de vós; é dom de Deus. Não vem das obras, para que ninguém se glorie. Porque somos feitura sua, criados em Cristo Jesus para as boas obras, as quais Deus preparou para que andássemos nelas.',
    contextSummary: 'A centralidade da salvação puramente pela graça mediante a fé, resultando em uma vida frutífera em boas obras preparadas por Deus.',
    theme: 'Salvação pela Graça para Boas Obras',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'gl-5-22-23',
    book: 'Gálatas',
    chapter: 5,
    startVerse: 22,
    endVerse: 23,
    reference: 'Gálatas 5:22-23',
    text: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fidelidade, mansidão, domínio próprio. Contra estas coisas não há lei.',
    contextSummary: 'Paulo contrasta as obras egocêntricas da carne com o caráter gracioso gerado pelo Espírito Santo na vida do cristão.',
    theme: 'O Fruto do Espírito Santo',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },
  {
    id: 'cl-3-12-14',
    book: 'Colossenses',
    chapter: 3,
    startVerse: 12,
    endVerse: 14,
    reference: 'Colossenses 3:12-14',
    text: 'Revesti-vos, pois, como eleitos de Deus, santos e amados, de entranhas de misericórdia, de benignidade, humildade, mansidão, longanimidade, suportando-vos uns aos outros e perdoando-vos uns aos outros, se algum tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também. E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição.',
    contextSummary: 'Instruções práticas para a comunidade da fé sobre a vivência do perdão mútuo fundamentado no perdão recebido de Cristo.',
    theme: 'Perdão Mútuo e Amor Fraternal',
    testament: 'NT',
    category: 'Epístolas Paulinas'
  },

  // PENTATEUCO E HISTÓRICOS
  {
    id: 'dt-6-5-7',
    book: 'Deuteronômio',
    chapter: 6,
    startVerse: 5,
    endVerse: 7,
    reference: 'Deuteronômio 6:5-7',
    text: 'Amarás, pois, o SENHOR, teu Deus, de todo o teu coração, e de toda a tua alma, e de todo o teu poder. E estas palavras que hoje te ordeno estarão no teu coração; e as intimarás a teus filhos e delas falarás assentado em tua casa, e andando pelo caminho, e deitando-te, e levantando-te.',
    contextSummary: 'O mandamento central da Shemá, enfatizando o amor integral a Deus e o compromisso diário com o discipulado.',
    theme: 'Amor Integral a Deus e Legado',
    testament: 'AT',
    category: 'Pentateuco'
  },
  {
    id: 'js-1-8-9',
    book: 'Josué',
    chapter: 1,
    startVerse: 8,
    endVerse: 9,
    reference: 'Josué 1:8-9',
    text: 'Não se aparte da tua boca o livro desta Lei; antes, medita nele dia e noite, para que tenhas cuidado de fazer conforme tudo quanto nele está escrito; porque, então, farás prosperar o teu caminho e, então, prudentemente te conduzirás. Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o SENHOR, teu Deus, é contigo, por onde quer que andares.',
    contextSummary: 'Comissão de Josué na transição da liderança de Israel, destacando a meditação fiel na Palavra como raiz da coragem.',
    theme: 'Coragem Fundamentada na Palavra',
    testament: 'AT',
    category: 'Históricos'
  },
  {
    id: 'ne-8-10',
    book: 'Neemias',
    chapter: 8,
    startVerse: 10,
    endVerse: 10,
    reference: 'Neemias 8:10',
    text: 'Disse-lhes mais: Ide, e comei as gorduras, e bebei as doçuras, e enviai porções aos que não têm nada preparado para si; porque este dia é consagrado ao nosso Senhor; portanto, não vos entristeçais, porque a alegria do SENHOR é a vossa força.',
    contextSummary: 'Esdras e Neemias instruem o povo recém-retornado do exílio a celebrar a misericórdia de Deus compartilhando com os necessitados.',
    theme: 'A Alegria do Senhor como Força',
    testament: 'AT',
    category: 'Históricos'
  },

  // PROFETAS MAIORES E MENORES
  {
    id: 'is-40-29-31',
    book: 'Isaías',
    chapter: 40,
    startVerse: 29,
    endVerse: 31,
    reference: 'Isaías 40:29-31',
    text: 'Dá força ao cansado e multiplica as forças ao que não tem nenhum vigor. Os jovens se cansarão e se fatigarão, e os jovens certamente cairão. Mas os que esperam no SENHOR renovarão as suas forças e subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    contextSummary: 'Profecia de consolo ao povo aflito, proclamando a grandeza incomparável de Deus em restaurar os exaustos.',
    theme: 'Esperar no Senhor para Renovar as Forças',
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
    contextSummary: 'No centro de uma profunda lamentação sobre a destruição de Jerusalém, o autor encontra esperança inabalável na fidelidade divina que se renova a cada alvorecer.',
    theme: 'Misericórdias Novas a Cada Manhã',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'jr-29-11-13',
    book: 'Jeremias',
    chapter: 29,
    startVerse: 11,
    endVerse: 13,
    reference: 'Jeremias 29:11-13',
    text: 'Porque eu bem sei os pensamentos que penso de vós, diz o SENHOR; pensamentos de paz e não de mal, para vos dar o fim que esperais. Então, me invocareis, e ireis, e orareis a mim, e eu vos ouvirei. E buscar-me-eis e me achareis quando me buscardes de todo o vosso coração.',
    contextSummary: 'Carta pastoral de Jeremias aos cativos na Babilônia, encorajando-os a manterem a fé e buscarem a Deus durante os 70 anos de provação.',
    theme: 'Buscando a Deus de Todo o Coração',
    testament: 'AT',
    category: 'Profetas Maiores'
  },
  {
    id: 'mq-6-8',
    book: 'Miquéias',
    chapter: 6,
    startVerse: 8,
    endVerse: 8,
    reference: 'Miquéias 6:8',
    text: 'Ele te declarou, ó homem, o que é bom; e que é o que o SENHOR pede de ti, senão que pratiques a justiça, e ames a beneficência, e andes humildemente com o teu Deus?',
    contextSummary: 'O profeta Miquéias sintetiza o verdadeiro culto bíblico contra a hipocrisia de sacrifícios externos sem coração sincero.',
    theme: 'Justiça, Misericórdia e Humildade',
    testament: 'AT',
    category: 'Profetas Menores'
  },
  {
    id: 'hc-3-17-19',
    book: 'Habacuque',
    chapter: 3,
    startVerse: 17,
    endVerse: 19,
    reference: 'Habacuque 3:17-19',
    text: 'Porquanto, ainda que a figueira não floresça, nem haja fruto na vide; o produto da oliveira minta, e os campos não produzam mantimento; as ovelhas da malhada sejam arrebatadas, e nos currais não haja vacas, todavia, eu me alegrarei no SENHOR, exultarei no Deus da minha salvação. O SENHOR Deus é a minha fortaleza, e fará os meus pés como os das corças, e me fará andar sobre as minhas alturas.',
    contextSummary: 'A oração vitoriosa da fé madura que escolhe exultar em Deus mesmo diante da escassez terrena.',
    theme: 'Fé Inabalável nas Adversidades',
    testament: 'AT',
    category: 'Profetas Menores'
  },

  // EPÍSTOLAS GERAIS E ATOS
  {
    id: 'at-2-42-44',
    book: 'Atos',
    chapter: 2,
    startVerse: 42,
    endVerse: 44,
    reference: 'Atos 2:42-44',
    text: 'E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações. Em cada alma havia temor, e muitas maravilhas e sinais se faziam pelos apóstolos. Todos os que criam estavam juntos e tinham tudo em comum.',
    contextSummary: 'O modelo da igreja primitiva em Jerusalém, centrada na Palavra, oração, comunhão sincera e generosidade prática.',
    theme: 'A Comunhão e a Oração na Igreja',
    testament: 'NT',
    category: 'História'
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
    id: '1jo-4-7-10',
    book: '1 João',
    chapter: 4,
    startVerse: 7,
    endVerse: 10,
    reference: '1 João 4:7-10',
    text: 'Amados, amemo-nos uns aos outros, porque o amor é de Deus; e qualquer que ama é nascido de Deus e conhece a Deus. Aquele que não ama não conhece a Deus, porque Deus é amor. Nisto se manifestou o amor de Deus para conosco: que Deus enviou seu Filho unigênito ao mundo, para que por ele vivamos.',
    contextSummary: 'João fundamenta todo amor cristão sacrificial na manifestação histórica do amor redentor de Deus em Cristo.',
    theme: 'Deus é Amor e o Amor Fraternal',
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
  }
];

export function getPassageById(id: string): BiblicalPassage | undefined {
  return VERIFIED_PASSAGES_CATALOG.find(p => p.id === id);
}
