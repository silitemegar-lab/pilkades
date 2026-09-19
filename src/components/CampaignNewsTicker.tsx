import React from 'react';
import { CampaignBroadcast } from '../types';
import { Megaphone, Pin, AlertTriangle, CheckCircle2, Calendar, Info, ChevronRight, Plus } from 'lucide-react';

interface CampaignNewsTickerProps {
  broadcasts: CampaignBroadcast[];
  onOpenBroadcasts: () => void;
  isAdmin?: boolean;
}

export const CampaignNewsTicker: React.FC<CampaignNewsTickerProps> = ({
  broadcasts,
  onOpenBroadcasts,
  isAdmin = false,
}) => {
  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:px-4 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">
            Saluran Informasi Tim Kemenangan Ahmad Latif Usman aktif. Belum ada pengumuman baru.
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={onOpenBroadcasts}
            className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kirim Berita</span>
          </button>
        )}
      </div>
    );
  }

  // Get first pinned or most recent broadcast
  const latest = broadcasts.find((b) => b.pinned) || broadcasts[0];

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PENTING':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
            PENTING
          </span>
        );
      case 'INSTRUKSI':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
            INSTRUKSI
          </span>
        );
      case 'JADWAL':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center gap-1 shrink-0">
            <Calendar className="w-2.5 h-2.5 text-blue-600" />
            JADWAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Info className="w-2.5 h-2.5 text-emerald-600" />
            BERITA
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-3 sm:p-4 shadow-md border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
          <Megaphone className="w-4 h-4 animate-bounce" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {latest.pinned && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-300">
                <Pin className="w-3 h-3 fill-amber-300" />
                Disematkan
              </span>
            )}
            {getCategoryBadge(latest.category)}
            <span className="text-[11px] text-emerald-200 font-medium truncate">
              {new Date(latest.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white truncate">
            {latest.title}: <span className="font-normal text-emerald-100">{latest.content}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={onOpenBroadcasts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition border border-white/20 active:scale-95 cursor-pointer"
        >
          <span>Semua Berita ({broadcasts.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
