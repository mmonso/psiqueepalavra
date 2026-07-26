import { Essay, ReadingPreferences, EssayNote } from '../types';
import { INITIAL_ESSAYS } from '../data/initialEssays';

const ESSAYS_KEY = 'psique_blog_essays_v1';
const PREFS_KEY = 'psique_blog_prefs_v1';
const NOTES_KEY = 'psique_blog_notes_v1';
const FAVORITES_KEY = 'psique_blog_favs_v1';

export const DEFAULT_PREFERENCES: ReadingPreferences = {
  theme: 'papiro',
  fontFamily: 'serif',
  fontSize: 'md',
  lineHeight: 'relaxed',
  maxWidth: 'standard',
  focusMode: false,
  bionicReading: false,
};

export function getStoredEssays(): Essay[] {
  try {
    const data = localStorage.getItem(ESSAYS_KEY);
    if (!data) {
      localStorage.setItem(ESSAYS_KEY, JSON.stringify(INITIAL_ESSAYS));
      return INITIAL_ESSAYS;
    }
    const essays: Essay[] = JSON.parse(data);
    const favs = getFavoriteIds();
    return essays.map(e => ({ ...e, isFavorite: favs.includes(e.id) }));
  } catch (error) {
    console.error('Failed to load essays from localStorage:', error);
    return INITIAL_ESSAYS;
  }
}

export function saveEssays(essays: Essay[]): void {
  try {
    localStorage.setItem(ESSAYS_KEY, JSON.stringify(essays));
  } catch (error) {
    console.error('Failed to save essays to localStorage:', error);
  }
}

export function getStoredPreferences(): ReadingPreferences {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    if (!data) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
  } catch (error) {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: ReadingPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function getFavoriteIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(essayId: string): boolean {
  try {
    let favs = getFavoriteIds();
    const isFav = favs.includes(essayId);
    if (isFav) {
      favs = favs.filter(id => id !== essayId);
    } else {
      favs.push(essayId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return !isFav;
  } catch {
    return false;
  }
}

export function getStoredNotes(essayId?: string): EssayNote[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    const notes: EssayNote[] = data ? JSON.parse(data) : [];
    if (essayId) return notes.filter(n => n.essayId === essayId);
    return notes;
  } catch {
    return [];
  }
}

export function saveNote(note: Omit<EssayNote, 'id' | 'createdAt'>): EssayNote {
  const notes = getStoredNotes();
  const newNote: EssayNote = {
    ...note,
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  };
  notes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return newNote;
}

export function deleteNote(id: string): void {
  const notes = getStoredNotes().filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function exportBlogDataAsJSON(): void {
  const data = {
    essays: getStoredEssays(),
    preferences: getStoredPreferences(),
    notes: getStoredNotes(),
    favorites: getFavoriteIds(),
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_ensaios_psicologia_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBlogDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.essays)) {
      localStorage.setItem(ESSAYS_KEY, JSON.stringify(data.essays));
      if (data.preferences) localStorage.setItem(PREFS_KEY, JSON.stringify(data.preferences));
      if (data.notes) localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes));
      if (data.favorites) localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}
