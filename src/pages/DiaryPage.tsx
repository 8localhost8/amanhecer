import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, ShieldCheck, Heart, Sparkles, MessageSquare, Edit3, X } from 'lucide-react';
import { DiaryEntry, getAllDiaryEntries, saveDiaryEntry, deleteDiaryEntry, exportDiaryToJson, importDiaryFromJson } from '../storage/db';

export const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'note' | 'prayer' | 'gratitude'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<'note' | 'prayer' | 'gratitude'>('note');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getAllDiaryEntries();
    setEntries(data);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormType('note');
    setFormTitle('');
    setFormContent('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setFormType(entry.type);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    await saveDiaryEntry(
      {
        date: new Date().toISOString().slice(0, 10),
        type: formType,
        title: formTitle.trim(),
        content: formContent.trim(),
      },
      editingId || undefined
    );

    setIsEditorOpen(false);
    await loadEntries();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este registro do seu diário?')) {
      await deleteDiaryEntry(id);
      await loadEntries();
    }
  };

  const handleExportBackup = async () => {
    const jsonStr = await exportDiaryToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amanhecer-diario-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const count = await importDiaryFromJson(text);
        alert(`Backup restaurado com sucesso! ${count} registros importados.`);
        await loadEntries();
      } catch (err: any) {
        alert(err.message || 'Erro ao importar backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = entries.filter((e) => activeFilter === 'all' || e.type === activeFilter);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Diário Pessoal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Anotações espirituais, pedidos e gratidão salvos apenas no seu aparelho
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="py-2.5 px-4 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-md shadow-dawn-600/20 flex items-center space-x-1.5 text-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-dawn-50/60 dark:bg-dawn-950/40 border border-dawn-200/80 dark:border-dawn-900/60 rounded-2xl p-3.5 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-3">
        <ShieldCheck className="w-5 h-5 text-dawn-600 dark:text-dawn-400 flex-shrink-0" />
        <p>
          <strong>Privacidade total:</strong> Suas anotações nunca são enviadas a servidores ou para a inteligência artificial. Faça backups regulares abaixo.
        </p>
      </div>

      {/* Filters and Backup Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex bg-slate-100 dark:bg-midnight-950 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Todos ({entries.length})
          </button>
          <button
            onClick={() => setActiveFilter('prayer')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'prayer'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Orações
          </button>
          <button
            onClick={() => setActiveFilter('gratitude')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'gratitude'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Gratidão
          </button>
          <button
            onClick={() => setActiveFilter('note')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'note'
                ? 'bg-white dark:bg-slate-800 text-dawn-600 dark:text-dawn-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Anotações
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleExportBackup}
            title="Exportar arquivo JSON de backup"
            className="p-2 bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs font-medium flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <label
            title="Restaurar backup JSON"
            className="p-2 bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">Nenhum registro encontrado nesta categoria.</p>
            <button
              onClick={handleOpenNew}
              className="text-dawn-600 dark:text-dawn-400 text-xs font-bold hover:underline"
            >
              Criar primeira anotação
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEdit(item)}
              className="p-4 rounded-2xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 hover:border-dawn-300 dark:hover:border-dawn-800 transition-all shadow-sm cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      item.type === 'prayer'
                        ? 'bg-dawn-100 text-dawn-700 dark:bg-dawn-950 dark:text-dawn-300'
                        : item.type === 'gratitude'
                        ? 'bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.type === 'prayer' ? 'Oração' : item.type === 'gratitude' ? 'Gratidão' : 'Anotação'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-serif">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Editar Registro' : 'Novo Registro no Diário'}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('prayer')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      formType === 'prayer'
                        ? 'border-dawn-500 bg-dawn-50 text-dawn-700 dark:bg-dawn-950 dark:text-dawn-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Pedido de Oração
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('gratitude')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      formType === 'gratitude'
                        ? 'border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-950 dark:text-gold-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Agradecimento
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('note')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      formType === 'note'
                        ? 'border-slate-500 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Reflexão Geral
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Oração pela minha família, Lição do Salmo 23..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dawn-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Conteúdo
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Escreva seus pensamentos, pedidos ou agradecimentos..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dawn-500 text-slate-900 dark:text-white font-serif leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-dawn-600/30"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
