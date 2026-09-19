import React, { useState } from 'react';
import { CampaignBroadcast } from '../types';
import {
  Bell,
  Plus,
  Pin,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  X,
  Megaphone,
} from 'lucide-react';

interface BroadcastNewsModalProps {
  broadcasts: CampaignBroadcast[];
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAddBroadcast: (data: {
    title: string;
    content: string;
    category: 'PENTING' | 'INSTRUKSI' | 'JADWAL' | 'INFORMASI';
    pinned: boolean;
  }) => Promise<void>;
  onDeleteBroadcast: (id: string) => Promise<void>;
}

export const BroadcastNewsModal: React.FC<BroadcastNewsModalProps> = ({
  broadcasts,
  isAdmin,
  isOpen,
  onClose,
  onAddBroadcast,
  onDeleteBroadcast,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'PENTING' | 'INSTRUKSI' | 'JADWAL' | 'INFORMASI'>('PENTING');
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddBroadcast({ title, content, category, pinned });
      setTitle('');
      setContent('');
      setCategory('PENTING');
      setPinned(false);
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PENTING':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            PENTING
          </span>
        );
      case 'INSTRUKSI':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            INSTRUKSI
          </span>
        );
      case 'JADWAL':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            JADWAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500" />
            INFORMASI
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Berita Kampanye & Instruksi Relawan
              </h3>
              <p className="text-xs text-slate-500">
                Update informasi terkini pemenangan Ahmad Latif Usman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button for admin */}
        {isAdmin && !showAddForm && (
          <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-semibold">
              Kirim pengumuman atau instruksi baru kepada seluruh relawan
            </span>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Berita Baru</span>
            </button>
          </div>
        )}

        {/* Add Form */}
        {isAdmin && showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Form Broadcast Berita Kampanye</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Batal
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Judul Berita / Instruksi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                />
              </div>
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                >
                  <option value="PENTING">Kategori: PENTING</option>
                  <option value="INSTRUKSI">Kategori: INSTRUKSI</option>
                  <option value="JADWAL">Kategori: JADWAL</option>
                  <option value="INFORMASI">Kategori: INFORMASI</option>
                </select>
              </div>
            </div>

            <textarea
              required
              rows={3}
              placeholder="Tuliskan isi berita, arahan, jadwal sosialisasi, atau instruksi pemantauan TPS..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Sematkan / Pin di paling atas</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Siarkan Pengumuman'}
              </button>
            </div>
          </form>
        )}

        {/* Broadcast List */}
        <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto p-2">
          {broadcasts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada pengumuman kampanye saat ini.</p>
            </div>
          ) : (
            broadcasts.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl transition ${
                  item.pinned ? 'bg-emerald-50/50 border border-emerald-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(item.category)}
                      {item.pinned && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                          <Pin className="w-3 h-3" /> Disematkan
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('Hapus berita pengumuman ini?')) {
                          onDeleteBroadcast(item.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                      title="Hapus Berita"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dipublikasikan oleh: {item.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
