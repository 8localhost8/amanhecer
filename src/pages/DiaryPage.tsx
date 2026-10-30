import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, ShieldCheck, MessageSquare, X } from 'lucide-react';
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
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
            Diário Pessoal
          </h1>
          <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
            Anotações espirituais e orações salvas unicamente no seu dispositivo
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="py-2.5 px-4 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center space-x-1.5 text-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-sage-50 dark:bg-graphite-800 border border-sage-200/80 dark:border-graphite-700 rounded-3xl p-4 text-xs text-graphite-600 dark:text-graphite-300 flex items-center space-x-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-sage-700 dark:text-sage-300 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-graphite-700 dark:text-graphite-100">Privacidade local:</strong> Suas preces e anotações nunca são transmitidas para a nuvem nem lidas por IA.
        </p>
      </div>

      {/* Filters and Backup Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex bg-sand-100 dark:bg-graphite-850 p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400'
            }`}
          >
            Todos ({entries.length})
          </button>
          <button
            onClick={() => setActiveFilter('prayer')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeFilter === 'prayer'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400'
            }`}
          >
            Orações
          </button>
          <button
            onClick={() => setActiveFilter('gratitude')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeFilter === 'gratitude'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400'
            }`}
          >
            Gratidão
          </button>
          <button
            onClick={() => setActiveFilter('note')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeFilter === 'note'
                ? 'bg-white dark:bg-graphite-800 text-sage-900 dark:text-sage-200 shadow-xs'
                : 'text-graphite-500 hover:text-graphite-800 dark:text-graphite-400'
            }`}
          >
            Anotações
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleExportBackup}
            title="Exportar backup JSON"
            className="py-1.5 px-3 bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-full text-graphite-600 dark:text-graphite-300 hover:text-graphite-900 text-xs font-medium flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <label
            title="Restaurar backup JSON"
            className="py-1.5 px-3 bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-full text-graphite-600 dark:text-graphite-300 hover:text-graphite-900 text-xs font-medium flex items-center space-x-1 cursor-pointer shadow-xs"
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
          <div className="text-center py-16 text-graphite-400 dark:text-graphite-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-sage-600" />
            <p className="text-xs">Nenhum registro encontrado nesta categoria.</p>
            <button
              onClick={handleOpenNew}
              className="text-sage-800 dark:text-sage-300 text-xs font-semibold hover:underline"
            >
              Criar primeira anotação
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEdit(item)}
              className="p-5 rounded-3xl bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 hover:border-sage-400 dark:hover:border-sage-600 transition-all shadow-xs cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'prayer'
                        ? 'bg-sage-100 text-sage-900 dark:bg-sage-900/60 dark:text-sage-200'
                        : item.type === 'gratitude'
                        ? 'bg-sand-200 text-graphite-800 dark:bg-graphite-700 dark:text-sand-300'
                        : 'bg-sand-100 text-graphite-700 dark:bg-graphite-700 dark:text-graphite-200'
                    }`}
                  >
                    {item.type === 'prayer' ? 'Oração' : item.type === 'gratitude' ? 'Gratidão' : 'Anotação'}
                  </span>
                  <span className="text-[11px] text-graphite-400">
                    {item.date}
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-graphite-400 hover:text-rose-600 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold font-serif text-graphite-700 dark:text-graphite-50 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-graphite-600 dark:text-graphite-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3.5 border-b border-sand-100 dark:border-graphite-700">
              <h2 className="text-base font-bold font-serif text-graphite-700 dark:text-graphite-50">
                {editingId ? 'Editar Registro' : 'Novo Registro no Diário'}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 block mb-1">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('prayer')}
                    className={`py-2 px-3 rounded-full text-xs font-semibold border ${
                      formType === 'prayer'
                        ? 'border-sage-600 bg-sage-100 text-sage-900 dark:bg-sage-900/60 dark:text-sage-200'
                        : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                    }`}
                  >
                    Oração
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('gratitude')}
                    className={`py-2 px-3 rounded-full text-xs font-semibold border ${
                      formType === 'gratitude'
                        ? 'border-sand-400 bg-sand-200 text-graphite-900 dark:bg-graphite-700 dark:text-sand-300'
                        : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                    }`}
                  >
                    Gratidão
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('note')}
                    className={`py-2 px-3 rounded-full text-xs font-semibold border ${
                      formType === 'note'
                        ? 'border-graphite-500 bg-sand-100 text-graphite-800 dark:bg-graphite-700 dark:text-graphite-100'
                        : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                    }`}
                  >
                    Reflexão
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 block mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Oração pela minha família..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 text-graphite-700 dark:text-graphite-50"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 block mb-1">
                  Conteúdo
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Escreva seus pensamentos, pedidos ou agradecimentos..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 text-graphite-700 dark:text-graphite-50 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="py-2.5 px-4 rounded-full text-xs font-semibold text-graphite-500 hover:text-graphite-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full text-xs shadow-xs"
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
