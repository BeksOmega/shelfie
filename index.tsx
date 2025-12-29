import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Book as BookIcon, 
  Plus, 
  Video,
  Search, 
  X, 
  Loader2,
  Trash2, 
  Download,
  Upload,
  Settings,
  Calendar, 
  MessageSquare, 
  Layout, 
  History, 
  Trophy,
  Target,
  ChevronRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Edit3
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

interface UserConfig {
  goal2026: number;
  theme: string;
}

// --- Constants ---
const TIERS: { id: TierId; label: string; color: string }[] = [
  { id: 'TBR', label: 'TBR', color: '#64748b' },
  { id: 'GOD', label: 'God Tier', color: '#f59e0b' },
  { id: 'A', label: 'A', color: '#10b981' },
  { id: 'B', label: 'B', color: '#3b82f6' },
  { id: 'C', label: 'C', color: '#8b5cf6' },
  { id: 'DNF', label: 'DNF', color: '#ef4444' },
];

// --- Components ---

const DataManagerModal: React.FC<{ 
  books: Book[]; 
  onImport: (books: Book[]) => void; 
  onClose: () => void;
  goal: number;
  setGoal: (g: number) => void;
}> = ({ books, onImport, onClose, goal, setGoal }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const dataStr = JSON.stringify({ books, goal, version: '2026.1' }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shelfie_2026_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.books)) {
          onImport(json.books);
          if (json.goal) setGoal(json.goal);
          alert('Import Successful!');
          onClose();
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5" /> 2026 Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
            <label className="text-xs font-bold uppercase text-blue-600 flex items-center gap-2"><Target className="w-4 h-4"/> 2026 Reading Goal</label>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                value={goal} 
                onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                className="w-24 p-2 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none font-bold text-center"
              />
              <span className="text-sm text-blue-800 font-medium">Books for the year</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={exportData} className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl hover:border-gray-400 transition-colors">
              <Download className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-bold">Export Backup</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl hover:border-gray-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-bold">Import Backup</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
        </div>
        
        <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">Always backup your data before 2026 ends!</p>
      </div>
    </div>
  );
};

