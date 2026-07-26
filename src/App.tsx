import React, { useState, useEffect } from 'react';
import { Essay, ReadingPreferences, ViewMode } from './types';
import { getStoredEssays, saveEssays, getStoredPreferences, savePreferences, toggleFavorite, getFavoriteIds } from './utils/storage';
import { getThemeClasses } from './utils/themeHelpers';
import { Header } from './components/Header';
import { ReadingToolbar } from './components/ReadingToolbar';
import { EssayCard } from './components/EssayCard';
import { EssayReader } from './components/EssayReader';
import { UploadModal } from './components/UploadModal';
import { Footer } from './components/Footer';
import { BookOpen, Bookmark, Upload } from 'lucide-react';

export default function App() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [preferences, setPreferences] = useState<ReadingPreferences>(getStoredPreferences());
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  // Load essays on mount
  useEffect(() => {
    refreshEssays();
  }, []);

  const refreshEssays = () => {
    const loaded = getStoredEssays();
    setEssays(loaded);
  };

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update preferences & persist
  const handleUpdatePreferences = (newPrefs: Partial<ReadingPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    savePreferences(updated);
  };

  // Toggle favorite
  const handleToggleFavorite = (essayId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleFavorite(essayId);
    refreshEssays();
  };

  // Save uploaded essay
  const handleUploadEssay = (savedEssay: Essay) => {
    let updatedList = [savedEssay, ...essays];
    saveEssays(updatedList);
    setEssays(updatedList);
    setSelectedEssayId(savedEssay.id);
    setCurrentView('reader');
  };

  const handleSelectEssay = (id: string) => {
    // increment views
    const updatedList = essays.map(e => {
      if (e.id === id) {
        return { ...e, views: (e.views || 0) + 1 };
      }
      return e;
    });
    saveEssays(updatedList);
    setEssays(updatedList);
    setSelectedEssayId(id);
    setCurrentView('reader');
  };

  const favIds = getFavoriteIds();
  const favoriteCount = favIds.length;

  // Filtered essays
  const filteredEssays = essays.filter(essay => {
    // View check for favorites
    if (currentView === 'favorites' && !favIds.includes(essay.id)) return false;

    // Tag check
    if (selectedTag && !essay.tags.includes(selectedTag)) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = essay.title.toLowerCase().includes(q);
      const matchSubtitle = essay.subtitle?.toLowerCase().includes(q);
      const matchContent = essay.content.toLowerCase().includes(q);
      const matchAuthor = essay.author.toLowerCase().includes(q);
      const matchTags = essay.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchContent && !matchAuthor && !matchTags) {
        return false;
      }
    }

    return true;
  });

  const activeEssay = essays.find(e => e.id === selectedEssayId) || essays[0];
  const theme = getThemeClasses(preferences.theme);

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} ${theme.text} transition-colors duration-300 font-["Plus_Jakarta_Sans",sans-serif]`}>
      
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
        }}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        favoriteCount={favoriteCount}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Reading Toolbar when inside EssayReader */}
      {currentView === 'reader' && activeEssay && (
        <ReadingToolbar
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onBack={() => setCurrentView('home')}
          isFavorite={activeEssay.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(activeEssay.id)}
          onShare={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Link do ensaio copiado para a área de transferência!");
            }
          }}
          readingProgress={readingProgress}
          essayTitle={activeEssay.title}
        />
      )}

      {/* VIEW: HOME OR FAVORITES LIST */}
      {(currentView === 'home' || currentView === 'favorites') && (
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16 w-full animate-in fade-in duration-300">
          
          {/* Editorial Banner */}
          {currentView === 'home' && !selectedTag && !searchQuery && (
            <div className="mb-12 sm:mb-16 pb-12 border-b border-current border-opacity-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] block mb-3">
                Espaço de Leitura & Escuta
              </span>
              <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-5xl font-bold leading-[1.2] max-w-3xl tracking-tight mb-4">
                A psique se revela no tempo da palavra pausada.
              </h2>
              <p className="font-['Lora',serif] text-lg sm:text-xl opacity-80 max-w-2xl leading-relaxed italic">
                Ensaios e notas sobre psicanálise, hipervigilância moderna, angústia e a coragem de habitar nosso próprio silêncio sem filtros.
              </p>
            </div>
          )}

          {/* Section Heading */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-['Playfair_Display',serif] text-2xl font-bold">
                {currentView === 'favorites' ? 'Seus Ensaios Favoritos' : selectedTag ? `Ensaios sobre "${selectedTag}"` : searchQuery ? `Resultados para "${searchQuery}"` : 'Ensaios Publicados'}
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Exibindo {filteredEssays.length} {filteredEssays.length === 1 ? 'ensaio' : 'ensaios'}
              </p>
            </div>

            {currentView === 'home' && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${theme.border} ${theme.cardBg} hover:opacity-80 transition-all shadow-sm`}
              >
                <Upload className="w-4 h-4 text-[#8C7A6B]" />
                <span>Subir Texto</span>
              </button>
            )}
          </div>

          {/* Essays Grid */}
          {filteredEssays.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border ${theme.border} ${theme.cardBg} opacity-80 my-8`}>
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h4 className="font-['Playfair_Display',serif] text-xl font-bold mb-2">Nenhum ensaio encontrado</h4>
              <p className="text-sm max-w-md mx-auto opacity-70">
                {currentView === 'favorites'
                  ? 'Você ainda não salvou nenhum ensaio na sua lista de favoritos. Clique no ícone de marcador durante a leitura para adicioná-los.'
                  : 'Nenhum texto corresponde à sua busca ou filtro atual.'}
              </p>
              {(searchQuery || selectedTag) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                  className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold underline decoration-1 underline-offset-4"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              {filteredEssays.map(essay => (
                <EssayCard
                  key={essay.id}
                  essay={essay}
                  preferences={preferences}
                  onSelect={handleSelectEssay}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectTag={setSelectedTag}
                />
              ))}
            </div>
          )}

        </main>
      )}

      {/* VIEW: ESSAY READER */}
      {currentView === 'reader' && activeEssay && (
        <EssayReader
          essay={activeEssay}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onToggleFavorite={() => handleToggleFavorite(activeEssay.id)}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadEssay}
        preferences={preferences}
      />

      {/* Footer */}
      <Footer preferences={preferences} />

    </div>
  );
}
