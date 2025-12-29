
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Book as BookIcon, 
  Settings, 
  Plus, 
  Video
} from 'lucide-react';
import { TIERS, THEME_PRESETS } from './constants';
import { Book, TierId, ThemePreset, ThemeColors } from './types';
import SearchPanel from './components/SearchPanel';
import BookModal from './components/BookModal';
import ThemeManager from './components/ThemeManager';
import VeoAnimator from './components/VeoAnimator';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('Dark Academia');
  const [customColors, setCustomColors] = useState<ThemeColors>(THEME_PRESETS['Dark Academia']);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isVeoOpen, setIsVeoOpen] = useState(false);
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<TierId | null>(null);
  const [dragOverBookId, setDragOverBookId] = useState<string | null>(null);

  // Persistence & Migration
  useEffect(() => {
    const savedBooks = localStorage.getItem('biblio_books');
    const savedTheme = localStorage.getItem('biblio_theme');
    const savedColors = localStorage.getItem('biblio_colors');
    
    if (savedBooks) {
      const parsed: any[] = JSON.parse(savedBooks);
      const migrated = parsed.map(b => {
        if (!b.sessions) {
          return {
            ...b,
            sessions: b.dateStarted || b.dateFinished ? [{
              id: Math.random().toString(36).substr(2, 9),
              startDate: b.dateStarted || '',
              endDate: b.dateFinished || '',
              format: b.format || 'Physical Book'
            }] : []
          };
        }
        return b;
      });
      setBooks(migrated);
    }
    if (savedTheme) setActiveTheme(savedTheme as ThemePreset);
    if (savedColors) setCustomColors(JSON.parse(savedColors));
  }, []);

  useEffect(() => {
    localStorage.setItem('biblio_books', JSON.stringify(books));
    localStorage.setItem('biblio_theme', activeTheme);
    localStorage.setItem('biblio_colors', JSON.stringify(customColors));
  }, [books, activeTheme, customColors]);

  const currentColors = useMemo(() => {
    return activeTheme === 'Custom' ? customColors : THEME_PRESETS[activeTheme];
  }, [activeTheme, customColors]);

  const addBook = useCallback((newBook: Omit<Book, 'id' | 'tier' | 'sessions' | 'comments' | 'dnfProgress'>) => {
    const book: Book = {
      ...newBook,
      id: Math.random().toString(36).substr(2, 9),
      tier: 'TBR',
      sessions: [],
      comments: '',
      dnfProgress: 0,
    };
    setBooks(prev => [...prev, book]);
    setIsSearchOpen(false);
  }, []);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setSelectedBook(null);
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    setSelectedBook(null);
  }, []);

  const totalBooksRead = useMemo(() => {
    return books.reduce((acc, book) => {
      if (['GOD', 'A', 'B', 'C'].includes(book.tier)) return acc + 1;
      if (book.tier === 'DNF' && book.dnfProgress > 80) return acc + 1;
      return acc;
    }, 0);
  }, [books]);

  const booksByTier = useMemo(() => {
    const map: Record<TierId, Book[]> = {
      TBR: [], GOD: [], A: [], B: [], C: [], DNF: []
    };
    books.forEach(b => map[b.tier].push(b));
    return map;
  }, [books]);

  const moveAndReorderBook = (draggedId: string, targetTier: TierId, targetBookId: string | null = null) => {
    setBooks(prev => {
      const newBooks = [...prev];
      const draggedIndex = newBooks.findIndex(b => b.id === draggedId);
      if (draggedIndex === -1) return prev;
      
      const [draggedBook] = newBooks.splice(draggedIndex, 1);
      draggedBook.tier = targetTier;

      if (targetBookId) {
        const targetIndex = newBooks.findIndex(b => b.id === targetBookId);
        newBooks.splice(targetIndex, 0, draggedBook);
      } else {
        newBooks.push(draggedBook);
      }
      return newBooks;
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedBookId(id);
  };

  const handleDragOverTier = (e: React.DragEvent, tierId: TierId) => {
    e.preventDefault();
    setDragOverTier(tierId);
  };

  const handleDragOverBook = (e: React.DragEvent, bookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverBookId(bookId);
  };

  const handleDropOnTier = (e: React.DragEvent, tierId: TierId) => {
    e.preventDefault();
    if (draggedBookId) {
      moveAndReorderBook(draggedBookId, tierId, null);
    }
    resetDragState();
  };

  const handleDropOnBook = (e: React.DragEvent, targetBookId: string, tierId: TierId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBookId && draggedBookId !== targetBookId) {
      moveAndReorderBook(draggedBookId, tierId, targetBookId);
    }
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedBookId(null);
    setDragOverTier(null);
    setDragOverBookId(null);
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-500 pb-20"
      style={{ backgroundColor: currentColors.background, color: currentColors.text }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 shadow-md p-4 backdrop-blur-md flex items-center justify-between border-b" 
              style={{ backgroundColor: `${currentColors.background}CC`, borderColor: `${currentColors.accent}33` }}>
        <div className="flex items-center gap-3">
          <BookIcon className="w-8 h-8" style={{ color: currentColors.accent }} />
          <h1 className="text-2xl font-bold tracking-tight">Shelfie</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="block text-xs uppercase font-semibold opacity-70">Total Read</span>
            <span className="text-2xl font-black" style={{ color: currentColors.accent }}>{totalBooksRead}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsVeoOpen(true)}
              className="p-2 rounded-full transition-transform hover:scale-110 active:scale-95 border"
              style={{ borderColor: currentColors.accent, color: currentColors.accent }}
              title="Animate Cover (AI)"
            >
              <Video className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsThemeOpen(true)}
              className="p-2 rounded-full transition-transform hover:scale-110 active:scale-95 border"
              style={{ borderColor: currentColors.accent, color: currentColors.accent }}
              title="Theme Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: currentColors.accent }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {TIERS.map(tier => (
          <div 
            key={tier.id}
            onDragOver={(e) => handleDragOverTier(e, tier.id)}
            onDragLeave={() => setDragOverTier(null)}
            onDrop={(e) => handleDropOnTier(e, tier.id)}
            className={`flex flex-col sm:flex-row min-h-[160px] rounded-xl overflow-hidden shadow-sm border-2 transition-all ${dragOverTier === tier.id ? 'scale-[1.01] border-dashed ring-4 ring-offset-2' : 'border-transparent'}`}
            // Fixed: Replaced 'ringColor' (invalid CSS) with CSS variable '--tw-ring-color' to work with Tailwind's ring utility
            style={{ 
              backgroundColor: `${currentColors[tier.id]}11`, 
              borderColor: dragOverTier === tier.id ? currentColors[tier.id] : `${currentColors[tier.id]}44`,
              ['--tw-ring-color' as any]: `${currentColors[tier.id]}33`
            }}
          >
            {/* Tier Label - 100% Opaque and High Contrast */}
            <div 
              className="sm:w-36 flex flex-col items-center justify-center p-6 text-white font-black text-center shadow-lg z-10"
              style={{ backgroundColor: currentColors[tier.id], opacity: 1 }}
            >
              <span className="text-xl leading-tight uppercase tracking-widest drop-shadow-md">{tier.label}</span>
              <div className="mt-3 px-3 py-1 rounded-full bg-black/30 text-xs font-bold backdrop-blur-sm">
                {booksByTier[tier.id].length}
              </div>
            </div>

            {/* Books Container */}
            <div className="flex-1 p-6 flex flex-wrap gap-6 items-start content-start min-h-[140px]">
              {booksByTier[tier.id].map(book => (
                <div 
                  key={book.id} 
                  draggable
                  onDragStart={() => handleDragStart(book.id)}
                  onDragOver={(e) => handleDragOverBook(e, book.id)}
                  onDragLeave={() => setDragOverBookId(null)}
                  onDrop={(e) => handleDropOnBook(e, book.id, tier.id)}
                  className={`relative group w-24 sm:w-32 cursor-grab active:cursor-grabbing transition-all ${draggedBookId === book.id ? 'opacity-40 grayscale rotate-2 scale-90' : ''} ${dragOverBookId === book.id ? 'border-l-4 border-white' : ''}`}
                  style={{ borderLeftColor: dragOverBookId === book.id ? currentColors.accent : 'transparent' }}
                  onClick={() => setSelectedBook(book)}
                >
                  <img 
                    src={book.coverUrl || 'https://picsum.photos/120/180'} 
                    alt={book.title}
                    className="w-full h-36 sm:h-48 object-cover rounded shadow-lg border-2 border-transparent group-hover:border-white transition-all transform group-hover:scale-105"
                  />
                  <div className="mt-2 text-center">
                    <p className="text-[10px] sm:text-xs font-bold truncate leading-none">{book.title}</p>
                    <p className="text-[9px] sm:text-[10px] opacity-70 truncate mt-1">{book.author}</p>
                  </div>
                </div>
              ))}
              {booksByTier[tier.id].length === 0 && (
                <div className="w-full h-full flex items-center justify-center opacity-10 italic pointer-events-none text-xl font-bold">
                  Drop Books Here
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Modals */}
      {isSearchOpen && (
        <SearchPanel 
          onClose={() => setIsSearchOpen(false)} 
          onAdd={addBook}
          accentColor={currentColors.accent}
        />
      )}

      {selectedBook && (
        <BookModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
          onSave={updateBook}
          onDelete={deleteBook}
          accentColor={currentColors.accent}
        />
      )}

      {isThemeOpen && (
        <ThemeManager 
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          customColors={customColors}
          setCustomColors={setCustomColors}
          onClose={() => setIsThemeOpen(false)}
        />
      )}

      {isVeoOpen && (
        <VeoAnimator 
          onClose={() => setIsVeoOpen(false)}
          accentColor={currentColors.accent}
        />
      )}
    </div>
  );
};

export default App;
