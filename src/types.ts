export type ReadingTheme = 'papiro' | 'creme' | 'alba' | 'noturno';
export type FontFamily = 'serif' | 'sans' | 'display';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type LineHeight = 'normal' | 'relaxed' | 'loose';
export type MaxWidth = 'compact' | 'standard' | 'wide';

export interface ReadingPreferences {
  theme: ReadingTheme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineHeight: LineHeight;
  maxWidth: MaxWidth;
  focusMode: boolean;
  bionicReading?: boolean;
}

export interface EssayNote {
  id: string;
  essayId: string;
  quote: string;
  note: string;
  createdAt: string;
}

export interface Essay {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readingTimeMinutes: number;
  tags: string[];
  status: 'published' | 'draft';
  views?: number;
  likes?: number;
  isFavorite?: boolean;
}

export type ViewMode = 'home' | 'reader' | 'favorites';
