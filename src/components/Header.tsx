import React from 'react';
import { UserSession } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Vote,
  Users,
  Bell,
  LogOut,
  ShieldCheck,
  User,
  MapPin,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface HeaderProps {
  session: UserSession | null;
  activeUsersCount: number;
  unreadBroadcastsCount: number;
  onOpenBroadcasts: () => void;
  onOpenActiveUsers?: () => void;
  onOpenChangePassword?: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activeUsersCount,
  unreadBroadcastsCount,
  onOpenBroadcasts,
  onOpenActiveUsers,
  onOpenChangePassword,
  onLogout,
  onOpenLogin,
}) => {
  const isAdmin = session?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-900 flex items-center justify-center font-black text-lg shadow-xs shrink-0 ring-2 ring-emerald-400">
              <span className="text-emerald-800 font-extrabold text-sm">#1</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-sm font-black tracking-wide uppercase text-white truncate">
                  AHMAD LATIF USMAN
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-emerald-700 text-emerald-200 text-[10px] font-bold">
                  Calon Kades No. 1
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 truncate">
                Sistem Koordinasi Relawan & Pemantauan Suara Real-Time
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Realtime Active Counter */}
            {isAdmin && (
              <button
                id="btn-header-active-users"
                onClick={onOpenActiveUsers}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold border border-emerald-700 transition"
                title="Lihat daftar pengguna aktif saat ini"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                </span>
                <Users className="w-3.5 h-3.5 hidden sm:inline" />
                <span>{activeUsersCount} Online</span>
              </button>
            )}

            {/* Campaign Broadcast / Notification Bell */}
            <button
              id="btn-header-broadcasts"
              onClick={onOpenBroadcasts}
              className="relative p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition active:scale-95"
              title="Update Berita Kampanye"
            >
              <Bell className="w-4 h-4" />
              {unreadBroadcastsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px] flex items-center justify-center shadow-xs animate-bounce">
                  {unreadBroadcastsCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* User Profile / Login info */}
            {session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-700/80">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-emerald-300" />
                    )}
                    <span>{session.username}</span>
                  </div>
                  <div className="text-[10px] text-emerald-300 font-medium">
                    {isAdmin ? 'Super Admin Posko' : `${session.dusun || 'Relawan'} (${session.rt || 'RT'})`}
                  </div>
                </div>

                {/* Ganti Kata Sandi Admin (Hanya untuk Admin) */}
                {isAdmin && onOpenChangePassword && (
                  <button
                    id="btn-change-admin-password"
                    onClick={onOpenChangePassword}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-400/30 transition cursor-pointer"
                    title="Ganti Kata Sandi Admin"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Ganti Sandi</span>
                  </button>
                )}

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-emerald-800/80 hover:bg-rose-900/80 text-emerald-200 hover:text-rose-100 transition active:scale-95"
                  title="Keluar / Ganti Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-lg bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition shadow-xs"
              >
                Masuk Sistem
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
