import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Database,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import {
  getConsentRecord,
  grantAnalyticsConsent,
  refuseAnalyticsConsent,
  requestAnalyticsDataDeletion,
  CURRENT_POLICY_VERSION,
} from '../services/consent/consent-manager';

export type LegalRouteType =
  | '/termos-de-uso'
  | '/politica-de-privacidade'
  | '/politica-de-cookies';

interface LegalPageProps {
  route: LegalRouteType;
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ route, onNavigate }) => {
  const [consent, setConsent] = useState(() => getConsentRecord());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleConsent = (allow: boolean) => {
    const next = allow
      ? grantAnalyticsConsent('settings', true)
      : refuseAnalyticsConsent('settings', true);
    setConsent(next);
    setFeedbackMsg(
      allow
        ? 'Coleta opcional de estatísticas ativada com sucesso.'
        : 'Coleta opcional de estatísticas desativada e armazenamento analítico local limpo imediatamente.'
    );
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    const res = await requestAnalyticsDataDeletion();
    setConsent(getConsentRecord());
    setFeedbackMsg(res.message);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-graphite-950 text-graphite-700 dark:text-graphite-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sand-200 dark:border-graphite-800">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full surface-editorial text-xs font-semibold text-graphite-700 dark:text-cream-100 hover:text-sage-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Amanhecer</span>
          </button>

          <nav className="flex flex-wrap items-center gap-1.5" aria-label="Documentos legais">
            <button
              type="button"
              onClick={() => onNavigate('/termos-de-uso')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                route === '/termos-de-uso'
                  ? 'bg-sage-800 text-cream-50'
                  : 'surface-editorial text-graphite-600 dark:text-sand-300'
              }`}
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/politica-de-privacidade')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                route === '/politica-de-privacidade'
                  ? 'bg-sage-800 text-cream-50'
                  : 'surface-editorial text-graphite-600 dark:text-sand-300'
              }`}
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/politica-de-cookies')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                route === '/politica-de-cookies'
                  ? 'bg-sage-800 text-cream-50'
                  : 'surface-editorial text-graphite-600 dark:text-sand-300'
              }`}
            >
              Cookies e Armazenamento
            </button>
          </nav>
        </header>

        {/* Quick Consent & Rights Control Bar */}
        <section className="surface-editorial rounded-2xl p-4 sm:p-5 border border-sand-200 dark:border-graphite-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sage-700 dark:text-sand-300 shrink-0" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-graphite-800 dark:text-cream-50">
                  Sua Escolha Atual de Privacidade (Versão {CURRENT_POLICY_VERSION})
                </h2>
                <p className="text-xs text-graphite-500 dark:text-sand-300">
                  Status de Analytics Opcionais:{' '}
                  <strong className="text-graphite-800 dark:text-white">
                    {consent.analyticsAllowed ? 'Autorizado' : 'Desativado / Recusado'}
                  </strong>
                  {consent.decidedAt && (
                    <span>
                      {' '}
                      • Atualizado em {new Date(consent.decidedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {consent.analyticsAllowed ? (
                <button
                  type="button"
                  onClick={() => handleToggleConsent(false)}
                  className="py-1.5 px-3 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 text-xs font-semibold text-graphite-800 dark:text-cream-100"
                >
                  Revogar / Desativar Analytics
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleConsent(true)}
                  className="py-1.5 px-3 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 text-xs font-semibold text-graphite-800 dark:text-cream-100"
                >
                  Autorizar Analytics Opcionais
                </button>
              )}

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteData}
                className="py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-xs font-semibold text-rose-800 dark:text-rose-200 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Eliminar Dados Analíticos'}</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-sage-50 dark:bg-graphite-800 border border-sage-200 dark:border-graphite-700 text-xs text-sage-900 dark:text-sand-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-sage-700 dark:text-sand-300" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </section>

        {/* DOCUMENT 1: TERMOS DE USO (Seção 24) */}
        {route === '/termos-de-uso' && (
          <article className="surface-editorial rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
            <div className="border-b border-sand-200 dark:border-graphite-800 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-800 dark:text-sand-300">
                <FileText className="w-4 h-4" />
                <span>Documento Público Oficial</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50">
                Termos de Uso — Amanhecer
              </h1>
              <p className="text-xs text-graphite-500 dark:text-sand-300">
                Vigência: 10 de novembro de 2026 • Versão {CURRENT_POLICY_VERSION}
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                1. Identificação do Responsável e Canal de Contato
              </h2>
              <p>
                O aplicativo <strong>Amanhecer — Devocional Diário</strong> (acessível em{' '}
                <code>https://amanhecer-beta.vercel.app</code>) é uma iniciativa independente,
                gratuita e sem fins lucrativos mantida por <strong>Arthur Almeida</strong>{' '}
                (<em>[Nota de Revisão Jurídica: inserir qualificação civil completa, CPF/CNPJ ou endereço institucional antes da publicação definitiva]</em>).
              </p>
              <p>
                <strong>Canal oficial de atendimento e privacidade:</strong>{' '}
                <a href="mailto:contato@amanhecer.app" className="underline font-semibold">
                  contato@amanhecer.app
                </a>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                2. Descrição do Serviço e Gratuidade
              </h2>
              <p>
                O Amanhecer disponibiliza leituras devocionais cristãs diárias, versículos bíblicos
                selecionados do cânon protestante de 66 livros, sugestões de louvores, diário local
                de oração e geração de imagens de versículos para compartilhamento. O aplicativo é{' '}
                <strong>100% gratuito</strong>, livre de anúncios publicitários e funciona sem
                exigência de cadastro, conta ou senha.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                3. Natureza Informativa e Religiosa do Conteúdo
              </h2>
              <p>
                Os textos devocionais, reflexões, aplicações práticas e orações possuem finalidade
                exclusivamente espiritual, edificante e informativa.{' '}
                <strong>
                  O Amanhecer não substitui a leitura direta da Bíblia Sagrada, o estudo bíblico em
                  comunidade, a comunhão na igreja local, o acompanhamento pastoral ou o atendimento
                  médico e psicológico profissional.
                </strong>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                4. Funcionamento Online, Offline e Requisitos Técnicos
              </h2>
              <p>
                O Amanhecer utiliza tecnologia de <em>Progressive Web App (PWA)</em>. Após o
                primeiro acesso, os devocionais do cofre local permanecem disponíveis para leitura
                offline. Como não há criação de conta em nuvem, suas anotações no Diário de Oração e
                Favoritos são guardados unicamente na memória do seu dispositivo; recomendamos usar
                a função de exportar backup JSON disponível nos ajustes caso troque de aparelho.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                5. Direitos Autorais e Regras de Compartilhamento
              </h2>
              <p>
                Você pode compartilhar livremente os versículos, reflexões e imagens geradas pelo
                aplicativo em redes sociais, aplicativos de mensagem e comunidades cristãs, desde
                que sem finalidade comercial, sem adulterar o sentido bíblico do conteúdo e mantendo
                a integridade visual quando utilizar os cartões do aplicativo.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                6. Uso Permitido e Condutas Vedadas
              </h2>
              <p>
                É vedado utilizar mecanismos automatizados de ataque, engenharia reversa maliciosa,
                sobrecarga intencional das APIs do serviço (DDoS) ou tentativa de acesso não
                autorizado a rotas administrativas restritas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                7. Disponibilidade, Atualizações e Legislação Aplicável
              </h2>
              <p>
                Empregamos nossos melhores esforços técnicos para manter o serviço continuamente
                acessível e seguro, podendo realizar atualizações preventivas e evolutivas. Estes
                Termos são regidos pelas leis da República Federativa do Brasil, em especial pelo
                Marco Civil da Internet (Lei nº 12.965/2014) e pela Lei Geral de Proteção de Dados
                Pessoais (Lei nº 13.709/2018), assegurados todos os direitos legais dos usuários.
              </p>
            </section>
          </article>
        )}

        {/* DOCUMENT 2: POLÍTICA DE PRIVACIDADE (Seção 25) */}
        {route === '/politica-de-privacidade' && (
          <article className="surface-editorial rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
            <div className="border-b border-sand-200 dark:border-graphite-800 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-800 dark:text-sand-300">
                <Lock className="w-4 h-4" />
                <span>Conformidade LGPD (Lei nº 13.709/2018)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50">
                Política de Privacidade e Proteção de Dados
              </h1>
              <p className="text-xs text-graphite-500 dark:text-sand-300">
                Vigência: 10 de novembro de 2026 • Versão {CURRENT_POLICY_VERSION}
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                1. Controlador e Contato do Encarregado (DPO)
              </h2>
              <p>
                <strong>Controlador:</strong> Projeto Amanhecer — mantido por Arthur Almeida{' '}
                <em>[Revisão Jurídica: completar identificação formal do controlador antes da publicação]</em>.
              </p>
              <p>
                <strong>Contato para exercício de direitos (Art. 18 da LGPD):</strong>{' '}
                <a href="mailto:contato@amanhecer.app" className="underline font-semibold">
                  contato@amanhecer.app
                </a>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                2. Princípio de Privacidade por Padrão (Privacy by Default)
              </h2>
              <p>
                O Amanhecer foi arquitetado para funcionar sem cadastro.{' '}
                <strong>
                  Nenhum evento de analytics opcional, identificador de visitante ou sessão analítica
                  é gerado, armazenado ou transmitido antes da sua autorização livre, informada e
                  inequívoca.
                </strong>{' '}
                Caso você recuse ou não responda ao aviso de privacidade, continuará tendo acesso
                integral a todos os devocionais e recursos do aplicativo.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                3. Dados que NUNCA Coletamos em Nossos Servidores
              </h2>
              <ul className="list-disc list-inside space-y-1 text-graphite-600 dark:text-cream-200">
                <li>Não coletamos seu nome civil, CPF, endereço ou telefone.</li>
                <li>
                  Não enviamos seu nome/apelido de saudação nem suas anotações do Diário de Oração
                  para nenhum servidor (eles ficam 100% restritos ao armazenamento local do seu
                  aparelho).
                </li>
                <li>Não armazenamos endereços IP completos em nosso banco de dados analítico.</li>
                <li>Não utilizamos técnicas de <em>fingerprinting</em> de dispositivo.</li>
                <li>Não coletamos geolocalização precisa (GPS).</li>
                <li>
                  Não construímos perfis religiosos individuais nem comercializamos dados com
                  anunciantes ou terceiros.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                4. Tabela de Transparência de Tratamento de Dados
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-sand-200 dark:border-graphite-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-sand-100 dark:bg-graphite-800 text-graphite-800 dark:text-cream-50 border-b border-sand-200 dark:border-graphite-700">
                      <th className="p-3 font-bold">Categoria</th>
                      <th className="p-3 font-bold">Dados</th>
                      <th className="p-3 font-bold">Finalidade</th>
                      <th className="p-3 font-bold">Base Legal (LGPD)</th>
                      <th className="p-3 font-bold">Retenção</th>
                      <th className="p-3 font-bold">Compartilhamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 dark:divide-graphite-800">
                    <tr>
                      <td className="p-3 font-semibold">1. Dados Locais Essenciais</td>
                      <td className="p-3">
                        Apelido opcional, Diário de Oração, Favoritos, Histórico de leitura, Tema,
                        Fonte e escolha de privacidade (em <code>localStorage</code> e{' '}
                        <code>IndexedDB</code>).
                      </td>
                      <td className="p-3">
                        Garantir o funcionamento do aplicativo e leitura offline no aparelho do
                        próprio usuário.
                      </td>
                      <td className="p-3">
                        Execução dos Termos de Uso / Procedimentos preliminares a pedido do titular
                        (Art. 7º, V).
                      </td>
                      <td className="p-3">
                        Apenas no aparelho do usuário, até limpeza manual ou desinstalação.
                      </td>
                      <td className="p-3">Nenhum (100% local no dispositivo).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">2. Notificações Web Push (Opcional)</td>
                      <td className="p-3">
                        Endpoint criptográfico Web Push (<code>p256dh</code> / <code>auth</code>),
                        fuso horário e data da última leitura concluída.
                      </td>
                      <td className="p-3">
                        Entregar o Versículo do Dia (06:06) e silenciar lembretes quando a leitura
                        do dia já foi concluída.
                      </td>
                      <td className="p-3">
                        Consentimento específico ao ativar notificações (Art. 7º, I).
                      </td>
                      <td className="p-3">
                        Enquanto a inscrição estiver ativa; removida imediatamente ao desativar nas
                        configurações.
                      </td>
                      <td className="p-3">
                        Serviço de entrega push do sistema operacional (FCM/Mozilla/Apple) e Vercel
                        Blob (criptografado).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">3. Analytics de Produto (Opcional)</td>
                      <td className="p-3">
                        Identificador pseudônimo aleatório (<code>visitorId</code> /{' '}
                        <code>sessionId</code>), eventos de visualização, abertura e confirmação de
                        leitura, compartilhamentos, parâmetros públicos de campanha (<code>utm_*</code>
                        ) e categoria de dispositivo/SO/navegador.
                      </td>
                      <td className="p-3">
                        Compreender de forma estatística a adoção do aplicativo, retenção agregada,
                        eficácia de divulgação e melhoria de recursos.
                      </td>
                      <td className="p-3">
                        Consentimento livre, informado e destacado (Art. 7º, I), desmarcado por
                        padrão.
                      </td>
                      <td className="p-3">
                        Eventos pseudônimos retidos por no máximo 90 dias (ou eliminados antes
                        mediante revogação/solicitação).
                      </td>
                      <td className="p-3">
                        Infraestrutura de hospedagem Vercel Inc. (armazenamento criptografado
                        AES-256-GCM). Sem envio a redes de anúncios.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">4. Saúde Técnica (Opcional)</td>
                      <td className="p-3">
                        Mensagens sanitizadas de erro JS/SW, versão da PWA e tempos de carregamento
                        (Web Vitals).
                      </td>
                      <td className="p-3">
                        Detectar e corrigir travamentos e lentidão em diferentes aparelhos.
                      </td>
                      <td className="p-3">Consentimento (Art. 7º, I).</td>
                      <td className="p-3">Até 90 dias.</td>
                      <td className="p-3">Infraestrutura Vercel Inc.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">5. Segurança Administrativa</td>
                      <td className="p-3">
                        Hash truncado diário de rede (sem IP completo) e registros de tentativas de
                        login administrativo.
                      </td>
                      <td className="p-3">
                        Prevenir ataques de força bruta (rate limiting) e proteger a rota
                        administrativa.
                      </td>
                      <td className="p-3">
                        Prevenção à fraude e segurança do titular e do sistema (Art. 7º, IX e Art.
                        11, II, g).
                      </td>
                      <td className="p-3">
                        Hash de rate-limit em memória efêmera (15 min); log de auditoria até 90
                        dias.
                      </td>
                      <td className="p-3">Infraestrutura Vercel Inc.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                5. Proteção de Crianças, Adolescentes e Dados Sensíveis (Seções 27 e 28)
              </h2>
              <p>
                Por tratar-se de aplicativo de conteúdo cristão aberto a todas as idades, adotamos
                proteção reforçada no melhor interesse de crianças e adolescentes (Art. 14 da LGPD e
                orientações da ANPD): não realizamos perfilamento comportamental, não exibimos
                publicidade, não inferimos convicções doutrinárias individuais e mantemos toda
                coleta analítica estritamente desativada por padrão. Recomendamos que crianças
                utilizem o aplicativo com acompanhamento de seus pais ou responsáveis legais,
                mantendo a opção de analytics recusada caso não haja autorização do responsável.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                6. Fornecedores, Subprocessadores e Transferência Internacional
              </h2>
              <p>
                A aplicação e o armazenamento criptografado utilizam a infraestrutura de nuvem da{' '}
                <strong>Vercel Inc.</strong> (com armazenamento configurado na região de São Paulo —{' '}
                <code>gru1</code>, podendo haver processamento técnico de borda nos Estados Unidos
                sob cláusulas-padrão e medidas de criptografia em trânsito TLS 1.3 e em repouso
                AES-256-GCM).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50">
                7. Direitos dos Titulares e Como Exercê-los (Art. 18 da LGPD)
              </h2>
              <p>
                Você pode, a qualquer momento e gratuitamente: (a) confirmar a existência de
                tratamento; (b) consultar seus dados locais; (c) revogar o consentimento de
                analytics com efeito imediato no topo desta página ou em{' '}
                <strong>Configurações → Privacidade e Dados</strong>; (d) acionar o botão{' '}
                <strong>Eliminar Dados Analíticos</strong> para apagar imediatamente registros
                pseudônimos vinculados ao seu identificador no servidor; ou (e) entrar em contato
                pelo e-mail <a href="mailto:contato@amanhecer.app" className="underline">contato@amanhecer.app</a>.
              </p>
            </section>
          </article>
        )}

        {/* DOCUMENT 3: POLÍTICA DE COOKIES E ARMAZENAMENTO (Seção 26) */}
        {route === '/politica-de-cookies' && (
          <article className="surface-editorial rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
            <div className="border-b border-sand-200 dark:border-graphite-800 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-800 dark:text-sand-300">
                <Database className="w-4 h-4" />
                <span>Transparência Técnica de Armazenamento</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50">
                Política de Cookies e Armazenamento Local
              </h1>
              <p className="text-xs text-graphite-500 dark:text-sand-300">
                Vigência: 10 de novembro de 2026 • Versão {CURRENT_POLICY_VERSION}
              </p>
            </div>

            <p>
              Esta política descreve de forma exata todos os mecanismos de armazenamento no
              navegador (Cookies, <code>localStorage</code>, <code>sessionStorage</code>,{' '}
              <code>IndexedDB</code> e Cache de Service Worker) utilizados pelo Amanhecer.{' '}
              <strong>
                Não classificamos identificadores analíticos como essenciais: eles só são criados se
                você autorizar expressamente os analytics opcionais.
              </strong>
            </p>

            <div className="overflow-x-auto rounded-2xl border border-sand-200 dark:border-graphite-700">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sand-100 dark:bg-graphite-800 text-graphite-800 dark:text-cream-50 border-b border-sand-200 dark:border-graphite-700">
                    <th className="p-3 font-bold">Chave / Tecnologia</th>
                    <th className="p-3 font-bold">Tipo</th>
                    <th className="p-3 font-bold">Classificação</th>
                    <th className="p-3 font-bold">Finalidade</th>
                    <th className="p-3 font-bold">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 dark:divide-graphite-800">
                  <tr>
                    <td className="p-3 font-mono">amanhecer_privacy_consent_v1</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3 font-semibold text-sage-800 dark:text-sand-300">Essencial</td>
                    <td className="p-3">
                      Memorizar sua decisão de aceitar ou recusar analytics para não exibir o banner
                      repetidamente a cada visita.
                    </td>
                    <td className="p-3">Persistente até alteração da política ou limpeza manual.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer_user_preferences_v1</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3 font-semibold text-sage-800 dark:text-sand-300">Essencial</td>
                    <td className="p-3">
                      Salvar seu tema visual (claro/escuro), tamanho da fonte e apelido local de
                      saudação.
                    </td>
                    <td className="p-3">Persistente apenas no aparelho.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer-local-db</td>
                    <td className="p-3">IndexedDB</td>
                    <td className="p-3 font-semibold text-sage-800 dark:text-sand-300">Essencial</td>
                    <td className="p-3">
                      Guardar localmente suas anotações do Diário de Oração, devocionais favoritos e
                      datas concluídas.
                    </td>
                    <td className="p-3">Persistente apenas no aparelho.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">Workbox &amp; Service Worker Cache</td>
                    <td className="p-3">Cache Storage</td>
                    <td className="p-3 font-semibold text-sage-800 dark:text-sand-300">Essencial</td>
                    <td className="p-3">
                      Permitir que o aplicativo abra instantaneamente e funcione mesmo sem internet
                      (modo offline).
                    </td>
                    <td className="p-3">Atualizado automaticamente a cada versão da PWA.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer_analytics_visitor_id</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3 font-semibold text-amber-700 dark:text-amber-300">
                      Opcional (Analytics)
                    </td>
                    <td className="p-3">
                      Identificador pseudônimo aleatório (UUID) para medir retorno e retenção sem
                      identificar civilmente o usuário.
                    </td>
                    <td className="p-3">
                      Criado apenas após consentimento; apagado imediatamente ao revogar.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer_analytics_session_v1</td>
                    <td className="p-3">sessionStorage / localStorage</td>
                    <td className="p-3 font-semibold text-amber-700 dark:text-amber-300">
                      Opcional (Analytics)
                    </td>
                    <td className="p-3">
                      Agrupar eventos dentro de uma mesma sessão de uso (janela de 30 minutos).
                    </td>
                    <td className="p-3">30 minutos de inatividade ou até revogação.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer_analytics_queue_v1</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3 font-semibold text-amber-700 dark:text-amber-300">
                      Opcional (Analytics)
                    </td>
                    <td className="p-3">
                      Fila temporária para eventos gerados em modo offline por usuários que
                      autorizaram analytics.
                    </td>
                    <td className="p-3">
                      Esvaziada assim que enviada ou apagada imediatamente se o consentimento for
                      revogado.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">amanhecer_admin_session</td>
                    <td className="p-3">Cookie HttpOnly</td>
                    <td className="p-3 font-semibold text-graphite-600 dark:text-graphite-300">
                      Restrito (Admin)
                    </td>
                    <td className="p-3">
                      Utilizado exclusivamente para autenticar o administrador na rota administrativa
                      protegida. Nunca é criado para leitores do aplicativo.
                    </td>
                    <td className="p-3">12 horas.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-sage-700 dark:text-sand-300 shrink-0 mt-0.5" />
              <p>
                <strong>Como gerenciar:</strong> Você pode ativar ou desativar os identificadores
                opcionais a qualquer momento usando o painel no topo desta página ou em{' '}
                <strong>Configurações → Privacidade e Dados</strong> dentro do aplicativo, sem
                precisar apagar suas anotações do Diário de Oração.
              </p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
