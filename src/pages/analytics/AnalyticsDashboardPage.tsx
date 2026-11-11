import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  Activity,
  Compass,
  Download,
  BookOpen,
  Sparkles,
  Share2,
  Users,
  Filter,
  Cpu,
  List,
  FileText,
  Settings,
  Lock,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  Printer,
  Search,
} from 'lucide-react';
import {
  PrecisionKPICard,
  InteractiveTimeSeriesChart,
  ReadingHourHeatmap,
} from './AnalyticsCharts';
import { METRIC_DICTIONARY } from '../../services/analytics/metrics-dictionary';

export type DashboardSectionId =
  | 'overview'
  | 'realtime'
  | 'acquisition'
  | 'installations'
  | 'readings'
  | 'verses'
  | 'shares'
  | 'retention'
  | 'funnels'
  | 'technology'
  | 'events'
  | 'reports'
  | 'settings';

const SIDEBAR_ITEMS: Array<{
  id: DashboardSectionId;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Visão geral', icon: BarChart2 },
  { id: 'realtime', label: 'Tempo real', icon: Activity },
  { id: 'acquisition', label: 'Aquisição', icon: Compass },
  { id: 'installations', label: 'Instalações', icon: Download },
  { id: 'readings', label: 'Leituras', icon: BookOpen },
  { id: 'verses', label: 'Versículos', icon: Sparkles },
  { id: 'shares', label: 'Compartilhamentos', icon: Share2 },
  { id: 'retention', label: 'Retenção', icon: Users },
  { id: 'funnels', label: 'Funis', icon: Filter },
  { id: 'technology', label: 'Tecnologia', icon: Cpu },
  { id: 'events', label: 'Eventos', icon: List },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const CUSTOM_FUNNEL_EVENT_OPTIONS = [
  { key: 'landing_viewed', label: 'Visualizou Landing Page' },
  { key: 'landing_cta_clicked', label: 'Clicou em CTA na Landing' },
  { key: 'install_tutorial_opened', label: 'Abriu Tutorial de Instalação' },
  { key: 'pwa_appinstalled_detected', label: 'Instalação Detectada (appinstalled)' },
  { key: 'app_opened', label: 'Abriu o Aplicativo' },
  { key: 'pwa_standalone_opened', label: 'Abriu em Modo PWA Standalone' },
  { key: 'devotional_opened', label: 'Abriu Devocional' },
  { key: 'reading_started', label: 'Iniciou Leitura (>4.5s)' },
  { key: 'devotional_completed', label: 'Confirmou Leitura pelo Botão' },
  { key: 'verse_viewed', label: 'Visualizou Versículo do Dia' },
  { key: 'verse_image_generated', label: 'Gerou Imagem de Versículo' },
  { key: 'share_initiated', label: 'Iniciou Compartilhamento' },
  { key: 'share_completed', label: 'Concluiu Compartilhamento' },
  { key: 'notification_opened', label: 'Abriu Notificação' },
];

interface AnalyticsDashboardPageProps {
  onExitToApp: () => void;
}

export const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({
  onExitToApp,
}) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('amanhecer_admin_bearer');
    } catch {
      return null;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estado de navegação e filtros
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [showComparison, setShowComparison] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  // Estado Aquisição (Construtor UTM)
  const [utmName, setUtmName] = useState('');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('lancamento');
  const [utmContent, setUtmContent] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Estado Retenção (Coortes por Dia da Semana vs por Data)
  const [cohortMode, setCohortMode] = useState<'weekday' | 'date'>('weekday');

  // Estado Construtor de Funil Customizado
  const [customFunnelSteps, setCustomFunnelSteps] = useState<string[]>([
    'app_opened',
    'devotional_opened',
    'devotional_completed',
    'share_completed',
  ]);

  // Estado Busca de Eventos e Dicionário
  const [eventSearch, setEventSearch] = useState('');
  const [eventsTab, setEventsTab] = useState<'stream' | 'dictionary'>('stream');

  // Estado Relatórios
  const [reportCadence, setReportCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Estado Configurações Admin
  const [retentionDaysInput, setRetentionDaysInput] = useState<number>(90);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  const authHeaders = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { Accept: 'application/json' };
    if (sessionToken) {
      h.Authorization = `Bearer ${sessionToken}`;
    }
    return h;
  }, [sessionToken]);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics?action=auth-session', {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setAuthenticated(Boolean(json.authenticated));
      }
    } catch {
      // ignore
    } finally {
      setAuthChecked(true);
    }
  }, [authHeaders]);

  const loadDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (!authenticated) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(
          `/api/analytics?action=dashboard&days=${periodDays}${
            forceRefresh ? '&refresh=true' : ''
          }`,
          {
            headers: authHeaders(),
            credentials: 'include',
          }
        );
        if (res.status === 401) {
          setAuthenticated(false);
          setIsLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error(`Falha ao carregar dados (${res.status})`);
        }
        const json = await res.json();
        setData(json);
        if (json?.governance?.settings?.retentionDays) {
          setRetentionDaysInput(json.governance.settings.retentionDays);
        }
      } catch (err: any) {
        setFetchError(err?.message || 'Erro de comunicação com a API administrativa.');
      } finally {
        setIsLoading(false);
      }
    },
    [authenticated, periodDays, authHeaders]
  );

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated) {
      loadDashboardData(false);
    }
  }, [authenticated, periodDays, loadDashboardData]);

  // Atualização periódica automática na aba Tempo Real
  useEffect(() => {
    if (!authenticated || activeSection !== 'realtime') return;
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [authenticated, activeSection, loadDashboardData]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/analytics?action=auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: passwordInput }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.authenticated) {
        setLoginError(json.error || 'Credencial administrativa inválida.');
      } else {
        if (json.token) {
          setSessionToken(json.token);
          try {
            sessionStorage.setItem('amanhecer_admin_bearer', json.token);
          } catch {
            // ignore
          }
        }
        setPasswordInput('');
        setAuthenticated(true);
      }
    } catch {
      setLoginError('Falha de rede ao validar credencial no servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/analytics?action=auth-logout', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem('amanhecer_admin_bearer');
    } catch {
      // ignore
    }
    setSessionToken(null);
    setAuthenticated(false);
    setData(null);
  };

  const handleExportCSV = () => {
    if (!data?.timeSeries) return;
    const headers = [
      'Data',
      'Visitantes_Unicos',
      'Sessoes',
      'Pageviews',
      'Aberturas_App',
      'Aberturas_PWA_Standalone',
      'Instalacoes_Detectadas',
      'Devocionais_Abertos',
      'Leituras_Confirmadas',
      'Versiculos_Visualizados',
      'Compartilhamentos_Concluidos',
    ];
    const rows = data.timeSeries.map((r: any) =>
      [
        r.date,
        r.uniqueVisitors,
        r.sessions,
        r.pageviews,
        r.appOpens,
        r.pwaStandaloneOpens,
        r.installsDetected,
        r.devotionalsOpened,
        r.readingsCompleted,
        r.versesViewed,
        r.sharesCompleted,
      ].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amanhecer-analytics-${data.meta?.period?.startDate || 'relatorio'}-a-${
      data.meta?.period?.endDate || 'hoje'
    }.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utmName.trim() || !utmSource.trim() || !utmMedium.trim() || !utmCampaign.trim()) return;
    try {
      const res = await fetch('/api/analytics?action=save-campaign', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: utmName,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
        }),
      });
      if (res.ok) {
        setUtmName('');
        loadDashboardData(true);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch('/api/analytics?action=delete-campaign', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadDashboardData(true);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveRetentionSettings = async () => {
    setSettingsSavedMsg(null);
    try {
      const res = await fetch('/api/analytics?action=update-settings', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ retentionDays: retentionDaysInput }),
      });
      if (res.ok) {
        const json = await res.json();
        setSettingsSavedMsg(
          `Política de retenção atualizada para ${retentionDaysInput} dias (${
            json.purgedCount || 0
          } registros antigos expurgados).`
        );
        loadDashboardData(true);
      }
    } catch {
      // ignore
    }
  };

  const previewGeneratedUtmUrl = (() => {
    const p = new URLSearchParams({
      utm_source: utmSource.trim().toLowerCase() || 'instagram',
      utm_medium: utmMedium.trim().toLowerCase() || 'social',
      utm_campaign: utmCampaign.trim().toLowerCase() || 'lancamento',
    });
    if (utmContent.trim()) p.set('utm_content', utmContent.trim().toLowerCase());
    return `https://amanhecer-beta.vercel.app/?${p.toString()}`;
  })();

  // ---------- TELA DE AUTENTICAÇÃO ADMINISTRATIVA (Seção 12 & 29) ----------
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-4 font-sans">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Verificando sessão administrativa segura...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div
        data-testid="admin-login-screen"
        className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 font-sans"
      >
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Lock className="w-4 h-4 text-zinc-200" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
                  Amanhecer Intelligence
                </h1>
                <p className="text-[11px] text-zinc-400">
                  Acesso Administrativo Restrito • /colossenses323analytics
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onExitToApp}
              className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>App</span>
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-secret-input"
                className="block text-xs font-medium text-zinc-300"
              >
                Chave Administrativa do Servidor
              </label>
              <input
                id="admin-secret-input"
                data-testid="admin-password-input"
                type="password"
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Insira ANALYTICS_ADMIN_PASSWORD ou CRON_SECRET"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {loginError && (
              <div
                data-testid="admin-login-error"
                className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              data-testid="admin-login-submit"
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Autenticando no servidor...' : 'Acessar Central de Inteligência'}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 space-y-1 leading-relaxed">
            <p className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Segurança Validada no Servidor</span>
            </p>
            <p>
              Esta rota exige sessão autenticada via Cookie <code>HttpOnly</code> assinado com
              HMAC-SHA256 e proteção contra força bruta. Nenhuma senha é armazenada no frontend.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- LAYOUT PRINCIPAL DA PLATAFORMA SAAS (Seção 10) ----------
  return (
    <div
      data-testid="analytics-dashboard-shell"
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans antialiased"
    >
      {/* SIDEBAR FIXA E RECOLHÍVEL (13 Módulos) */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-150 print:hidden`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 px-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold tracking-tight block truncate">
                    Amanhecer Analytics
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Colossenses 3:23
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 13 Navigation Items */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-120px)]">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`nav-${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <button
            type="button"
            onClick={onExitToApp}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Voltar ao aplicativo Amanhecer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Abrir App PWA</span>}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Encerrar sessão administrativa"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER COM SELETOR DE PERÍODO, COMPARAÇÃO, ATUALIZAÇÃO, EXPORTAÇÃO E STATUS */}
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label || 'Visão geral'}
            </h1>

            {/* Indicador de Status dos Dados */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Dados Reais •{' '}
                {data?.meta?.storageBackend === 'vercel-blob-encrypted'
                  ? 'Vercel Blob (AES-256)'
                  : data?.meta?.storageBackend || 'Ativo'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Período */}
            <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-0.5 text-xs">
              {[
                { d: 1, label: 'Hoje' },
                { d: 7, label: '7d' },
                { d: 14, label: '14d' },
                { d: 30, label: '30d' },
                { d: 90, label: '90d' },
              ].map((opt) => (
                <button
                  key={opt.d}
                  type="button"
                  onClick={() => setPeriodDays(opt.d)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    periodDays === opt.d
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Toggle de Comparação Temporal */}
            <button
              type="button"
              onClick={() => setShowComparison((v) => !v)}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                showComparison
                  ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <span>Comparar período</span>
            </button>

            {/* Botão Atualizar */}
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={isLoading}
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Botão Exportar CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </header>

        {/* CORPO DAS SEÇÕES */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {fetchError && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                className="underline font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* 1. VISÃO GERAL (Seção 3) */}
          {activeSection === 'overview' && data && (
            <div className="space-y-6">
              {/* Resumo Automático Baseado em Regras e Dados Reais */}
              {data.automatedInsights && data.automatedInsights.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Síntese de Inteligência do Período ({data.meta.period.startDate} a{' '}
                      {data.meta.period.endDate})
                    </span>
                    <span className="text-[11px] text-zinc-400 tabular-nums">
                      Eventos armazenados: {data.meta.totalRawEventsStored}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                    {data.automatedInsights.map((insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gráfico Principal de Séries Temporais */}
              <InteractiveTimeSeriesChart series={data.timeSeries} />

              {/* Grade Completa dos 24 Indicadores Principais */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Indicadores Principais (24 KPIs Auditáveis)
                  </h2>
                  <span className="text-[11px] text-zinc-400">
                    Passe o mouse no ícone (?) de cada indicador para ver definição, evento e
                    limitações
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.overviewKPIs.map((kpi: any) => (
                    <PrecisionKPICard
                      key={kpi.id}
                      id={kpi.id}
                      label={kpi.label}
                      formattedValue={kpi.formattedValue}
                      previousValue={kpi.previousValue}
                      deltaPercent={kpi.deltaPercent}
                      confidence={kpi.confidence}
                      unavailableReason={kpi.unavailableReason}
                      sparkline={kpi.sparkline}
                      showComparison={showComparison}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. TEMPO REAL (Seção 15) */}
          {activeSection === 'realtime' && data && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Monitoramento em Tempo Real (Janela de 5 minutos)</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {data.realtime.definition} Não exibe identificação individual.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {data.realtime.activeNowCount}
                  </div>
                  <div className="text-[11px] text-zinc-400">visitantes ativos agora</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Aberturas Recentes (5m)</span>
                  <div className="text-xl font-semibold tabular-nums mt-1">
                    {data.realtime.recentOpensCount}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Leituras Confirmadas (5m)</span>
                  <div className="text-xl font-semibold tabular-nums mt-1 text-emerald-600">
                    {data.realtime.recentReadingsCount}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Compartilhamentos (5m)</span>
                  <div className="text-xl font-semibold tabular-nums mt-1">
                    {data.realtime.recentSharesCount}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Instalações Detectadas (5m)</span>
                  <div className="text-xl font-semibold tabular-nums mt-1">
                    {data.realtime.recentInstallsCount}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Fluxo de Eventos Recentes (Anônimo)
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Atualização automática a cada 15s
                  </span>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70 max-h-96 overflow-y-auto">
                  {data.realtime.recentEvents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-400">
                      Nenhum evento recebido ainda. Interaja com o aplicativo após aceitar os
                      analytics opcionais para observar o fluxo ao vivo.
                    </div>
                  ) : (
                    data.realtime.recentEvents.map((ev: any) => (
                      <div
                        key={ev.eventId}
                        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {ev.eventName}
                          </span>
                          <span className="text-zinc-700 dark:text-zinc-200">
                            {ev.summary}
                          </span>
                          {ev.wasOfflineSynced && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Sincronizado Offline
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 tabular-nums">
                          <span>
                            {ev.isStandalone ? 'PWA' : 'Web'} • {ev.os} • {ev.browser}
                          </span>
                          <span>
                            {new Date(ev.occurredAt).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. AQUISIÇÃO & GERADOR DE LINKS UTM (Seção 7) */}
          {activeSection === 'acquisition' && data && (
            <div className="space-y-6">
              {/* Relatório de Canais e Campanhas */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold">
                    Relatório de Origem, Meio e Campanha (UTM &amp; Referrers)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Apenas origens reais verificadas por parâmetros UTM ou cabeçalho HTTP Referer
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3 font-medium">Origem (Source)</th>
                        <th className="p-3 font-medium">Meio (Medium)</th>
                        <th className="p-3 font-medium">Campanha</th>
                        <th className="p-3 font-medium text-right">Visitas</th>
                        <th className="p-3 font-medium text-right">Visitantes Únicos</th>
                        <th className="p-3 font-medium text-right">Conversões PWA</th>
                        <th className="p-3 font-medium text-right">Leituras</th>
                        <th className="p-3 font-medium text-right">Compartilhamentos</th>
                        <th className="p-3 font-medium text-right">Retenção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.acquisition.rows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-zinc-400">
                            Nenhuma sessão registrada no período selecionado.
                          </td>
                        </tr>
                      ) : (
                        data.acquisition.rows.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                            <td className="p-3 font-semibold">{r.source}</td>
                            <td className="p-3 text-zinc-500">{r.medium}</td>
                            <td className="p-3 font-mono text-[11px]">{r.campaign}</td>
                            <td className="p-3 text-right tabular-nums">{r.visits}</td>
                            <td className="p-3 text-right tabular-nums">{r.uniqueVisitors}</td>
                            <td className="p-3 text-right tabular-nums">{r.conversions}</td>
                            <td className="p-3 text-right tabular-nums font-medium text-emerald-700 dark:text-emerald-400">
                              {r.readingsCompleted}
                            </td>
                            <td className="p-3 text-right tabular-nums">{r.sharesCompleted}</td>
                            <td className="p-3 text-right tabular-nums">{r.retentionRatePct}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gerador de Links de Campanha UTM */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Construtor de Links Rastreáveis de Campanha (UTM)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Crie links para Instagram, YouTube, WhatsApp, QR Codes de Igrejas, Rádio e
                    Parcerias
                  </p>
                </div>

                {/* Presets rápidos */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { name: 'Instagram Reels', s: 'instagram', m: 'organic', c: 'reels_devocional' },
                    { name: 'YouTube Descrição', s: 'youtube', m: 'video', c: 'canal_oficial' },
                    { name: 'Grupos WhatsApp', s: 'whatsapp', m: 'mensagem', c: 'divulgacao_diaria' },
                    { name: 'QR Code Igreja', s: 'qr_code', m: 'impresso', c: 'boletim_domingo' },
                    { name: 'Divulgação Rádio', s: 'radio', m: 'audio', c: 'programa_matinal' },
                    { name: 'Parceria Cristã', s: 'parceria', m: 'referral', c: 'apoio_ministerial' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setUtmName(preset.name);
                        setUtmSource(preset.s);
                        setUtmMedium(preset.m);
                        setUtmCampaign(preset.c);
                      }}
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSaveCampaign}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Nome interno (ex: QR Igreja)"
                    value={utmName}
                    onChange={(e) => setUtmName(e.target.value)}
                    className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="utm_source (ex: instagram)"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="utm_medium (ex: organic)"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="utm_campaign (ex: lancamento)"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Salvar Link</span>
                  </button>
                </form>

                {/* Preview & Copy */}
                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <code className="text-zinc-700 dark:text-zinc-300 break-all">
                    {previewGeneratedUtmUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(previewGeneratedUtmUrl);
                      setCopiedUrl(previewGeneratedUtmUrl);
                      setTimeout(() => setCopiedUrl(null), 2500);
                    }}
                    className="px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1"
                  >
                    {copiedUrl === previewGeneratedUtmUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Lista de Links Salvos */}
                {data.acquisition.savedCampaigns?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Links de Campanha Salvos
                    </h4>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
                      {data.acquisition.savedCampaigns.map((c: any) => (
                        <div
                          key={c.id}
                          className="p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {c.name}
                            </span>
                            <span className="block font-mono text-[11px] text-zinc-500">
                              {c.fullUrl}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(c.fullUrl);
                                setCopiedUrl(c.fullUrl);
                                setTimeout(() => setCopiedUrl(null), 2500);
                              }}
                              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                              title="Copiar link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600"
                              title="Remover link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. INSTALAÇÕES (Seção 4) */}
          {activeSection === 'installations' && data && (
            <div className="space-y-6">
              {/* Separação Estrita: Detectadas vs Standalone vs Estimadas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">
                      1. Instalações Detectadas pelo SO
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      Confirmado
                    </span>
                  </div>
                  <div className="text-3xl font-bold tabular-nums">
                    {data.installations.separation.detectedInstallsTotal}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Disparos reais do evento nativo <code>appinstalled</code> ou aceite do prompt{' '}
                    <code>beforeinstallprompt</code> (suportado em navegadores Chromium/Android).
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">
                      2. Dispositivos que Abriram a PWA
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      Confirmado
                    </span>
                  </div>
                  <div className="text-3xl font-bold tabular-nums">
                    {data.installations.separation.standaloneDevicesTotal}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Visitantes únicos que efetivamente abriram o Amanhecer em modo instalado{' '}
                    <code>display-mode: standalone</code> (inclui Android, iOS Safari e Desktop).
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">
                      3. Instalações Estimadas (Total)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Estimado
                    </span>
                  </div>
                  <div className="text-3xl font-bold tabular-nums">
                    {data.installations.separation.estimatedInstallsTotal}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Estimativa consolidada (união de instalações detectadas, aberturas standalone e{' '}
                    {data.installations.separation.activePushDevicesTotal} inscrições push ativas).
                  </p>
                </div>
              </div>

              {/* Funil Completo da Página de Instalação */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Funil da Página de Instalação (Visitou → Interagiu → Instalou → Abriu PWA → Leu)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Conversão por etapa no período selecionado
                  </p>
                </div>
                <div className="space-y-3">
                  {data.installations.funnel.map((step: any, idx: number) => {
                    const max = Math.max(data.installations.funnel[0]?.count || 1, 1);
                    const pct = Math.min(100, Math.round((step.count / max) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {idx + 1}. {step.step}
                          </span>
                          <span className="tabular-nums font-semibold">
                            {step.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-900 dark:bg-zinc-200 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribuição por Dispositivo, SO e Navegador */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Por Categoria de Dispositivo
                  </h4>
                  {Object.entries(data.installations.byDeviceType).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="capitalize">{k}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Por Sistema Operacional
                  </h4>
                  {Object.entries(data.installations.byOS).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span>{k}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Por Navegador
                  </h4>
                  {Object.entries(data.installations.byBrowser).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span>{k}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. LEITURAS & DEVOCIONAIS (Seção 5.1 e 5.3) */}
          {activeSection === 'readings' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Devocionais Abertos</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.readings.devotionalsOpened}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Leituras Iniciadas (&gt;4.5s)</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.readings.readingsStarted}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Confirmadas pelo Botão</span>
                  <div className="text-2xl font-bold tabular-nums mt-1 text-emerald-600">
                    {data.readings.readingsCompleted}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Taxa de Conclusão</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.readings.completionRatePct !== null
                      ? `${data.readings.completionRatePct}%`
                      : '—'}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Tempo Médio até Confirmar</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.readings.avgReadingTimeSec !== null
                      ? `${data.readings.avgReadingTimeSec}s`
                      : '—'}
                  </div>
                </div>
              </div>

              {/* Heatmap 7x24 */}
              <ReadingHourHeatmap matrix={data.readings.heatmap7x24} />

              {/* Ranking de Devocionais */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold">
                    Desempenho por Devocional (Aberturas vs Confirmações Reais pelo Botão)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Diferenciação estrita: abrir a página não conta como leitura concluída
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3 font-medium">Data</th>
                        <th className="p-3 font-medium">Título / Tema</th>
                        <th className="p-3 font-medium text-right">Abertos</th>
                        <th className="p-3 font-medium text-right">Iniciados</th>
                        <th className="p-3 font-medium text-right">Confirmados</th>
                        <th className="p-3 font-medium text-right">Taxa Conclusão</th>
                        <th className="p-3 font-medium text-right">Compartilhados</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.readings.topDevotionals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-zinc-400">
                            Nenhuma leitura registrada no período.
                          </td>
                        </tr>
                      ) : (
                        data.readings.topDevotionals.map((d: any) => {
                          const rate =
                            d.openedCount > 0
                              ? Math.min(100, Math.round((d.completedCount / d.openedCount) * 100))
                              : 0;
                          return (
                            <tr key={d.devotionalId}>
                              <td className="p-3 font-mono">{d.date}</td>
                              <td className="p-3">
                                <span className="font-semibold block">{d.title}</span>
                                <span className="text-[11px] text-zinc-400">{d.theme}</span>
                              </td>
                              <td className="p-3 text-right tabular-nums">{d.openedCount}</td>
                              <td className="p-3 text-right tabular-nums">{d.startedCount}</td>
                              <td className="p-3 text-right tabular-nums font-semibold text-emerald-600">
                                {d.completedCount}
                              </td>
                              <td className="p-3 text-right tabular-nums">{rate}%</td>
                              <td className="p-3 text-right tabular-nums">{d.sharedCount}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. VERSÍCULOS DO DIA (Seção 5.2) */}
          {activeSection === 'verses' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Visualizações do Versículo</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.versesViewed}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Imagens Geradas (1080x1350)</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.imagesGenerated}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Downloads de Imagem</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.imagesDownloaded}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Textos Copiados</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.textCopied}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold">Ranking de Versículos por Engajamento</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3 font-medium">Referência</th>
                        <th className="p-3 font-medium">Categoria</th>
                        <th className="p-3 font-medium text-right">Visualizações</th>
                        <th className="p-3 font-medium text-right">Imagens Geradas</th>
                        <th className="p-3 font-medium text-right">Downloads</th>
                        <th className="p-3 font-medium text-right">Tentativas Share</th>
                        <th className="p-3 font-medium text-right">Shares Concluídos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.versesAndSharing.topVerses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-zinc-400">
                            Nenhum evento de versículo registrado no período.
                          </td>
                        </tr>
                      ) : (
                        data.versesAndSharing.topVerses.map((v: any) => (
                          <tr key={v.reference}>
                            <td className="p-3 font-semibold">{v.reference}</td>
                            <td className="p-3 text-zinc-500">{v.category}</td>
                            <td className="p-3 text-right tabular-nums">{v.views}</td>
                            <td className="p-3 text-right tabular-nums">{v.imagesGenerated}</td>
                            <td className="p-3 text-right tabular-nums">{v.imagesDownloaded}</td>
                            <td className="p-3 text-right tabular-nums">{v.sharesInitiated}</td>
                            <td className="p-3 text-right tabular-nums font-semibold text-emerald-600">
                              {v.sharesCompleted}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. COMPARTILHAMENTOS (Seção 5.2 & 8) */}
          {activeSection === 'shares' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Compartilhamentos Iniciados</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.sharesInitiated}
                  </div>
                  <span className="text-[11px] text-zinc-400">Abertura da folha nativa</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Compartilhamentos Concluídos</span>
                  <div className="text-2xl font-bold tabular-nums mt-1 text-emerald-600">
                    {data.versesAndSharing.sharesCompleted}
                  </div>
                  <span className="text-[11px] text-zinc-400">Confirmados pelo navegador/SO</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Versículos vs Devocionais</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.verseSharesCompleted} /{' '}
                    {data.versesAndSharing.devotionalSharesCompleted}
                  </div>
                  <span className="text-[11px] text-zinc-400">Por tipo de conteúdo</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Taxa de Compartilhamento</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.versesAndSharing.shareRatePct !== null
                      ? `${data.versesAndSharing.shareRatePct}%`
                      : '—'}
                  </div>
                  <span className="text-[11px] text-zinc-400">Shares / Visualizações</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Nota Técnica sobre Confirmação de Compartilhamento
                </h3>
                <p>
                  Quando o usuário aciona o botão Compartilhar, registramos primeiro{' '}
                  <code>share_initiated</code> (tentativa). Apenas quando a Promise{' '}
                  <code>navigator.share()</code> resolve sem <code>AbortError</code> (ou quando o
                  download/cópia é concluído em desktops) registramos <code>share_completed</code>.
                </p>
              </div>
            </div>
          )}

          {/* 8. RETENÇÃO E MATRIZ DE COORTES (Seção 6) */}
          {activeSection === 'retention' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">DAU / WAU / MAU</span>
                  <div className="text-xl font-bold tabular-nums mt-1">
                    {data.retention.dau} / {data.retention.wau} / {data.retention.mau}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Stickiness (DAU / MAU)</span>
                  <div className="text-xl font-bold tabular-nums mt-1">
                    {data.retention.stickinessPct !== null
                      ? `${data.retention.stickinessPct}%`
                      : 'Indisponível'}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Retenção D1 / D7</span>
                  <div className="text-xl font-bold tabular-nums mt-1">
                    {data.retention.retD1.rate !== null
                      ? `${data.retention.retD1.rate}%`
                      : 'Em maturação'}{' '}
                    /{' '}
                    {data.retention.retD7.rate !== null
                      ? `${data.retention.retD7.rate}%`
                      : 'Em maturação'}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Retenção D14 / D30</span>
                  <div className="text-xl font-bold tabular-nums mt-1">
                    {data.retention.retD14.rate !== null
                      ? `${data.retention.retD14.rate}%`
                      : 'Em maturação'}{' '}
                    /{' '}
                    {data.retention.retD30.rate !== null
                      ? `${data.retention.retD30.rate}%`
                      : 'Em maturação'}
                  </div>
                </div>
              </div>

              {/* Matriz de Coortes Profissional */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Matriz de Coortes de Aquisição e Retorno
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Permite responder: &ldquo;Dos usuários que começaram em determinado dia da
                      semana ou data, quantos voltaram D1, D3, D7, D14 e D30 depois?&rdquo;
                    </p>
                  </div>

                  <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setCohortMode('weekday')}
                      className={`px-3 py-1 rounded font-medium ${
                        cohortMode === 'weekday'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-500'
                      }`}
                    >
                      Por Dia da Semana
                    </button>
                    <button
                      type="button"
                      onClick={() => setCohortMode('date')}
                      className={`px-3 py-1 rounded font-medium ${
                        cohortMode === 'date'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-500'
                      }`}
                    >
                      Por Data de Início
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3 font-medium">Coorte de Aquisição</th>
                        <th className="p-3 font-medium text-right">Tamanho (Usuários)</th>
                        <th className="p-3 font-medium text-center">Dia +1 (D1)</th>
                        <th className="p-3 font-medium text-center">Dia +3 (D3)</th>
                        <th className="p-3 font-medium text-center">Dia +7 (D7)</th>
                        <th className="p-3 font-medium text-center">Dia +14 (D14)</th>
                        <th className="p-3 font-medium text-center">Dia +30 (D30)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {(cohortMode === 'weekday'
                        ? data.retention.weekdayCohorts
                        : data.retention.dateCohorts
                      ).map((row: any) => (
                        <tr key={row.cohortLabel}>
                          <td className="p-3 font-semibold">
                            {row.cohortLabel}
                            {cohortMode === 'date' && (
                              <span className="ml-2 text-[11px] font-normal text-zinc-400">
                                ({row.dayOfWeekLabel})
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right tabular-nums font-medium">
                            {row.usersCount}
                          </td>
                          {(['d1', 'd3', 'd7', 'd14', 'd30'] as const).map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="p-2 text-center tabular-nums">
                                {val === null ? (
                                  <span className="text-zinc-300 dark:text-zinc-600">—</span>
                                ) : (
                                  <span
                                    style={{
                                      backgroundColor:
                                        val > 0
                                          ? `rgba(5, 150, 105, ${Math.max(
                                              0.12,
                                              Math.min(0.85, val / 100)
                                            )})`
                                          : undefined,
                                    }}
                                    className={`inline-block w-16 py-1 rounded font-medium ${
                                      val >= 50
                                        ? 'text-white'
                                        : val > 0
                                        ? 'text-emerald-950 dark:text-emerald-100'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}
                                  >
                                    {val}%
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 9. FUNIS DE CONVERSÃO & CONSTRUTOR DE FUNIS (Seção 8) */}
          {activeSection === 'funnels' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Funil de Aquisição',
                    subtitle: 'Visitou → Clicou Instalar → Abriu PWA → Confirmou Leitura',
                    steps: data.funnels.predefined.acquisition,
                  },
                  {
                    title: 'Funil de Engajamento',
                    subtitle: 'Abriu App → Abriu Devocional → Confirmou Leitura → Compartilhou',
                    steps: data.funnels.predefined.engagement,
                  },
                  {
                    title: 'Funil de Divulgação',
                    subtitle: 'Viu Versículo → Gerou Imagem → Compartilhou → Visita por Link',
                    steps: data.funnels.predefined.viral,
                  },
                ].map((funnel) => (
                  <div
                    key={funnel.title}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3"
                  >
                    <div>
                      <h3 className="text-sm font-semibold">{funnel.title}</h3>
                      <p className="text-[11px] text-zinc-500">{funnel.subtitle}</p>
                    </div>
                    <div className="space-y-2.5 pt-1">
                      {funnel.steps.map((st: any) => (
                        <div
                          key={st.stepIndex}
                          className="p-2.5 rounded border border-zinc-100 dark:border-zinc-800 space-y-1"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{st.label}</span>
                            <span className="font-bold tabular-nums">{st.usersCount}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${st.conversionFromStartPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-400 tabular-nums">
                            <span>Do topo: {st.conversionFromStartPct}%</span>
                            {st.stepIndex > 1 && (
                              <span>
                                Queda: -{st.dropOffCount} ({st.dropOffPct}%)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Construtor de Funis Customizado */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Construtor Interativo de Funil</h3>
                  <p className="text-xs text-zinc-500">
                    Selecione qualquer combinação de etapas para inspecionar a conversão nos eventos
                    recentes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {customFunnelSteps.map((stepKey, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Etapa {idx + 1}
                      </label>
                      <select
                        value={stepKey}
                        onChange={(e) => {
                          const next = [...customFunnelSteps];
                          next[idx] = e.target.value;
                          setCustomFunnelSteps(next);
                        }}
                        className="w-full px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                      >
                        {CUSTOM_FUNNEL_EVENT_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. TECNOLOGIA & SAÚDE DO APLICATIVO (Seção 9) */}
          {activeSection === 'technology' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Tempo Médio Carregamento</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.technicalHealth.avgPageLoadMs !== null
                      ? `${data.technicalHealth.avgPageLoadMs} ms`
                      : 'Aguardando amostra'}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">First Contentful Paint (FCP)</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.technicalHealth.avgFcpMs !== null
                      ? `${data.technicalHealth.avgFcpMs} ms`
                      : 'Aguardando amostra'}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Erros JS / SW no Período</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.technicalHealth.totalErrorsInPeriod}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <span className="text-xs text-zinc-500">Eventos Capturados Offline</span>
                  <div className="text-2xl font-bold tabular-nums mt-1">
                    {data.technicalHealth.offlineSyncedEventsCount}
                  </div>
                </div>
              </div>

              {/* Versões da PWA */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold">Distribuição e Saúde por Versão da PWA</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-2.5">Versão</th>
                        <th className="p-2.5 text-right">Sessões</th>
                        <th className="p-2.5 text-right">Erros</th>
                        <th className="p-2.5 text-right">Taxa de Erro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.technicalHealth.versionsDistribution).map(
                        ([ver, info]: any) => {
                          const rate =
                            info.sessions > 0
                              ? ((info.errors / info.sessions) * 100).toFixed(1)
                              : '0.0';
                          return (
                            <tr
                              key={ver}
                              className="border-b border-zinc-100 dark:border-zinc-800"
                            >
                              <td className="p-2.5 font-mono font-semibold">v{ver}</td>
                              <td className="p-2.5 text-right tabular-nums">{info.sessions}</td>
                              <td className="p-2.5 text-right tabular-nums">{info.errors}</td>
                              <td className="p-2.5 text-right tabular-nums">{rate}%</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 11. EVENTOS & DICIONÁRIO DE CONFIABILIDADE DE DADOS (Seção 17) */}
          {activeSection === 'events' && data && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setEventsTab('stream')}
                    className={`px-3 py-1.5 rounded font-medium ${
                      eventsTab === 'stream'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500'
                    }`}
                  >
                    Log de Eventos Recebidos
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventsTab('dictionary')}
                    className={`px-3 py-1.5 rounded font-medium ${
                      eventsTab === 'dictionary'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500'
                    }`}
                  >
                    Dicionário de Confiabilidade de Métricas (Seção 17)
                  </button>
                </div>

                {eventsTab === 'stream' && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Filtrar por nome do evento..."
                      className="pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {eventsTab === 'stream' ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-3 font-medium">Evento</th>
                          <th className="p-3 font-medium">Resumo</th>
                          <th className="p-3 font-medium">Horário Original (occurredAt)</th>
                          <th className="p-3 font-medium">Recebido (receivedAt)</th>
                          <th className="p-3 font-medium">Ambiente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {data.realtime.recentEvents
                          .filter(
                            (ev: any) =>
                              !eventSearch.trim() ||
                              ev.eventName
                                .toLowerCase()
                                .includes(eventSearch.trim().toLowerCase())
                          )
                          .map((ev: any) => (
                            <tr key={ev.eventId}>
                              <td className="p-3 font-mono font-semibold">{ev.eventName}</td>
                              <td className="p-3">{ev.summary}</td>
                              <td className="p-3 font-mono text-[11px] tabular-nums">
                                {new Date(ev.occurredAt).toLocaleString('pt-BR')}
                              </td>
                              <td className="p-3 font-mono text-[11px] tabular-nums text-zinc-500">
                                {new Date(ev.receivedAt).toLocaleString('pt-BR')}
                              </td>
                              <td className="p-3">
                                {ev.isStandalone ? 'PWA' : 'Browser'} • {ev.os} • v{ev.appVersion}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(METRIC_DICTIONARY).map((m) => (
                    <div
                      key={m.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {m.label}
                        </h4>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {m.confidence === 'confirmed' ? 'Dado Confirmado' : 'Dado Estimado'}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300">{m.definition}</p>
                      <div className="space-y-1 pt-1 text-[11px] text-zinc-500">
                        <p>
                          <strong>Eventos de Origem:</strong>{' '}
                          <code>{m.sourceEvents.join(', ')}</code>
                        </p>
                        <p>
                          <strong>Método de Cálculo:</strong> {m.calculationMethod}
                        </p>
                        <p>
                          <strong>Limitações:</strong> {m.limitations}
                        </p>
                        <p>
                          <strong>Fontes de Imprecisão:</strong> {m.imprecisionSources}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 12. RELATÓRIOS EXECUTIVOS (Seção 16) */}
          {activeSection === 'reports' && data && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Relatórios Executivos e Exportação Oficial
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Selecione a cadência do relatório ou exporte os dados auditáveis em CSV ou PDF
                  </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 text-xs">
                    {[
                      { id: 'daily', label: 'Diário (1d)', days: 1 },
                      { id: 'weekly', label: 'Semanal (7d)', days: 7 },
                      { id: 'monthly', label: 'Mensal (30d)', days: 30 },
                    ].map((cad) => (
                      <button
                        key={cad.id}
                        type="button"
                        onClick={() => {
                          setReportCadence(cad.id as any);
                          setPeriodDays(cad.days);
                        }}
                        className={`px-3 py-1 rounded font-medium ${
                          reportCadence === cad.id
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'text-zinc-500'
                        }`}
                      >
                        {cad.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Exportar PDF / Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Corpo do Relatório */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-6">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold">
                      Relatório de Inteligência de Produto — Amanhecer
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Período analisado: {data.meta.period.startDate} até {data.meta.period.endDate}{' '}
                      (Comparado com {data.meta.period.prevStartDate} a{' '}
                      {data.meta.period.prevEndDate})
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    Gerado em {new Date(data.meta.generatedAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Resumo Automático Comprovado por Dados Reais
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-200 list-disc list-inside">
                    {data.automatedInsights.map((txt: string, i: number) => (
                      <li key={i}>{txt}</li>
                    ))}
                  </ul>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                        <th className="p-2.5">Indicador</th>
                        <th className="p-2.5 text-right">Período Atual</th>
                        <th className="p-2.5 text-right">Período Anterior</th>
                        <th className="p-2.5 text-right">Variação (%)</th>
                        <th className="p-2.5 text-right">Natureza do Dado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.overviewKPIs.map((k: any) => (
                        <tr key={k.id}>
                          <td className="p-2.5 font-medium">{k.label}</td>
                          <td className="p-2.5 text-right tabular-nums font-semibold">
                            {k.formattedValue}
                          </td>
                          <td className="p-2.5 text-right tabular-nums text-zinc-500">
                            {k.previousValue !== null ? k.previousValue : '—'}
                          </td>
                          <td className="p-2.5 text-right tabular-nums">
                            {k.deltaPercent !== null
                              ? `${k.deltaPercent > 0 ? '+' : ''}${k.deltaPercent}%`
                              : '—'}
                          </td>
                          <td className="p-2.5 text-right capitalize">{k.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 13. CONFIGURAÇÕES & GOVERNANÇA LGPD (Seção 13, 14, 30) */}
          {activeSection === 'settings' && data && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Política de Retenção de Eventos e Expurgo Automático (LGPD)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Define por quantos dias os eventos brutos pseudônimos são mantidos antes da
                    exclusão automática
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={retentionDaysInput}
                    onChange={(e) => setRetentionDaysInput(parseInt(e.target.value, 10))}
                    className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium"
                  >
                    <option value={30}>30 dias</option>
                    <option value={60}>60 dias</option>
                    <option value={90}>90 dias (Recomendado LGPD)</option>
                    <option value={180}>180 dias</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSaveRetentionSettings}
                    className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
                  >
                    Salvar e Executar Expurgo Agora
                  </button>
                </div>

                {settingsSavedMsg && (
                  <p className="text-xs text-emerald-600 font-medium">{settingsSavedMsg}</p>
                )}
              </div>

              {/* Estatísticas Agregadas das Preferências do App */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Preferências Agregadas de Tema
                  </h4>
                  {Object.entries(data.settingsStats.themePreferencesCount).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="capitalize">{k}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Logs Recentes de Segurança Administrativa
                  </h4>
                  {data.governance.recentSecurityAudit.map((sec: any) => (
                    <div
                      key={sec.id}
                      className="flex justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <span>
                        {sec.action} ({sec.status})
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {new Date(sec.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
