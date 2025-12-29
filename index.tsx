import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Book as BookIcon, 
  Settings, 
  Plus, 
  Video,
  Search, 
  X, 
  Loader2,
  Trash2, 
  Calendar, 
  MessageSquare, 
  Percent, 
  Layout, 
  History, 
  Headphones, 
  Tablet,
  Check,
  Edit2,
  Palette, 
  Pipette,
  Upload, 
  Sparkles, 
  Play, 
  ExternalLink, 
  RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---
type TierId = 'TBR' | 'GOD' | 'A' | 'B' | 'C' | 'DNF';
type BookFormat = 'Audiobook' | 'Physical Book' | 'E-reader';

interface ReadingSession {
  id: string;
  startDate: string;
  endDate: string;
  format: BookFormat;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  tier: TierId;
  sessions: ReadingSession[];
  comments: string;
  dnfProgress: number;
}

interface ThemeColors {
  TBR: string;
  GOD: string;
  A: string;
  B: string;
  C: string;
  DNF: string;
  background: string;
  accent: string;
  text: string;
}

type ThemePreset = 'Dark Academia' | 'Cyberpunk' | 'Pastel Dream' | 'Custom';

// --- Constants ---
const TIERS: { id: TierId; label: string }[] = [
  { id: 'TBR', label: 'TBR' },
  { id: 'GOD', label: 'God Tier' },
  { id: 'A', label: 'A Tier' },
  { id: 'B', label: 'B Tier' },
  { id: 'C', label: 'C Tier' },
  { id: 'DNF', label: 'DNF' },
];

const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  'Dark Academia': {
    TBR: '#5D4037',
    GOD: '#2C3E50',
    A: '#1B4332',
    B: '#7A6B5D',
    C: '#8D7B68',
    DNF: '#3E2723',
    background: '#FDFCF0',
    accent: '#4B3621',
    text: '#2C1B0E',
  },
  'Cyberpunk': {
    TBR: '#1a1a2e',
    GOD: '#ff0055',
    A: '#00d4ff',
    B: '#9d00ff',
    C: '#00ff9f',
    DNF: '#393e46',
    background: '#0d0221',
    accent: '#ff0055',
    text: '#ffffff',
  },
  'Pastel Dream': {
    TBR: '#B8E1FF',
    GOD: '#FFB7B2',
    A: '#FFDAC1',
    B: '#E2F0CB',
    C: '#B5EAD7',
    DNF: '#C5A3FF',
    background: '#FFF9F9',
    accent: '#FFB7B2',
    text: '#4A4A4A',
  },
  'Custom': {
    TBR: '#cbd5e1',
    GOD: '#fde047',
    A: '#86efac',
    B: '#93c5fd',
    C: '#f9a8d4',
    DNF: '#fca5a5',
    background: '#ffffff',
    accent: '#3b82f6',
    text: '#1f2937',
  },
};

// --- Components ---