const SearchPanel: React.FC<{ onClose: () => void; onAdd: (book: any) => void }> = ({ onClose, onAdd }) => {
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
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1543004471-240ce49a0027?q=80&w=200&h=300&auto=format&fit=crop',
      }));
      setResults(formatted);
    } catch (error) { console.error('Search error', error); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Add to 2026 Collection</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSearch} className="p-6 bg-gray-50 border-b">
          <div className="relative">
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500"
              placeholder="Search by Title, Author, or ISBN..."
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
            </button>
          </div>
        </form>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.map(book => (
            <div key={book.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
              <img src={book.coverUrl} className="w-12 h-18 object-cover rounded-lg shadow-sm" />
              <div className="flex-1">
                <h3 className="font-bold text-sm leading-tight">{book.title}</h3>
                <p className="text-xs text-gray-500">{book.author}</p>
              </div>
              <button onClick={() => onAdd(book)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookModal: React.FC<{ book: Book; onClose: () => void; onSave: (b: Book) => void; onDelete: (id: string) => void }> = ({ book, onClose, onSave, onDelete }) => {
  const [edited, setEdited] = useState<Book>({ ...book });

  const addSession = () => {
    const s: ReadingSession = { id: Math.random().toString(36).substr(2, 9), startDate: new Date().toISOString().split('T')[0], endDate: '', format: 'Physical Book' };
    setEdited(prev => ({ ...prev, sessions: [...prev.sessions, s] }));
  };

  const currentTier = TIERS.find(t => t.id === edited.tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-widest" style={{ backgroundColor: currentTier?.color }}>
              {currentTier?.label}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">2026 Archive Entry</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.confirm('Delete?') && onDelete(book.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-80 space-y-6">
            <img src={edited.coverUrl} className="w-full aspect-[2/3] object-cover rounded-3xl shadow-2xl ring-8 ring-gray-50" />
            <div className="space-y-2">
              <input value={edited.title} onChange={e => setEdited(p => ({ ...p, title: e.target.value }))} className="text-2xl font-black w-full outline-none focus:text-indigo-600 transition-colors" />
              <input value={edited.author} onChange={e => setEdited(p => ({ ...p, author: e.target.value }))} className="text-gray-500 w-full outline-none font-medium" />
            </div>
            <div className="pt-6 border-t grid grid-cols-2 gap-2">
              {TIERS.map(t => (
                <button 
                  key={t.id} onClick={() => setEdited(p => ({ ...p, tier: t.id }))}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${edited.tier === t.id ? 'text-white border-transparent' : 'text-gray-400 border-gray-100 hover:border-gray-200'}`}
                  style={{ backgroundColor: edited.tier === t.id ? t.color : '' }}
                >{t.label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><History className="w-4 h-4" /> 2026 Reading Log</h3>
              <button onClick={addSession} className="px-4 py-2 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase shadow-lg hover:bg-gray-800">New Session</button>
            </div>
            <div className="space-y-3">
              {edited.sessions.map(s => (
                <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30">
                  <div className="flex-1 flex gap-2">
                    <input type="date" value={s.startDate} className="text-xs p-2 rounded-lg border bg-white" onChange={e => setEdited(p => ({ ...p, sessions: p.sessions.map(ss => ss.id === s.id ? { ...ss, startDate: e.target.value } : ss) }))} />
                    <span className="text-gray-300">→</span>
                    <input type="date" value={s.endDate} className="text-xs p-2 rounded-lg border bg-white" onChange={e => setEdited(p => ({ ...p, sessions: p.sessions.map(ss => ss.id === s.id ? { ...ss, endDate: e.target.value } : ss) }))} />
                  </div>
                  <button onClick={() => setEdited(p => ({ ...p, sessions: p.sessions.filter(ss => ss.id !== s.id) }))} className="text-gray-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {edited.sessions.length === 0 && <p className="text-center py-6 text-gray-300 italic text-sm">No sessions logged for 2026 yet.</p>}
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Book Reflections</label>
              <textarea 
                value={edited.comments} onChange={e => setEdited(p => ({ ...p, comments: e.target.value }))}
                className="w-full h-40 p-6 rounded-3xl bg-gray-50 outline-none focus:ring-4 ring-indigo-50 border-2 border-transparent focus:border-indigo-100 transition-all text-gray-700"
                placeholder="Write your thoughts..."
              />
            </div>
          </div>
        </div>
        <div className="p-8 border-t bg-gray-50/80 flex justify-end gap-4">
          <button onClick={onClose} className="font-bold text-gray-400">Cancel</button>
          <button onClick={() => onSave(edited)} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all">Update Log</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [goal, setGoal] = useState(12);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const savedBooks = localStorage.getItem('shelfie_2026_books');
    const savedGoal = localStorage.getItem('shelfie_2026_goal');
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedGoal) setGoal(parseInt(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem('shelfie_2026_books', JSON.stringify(books));
    localStorage.setItem('shelfie_2026_goal', goal.toString());
  }, [books, goal]);

  const readCount = useMemo(() => books.filter(b => ['GOD', 'A', 'B', 'C'].includes(b.tier)).length, [books]);
  const progressPercent = Math.min(Math.round((readCount / goal) * 100), 100);

  const moveBook = (id: string, tier: TierId) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, tier } : b));
    setDraggedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="sticky top-0 z-40 p-6 glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <BookIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">SHELFIE <span className="text-indigo-600">2026</span></h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ultimate Reading Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-tighter">Yearly Goal Progress</span>
                <span className="font-black text-xl text-indigo-600">{readCount} / {goal} <span className="text-gray-300 text-sm ml-1">Books</span></span>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#4f46e5" strokeWidth="6" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{progressPercent}%</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"><Settings className="w-6 h-6" /></button>
              <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"><Plus className="w-5 h-5" /> New Book</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 mt-4">
        {TIERS.map(tier => (
          <div 
            key={tier.id}
            onDragOver={e => e.preventDefault()}
            onDrop={() => draggedId && moveBook(draggedId, tier.id)}
            className="tier-card rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row"
          >
            <div className="md:w-40 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: `${tier.color}08` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: tier.color }}>
                <span className="text-white font-black text-lg">{tier.label.charAt(0)}</span>
              </div>
              <h2 className="font-black text-xs uppercase tracking-widest text-slate-800 mb-1">{tier.label}</h2>
              <span className="text-[10px] font-bold text-slate-400">{books.filter(b => b.tier === tier.id).length} Books</span>
            </div>
            <div className="flex-1 p-8 flex flex-wrap gap-6 min-h-[220px]">
              {books.filter(b => b.tier === tier.id).map(book => (
                <div 
                  key={book.id} draggable onDragStart={() => setDraggedId(book.id)} 
                  onClick={() => setSelectedBook(book)}
                  className={`w-28 sm:w-36 cursor-pointer group book-hover transition-all ${draggedId === book.id ? 'opacity-30' : ''}`}
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg mb-3">
                    <img src={book.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-[10px] font-black uppercase flex items-center gap-2">View Log <ChevronRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[11px] leading-tight truncate px-1">{book.title}</h3>
                  <p className="text-[10px] text-gray-400 font-medium px-1 truncate">{book.author}</p>
                </div>
              ))}
              {books.filter(b => b.tier === tier.id).length === 0 && (
                <div className="w-full flex items-center justify-center text-slate-200 italic font-black text-xl uppercase tracking-tighter opacity-50">Empty Shelf</div>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-slate-200 mt-20 opacity-30">
        <p className="font-black text-xs uppercase tracking-[0.3em]">Built for the 2026 Reading Odyssey</p>
      </footer>

      {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} onAdd={b => { setBooks(p => [...p, { ...b, id: Math.random().toString(36).substr(2, 9), tier: 'TBR', sessions: [], comments: '', dnfProgress: 0 }]); setIsSearchOpen(false); }} />}
      {isSettingsOpen && <DataManagerModal goal={goal} setGoal={setGoal} books={books} onImport={setBooks} onClose={() => setIsSettingsOpen(false)} />}
      {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} onDelete={id => { setBooks(p => p.filter(b => b.id !== id)); setSelectedBook(null); }} onSave={b => { setBooks(p => p.map(bb => bb.id === b.id ? b : bb)); setSelectedBook(null); }} />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
