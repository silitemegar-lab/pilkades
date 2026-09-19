import React, { useState, useEffect, useCallback } from 'react';
import {
  VoterDPT,
  RTResult,
  CampaignBroadcast,
  ActiveUser,
  UserSession,
} from './types';
import {
  INITIAL_DPT,
  INITIAL_BROADCASTS,
  generateInitialRTResults,
} from './data/mockData';
import { Header } from './components/Header';
import { CandidateBanner } from './components/CandidateBanner';
import { AdminDPTDashboard } from './components/AdminDPTDashboard';
import { UserWilayahDashboard } from './components/UserWilayahDashboard';
import { ActiveUsersPanel } from './components/ActiveUsersPanel';
import { BroadcastNewsModal } from './components/BroadcastNewsModal';
import { CampaignNewsTicker } from './components/CampaignNewsTicker';
import { LoginModal } from './components/LoginModal';
import {
  Users,
  ShieldCheck,
  BarChart3,
  Megaphone,
  Radio,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const SESSION_KEY = 'tim_latif_session_v1';
const DPT_STORAGE_KEY = 'tim_latif_dpt_v1';
const VOTES_STORAGE_KEY = 'tim_latif_votes_v1';
const BROADCAST_STORAGE_KEY = 'tim_latif_news_v1';

export default function App() {
  // 1. Session State (Admin vs Relawan)
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!session);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dpt' | 'votes' | 'users'>('dpt');

  // 2. Data State
  const [dptList, setDptList] = useState<VoterDPT[]>(() => {
    try {
      const saved = localStorage.getItem(DPT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DPT;
    } catch {
      return INITIAL_DPT;
    }
  });

  const [rtResults, setRtResults] = useState<RTResult[]>(() => {
    try {
      const saved = localStorage.getItem(VOTES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : generateInitialRTResults();
    } catch {
      return generateInitialRTResults();
    }
  });

  const [broadcasts, setBroadcasts] = useState<CampaignBroadcast[]>(() => {
    try {
      const saved = localStorage.getItem(BROADCAST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
    } catch {
      return INITIAL_BROADCASTS;
    }
  });

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  // Save changes to localStorage as reliable backup
  useEffect(() => {
    try {
      localStorage.setItem(DPT_STORAGE_KEY, JSON.stringify(dptList));
    } catch (e) {
      console.warn('LocalStorage save DPT failed', e);
    }
  }, [dptList]);

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(rtResults));
    } catch (e) {
      console.warn('LocalStorage save Votes failed', e);
    }
  }, [rtResults]);

  useEffect(() => {
    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(broadcasts));
    } catch (e) {
      console.warn('LocalStorage save Broadcasts failed', e);
    }
  }, [broadcasts]);

  // Fetch initial data from server APIs
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch DPT
      const dptRes = await fetch('/api/dpt');
      if (dptRes.ok) {
        const dptData = await dptRes.json();
        if (Array.isArray(dptData) && dptData.length > 0) {
          setDptList(dptData);
        }
      }

      // 2. Fetch Votes
      const votesRes = await fetch('/api/votes');
      if (votesRes.ok) {
        const votesData = await votesRes.json();
        if (Array.isArray(votesData) && votesData.length > 0) {
          setRtResults(votesData);
        }
      }

      // 3. Fetch Broadcast News
      const newsRes = await fetch('/api/news');
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        if (Array.isArray(newsData) && newsData.length > 0) {
          setBroadcasts(newsData);
        }
      }

      // 4. Fetch Active Users
      const usersRes = await fetch('/api/active-users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData?.activeUsers) {
          setActiveUsers(usersData.activeUsers);
        }
      }

      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      // Server may be in client-only or starting up, silent fallback
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time Heartbeat & Active Users Polling every 5 seconds
  useEffect(() => {
    const heartbeatInterval = setInterval(async () => {
      if (session) {
        try {
          await fetch('/api/auth/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.sessionId,
              username: session.username,
              role: session.role,
              dusun: session.dusun,
              rt: session.rt,
            }),
          });
        } catch {
          // ignore transient offline
        }
      }

      // Refresh active users count
      try {
        const usersRes = await fetch('/api/active-users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData?.activeUsers) {
            setActiveUsers(usersData.activeUsers);
          }
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(heartbeatInterval);
  }, [session]);

  // Auth handlers
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    } catch {
      // ignore
    }
    setIsLoginModalOpen(false);
    fetchAllData();
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.sessionId }),
        });
      } catch {
        // ignore
      }
    }
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    setIsLoginModalOpen(true);
  };

  // DPT Operations
  const handleAddVoter = async (voterData: Partial<VoterDPT>) => {
    try {
      const res = await fetch('/api/dpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voterData),
      });
      if (res.ok) {
        const newVoter = await res.json();
        setDptList((prev) => [newVoter, ...prev]);
        return;
      }
    } catch {
      // Fallback local
    }
    const localNewVoter: VoterDPT = {
      id: `dpt-${Date.now()}`,
      nik: voterData.nik || `330412${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: voterData.name || 'Warga Baru',
      gender: voterData.gender || 'L',
      age: voterData.age || 35,
      dusun: voterData.dusun || 'Dusun Tracap',
      rt: voterData.rt || 'RT 01',
      address: voterData.address || '',
      lockStatus: voterData.lockStatus || 'BELUM',
      nominal: Number(voterData.nominal) || 0,
      nominalNotes: voterData.nominalNotes || '',
      leanCandidate: voterData.leanCandidate || 'ahmad_latif_usman',
      isInTeam: voterData.isInTeam ?? false,
      teamRole: voterData.teamRole || '',
      votingStatus:
        voterData.votingStatus ||
        (voterData.leanCandidate === 'ahmad_latif_usman'
          ? 'MENYOBLOS_LATIF'
          : voterData.leanCandidate === 'munjilin'
          ? 'MENYOBLOS_MUNJILIN'
          : voterData.leanCandidate === 'sigit'
          ? 'MENYOBLOS_SIGIT'
          : voterData.leanCandidate === 'makful'
          ? 'MENYOBLOS_MAKFUL'
          : 'BELUM_MENENTUKAN'),
      verificationStatus: voterData.verificationStatus || 'TERVERIFIKASI',
      volunteerInCharge: voterData.volunteerInCharge || '',
      phone: voterData.phone || '',
      notes: voterData.notes || '',
      updatedAt: new Date().toISOString(),
    };
    setDptList((prev) => [localNewVoter, ...prev]);
  };

  const handleUpdateVoter = async (id: string, updates: Partial<VoterDPT>) => {
    try {
      await fetch(`/api/dpt/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // local
    }
    setDptList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
  };

  const handleDeleteVoter = async (id: string) => {
    try {
      await fetch(`/api/dpt/${id}`, { method: 'DELETE' });
    } catch {
      // local
    }
    setDptList((prev) => prev.filter((v) => v.id !== id));
  };

  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/dpt/reset-seed', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkImport = async (voters: Partial<VoterDPT>[]) => {
    try {
      const res = await fetch('/api/dpt/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voters }),
      });
      if (res.ok) {
        fetchAllData();
        return;
      }
    } catch {
      // local fallback
    }
    const converted: VoterDPT[] = voters.map((v, i) => ({
      id: `dpt-imp-${Date.now()}-${i}`,
      nik: v.nik || `330412${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: v.name || 'Warga Terimpor',
      gender: v.gender || 'L',
      age: v.age || 35,
      dusun: v.dusun || 'Dusun Tracap',
      rt: v.rt || 'RT 01',
      address: v.address || '',
      lockStatus: v.lockStatus || 'BELUM',
      nominal: Number(v.nominal) || 0,
      nominalNotes: v.nominalNotes || '',
      leanCandidate: v.leanCandidate || 'ahmad_latif_usman',
      isInTeam: v.isInTeam ?? false,
      teamRole: v.teamRole || '',
      votingStatus:
        v.votingStatus ||
        (v.leanCandidate === 'ahmad_latif_usman'
          ? 'MENYOBLOS_LATIF'
          : v.leanCandidate === 'munjilin'
          ? 'MENYOBLOS_MUNJILIN'
          : v.leanCandidate === 'sigit'
          ? 'MENYOBLOS_SIGIT'
          : v.leanCandidate === 'makful'
          ? 'MENYOBLOS_MAKFUL'
          : 'BELUM_MENENTUKAN'),
      verificationStatus: v.verificationStatus || 'TERVERIFIKASI',
      volunteerInCharge: v.volunteerInCharge || '',
      phone: v.phone || '',
      notes: v.notes || '',
      updatedAt: new Date().toISOString(),
    }));
    setDptList((prev) => [...converted, ...prev]);
  };

  // Vote Report Submission from Volunteer or Admin
  const handleSubmitVoteReport = async (reportData: {
    rt: string;
    dusun: string;
    votesLatif: number;
    votesMunjilin: number;
    votesSigit: number;
    votesMakful: number;
    invalidVotes: number;
    reporter: string;
  }) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (res.ok) {
        const updated = await res.json();
        setRtResults((prev) =>
          prev.map((r) => (r.rt === updated.rt ? updated : r))
        );
        return;
      }
    } catch {
      // local
    }
    setRtResults((prev) =>
      prev.map((r) =>
        r.rt === reportData.rt
          ? {
              ...r,
              ...reportData,
              lastUpdated: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Campaign Broadcast News Operations
  const handleAddBroadcast = async (data: {
    title: string;
    content: string;
    category: 'PENTING' | 'INSTRUKSI' | 'JADWAL' | 'INFORMASI';
    pinned: boolean;
  }) => {
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          author: session?.username || 'Admin Posko',
        }),
      });
      if (res.ok) {
        const newNews = await res.json();
        setBroadcasts((prev) => [newNews, ...prev]);
        return;
      }
    } catch {
      // local
    }
    const localNews: CampaignBroadcast = {
      id: `bc-${Date.now()}`,
      title: data.title,
      content: data.content,
      category: data.category,
      author: session?.username || 'Admin Posko',
      createdAt: new Date().toISOString(),
      pinned: data.pinned,
    };
    setBroadcasts((prev) => [localNews, ...prev]);
  };

  const handleDeleteBroadcast = async (id: string) => {
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
    } catch {
      // local
    }
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  };

  const isAdmin = session?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        session={session}
        activeUsersCount={activeUsers.length}
        unreadBroadcastsCount={broadcasts.length}
        onOpenBroadcasts={() => setIsBroadcastModalOpen(true)}
        onOpenActiveUsers={() => {
          if (isAdmin) setActiveAdminTab('users');
        }}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        {/* Status Bar / Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Sistem Pemantauan Lapangan Aktif
            </span>
            <span>&bull;</span>
            <span>Update Terakhir: {lastSyncTime} WIB</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={isRefreshing}
              className="flex items-center gap-1 hover:text-emerald-700 font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Sinkronisasi Data</span>
            </button>
          </div>
        </div>

        {/* 1. Campaign News Ticker / Notification Banner */}
        <CampaignNewsTicker
          broadcasts={broadcasts}
          onOpenBroadcasts={() => setIsBroadcastModalOpen(true)}
          isAdmin={isAdmin}
        />

        {/* 2. Candidate Banner (4 Candidates: Ahmad Latif Usman, Munjilin, Sigit, Makful) */}
        <CandidateBanner
          rtResults={rtResults}
          filterDusun={!isAdmin ? session?.dusun : undefined}
          isUserView={!isAdmin}
        />

        {/* 2. Content based on Role */}
        {isAdmin ? (
          /* ================= ADMIN VIEW ================= */
          <div className="space-y-5">
            {/* Admin Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveAdminTab('dpt')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeAdminTab === 'dpt'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dashboard DPT & Penguncian Suara</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('users')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeAdminTab === 'users'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pemantau Relawan Online Real-Time</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                  {activeUsers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveAdminTab('votes')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeAdminTab === 'votes'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Rekapitulasi Suara 28 RT</span>
              </button>
            </div>

            {/* Admin Active Tab Content */}
            {activeAdminTab === 'dpt' && (
              <AdminDPTDashboard
                voters={dptList}
                onAddVoter={handleAddVoter}
                onUpdateVoter={handleUpdateVoter}
                onDeleteVoter={handleDeleteVoter}
                onBulkImport={handleBulkImport}
                onResetSeed={handleResetSeed}
              />
            )}

            {activeAdminTab === 'users' && (
              <ActiveUsersPanel
                activeUsers={activeUsers}
                onRefresh={fetchAllData}
                isLoading={isRefreshing}
              />
            )}

            {activeAdminTab === 'votes' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Rekapitulasi Perolehan Suara TPS Seluruh Desa (28 RT)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dusun Tracap (RT 01-07), Jojogan (RT 08-13), Karangsari (RT 14-21), Wonoroto (RT 22-28)
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                        <tr>
                          <th className="p-3">RT & Dusun</th>
                          <th className="p-3">DPT</th>
                          <th className="p-3 font-bold text-emerald-900 bg-emerald-50/50">Latif (No. 1)</th>
                          <th className="p-3">Munjilin (No. 2)</th>
                          <th className="p-3">Sigit (No. 3)</th>
                          <th className="p-3">Makful (No. 4)</th>
                          <th className="p-3">Tidak Sah</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rtResults.map((row) => (
                          <tr key={row.rt} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-slate-900">
                              {row.rt} &bull; <span className="text-slate-500 font-normal">{row.dusun}</span>
                            </td>
                            <td className="p-3 font-mono">{row.totalDpt}</td>
                            <td className="p-3 font-black text-emerald-800 bg-emerald-50/30">{row.votesLatif}</td>
                            <td className="p-3 font-medium text-slate-700">{row.votesMunjilin}</td>
                            <td className="p-3 font-medium text-slate-700">{row.votesSigit}</td>
                            <td className="p-3 font-medium text-slate-700">{row.votesMakful}</td>
                            <td className="p-3 text-slate-400 font-mono">{row.invalidVotes}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Terverifikasi
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= USER / RELAWAN VIEW ================= */
          /* Strict scope: user hanya bisa melihat progress grafik perolehan suara di wilayah mereka masing-masing */
          <UserWilayahDashboard
            userDusun={session?.dusun || 'Dusun Tracap'}
            userRT={session?.rt || 'RT 01'}
            username={session?.username || 'Relawan'}
            rtResults={rtResults}
            onSubmitVoteReport={handleSubmitVoteReport}
            voters={dptList}
            onUpdateVoter={handleUpdateVoter}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">
          TIM KEMENANGAN AHMAD LATIF USMAN &bull; PILKADES
        </p>
        <p className="text-[11px] mt-0.5 text-slate-400">
          Dusun Tracap (RT 01-07) &bull; Dusun Jojogan (RT 08-13) &bull; Dusun Karangsari (RT 14-21) &bull; Dusun Wonoroto (RT 22-28)
        </p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Broadcast News & Notifications Modal */}
      <BroadcastNewsModal
        isOpen={isBroadcastModalOpen}
        isAdmin={Boolean(isAdmin)}
        broadcasts={broadcasts}
        onClose={() => setIsBroadcastModalOpen(false)}
        onAddBroadcast={handleAddBroadcast}
        onDeleteBroadcast={handleDeleteBroadcast}
      />
    </div>
  );
}
