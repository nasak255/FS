'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
};

const COLORS = [
  'bg-red-100', 'bg-orange-100', 'bg-amber-100',
  'bg-green-100', 'bg-emerald-100', 'bg-teal-100',
  'bg-cyan-100', 'bg-blue-100', 'bg-indigo-100',
  'bg-violet-100', 'bg-purple-100', 'bg-fuchsia-100',
  'bg-pink-100', 'bg-rose-100'
];

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    const savedNotes = localStorage.getItem('notes-app-data');
    if (savedNotes) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes');
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('notes-app-data', JSON.stringify(notes));
    }
  }, [notes, isMounted]);

  const handleSave = () => {
    if (!currentNote.title?.trim() && !currentNote.content?.trim()) {
      setIsModalOpen(false);
      return;
    }

    if (currentNote.id) {
      // Edit existing note
      setNotes(notes.map(n => n.id === currentNote.id ? { ...n, ...currentNote } as Note : n));
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentNote.title || '',
        content: currentNote.content || '',
        date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      setNotes([newNote, ...notes]);
    }
    setIsModalOpen(false);
    setCurrentNote({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const openEdit = (note: Note) => {
    setCurrentNote(note);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setCurrentNote({});
    setIsModalOpen(true);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) return null;

  const filteredNotes = notes.filter(note => 
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">ملاحظاتي</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">تطبيق بسيط لتسجيل أفكارك وملاحظاتك</p>
        </div>

        <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="البحث في الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-2xl border-0 py-3 pr-11 pl-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6 bg-white shadow-sm transition-all"
          />
        </div>

        <button
          onClick={openNew}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} />
          <span className="font-medium">إضافة ملاحظة</span>
        </button>
      </header>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-32 text-gray-500 flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Edit2 size={48} className="text-gray-400" />
          </div>
          <p className="text-2xl font-medium text-gray-700">لا توجد ملاحظات بعد</p>
          <p className="mt-2 text-gray-500">انقر على &quot;إضافة ملاحظة&quot; للبدء في تدوين أفكارك!</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-32 text-gray-500 flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Search size={48} className="text-gray-400" />
          </div>
          <p className="text-2xl font-medium text-gray-700">لا توجد نتائج</p>
          <p className="mt-2 text-gray-500">لم نتمكن من العثور على أي ملاحظات تطابق بحثك.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                layout
                className={`${note.color} p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group relative flex flex-col h-72 border border-black/5`}
              >
                <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2 leading-tight">
                  {note.title || 'بدون عنوان'}
                </h3>
                <p className="text-gray-800 whitespace-pre-wrap flex-grow overflow-hidden line-clamp-6 text-base leading-relaxed">
                  {note.content}
                </p>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-600 pt-4 border-t border-black/5">
                  <span className="font-medium opacity-70">{note.date}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEdit(note)} 
                      className="p-2 hover:bg-black/10 rounded-full transition-colors text-gray-700"
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(note.id)} 
                      className="p-2 hover:bg-red-500/20 text-red-600 rounded-full transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentNote.id ? 'تعديل الملاحظة' : 'ملاحظة جديدة'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="عنوان الملاحظة"
                  value={currentNote.title || ''}
                  onChange={e => setCurrentNote({...currentNote, title: e.target.value})}
                  className="text-2xl font-bold border-none outline-none placeholder:text-gray-300 bg-transparent text-gray-900"
                  autoFocus
                />
                <textarea
                  placeholder="اكتب ملاحظتك هنا..."
                  value={currentNote.content || ''}
                  onChange={e => setCurrentNote({...currentNote, content: e.target.value})}
                  className="w-full h-64 resize-none border-none outline-none placeholder:text-gray-400 bg-transparent text-lg leading-relaxed text-gray-800"
                />
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-200 rounded-2xl transition-colors font-medium text-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-all font-medium text-lg shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={20} />
                  <span>حفظ</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
