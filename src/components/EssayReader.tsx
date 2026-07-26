import React, { useState, useEffect } from 'react';
import { Essay, ReadingPreferences, EssayNote } from '../types';
import { getThemeClasses, getTypographyClasses } from '../utils/themeHelpers';
import { getStoredNotes, saveNote, deleteNote } from '../utils/storage';
import ReactMarkdown from 'react-markdown';
import { 
  Bookmark, Share2, Sparkles, MessageSquare, Plus, Trash2, 
  Check, ArrowRight, CornerDownRight, BookOpen, Quote, HelpCircle, Lightbulb
} from 'lucide-react';

interface EssayReaderProps {
  essay: Essay;
  preferences: ReadingPreferences;
  onUpdatePreferences: (prefs: Partial<ReadingPreferences>) => void;
  onToggleFavorite: () => void;
}

export const EssayReader: React.FC<EssayReaderProps> = ({
  essay,
  preferences,
  onUpdatePreferences,
  onToggleFavorite,
}) => {
  const theme = getThemeClasses(preferences.theme);
  const typo = getTypographyClasses(preferences);

  // Local states for interactive features
  const [notes, setNotes] = useState<EssayNote[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Socratic Reflection AI state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'read' | 'notes' | 'socratic'>('read');

  useEffect(() => {
    setNotes(getStoredNotes(essay.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [essay.id]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const added = saveNote({
      essayId: essay.id,
      quote: newQuote.trim(),
      note: newNoteText.trim()
    });
    setNotes([added, ...notes]);
    setNewQuote('');
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAskSocratic = async (promptType: string) => {
    setIsReflecting(true);
    setAiReflection(null);
    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayTitle: essay.title,
          essayExcerpt: essay.excerpt + " " + essay.content.slice(0, 1000),
          questionOrMode: promptType
        })
      });
      const data = await response.json();
      setAiReflection(data.reflection || data.fallback);
    } catch (error) {
      setAiReflection("A verdadeira reflexão nasce do tempo de pausa. Como os temas de perda, limite e escuta deste ensaio dialogam com sua história de vida atual?");
    } finally {
      setIsReflecting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 pb-24`}>
      {/* Main Container */}
      <div className={`mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-16 ${typo.maxWidth} transition-all duration-300`}>
        
        {/* Essay Header */}
        <header className="mb-12 sm:mb-16 border-b border-current border-opacity-15 pb-10">
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {essay.tags.map(tag => (
              <span 
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${theme.pillBg} ${theme.pillText}`}
              >
                {tag}
              </span>
            ))}
            <span className={`text-xs ${theme.textMuted} ml-auto`}>
              {essay.readingTimeMinutes} min de leitura • {essay.date}
            </span>
          </div>

          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] mb-6 tracking-tight">
            {essay.title}
          </h1>

          <p className="font-['Lora',serif] text-lg sm:text-xl md:text-2xl leading-relaxed opacity-85 mb-8 italic">
            {essay.subtitle}
          </p>

          <div className={`flex items-center justify-between text-sm ${theme.textMuted}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5DFD5] dark:bg-[#2C2E30] flex items-center justify-center font-bold text-sm text-[#2C2A29] dark:text-[#E2E0DD] border border-current border-opacity-20">
                MM
              </div>
              <div>
                <p className="font-semibold text-current">{essay.author}</p>
                <p className="text-xs opacity-80">{essay.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.cardBg} ${theme.cardHover} transition-colors`}
                title="Favoritar Ensaio"
              >
                <Bookmark className="w-4 h-4" fill={essay.isFavorite ? "currentColor" : "none"} />
                <span className="hidden sm:inline">{essay.isFavorite ? 'Salvo' : 'Favoritar'}</span>
              </button>

              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.cardBg} ${theme.cardHover} transition-colors`}
                title="Copiar link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab switcher for Reader / Personal Notes / Socratic Dialogue */}
        <div className="flex border-b border-current border-opacity-15 mb-10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'read'
                ? 'border-[#8C7A6B] text-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Texto do Ensaio</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-[#8C7A6B] text-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Minhas Anotações ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('socratic')}
            className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'socratic'
                ? 'border-[#8C7A6B] text-current font-bold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C5832B]" />
            <span>Diálogo Socrático com IA</span>
          </button>
        </div>

        {/* TAB 1: ESSAY CONTENT */}
        {activeTab === 'read' && (
          <main className={`${typo.fontFamily} ${typo.fontSize} ${typo.lineHeight} essay-markdown transition-all duration-300`}>
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold mt-12 mb-6 tracking-tight" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold mt-10 mb-5 pb-2 border-b border-current border-opacity-10 tracking-tight" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-semibold mt-8 mb-4 tracking-tight" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-6 opacity-95 text-justify sm:text-left selection:bg-[#E5DFD5] selection:text-[#1A1817]" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className={`my-8 pl-6 sm:pl-8 border-l-4 border-[#8C7A6B] italic opacity-90 ${theme.cardBg} py-4 pr-6 rounded-r-lg font-["Lora",serif] text-base md:text-lg`} {...props} />
                  ),
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-6 space-y-2 pl-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-6 space-y-2 pl-4" {...props} />,
                  li: ({ node, ...props }) => <li className="opacity-95 leading-relaxed" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-current underline decoration-1 underline-offset-4 decoration-[#8C7A6B]/50" {...props} />,
                }}
              >
                {essay.content}
              </ReactMarkdown>
            </div>

            {/* End of Essay Divider */}
            <div className="my-16 flex items-center justify-center gap-3 opacity-40">
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="w-2 h-2 rounded-full bg-current"></span>
            </div>

            {/* Quick action footer prompt */}
            <div className={`p-8 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col sm:flex-row items-center justify-between gap-6 my-12`}>
              <div>
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold mb-2">
                  Esta leitura gerou alguma reflexão?
                </h3>
                <p className={`text-sm ${theme.textMuted}`}>
                  Anote suas impressões ou inicie um diálogo filosófico e clínico com nosso assistente socrático.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${theme.border} bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                >
                  Criar Anotação
                </button>
                <button
                  onClick={() => setActiveTab('socratic')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${theme.buttonBg} ${theme.buttonText} transition-opacity hover:opacity-90`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dialogar</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* TAB 2: PERSONAL NOTES */}
        {activeTab === 'notes' && (
          <section className="animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-['Playfair_Display',serif] text-2xl font-bold mb-1">
                  Suas Anotações de Leitura
                </h2>
                <p className={`text-sm ${theme.textMuted}`}>
                  Suas reflexões, citações favoritas e insights ficam salvos localmente neste navegador.
                </p>
              </div>
              {!isAddingNote && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${theme.buttonBg} ${theme.buttonText}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Anotação</span>
                </button>
              )}
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} className={`p-6 rounded-xl border ${theme.border} ${theme.cardBg} mb-8 space-y-4`}>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Quote className="w-4 h-4 text-[#8C7A6B]" />
                  Registrar Citação ou Reflexão
                </h3>
                <div>
                  <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${theme.textMuted}`}>
                    Citação do ensaio (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 'O descanso não é o prêmio que recebemos...'"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} text-sm focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]`}
                  />
                </div>
                <div>
                  <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${theme.textMuted}`}>
                    Sua Anotação / Insight *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="O que esse trecho me fez pensar sobre a minha própria relação com o tempo e a cobrança interna..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} text-sm focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]`}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.textMuted} hover:${theme.text}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-lg text-sm font-medium ${theme.buttonBg} ${theme.buttonText}`}
                  >
                    Salvar Anotação
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme.border} ${theme.cardBg} opacity-80`}>
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Você ainda não fez anotações neste ensaio.</p>
                <p className="text-xs opacity-70 mt-1">Clique em "Nova Anotação" para guardar ideias para suas próximas reflexões ou consultas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map(n => (
                  <div key={n.id} className={`p-6 rounded-xl border ${theme.border} ${theme.cardBg} relative group`}>
                    {n.quote && (
                      <blockquote className="border-l-2 border-[#8C7A6B] pl-4 italic text-sm opacity-80 mb-3 font-['Lora',serif]">
                        "{n.quote}"
                      </blockquote>
                    )}
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{n.note}</p>
                    <div className={`mt-4 pt-3 border-t ${theme.border} flex items-center justify-between text-xs ${theme.textMuted}`}>
                      <span>Registrado em {n.createdAt}</span>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="opacity-60 hover:opacity-100 hover:text-red-600 transition-opacity p-1"
                        title="Excluir anotação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: SOCRATIC DIALOGUE WITH AI */}
        {activeTab === 'socratic' && (
          <section className="animate-in fade-in duration-200">
            <div className={`p-8 rounded-2xl border ${theme.border} ${theme.cardBg} mb-8`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#8C7A6B]/20 flex items-center justify-center text-[#8C7A6B]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-['Playfair_Display',serif] text-2xl font-bold">
                    Diálogo Socrático & Reflexão Psicanalítica
                  </h2>
                  <p className={`text-sm ${theme.textMuted}`}>
                    Uma escuta orientada pela IA para aprofundar os conceitos deste ensaio em sua experiência pessoal.
                  </p>
                </div>
              </div>

              {/* Quick Prompt Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                <button
                  onClick={() => handleAskSocratic("Gere uma pergunta provocativa no estilo socrático/junguiano para me fazer refletir profundamente sobre o tema central deste ensaio na minha vida privada.")}
                  disabled={isReflecting}
                  className={`p-4 rounded-xl border ${theme.border} text-left transition-all hover:border-[#8C7A6B] ${theme.inputBg} flex flex-col justify-between gap-2`}
                >
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <HelpCircle className="w-4 h-4 text-[#8C7A6B]" />
                    Pergunta Socrática
                  </span>
                  <span className={`text-xs ${theme.textMuted}`}>
                    Qual questão o ensaio faz eco no silêncio do meu cotidiano?
                  </span>
                </button>

                <button
                  onClick={() => handleAskSocratic("Faça uma síntese analítica conectando as ideias deste texto com a psicanálise de Winnicott, Frankl ou Jung, explicando a importância clínica deste tema.")}
                  disabled={isReflecting}
                  className={`p-4 rounded-xl border ${theme.border} text-left transition-all hover:border-[#8C7A6B] ${theme.inputBg} flex flex-col justify-between gap-2`}
                >
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <Lightbulb className="w-4 h-4 text-[#8C7A6B]" />
                    Conexão Psicanalítica
                  </span>
                  <span className={`text-xs ${theme.textMuted}`}>
                    Como essa teoria se conecta com os grandes pensadores da mente?
                  </span>
                </button>

                <button
                  onClick={() => handleAskSocratic("Como posso praticar no meu dia a dia a desobediência civil contra o imperativo do desempenho e acolher minhas vulnerabilidades? Dê 3 exercícios de auto-escuta.")}
                  disabled={isReflecting}
                  className={`p-4 rounded-xl border ${theme.border} text-left transition-all hover:border-[#8C7A6B] ${theme.inputBg} flex flex-col justify-between gap-2`}
                >
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <CornerDownRight className="w-4 h-4 text-[#8C7A6B]" />
                    Prática de Auto-escuta
                  </span>
                  <span className={`text-xs ${theme.textMuted}`}>
                    Caminhos práticos para abrandar o superego e acolher o silêncio.
                  </span>
                </button>
              </div>

              {/* Custom question input */}
              <div className="mt-6 pt-6 border-t border-current border-opacity-10">
                <label className={`block text-xs uppercase tracking-wider font-semibold mb-2 ${theme.textMuted}`}>
                  Ou faça uma pergunta livre sobre o ensaio para o Assistente Psi:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Como lidar quando o silêncio na terapia gera angústia excessiva?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && aiQuestion.trim()) {
                        handleAskSocratic(aiQuestion);
                        setAiQuestion('');
                      }
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg border ${theme.border} ${theme.inputBg} text-sm focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]`}
                  />
                  <button
                    onClick={() => {
                      if (aiQuestion.trim()) {
                        handleAskSocratic(aiQuestion);
                        setAiQuestion('');
                      }
                    }}
                    disabled={isReflecting || !aiQuestion.trim()}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium ${theme.buttonBg} ${theme.buttonText} disabled:opacity-50 transition-opacity`}
                  >
                    {isReflecting ? 'Refletindo...' : 'Consultar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Reflection Response Area */}
            {isReflecting && (
              <div className={`p-8 rounded-2xl border ${theme.border} ${theme.cardBg} text-center space-y-3 animate-pulse`}>
                <Sparkles className="w-6 h-6 mx-auto text-[#8C7A6B] animate-spin" />
                <p className="font-['Lora',serif] italic text-base">Escutando e tecendo reflexões psicanalíticas...</p>
              </div>
            )}

            {aiReflection && !isReflecting && (
              <div className={`p-8 sm:p-10 rounded-2xl border-2 border-[#8C7A6B]/40 ${theme.cardBg} shadow-sm animate-in fade-in duration-300`}>
                <div className="flex items-center gap-2 mb-4 text-[#8C7A6B] font-semibold text-xs uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>Reflexão do Assistente Socrático</span>
                </div>
                <div className="font-['Lora',serif] text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-wrap">
                  {aiReflection}
                </div>
                <div className="mt-8 pt-4 border-t border-current border-opacity-10 flex justify-end">
                  <button
                    onClick={() => {
                      saveNote({
                        essayId: essay.id,
                        quote: "Insight do Assistente Socrático",
                        note: aiReflection
                      });
                      setActiveTab('notes');
                    }}
                    className={`text-xs font-semibold underline decoration-1 underline-offset-4 hover:opacity-80 transition-opacity`}
                  >
                    + Salvar esta reflexão nas minhas anotações
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
