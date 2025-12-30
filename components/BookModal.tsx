import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  MessageSquare, 
  Percent, 
  Layout, 
  Plus, 
  History, 
  BookOpen, 
  Headphones, 
  Tablet,
  Check,
  Edit2
} from 'lucide-react';
import { Book, BookFormat, ReadingSession } from '../types';
import { TIERS } from '../constants';

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onSave: (book: Book) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}

const BookModal: React.FC<BookModalProps> = ({ book, onClose, onSave, onDelete, accentColor }) => {
  const [editedBook, setEditedBook] = useState<Book>({ ...book });
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (editingAuthor) authorInputRef.current?.focus(); }, [editingAuthor]);

  const addSession = () => {
    const newSession: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      format: 'Physical Book',
    };
    setEditedBook(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
  };

  const updateSession = (id: string, updates: Partial<ReadingSession>) => {
    setEditedBook(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Permanently remove "${editedBook.title}" from your shelf?`)) {
      onDelete(book.id);
    }
  };

  const formatOptions: { value: BookFormat; icon: any }[] = [
    { value: 'Audiobook', icon: Headphones },
    { value: 'Physical Book', icon: BookOpen },
    { value: 'E-reader', icon: Tablet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Reading Archive Detail</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Book"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-80 flex flex-col gap-6">
            <div className="relative group">
              <img src={book.coverUrl || 'https://picsum.photos/320/480'} className="w-full aspect-[2/3] object-cover rounded-3xl shadow-2xl ring-8 ring-gray-50 bg-gray-100" alt={book.title} />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-black/10 pointer-events-none"></div>
            </div>
            
            <div className="space-y-4">
              <div className="group bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400">Title</label>
                {editingTitle ? (
                  <input ref={titleInputRef} className="w-full text-lg font-black bg-transparent outline-none border-b-2 border-indigo-200" value={editedBook.title} onChange={e => setEditedBook(p => ({ ...p, title: e.target.value }))} onBlur={() => setEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)} />
                ) : (
                  <div onClick={() => setEditingTitle(true)} className="flex items-center gap-2 cursor-pointer font-black text-lg group-hover:text-indigo-600 transition-colors">{editedBook.title} <Edit2 className="w-3 h-3 text-gray-300" /></div>
                )}
              </div>
              <div className="group bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400">Author</label>
                {editingAuthor ? (
                  <input ref={authorInputRef} className="w-full text-sm font-bold bg-transparent outline-none border-b-2 border-indigo-200" value={editedBook.author} onChange={e => setEditedBook(p => ({ ...p, author: e.target.value }))} onBlur={() => setEditingAuthor(false)} onKeyDown={e => e.key === 'Enter' && setEditingAuthor(false)} />
                ) : (
                  <div onClick={() => setEditingAuthor(true)} className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{editedBook.author} <Edit2 className="w-3 h-3 text-gray-300" /></div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t grid grid-cols-2 gap-2">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setEditedBook(prev => ({ ...prev, tier: t.id }))}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${editedBook.tier === t.id ? 'text-white border-transparent shadow-lg' : 'text-gray-400 border-gray-100 hover:border-gray-200'}`}
                  style={{ backgroundColor: editedBook.tier === t.id ? accentColor : '' }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><History className="w-4 h-4" /> Reading Sessions</h3>
                <button onClick={addSession} className="px-4 py-2 rounded-full text-[10px] font-black uppercase text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: accentColor }}>+ Session</button>
              </div>

              <div className="space-y-3">
                {editedBook.sessions.map(session => (
                  <div key={session.id} className="bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4 hover:border-indigo-100 transition-colors">
                    <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100">
                      {formatOptions.map(opt => (
                        <button key={opt.value} onClick={() => updateSession(session.id, { format: opt.value })} className={`p-2 rounded-lg transition-all ${session.format === opt.value ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:text-gray-400'}`} style={{ backgroundColor: session.format === opt.value ? accentColor : '' }}><opt.icon className="w-4 h-4" /></button>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-1 min-w-[150px]">
                      <div className="flex-1">
                        <span className="block text-[8px] font-black uppercase text-gray-300 mb-0.5">Start</span>
                        <input type="date" value={session.startDate} onChange={e => updateSession(session.id, { startDate: e.target.value })} className="text-[10px] p-1.5 rounded-lg border w-full outline-none focus:ring-1 focus:ring-indigo-200" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-[8px] font-black uppercase text-gray-300 mb-0.5">End</span>
                        <input type="date" value={session.endDate} onChange={e => updateSession(session.id, { endDate: e.target.value })} className="text-[10px] p-1.5 rounded-lg border w-full outline-none focus:ring-1 focus:ring-indigo-200" />
                      </div>
                    </div>
                    <button onClick={() => setEditedBook(p => ({ ...p, sessions: p.sessions.filter(s => s.id !== session.id) }))} className="text-gray-300 hover:text-red-400 transition-colors p-2"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {editedBook.tier === 'DNF' && (
              <div className="p-6 bg-red-50 rounded-3xl border-2 border-red-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-red-500">
                  <div className="flex items-center gap-2"><Percent className="w-4 h-4" /> DNF Progress</div>
                  <span className="text-lg">{editedBook.dnfProgress || 0}%</span>
                </div>
                <input type="range" min="0" max="100" value={editedBook.dnfProgress || 0} onChange={e => setEditedBook(p => ({ ...p, dnfProgress: parseInt(e.target.value) }))} className="w-full h-3 bg-red-200 rounded-full appearance-none accent-red-600 cursor-pointer" />
                <div className="text-[10px] font-bold text-red-400 flex items-center gap-2">
                  <Check className={`w-3 h-3 transition-opacity ${editedBook.dnfProgress > 80 ? 'opacity-100' : 'opacity-20'}`} />
                  {editedBook.dnfProgress > 80 ? "Reached 80% - This book now counts towards your total read count!" : "Below 80% - Not counted in your yearly progress statistics."}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Personal Reflection</label>
              <textarea value={editedBook.comments} onChange={e => setEditedBook(p => ({ ...p, comments: e.target.value }))} className="w-full p-6 rounded-[32px] border-2 border-gray-100 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none h-40 resize-none bg-gray-50/50 transition-all text-gray-700" placeholder="Notes on writing, plot, or why it ended up in this tier..." />
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/80 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-gray-400 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
          <button onClick={() => onSave(editedBook)} className="px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: accentColor }}>Update Log</button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;