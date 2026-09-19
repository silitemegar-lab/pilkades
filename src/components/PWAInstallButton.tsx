import React, { useState } from 'react';
import { Download, Smartphone, Laptop, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Terinstall</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          id="btn-pwa-install"
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          title="Install Aplikasi di HP / PC"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Aplikasi (HP & PC)</span>
        </button>
      ) : isIOS ? (
        <button
          id="btn-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold shadow-sm border border-emerald-600 transition"
          title="Panduan Pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
          <span>Pasang di HP (iOS)</span>
        </button>
      ) : (
        <button
          id="btn-pwa-guide"
          onClick={() => setShowGeneralGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold shadow-sm border border-emerald-600 transition"
          title="Pasang di Layar Utama HP / Desktop PC"
        >
          <Laptop className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden md:inline">Install di HP / PC</span>
          <span className="md:hidden">Install App</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
                  1
                </span>
                <p>
                  Buka website ini di browser <strong>Safari</strong> pada iPhone/iPad Anda.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
                  2
                </span>
                <p>
                  Ketuk tombol <strong>Bagikan (Share)</strong> ikon kotak dengan panah ke atas di bagian bawah layar Safari.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
                  3
                </span>
                <p>
                  Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      {/* General Guide Modal for Chrome/Edge/Android */}
      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Cara Pasang Aplikasi</h3>
              </div>
              <button
                onClick={() => setShowGeneralGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Aplikasi ini dapat di-install secara langsung tanpa melalui Play Store / App Store:</p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <p className="font-semibold text-emerald-800">Di Smartphone (Android Chrome):</p>
                <p>Ketuk menu titik tiga di kanan atas browser &rarr; pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1.5">
                <p className="font-semibold text-slate-900">Di PC / Laptop (Chrome / Edge):</p>
                <p>Klik ikon install tanda panah di sebelah kanan bilah alamat (URL bar) atau menu titik tiga &rarr; <strong>"Install Tim Latif"</strong>.</p>
              </div>
            </div>
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
