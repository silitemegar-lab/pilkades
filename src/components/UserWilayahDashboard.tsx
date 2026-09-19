import React, { useState, useMemo } from 'react';
import { RTResult, CANDIDATES, DUSUN_LIST, CandidateId, VoterDPT, LockStatus, VotingChoiceStatus } from '../types';
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Award,
  Vote,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Users,
  Star,
  Lock,
  Unlock,
  Coins,
  Search,
} from 'lucide-react';

interface UserWilayahDashboardProps {
  userDusun: string;
  userRT?: string;
  username: string;
  rtResults: RTResult[];
  onSubmitVoteReport: (data: {
    rt: string;
    dusun: string;
    votesLatif: number;
    votesMunjilin: number;
    votesSigit: number;
    votesMakful: number;
    invalidVotes: number;
    reporter: string;
  }) => Promise<void>;
  voters?: VoterDPT[];
  onUpdateVoter?: (id: string, updates: Partial<VoterDPT>) => Promise<void>;
}

export const UserWilayahDashboard: React.FC<UserWilayahDashboardProps> = ({
  userDusun,
  userRT,
  username,
  rtResults,
  onSubmitVoteReport,
  voters = [],
  onUpdateVoter,
}) => {
  // Find dusun config
  const dusunConfig = useMemo(() => {
    return DUSUN_LIST.find((d) => d.name === userDusun) || DUSUN_LIST[0];
  }, [userDusun]);

  // Filter RT results strictly to user's assigned Dusun
  const wilayahResults = useMemo(() => {
    return rtResults.filter((r) => r.dusun === dusunConfig.name);
  }, [rtResults, dusunConfig]);

  // Tab state for volunteer
  const [activeTab, setActiveTab] = useState<'chart' | 'dpt'>('chart');

  // Filter DPT strictly to user's assigned Dusun
  const wilayahVoters = useMemo(() => {
    return voters.filter((v) => v.dusun === dusunConfig.name);
  }, [voters, dusunConfig]);

  // DPT Local filters for volunteer
  const [selectedRT, setSelectedRT] = useState<string>(userRT || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<'ALL' | 'IN_TEAM' | 'NOT_IN_TEAM'>('ALL');
  const [votingFilter, setVotingFilter] = useState<string>('ALL');

  const filteredWilayahVoters = useMemo(() => {
    return wilayahVoters.filter((v) => {
      if (selectedRT !== 'ALL' && v.rt !== selectedRT) return false;
      if (teamFilter === 'IN_TEAM' && !v.isInTeam) return false;
      if (teamFilter === 'NOT_IN_TEAM' && v.isInTeam) return false;
      if (votingFilter !== 'ALL') {
        const vStatus = v.votingStatus || (v.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : 'BELUM_MENENTUKAN');
        if (vStatus !== votingFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchNik = v.nik.includes(q);
        const matchRole = (v.teamRole || '').toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchRole) return false;
      }
      return true;
    });
  }, [wilayahVoters, selectedRT, teamFilter, votingFilter, searchQuery]);

  // Quick Stats for Relawan's Dusun DPT
  const teamVoterCount = wilayahVoters.filter((v) => v.isInTeam).length;
  const latifVoterCount = wilayahVoters.filter(
    (v) => v.votingStatus === 'MENYOBLOS_LATIF' || (!v.votingStatus && v.leanCandidate === 'ahmad_latif_usman')
  ).length;
  const lockedCount = wilayahVoters.filter((v) => v.lockStatus === 'GEMBOK' || v.lockStatus === 'KUNCI').length;

  // Toggle in-team for volunteer
  const handleToggleTeam = async (voter: VoterDPT) => {
    if (!onUpdateVoter) return;
    const newStatus = !voter.isInTeam;
    await onUpdateVoter(voter.id, {
      isInTeam: newStatus,
      teamRole: newStatus ? (voter.teamRole || `Relawan ${voter.rt}`) : '',
    });
  };

  // Update voting choice for volunteer
  const handleUpdateVotingChoice = async (voter: VoterDPT, choice: VotingChoiceStatus) => {
    if (!onUpdateVoter) return;
    let lean: CandidateId | 'swing' = 'ahmad_latif_usman';
    if (choice === 'MENYOBLOS_MUNJILIN') lean = 'munjilin';
    else if (choice === 'MENYOBLOS_SIGIT') lean = 'sigit';
    else if (choice === 'MENYOBLOS_MAKFUL') lean = 'makful';
    else if (choice === 'BELUM_MENENTUKAN' || choice === 'GOLPUT') lean = 'swing';

    await onUpdateVoter(voter.id, {
      votingStatus: choice,
      leanCandidate: lean,
    });
  };

  // Tally totals in this dusun
  const totalDpt = wilayahResults.reduce((acc, r) => acc + r.totalDpt, 0);
  const totalVotesLatif = wilayahResults.reduce((acc, r) => acc + r.votesLatif, 0);
  const totalVotesMunjilin = wilayahResults.reduce((acc, r) => acc + r.votesMunjilin, 0);
  const totalVotesSigit = wilayahResults.reduce((acc, r) => acc + r.votesSigit, 0);
  const totalVotesMakful = wilayahResults.reduce((acc, r) => acc + r.votesMakful, 0);
  const totalInvalid = wilayahResults.reduce((acc, r) => acc + r.invalidVotes, 0);
  const totalVotesCast = totalVotesLatif + totalVotesMunjilin + totalVotesSigit + totalVotesMakful + totalInvalid;

  const latifPercent = totalVotesCast > 0 ? ((totalVotesLatif / totalVotesCast) * 100).toFixed(1) : '0.0';
  const munjilinPercent = totalVotesCast > 0 ? ((totalVotesMunjilin / totalVotesCast) * 100).toFixed(1) : '0.0';
  const sigitPercent = totalVotesCast > 0 ? ((totalVotesSigit / totalVotesCast) * 100).toFixed(1) : '0.0';
  const makfulPercent = totalVotesCast > 0 ? ((totalVotesMakful / totalVotesCast) * 100).toFixed(1) : '0.0';

  // Input Form for Reporting Vote in Volunteer's RT
  const [reportRT, setReportRT] = useState<string>(userRT || dusunConfig.rts[0]);
  const [inputLatif, setInputLatif] = useState<number>(0);
  const [inputMunjilin, setInputMunjilin] = useState<number>(0);
  const [inputSigit, setInputSigit] = useState<number>(0);
  const [inputMakful, setInputMakful] = useState<number>(0);
  const [inputInvalid, setInputInvalid] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // When user changes report RT, prefill with existing RT data if available
  const handleSelectReportRT = (rtVal: string) => {
    setReportRT(rtVal);
    const existing = wilayahResults.find((r) => r.rt === rtVal);
    if (existing) {
      setInputLatif(existing.votesLatif);
      setInputMunjilin(existing.votesMunjilin);
      setInputSigit(existing.votesSigit);
      setInputMakful(existing.votesMakful);
      setInputInvalid(existing.invalidVotes);
    } else {
      setInputLatif(0);
      setInputMunjilin(0);
      setInputSigit(0);
      setInputMakful(0);
      setInputInvalid(0);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitVoteReport({
        rt: reportRT,
        dusun: dusunConfig.name,
        votesLatif: Number(inputLatif),
        votesMunjilin: Number(inputMunjilin),
        votesSigit: Number(inputSigit),
        votesMakful: Number(inputMakful),
        invalidVotes: Number(inputInvalid),
        reporter: `${username} (${reportRT})`,
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Scope Restriction Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-emerald-950">
                Wilayah Pantauan: {dusunConfig.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-extrabold">
                {dusunConfig.rts.length} RT ({dusunConfig.rts[0]} - {dusunConfig.rts[dusunConfig.rts.length - 1]})
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Relawan: <strong>{username}</strong> &bull; Sesuai otorisasi, Anda hanya mengakses statistik & perolehan suara wilayah Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Akses Terenkripsi & Terkunci</span>
        </div>
      </div>

      {/* Relawan Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'chart'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Grafik & Suara TPS {dusunConfig.name}</span>
        </button>

        <button
          onClick={() => setActiveTab('dpt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'dpt'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>DPT & Tandai Tim Wilayah ({wilayahVoters.length} Pemilih)</span>
          {teamVoterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
              {teamVoterCount} Tim
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CHART & VOTE REPORT */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          {/* Highlights for this Dusun */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-500 shadow-xs bg-gradient-to-b from-emerald-50/70 to-white">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold">1. Ahmad Latif Usman</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950">{totalVotesLatif.toLocaleString('id-ID')}</p>
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mt-1">
            <span>{latifPercent}% Suara</span>
            <span className="text-[10px] text-emerald-600">Unggul di {dusunConfig.name}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">2. Munjilin</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalVotesMunjilin.toLocaleString('id-ID')}</p>
          <span className="text-xs text-slate-500 font-semibold">{munjilinPercent}%</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">3. Sigit</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalVotesSigit.toLocaleString('id-ID')}</p>
          <span className="text-xs text-slate-500 font-semibold">{sigitPercent}%</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">4. Makful</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalVotesMakful.toLocaleString('id-ID')}</p>
          <span className="text-xs text-slate-500 font-semibold">{makfulPercent}%</span>
        </div>
      </div>

      {/* Graphical Comparison Bar in User Dusun */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Grafik Perolehan Suara di {dusunConfig.name}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total Suara Masuk: {totalVotesCast} dari {totalDpt} DPT
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-5 rounded-xl overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
          <div
            style={{ width: `${latifPercent}%` }}
            className="bg-emerald-600 h-full rounded-l-lg transition-all duration-500"
            title={`Ahmad Latif Usman: ${latifPercent}%`}
          />
          <div
            style={{ width: `${munjilinPercent}%` }}
            className="bg-blue-500 h-full transition-all duration-500"
            title={`Munjilin: ${munjilinPercent}%`}
          />
          <div
            style={{ width: `${sigitPercent}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Sigit: ${sigitPercent}%`}
          />
          <div
            style={{ width: `${makfulPercent}%` }}
            className="bg-purple-500 h-full rounded-r-lg transition-all duration-500"
            title={`Makful: ${makfulPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Ahmad Latif Usman</p>
              <p className="text-[11px] text-emerald-700">{latifPercent}% ({totalVotesLatif} suara)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Munjilin</p>
              <p className="text-[11px] text-blue-700">{munjilinPercent}% ({totalVotesMunjilin} suara)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Sigit</p>
              <p className="text-[11px] text-amber-700">{sigitPercent}% ({totalVotesSigit} suara)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-100">
            <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
            <div>
              <p className="font-semibold text-purple-900">Makful</p>
              <p className="text-[11px] text-purple-700">{makfulPercent}% ({totalVotesMakful} suara)</p>
            </div>
          </div>
        </div>
      </div>

      {/* RT by RT Table for this Dusun */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Rincian Suara Per-RT di {dusunConfig.name}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {wilayahResults.length} RT Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">RT / TPS</th>
                <th className="py-2.5 px-3">Total DPT</th>
                <th className="py-2.5 px-3 text-emerald-800 font-bold bg-emerald-50/60">Latif (No. 1)</th>
                <th className="py-2.5 px-3">Munjilin</th>
                <th className="py-2.5 px-3">Sigit</th>
                <th className="py-2.5 px-3">Makful</th>
                <th className="py-2.5 px-3">Tidak Sah</th>
                <th className="py-2.5 px-3">Pelapor / Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wilayahResults.map((r) => {
                const rtVotes = r.votesLatif + r.votesMunjilin + r.votesSigit + r.votesMakful + r.invalidVotes;
                const isLatifWinning = r.votesLatif > Math.max(r.votesMunjilin, r.votesSigit, r.votesMakful);

                return (
                  <tr key={r.rt} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {r.rt}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{r.totalDpt}</td>
                    <td className="py-2.5 px-3 font-black text-emerald-900 bg-emerald-50/40">
                      {r.votesLatif}
                      {isLatifWinning && (
                        <span className="ml-1.5 px-1 py-0.2 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                          Menang
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{r.votesMunjilin}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{r.votesSigit}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{r.votesMakful}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{r.invalidVotes}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">
                      <div>{r.reporter}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relawan Quick Report Form for their RT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Form Input & Laporan Hasil Suara RT
              </h3>
              <p className="text-xs text-slate-500">
                Input atau perbarui jumlah perolehan suara di TPS/RT wilayah tugas Anda
              </p>
            </div>
          </div>
        </div>

        {reportSuccess && (
          <div className="p-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Laporan suara {reportRT} berhasil dikirim dan tersinkronkan ke tim pusat!</span>
          </div>
        )}

        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Pilih RT yang Dilaporkan:</label>
            <select
              value={reportRT}
              onChange={(e) => handleSelectReportRT(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            >
              {dusunConfig.rts.map((rt) => (
                <option key={rt} value={rt}>
                  {rt} ({dusunConfig.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                1. Ahmad Latif Usman *
              </label>
              <input
                type="number"
                min={0}
                value={inputLatif}
                onChange={(e) => setInputLatif(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-white font-black text-emerald-900 text-base"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                2. Munjilin
              </label>
              <input
                type="number"
                min={0}
                value={inputMunjilin}
                onChange={(e) => setInputMunjilin(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-base"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                3. Sigit
              </label>
              <input
                type="number"
                min={0}
                value={inputSigit}
                onChange={(e) => setInputSigit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-base"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                4. Makful
              </label>
              <input
                type="number"
                min={0}
                value={inputMakful}
                onChange={(e) => setInputMakful(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-base"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Suara Tidak Sah
              </label>
              <input
                type="number"
                min={0}
                value={inputInvalid}
                onChange={(e) => setInputInvalid(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-500 text-base"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Pelapor: <strong>{username}</strong> (Saksi Lapangan)
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Mengirim...' : `Kirim Laporan Suara ${reportRT}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* TAB 2: DPT & TANDAI STATUS TIM WILAYAH */}
  {activeTab === 'dpt' && (
    <div className="space-y-4">
      {/* Summary Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total DPT {dusunConfig.name}</span>
          <span className="text-xl font-extrabold text-slate-900">{wilayahVoters.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Warga terdaftar</span>
        </div>
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-900 block flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Sudah Masuk Tim
          </span>
          <span className="text-xl font-extrabold text-amber-950">{teamVoterCount}</span>
          <span className="text-[10px] text-amber-800 block mt-0.5">
            {wilayahVoters.length > 0 ? ((teamVoterCount / wilayahVoters.length) * 100).toFixed(0) : 0}% Relawan & Tim
          </span>
        </div>
        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-900 block flex items-center gap-1">
            <Vote className="w-3.5 h-3.5 text-emerald-600" />
            Coblos Latif (No. 1)
          </span>
          <span className="text-xl font-extrabold text-emerald-950">{latifVoterCount}</span>
          <span className="text-[10px] text-emerald-800 block mt-0.5">
            {wilayahVoters.length > 0 ? ((latifVoterCount / wilayahVoters.length) * 100).toFixed(0) : 0}% Komitmen
          </span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-700 block flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            Kunci & Gembok
          </span>
          <span className="text-xl font-extrabold text-slate-900">{lockedCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pemilih diamankan</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIK warga..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* RT Filter */}
          <select
            value={selectedRT}
            onChange={(e) => setSelectedRT(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua RT ({dusunConfig.rts[0]} - {dusunConfig.rts[dusunConfig.rts.length - 1]})</option>
            {dusunConfig.rts.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>

          {/* Team Status Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua Status Tim</option>
            <option value="IN_TEAM">⭐ Sudah Masuk Tim</option>
            <option value="NOT_IN_TEAM">Bukan Anggota Tim</option>
          </select>

          {/* Voting Choice Filter */}
          <select
            value={votingFilter}
            onChange={(e) => setVotingFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua Pilihan Coblos</option>
            <option value="MENYOBLOS_LATIF">🗳️ No. 1 - Latif</option>
            <option value="MENYOBLOS_MUNJILIN">No. 2 - Munjilin</option>
            <option value="MENYOBLOS_SIGIT">No. 3 - Sigit</option>
            <option value="MENYOBLOS_MAKFUL">No. 4 - Makful</option>
            <option value="BELUM_MENENTUKAN">❓ Belum Menentukan</option>
            <option value="GOLPUT">❌ Golput</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Menampilkan {filteredWilayahVoters.length} pemilih
        </span>
      </div>

      {/* DPT Table for Volunteer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Nama & NIK</th>
                <th className="py-2.5 px-3">RT</th>
                <th className="py-2.5 px-3 text-center">Status Tim Pemenangan</th>
                <th className="py-2.5 px-3">Pilihan Coblos Calon Lurah</th>
                <th className="py-2.5 px-3 text-center">Kunci / Gembok</th>
                <th className="py-2.5 px-3">Relawan PJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWilayahVoters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data pemilih yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredWilayahVoters.map((voter, index) => {
                  const vStatus = voter.votingStatus || (voter.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : 'BELUM_MENENTUKAN');

                  return (
                    <tr key={voter.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{voter.name}</span>
                          {voter.isInTeam && (
                            <span title="Sudah Berada di Tim">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIK: {voter.nik} &bull; {voter.gender === 'L' ? 'L' : 'P'} ({voter.age || 35} th)
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {voter.rt}
                        </span>
                      </td>
                      {/* Toggle In Team Button */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleTeam(voter)}
                          title={voter.isInTeam ? 'Klik untuk membatalkan status tim' : 'Klik untuk tandai sudah masuk tim'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            voter.isInTeam
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${voter.isInTeam ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                          <span>{voter.isInTeam ? (voter.teamRole || 'Tim Relawan') : '+ Tandai Tim'}</span>
                        </button>
                      </td>
                      {/* Select Voting Choice */}
                      <td className="py-2.5 px-3">
                        <select
                          value={vStatus}
                          onChange={(e) => handleUpdateVotingChoice(voter, e.target.value as VotingChoiceStatus)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                            vStatus === 'MENYOBLOS_LATIF'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : vStatus === 'MENYOBLOS_MUNJILIN'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : vStatus === 'MENYOBLOS_SIGIT'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : vStatus === 'MENYOBLOS_MAKFUL'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="MENYOBLOS_LATIF">🗳️ No. 1 - Latif (Kita)</option>
                          <option value="MENYOBLOS_MUNJILIN">No. 2 - Munjilin</option>
                          <option value="MENYOBLOS_SIGIT">No. 3 - Sigit</option>
                          <option value="MENYOBLOS_MAKFUL">No. 4 - Makful</option>
                          <option value="BELUM_MENENTUKAN">❓ Belum Menentukan</option>
                          <option value="GOLPUT">❌ Golput</option>
                        </select>
                      </td>
                      {/* Lock Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            voter.lockStatus === 'GEMBOK'
                              ? 'bg-emerald-600 text-white'
                              : voter.lockStatus === 'KUNCI'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {voter.lockStatus === 'GEMBOK' ? (
                            <>
                              <Lock className="w-3 h-3" />
                              Gembok
                            </>
                          ) : voter.lockStatus === 'KUNCI' ? (
                            <>
                              <Lock className="w-3 h-3" />
                              Kunci
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-slate-400" />
                              Belum
                            </>
                          )}
                        </span>
                        {voter.nominal > 0 && (
                          <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                            Rp {voter.nominal.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {voter.volunteerInCharge || username || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
</div>
);
};
