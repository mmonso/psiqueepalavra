import React, { useState, useRef } from 'react';
import { Essay, ReadingPreferences } from '../types';
import { getThemeClasses } from '../utils/themeHelpers';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (essay: Essay) => void;
  preferences: ReadingPreferences;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  preferences,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [tagsInput, setTagsInput] = useState('Psicanálise, Ensaio');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = getThemeClasses(preferences.theme);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setError('Por favor, selecione um arquivo de texto (.md ou .txt).');
      return;
    }
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setFileContent(content);

      // Try to auto-detect title from first line if it starts with #
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.startsWith('# ')) {
          setTitleInput(firstLine.replace(/^#\s+/, ''));
        } else {
          // Use filename without extension
          setTitleInput(file.name.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' '));
        }
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo. Tente novamente.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePublish = () => {
    if (!fileContent.trim()) {
      setError('O conteúdo do texto não pode estar vazio. Suba um arquivo ou cole seu texto.');
      return;
    }

    const finalTitle = titleInput.trim() || 'Ensaio sem título';
    const slug = finalTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Estimate reading time
    const words = fileContent.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Excerpt from first paragraph
    const paragraphs = fileContent
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => !p.startsWith('#') && p.length > 20);
    const excerpt = paragraphs[0] 
      ? (paragraphs[0].length > 160 ? paragraphs[0].substring(0, 160) + '...' : paragraphs[0])
      : finalTitle;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newEssay: Essay = {
      id: `essay-${Date.now()}`,
      title: finalTitle,
      subtitle: '',
      slug,
      content: fileContent,
      excerpt,
      author: 'Marcelo Monso',
      authorRole: 'Psicólogo & Psicanalista',
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      readingTimeMinutes: readingTime,
      tags: parsedTags.length > 0 ? parsedTags : ['Psicanálise'],
      status: 'published',
      views: 0,
      likes: 0,
    };

    onUpload(newEssay);
    onClose();
    setFileName(null);
    setFileContent('');
    setTitleInput('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-xl rounded-2xl border ${theme.border} ${theme.bg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#8C7A6B]" />
            <h3 className={`font-["Playfair_Display",serif] text-lg font-bold ${theme.text}`}>
              Subir Texto para o Site
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.text} hover:${theme.cardBg} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className={`text-sm ${theme.textMuted}`}>
            Arraste um arquivo de texto (<code className="font-semibold">.md</code> ou <code className="font-semibold">.txt</code>) do seu computador ou clique abaixo para selecionar. O site irá formatar e publicar o ensaio automaticamente.
          </p>

          {/* Drag and Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#8C7A6B] bg-[#8C7A6B]/10 scale-[1.02]'
                : `${theme.border} ${theme.cardBg} hover:border-[#8C7A6B]/50`
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {fileName ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#8C7A6B]/20 flex items-center justify-center text-[#8C7A6B]">
                  <FileText className="w-6 h-6" />
                </div>
                <p className={`font-semibold text-sm ${theme.text}`}>Arquivo carregado: {fileName}</p>
                <p className={`text-xs ${theme.textMuted}`}>Clique ou arraste outro para substituir</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full border ${theme.border} flex items-center justify-center ${theme.textMuted}`}>
                  <Upload className="w-6 h-6" />
                </div>
                <p className={`font-medium text-sm ${theme.text}`}>
                  Clique para selecionar ou arraste seu arquivo .MD / .TXT
                </p>
                <p className={`text-xs ${theme.textMuted}`}>
                  Também é possível colar o conteúdo diretamente abaixo, se preferir.
                </p>
              </div>
            )}
          </div>

          {/* Optional Title override */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Título do Ensaio
            </label>
            <input
              type="text"
              placeholder="Ex: O silêncio na escuta analítica..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${theme.border} ${theme.inputBg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]`}
            />
          </div>

          {/* Optional Tags override */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Temas / Categorias (separados por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: Psicanálise, Angústia, Clínica"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${theme.border} ${theme.inputBg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]`}
            />
          </div>

          {/* Textarea fallback/preview */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Conteúdo do Texto
            </label>
            <textarea
              rows={6}
              placeholder="O texto do seu arquivo aparecerá aqui (ou você pode digitar/colar diretamente)..."
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-['Lora',serif] border ${theme.border} ${theme.inputBg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] resize-y`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${theme.border} flex items-center justify-end gap-3 bg-opacity-50`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${theme.textMuted} hover:${theme.text} transition-colors`}
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            disabled={!fileContent.trim()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              fileContent.trim()
                ? `${theme.buttonBg} ${theme.buttonText} hover:opacity-90 shadow-md`
                : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Publicar no Site</span>
          </button>
        </div>

      </div>
    </div>
  );
};
