import React from 'react';
import { ActiveUser } from '../types';
import { Users, Wifi, Smartphone, Laptop, Clock, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';

interface ActiveUsersPanelProps {
  activeUsers: ActiveUser[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const ActiveUsersPanel: React.FC<ActiveUsersPanelProps> = ({
  activeUsers,
  onRefresh,
  isLoading = false,
}) => {
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      if (diffSec < 10) return 'Baru saja';
      if (diffSec < 60) return `${diffSec} detik lalu`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} menit lalu`;
      return `${Math.floor(diffMin / 60)} jam lalu`;
    } catch {
      return 'Aktif';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Pengguna Online Real-Time
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block -ml-3" />
                {activeUsers.length} Online
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pantau siapa saja relawan & admin yang sedang login dan mengakses sistem detik ini
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-active-users"
          onClick={onRefresh}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* User List Table / Cards */}
      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        {activeUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Belum ada pengguna lain yang sedang aktif.</p>
          </div>
        ) : (
          activeUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const isMobile = user.device?.toLowerCase().includes('hp') || user.device?.toLowerCase().includes('android') || user.device?.toLowerCase().includes('iphone');

            return (
              <div
                key={user.sessionId}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isAdmin ? <ShieldCheck className="w-5 h-5" /> : user.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {user.username}
                      </span>
                      {isAdmin ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wide">
                          Admin Pusat
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {user.dusun || 'Wilayah Umum'} {user.rt ? `(${user.rt})` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        {isMobile ? <Smartphone className="w-3 h-3 text-slate-400" /> : <Laptop className="w-3 h-3 text-slate-400" />}
                        {user.device || 'Perangkat Web'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Login: {new Date(user.loginTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {formatTimeAgo(user.lastActive)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
        Sinkronisasi otomatis setiap 5 detik melalui jalur server real-time
      </div>
    </div>
  );
};
