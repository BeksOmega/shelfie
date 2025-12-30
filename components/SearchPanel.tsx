import React, { useState } from 'react';
import { Search, X, Loader2, Plus, BookOpen } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

interface SearchPanelProps {
  onClose: () => void;
  onAdd: (book: Omit<any, 'id' | 'tier' | 'sessions' | 'comments' | 'dnfProgress'>) => void;
  accentColor: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onClose, onAdd, accentColor }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Expand Library</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Search Google Books</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-6 bg-gray-50/50">
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 focus:ring-4 ring-blue-50 outline-none transition-all shadow-inner text-lg font-medium"
              style={{ borderColor: `${accentColor}44` }}
              autoFocus
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-300" />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: accentColor }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {results.map(book => (
            <div 
              key={book.id} 
              className="flex items-center gap-5 p-4 rounded-2xl border-2 border-transparent hover:border-gray-100 hover:bg-gray-50 group transition-all"
            >
              <div className="relative">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-20 h-28 object-cover rounded-xl shadow-md border-2 border-white"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-white">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 leading-tight text-lg">{book.title}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{book.author}</p>
              </div>
              <button 
                onClick={() => onAdd(book)}
                className="p-4 rounded-2xl text-white shadow-xl transform hover:scale-110 active:scale-90 transition-all"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>
          ))}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">No results found for "{query}"</p>
            </div>
          )}
          {!query && (
            <div className="text-center py-16 opacity-30">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <p className="font-black text-xl uppercase tracking-tighter italic">Enter a keyword to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;