const SearchPanel: React.FC<{ 
  onClose: () => void; 
  onAdd: (book: any) => void; 
  accentColor: string 
}> = ({ onClose, onAdd, accentColor }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      const formatted = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      }));
      setResults(formatted);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Expand Library</h2>
            <p className="text-xs text-gray-400 font-bold uppercase">Google Books Search</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X /></button>
        </div>
        <form onSubmit={handleSearch} className="p-6">
          <div className="relative">
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none"
              style={{ borderColor: `${accentColor}44` }}
              placeholder="Title, author..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl text-white font-bold" style={{ backgroundColor: accentColor }}>
              {loading ? <Loader2 className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {results.map(book => (
            <div key={book.id} className="flex items-center gap-4 p-4 rounded-2xl border hover:bg-gray-50">
              <img src={book.coverUrl || 'https://picsum.photos/60/90'} className="w-16 h-24 object-cover rounded-lg shadow" />
              <div className="flex-1">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
              </div>
              <button onClick={() => onAdd(book)} className="p-3 rounded-xl text-white" style={{ backgroundColor: accentColor }}><Plus /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookModal: React.FC<{
  book: Book;
  onClose: () => void;
  onSave: (book: Book) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}> = ({ book, onClose, onSave, onDelete, accentColor }) => {
  const [edited, setEdited] = useState<Book>({ ...book });
  
  const addSession = () => {
    const sess: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      format: 'Physical Book',
    };
    setEdited(prev => ({ ...prev, sessions: [...prev.sessions, sess] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase" style={{ backgroundColor: accentColor }}>{edited.tier}</span>
            <h2 className="text-gray-400 font-bold uppercase text-xs">Book Ledger</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.confirm('Delete?') && onDelete(book.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 /></button>
            <button onClick={onClose} className="p-2"><X /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-72 space-y-4">
            <img src={book.coverUrl} className="w-full rounded-2xl shadow-xl border-4 border-white" />
            <input 
              value={edited.title} onChange={e => setEdited(p => ({ ...p, title: e.target.value }))}
              className="text-xl font-black w-full outline-none"
            />
            <input 
              value={edited.author} onChange={e => setEdited(p => ({ ...p, author: e.target.value }))}
              className="text-gray-500 w-full outline-none"
            />
            <div className="grid grid-cols-2 gap-2 pt-4">
              {TIERS.map(t => (
                <button 
                  key={t.id} onClick={() => setEdited(p => ({ ...p, tier: t.id }))}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase border-2 ${edited.tier === t.id ? 'text-white' : 'text-gray-400'}`}
                  style={{ backgroundColor: edited.tier === t.id ? accentColor : '', borderColor: edited.tier === t.id ? accentColor : '#f3f4f6' }}
                >{t.label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><History className="w-4 h-4" /> Reading History</h3>
              <button onClick={addSession} className="px-4 py-2 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: accentColor }}>Add Session</button>
            </div>
            {edited.sessions.map(s => (
              <div key={s.id} className="p-4 border-2 rounded-2xl flex gap-4 items-center">
                <input type="date" value={s.startDate} className="text-xs border rounded p-1" onChange={e => setEdited(p => ({ ...p, sessions: p.sessions.map(ss => ss.id === s.id ? { ...ss, startDate: e.target.value } : ss) }))} />
                <input type="date" value={s.endDate} className="text-xs border rounded p-1" onChange={e => setEdited(p => ({ ...p, sessions: p.sessions.map(ss => ss.id === s.id ? { ...ss, endDate: e.target.value } : ss) }))} />
                <button onClick={() => setEdited(p => ({ ...p, sessions: p.sessions.filter(ss => ss.id !== s.id) }))}><X className="w-4 h-4 text-gray-300" /></button>
              </div>
            ))}
            {edited.tier === 'DNF' && (
              <div className="p-4 bg-red-50 rounded-2xl space-y-2">
                <div className="flex justify-between font-bold text-red-500 text-xs uppercase"><span>Progress</span><span>{edited.dnfProgress}%</span></div>
                <input type="range" className="w-full accent-red-500" value={edited.dnfProgress} onChange={e => setEdited(p => ({ ...p, dnfProgress: parseInt(e.target.value) }))} />
              </div>
            )}
            <textarea 
              className="w-full h-40 p-4 bg-gray-50 rounded-2xl outline-none" 
              placeholder="Notes..."
              value={edited.comments} onChange={e => setEdited(p => ({ ...p, comments: e.target.value }))}
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4 bg-gray-50">
          <button onClick={onClose} className="font-bold text-gray-400">Discard</button>
          <button onClick={() => onSave(edited)} className="px-8 py-3 rounded-xl text-white font-bold" style={{ backgroundColor: accentColor }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('Dark Academia');
  const [customColors, setCustomColors] = useState<ThemeColors>(THEME_PRESETS['Dark Academia']);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shelfie_books');
    if (saved) setBooks(JSON.parse(saved));
    const theme = localStorage.getItem('shelfie_theme');
    if (theme) setActiveTheme(theme as ThemePreset);
  }, []);

  useEffect(() => {
    localStorage.setItem('shelfie_books', JSON.stringify(books));
    localStorage.setItem('shelfie_theme', activeTheme);
  }, [books, activeTheme]);

  const currentColors = useMemo(() => activeTheme === 'Custom' ? customColors : THEME_PRESETS[activeTheme], [activeTheme, customColors]);

  const totalRead = useMemo(() => books.reduce((acc, b) => {
    if (['GOD', 'A', 'B', 'C'].includes(b.tier)) return acc + 1;
    if (b.tier === 'DNF' && b.dnfProgress > 80) return acc + 1;
    return acc;
  }, 0), [books]);

  const moveBook = (id: string, tier: TierId) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, tier } : b));
  };

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      <header className="sticky top-0 z-40 p-4 border-b flex justify-between items-center backdrop-blur-md" style={{ backgroundColor: `${currentColors.background}EE`, borderColor: `${currentColors.accent}22` }}>
        <div className="flex items-center gap-2">
          <BookIcon style={{ color: currentColors.accent }} />
          <h1 className="text-xl font-black">Shelfie</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center"><span className="text-[10px] uppercase font-bold opacity-50 block">Read</span><span className="font-black text-xl">{totalRead}</span></div>
          <button onClick={() => setIsSearchOpen(true)} className="p-3 rounded-full text-white shadow-lg" style={{ backgroundColor: currentColors.accent }}><Plus /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {TIERS.map(tier => (
          <div 
            key={tier.id} 
            onDragOver={e => e.preventDefault()} 
            onDrop={() => draggedId && moveBook(draggedId, tier.id)}
            className="flex flex-col md:flex-row min-h-[160px] rounded-3xl border-2 overflow-hidden"
            style={{ borderColor: `${currentColors[tier.id]}33`, backgroundColor: `${currentColors[tier.id]}08` }}
          >
            <div className="md:w-32 flex flex-col items-center justify-center p-4 text-white font-black" style={{ backgroundColor: currentColors[tier.id] }}>
              <span className="text-xs uppercase tracking-widest">{tier.label}</span>
              <div className="text-xs mt-2 opacity-50">{books.filter(b => b.tier === tier.id).length}</div>
            </div>
            <div className="flex-1 p-6 flex flex-wrap gap-4">
              {books.filter(b => b.tier === tier.id).map(book => (
                <div 
                  key={book.id} draggable onDragStart={() => setDraggedId(book.id)} 
                  onClick={() => setSelectedBook(book)}
                  className="w-24 group cursor-pointer"
                >
                  <img src={book.coverUrl} className="w-full aspect-[2/3] object-cover rounded shadow-lg transition-transform group-hover:scale-105" />
                  <p className="text-[10px] font-bold mt-1 truncate uppercase text-center opacity-70">{book.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {isSearchOpen && (
        <SearchPanel 
          accentColor={currentColors.accent} 
          onClose={() => setIsSearchOpen(false)} 
          onAdd={b => {
            const nb: Book = { ...b, id: Math.random().toString(36).substr(2, 9), tier: 'TBR', sessions: [], comments: '', dnfProgress: 0 };
            setBooks(p => [...p, nb]);
            setIsSearchOpen(false);
          }}
        />
      )}

      {selectedBook && (
        <BookModal 
          book={selectedBook} accentColor={currentColors.accent}
          onClose={() => setSelectedBook(null)}
          onDelete={id => { setBooks(p => p.filter(b => b.id !== id)); setSelectedBook(null); }}
          onSave={b => { setBooks(p => p.map(bb => bb.id === b.id ? b : bb)); setSelectedBook(null); }}
        />
      )}
    </div>
  );
};

// --- Initial Render ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
