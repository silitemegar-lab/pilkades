import React, { useState } from 'react';
import { DUSUN_LIST, ALL_RTS, UserSession } from '../types';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User,
  MapPin,
  Smartphone,
  Laptop,
  AlertCircle,
  Vote,
  Key,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [selectedDusun, setSelectedDusun] = useState('Dusun Tracap');
  const [selectedRT, setSelectedRT] = useState('RT 01');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Auto-fill defaults when toggling tab
  const handleTabSwitch = (tab: 'admin' | 'user') => {
    setActiveTab(tab);
    setErrorMsg(null);
    if (tab === 'admin') {
      setUsername('admin');
      setPassword('admin');
    } else {
      setUsername('');
      setPassword('user');
    }
  };

  const getAvailableRTs = () => {
    const d = DUSUN_LIST.find((item) => item.name === selectedDusun);
    return d ? d.rts : ALL_RTS.map((r) => r.rt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMsg(activeTab === 'admin' ? 'Username admin harus diisi' : 'Nama relawan harus diisi');
      return;
    }

    setIsLoading(true);

    // Detect device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    const deviceName = isMobile ? 'Smartphone / HP Relawan' : 'Desktop / Laptop PC';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password: password.trim(),
          dusun: activeTab === 'user' ? selectedDusun : undefined,
          rt: activeTab === 'user' ? selectedRT : undefined,
          device: deviceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal login. Periksa username dan password.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      // Offline fallback: if server is unreachable, allow client login based on rules
      if (activeTab === 'admin') {
        if (trimmedUser.toLowerCase() === 'admin' && password.trim() === 'admin') {
          onLoginSuccess({
            sessionId: `admin-local-${Date.now()}`,
            username: 'admin',
            role: 'admin',
          });
        } else {
          setErrorMsg('Kata sandi admin salah! (Gunakan kata sandi: admin)');
        }
      } else {
        if (password.trim() === 'user') {
          onLoginSuccess({
            sessionId: `usr-local-${Date.now()}`,
            username: trimmedUser,
            role: 'user',
            dusun: selectedDusun,
            rt: selectedRT,
          });
        } else {
          setErrorMsg('Kata sandi relawan salah! (Gunakan kata sandi: user)');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Emblem & Title */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white mx-auto flex items-center justify-center shadow-md">
            <Vote className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            TIM KEMENANGAN AHMAD LATIF USMAN
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sistem Koordinasi Relawan & Pemantauan Suara Lapangan Real-Time
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl my-4">
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Login Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('user')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'user'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Login Relawan / User</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === 'admin' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Default login admin: username <strong>admin</strong> | sandi <strong>admin</strong>
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Anda (Relawan) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Budi Santoso RT 03"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Masukkan nama Anda agar admin dapat memantau kehadiran Anda secara real-time.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Relawan *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="user"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Kata sandi relawan: <strong>user</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Wilayah Dusun Anda:
                  </label>
                  <select
                    value={selectedDusun}
                    onChange={(e) => {
                      const d = e.target.value;
                      setSelectedDusun(d);
                      const dObj = DUSUN_LIST.find((item) => item.name === d);
                      if (dObj) setSelectedRT(dObj.rts[0]);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {DUSUN_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    RT Tugas Anda:
                  </label>
                  <select
                    value={selectedRT}
                    onChange={(e) => setSelectedRT(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  >
                    {getAvailableRTs().map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-98 disabled:opacity-60 mt-2"
          >
            {isLoading
              ? 'Memverifikasi...'
              : activeTab === 'admin'
              ? 'Masuk Sebagai Admin Posko'
              : 'Masuk Sebagai Relawan'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Kompatibel HP & PC</span>
          </span>
          <span>Versi PWA Terverifikasi</span>
        </div>
      </div>
    </div>
  );
};
