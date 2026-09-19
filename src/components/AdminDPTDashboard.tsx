import React, { useState, useMemo } from 'react';
import {
  VoterDPT,
  LockStatus,
  VerificationStatus,
  CandidateId,
  VotingChoiceStatus,
  DUSUN_LIST,
  ALL_RTS,
} from '../types';
import {
  exportToExcel,
  downloadTemplateExcel,
  parseExcelFile,
} from '../utils/excelHelper';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Lock,
  KeyRound,
  CheckCircle2,
  Clock,
  Coins,
  Trash2,
  Edit2,
  X,
  Filter,
  Check,
  AlertCircle,
  FileDown,
  Star,
  UserCheck,
  UserPlus,
  Vote,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface AdminDPTDashboardProps {
  voters: VoterDPT[];
  onAddVoter: (voter: Partial<VoterDPT>) => Promise<void>;
  onUpdateVoter: (id: string, updates: Partial<VoterDPT>) => Promise<void>;
  onDeleteVoter: (id: string) => Promise<void>;
  onBulkImport: (voters: Partial<VoterDPT>[]) => Promise<void>;
  onResetSeed?: () => Promise<void>;
}

export const AdminDPTDashboard: React.FC<AdminDPTDashboardProps> = ({
  voters,
  onAddVoter,
  onUpdateVoter,
  onDeleteVoter,
  onBulkImport,
  onResetSeed,
}) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState<string>('ALL');
  const [selectedRT, setSelectedRT] = useState<string>('ALL');
  const [selectedLockStatus, setSelectedLockStatus] = useState<string>('ALL');
  const [selectedVerifStatus, setSelectedVerifStatus] = useState<string>('ALL');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<'ALL' | 'IN_TEAM' | 'NOT_IN_TEAM'>('ALL');
  const [selectedVotingStatusFilter, setSelectedVotingStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<VoterDPT | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importingFile, setImportingFile] = useState<File | null>(null);
  const [previewImportData, setPreviewImportData] = useState<Partial<VoterDPT>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<VoterDPT>>({
    name: '',
    nik: '',
    gender: 'L',
    age: 35,
    dusun: 'Dusun Tracap',
    rt: 'RT 01',
    address: '',
    isInTeam: false,
    teamRole: '',
    votingStatus: 'MENYOBLOS_LATIF',
    lockStatus: 'KUNCI',
    nominal: 100000,
    nominalNotes: '',
    leanCandidate: 'ahmad_latif_usman',
    verificationStatus: 'TERVERIFIKASI',
    volunteerInCharge: '',
    phone: '',
    notes: '',
  });

  // Calculate dynamic RT list based on selected dusun in form
  const formAvailableRTs = useMemo(() => {
    const dusunObj = DUSUN_LIST.find((d) => d.name === formData.dusun);
    return dusunObj ? dusunObj.rts : ALL_RTS.map((r) => r.rt);
  }, [formData.dusun]);

  // Calculate dynamic RT list for filter bar
  const filterAvailableRTs = useMemo(() => {
    if (selectedDusun === 'ALL') return ALL_RTS.map((r) => r.rt);
    const dusunObj = DUSUN_LIST.find((d) => d.name === selectedDusun);
    return dusunObj ? dusunObj.rts : [];
  }, [selectedDusun]);

  // Filtered Voters
  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      if (selectedDusun !== 'ALL' && v.dusun !== selectedDusun) return false;
      if (selectedRT !== 'ALL' && v.rt !== selectedRT) return false;
      if (selectedLockStatus !== 'ALL' && v.lockStatus !== selectedLockStatus) return false;
      if (selectedVerifStatus !== 'ALL' && v.verificationStatus !== selectedVerifStatus) return false;
      
      // Filter Status Masuk Tim
      if (selectedTeamFilter === 'IN_TEAM' && !v.isInTeam) return false;
      if (selectedTeamFilter === 'NOT_IN_TEAM' && v.isInTeam) return false;

      // Filter Status Coblos Calon
      if (selectedVotingStatusFilter !== 'ALL') {
        const vStatus = v.votingStatus || (v.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : v.leanCandidate === 'munjilin' ? 'MENYOBLOS_MUNJILIN' : v.leanCandidate === 'sigit' ? 'MENYOBLOS_SIGIT' : v.leanCandidate === 'makful' ? 'MENYOBLOS_MAKFUL' : 'BELUM_MENENTUKAN');
        if (vStatus !== selectedVotingStatusFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchNik = v.nik.includes(q);
        const matchAddr = (v.address || '').toLowerCase().includes(q);
        const matchVol = (v.volunteerInCharge || '').toLowerCase().includes(q);
        const matchRole = (v.teamRole || '').toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchAddr && !matchVol && !matchRole) return false;
      }
      return true;
    });
  }, [voters, selectedDusun, selectedRT, selectedLockStatus, selectedVerifStatus, selectedTeamFilter, selectedVotingStatusFilter, searchQuery]);

  // Key Aggregated Metrics
  const totalCount = voters.length;
  const teamCount = voters.filter((v) => v.isInTeam).length;
  const latifVotingCount = voters.filter((v) => v.votingStatus === 'MENYOBLOS_LATIF' || (!v.votingStatus && v.leanCandidate === 'ahmad_latif_usman')).length;
  const undecidedCount = voters.filter((v) => v.votingStatus === 'BELUM_MENENTUKAN' || (!v.votingStatus && v.leanCandidate === 'swing')).length;
  const lockedCount = voters.filter((v) => v.lockStatus === 'KUNCI').length;
  const padlockedCount = voters.filter((v) => v.lockStatus === 'GEMBOK').length;
  const totalSecured = lockedCount + padlockedCount;
  const verifiedCount = voters.filter((v) => v.verificationStatus === 'TERVERIFIKASI').length;
  const totalNominal = voters.reduce((acc, v) => acc + (v.nominal || 0), 0);

  // Handlers
  const handleOpenAdd = () => {
    setEditingVoter(null);
    setFormData({
      name: '',
      nik: '',
      gender: 'L',
      age: 38,
      dusun: selectedDusun !== 'ALL' ? selectedDusun : 'Dusun Tracap',
      rt: selectedRT !== 'ALL' ? selectedRT : 'RT 01',
      address: '',
      isInTeam: false,
      teamRole: '',
      votingStatus: 'MENYOBLOS_LATIF',
      lockStatus: 'KUNCI',
      nominal: 100000,
      nominalNotes: '',
      leanCandidate: 'ahmad_latif_usman',
      verificationStatus: 'TERVERIFIKASI',
      volunteerInCharge: '',
      phone: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (voter: VoterDPT) => {
    setEditingVoter(voter);
    setFormData({
      ...voter,
      isInTeam: Boolean(voter.isInTeam),
      teamRole: voter.teamRole || '',
      votingStatus: voter.votingStatus || (voter.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : voter.leanCandidate === 'munjilin' ? 'MENYOBLOS_MUNJILIN' : voter.leanCandidate === 'sigit' ? 'MENYOBLOS_SIGIT' : voter.leanCandidate === 'makful' ? 'MENYOBLOS_MAKFUL' : 'BELUM_MENENTUKAN'),
    });
    setIsAddModalOpen(true);
  };

  const handleSaveVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingVoter) {
        await onUpdateVoter(editingVoter.id, formData);
        setSuccessMessage(`Data pemilih "${formData.name}" berhasil diperbarui!`);
      } else {
        await onAddVoter(formData);
        setSuccessMessage(`Pemilih baru "${formData.name}" berhasil ditambahkan ke DPT!`);
      }
      setIsAddModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Inline Handlers
  const handleQuickToggleTeam = async (voter: VoterDPT) => {
    const newIsInTeam = !voter.isInTeam;
    const newRole = newIsInTeam ? (voter.teamRole || 'Relawan RT') : '';
    await onUpdateVoter(voter.id, { isInTeam: newIsInTeam, teamRole: newRole });
    setSuccessMessage(newIsInTeam ? `"${voter.name}" ditandai sebagai Relawan Tim Pemenangan!` : `"${voter.name}" dikembalikan ke status Warga Biasa.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleQuickChangeVotingStatus = async (voter: VoterDPT, status: VotingChoiceStatus) => {
    let lean: CandidateId | 'swing' = 'ahmad_latif_usman';
    if (status === 'MENYOBLOS_MUNJILIN') lean = 'munjilin';
    else if (status === 'MENYOBLOS_SIGIT') lean = 'sigit';
    else if (status === 'MENYOBLOS_MAKFUL') lean = 'makful';
    else if (status === 'BELUM_MENENTUKAN' || status === 'GOLPUT') lean = 'swing';

    await onUpdateVoter(voter.id, { votingStatus: status, leanCandidate: lean });
  };

  const handleResetDPTSeed = async () => {
    if (!onResetSeed) return;
    if (!confirm('Apakah Anda yakin ingin memuat ulang DPT Lengkap 28 RT? Ini akan menyinkronkan seluruh basis data pemilih 4 dusun.')) return;
    setIsResetting(true);
    try {
      await onResetSeed();
      setSuccessMessage('DPT Lengkap 28 RT (Tracap, Jojogan, Karangsari, Wonoroto) berhasil dimuat ulang!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickToggleLock = async (voter: VoterDPT, newStatus: LockStatus) => {
    await onUpdateVoter(voter.id, { lockStatus: newStatus });
  };

  const handleQuickToggleVerif = async (voter: VoterDPT) => {
    const nextVerif: VerificationStatus =
      voter.verificationStatus === 'TERVERIFIKASI' ? 'BELUM_VERIFIKASI' : 'TERVERIFIKASI';
    await onUpdateVoter(voter.id, { verificationStatus: nextVerif });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingFile(file);
    try {
      const parsed = await parseExcelFile(file);
      setPreviewImportData(parsed);
    } catch (err) {
      alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .csv valid.');
    }
  };

  const handleConfirmImport = async () => {
    if (previewImportData.length === 0) return;
    setIsSubmitting(true);
    try {
      await onBulkImport(previewImportData);
      setIsImportModalOpen(false);
      setImportingFile(null);
      setPreviewImportData([]);
      setSuccessMessage(`Berhasil mengimpor ${previewImportData.length} data DPT dari Excel!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Success Message */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-800 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total DPT */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total DPT</span>
            <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] text-slate-400">28 RT / 4 Dusun Desa</span>
        </div>

        {/* Di Tim Pemenangan */}
        <div className="bg-white rounded-xl p-3.5 border border-emerald-300 shadow-xs bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              Di Tim Pemenangan
            </span>
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-950">{teamCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {totalCount > 0 ? ((teamCount / totalCount) * 100).toFixed(1) : 0}% DPT masuk tim
          </span>
        </div>

        {/* Pasti Nyoblos No. 1 Ahmad Latif */}
        <div className="bg-white rounded-xl p-3.5 border border-emerald-300 shadow-xs bg-gradient-to-b from-emerald-50/40 to-white">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Vote className="w-3.5 h-3.5 text-emerald-600" />
              Coblos No. 1 Latif
            </span>
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-950">{latifVotingCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Pasti Menang Pilkades
          </span>
        </div>

        {/* Terkunci & Digembok */}
        <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-xs bg-gradient-to-b from-blue-50/40 to-white">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              Terkunci / Gembok
            </span>
            <span className="p-1 rounded-lg bg-blue-100 text-blue-700">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-950">
            {totalSecured}
          </p>
          <span className="text-[10px] text-blue-700 font-medium">
            {padlockedCount} Ring 1 + {lockedCount} Kunci
          </span>
        </div>

        {/* Belum Menentukan (Swing) */}
        <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs bg-gradient-to-b from-amber-50/30 to-white">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Belum Menentukan
            </span>
            <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-950">{undecidedCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">
            Target kunjungan silaturahmi
          </span>
        </div>

        {/* Total Nominal Tali Asih/Logistik */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Logistik / Tali Asih
            </span>
            <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
              <Coins className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 truncate">
            Rp {totalNominal.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            Total tercatat di sistem
          </span>
        </div>
      </div>

      {/* Action Bar & Excel Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-dpt"
            type="text"
            placeholder="Cari nama pemilih, NIK, alamat, tim, atau relawan PJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-add-dpt-manual"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Input DPT Manual</span>
          </button>

          <button
            id="btn-import-excel"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          <button
            id="btn-export-excel"
            onClick={() => exportToExcel(filteredVoters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition active:scale-95"
            title="Export data saat ini ke format .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            id="btn-download-template"
            onClick={downloadTemplateExcel}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
            title="Unduh template Excel untuk input cepat"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Template</span>
          </button>

          {onResetSeed && (
            <button
              id="btn-reset-seed-28rt"
              onClick={handleResetDPTSeed}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition active:scale-95 disabled:opacity-60"
              title="Muat ulang seluruh data DPT 28 RT"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-700 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Muat Ulang 28 RT</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => {
            setSelectedTeamFilter('ALL');
            setSelectedVotingStatusFilter('ALL');
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
            selectedTeamFilter === 'ALL' && selectedVotingStatusFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua DPT ({totalCount})
        </button>

        <button
          onClick={() => {
            setSelectedTeamFilter('IN_TEAM');
            setSelectedVotingStatusFilter('ALL');
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedTeamFilter === 'IN_TEAM'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>⭐ Sudah di Tim ({teamCount})</span>
        </button>

        <button
          onClick={() => {
            setSelectedTeamFilter('ALL');
            setSelectedVotingStatusFilter('MENYOBLOS_LATIF');
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedVotingStatusFilter === 'MENYOBLOS_LATIF'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>🗳️ Pasti Coblos Latif ({latifVotingCount})</span>
        </button>

        <button
          onClick={() => {
            setSelectedLockStatus(selectedLockStatus === 'ALL' ? 'GEMBOK' : 'ALL');
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedLockStatus !== 'ALL'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>🔒 Suara Terkunci ({totalSecured})</span>
        </button>

        <button
          onClick={() => {
            setSelectedTeamFilter('ALL');
            setSelectedVotingStatusFilter('BELUM_MENENTUKAN');
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedVotingStatusFilter === 'BELUM_MENENTUKAN'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>❓ Belum Menentukan ({undecidedCount})</span>
        </button>
      </div>

      {/* Filter Bar by Dusun, RT, Tim, & Pilihan Calon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Dusun Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Wilayah Dusun:
          </span>
          <button
            onClick={() => {
              setSelectedDusun('ALL');
              setSelectedRT('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              selectedDusun === 'ALL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Dusun ({voters.length})
          </button>
          {DUSUN_LIST.map((dusun) => {
            const count = voters.filter((v) => v.dusun === dusun.name).length;
            const isSelected = selectedDusun === dusun.name;
            return (
              <button
                key={dusun.id}
                onClick={() => {
                  setSelectedDusun(dusun.name);
                  setSelectedRT('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{dusun.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* RT, Tim, Pilihan Calon & Status Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* RT Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">RT:</span>
            <select
              value={selectedRT}
              onChange={(e) => setSelectedRT(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua RT ({selectedDusun === 'ALL' ? 'RT 01 - 28' : `${selectedDusun}`})</option>
              {filterAvailableRTs.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Masuk Tim */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status Tim:</span>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value as 'ALL' | 'IN_TEAM' | 'NOT_IN_TEAM')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 font-semibold"
            >
              <option value="ALL">Semua Status Tim</option>
              <option value="IN_TEAM">⭐ Hanya Masuk Tim Pemenangan</option>
              <option value="NOT_IN_TEAM">Warga Biasa (Bukan Tim)</option>
            </select>
          </div>

          {/* Filter Status Coblos */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Pilihan Coblos:</span>
            <select
              value={selectedVotingStatusFilter}
              onChange={(e) => setSelectedVotingStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Pilihan Coblos</option>
              <option value="MENYOBLOS_LATIF">No. 1 - Ahmad Latif Usman</option>
              <option value="MENYOBLOS_MUNJILIN">No. 2 - Munjilin</option>
              <option value="MENYOBLOS_SIGIT">No. 3 - Sigit</option>
              <option value="MENYOBLOS_MAKFUL">No. 4 - Makful</option>
              <option value="BELUM_MENENTUKAN">Belum Menentukan (Swing)</option>
              <option value="GOLPUT">Golput / Tidak Memilih</option>
            </select>
          </div>

          {/* Status Kunci / Gembok */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status Kunci:</span>
            <select
              value={selectedLockStatus}
              onChange={(e) => setSelectedLockStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Penguncian</option>
              <option value="GEMBOK">DIGEMBOK (Ring 1 100%)</option>
              <option value="KUNCI">DIKUNCI (Simpatisan Pasti)</option>
              <option value="BELUM">Belum Dikunci (Mengambang)</option>
            </select>
          </div>

          {/* Verifikasi */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Verifikasi:</span>
            <select
              value={selectedVerifStatus}
              onChange={(e) => setSelectedVerifStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Verifikasi</option>
              <option value="TERVERIFIKASI">Terverifikasi</option>
              <option value="BELUM_VERIFIKASI">Belum Diverifikasi</option>
            </select>
          </div>

          {(selectedDusun !== 'ALL' || selectedRT !== 'ALL' || selectedLockStatus !== 'ALL' || selectedVerifStatus !== 'ALL' || selectedTeamFilter !== 'ALL' || selectedVotingStatusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDusun('ALL');
                setSelectedRT('ALL');
                setSelectedLockStatus('ALL');
                setSelectedVerifStatus('ALL');
                setSelectedTeamFilter('ALL');
                setSelectedVotingStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* DPT Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Pemilih Tetap (DPT) & Status Tim / Pilihan Coblos
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {filteredVoters.length} Pemilih Ditampilkan
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">No</th>
                <th className="py-3 px-3.5">Nama & NIK</th>
                <th className="py-3 px-3.5">Wilayah (Dusun / RT)</th>
                <th className="py-3 px-3.5">Status Tim Pemenangan</th>
                <th className="py-3 px-3.5">Status Coblos Calon Lurah</th>
                <th className="py-3 px-3.5">Status Penguncian</th>
                <th className="py-3 px-3.5">Nominal Tali Asih</th>
                <th className="py-3 px-3.5">Verifikasi</th>
                <th className="py-3 px-3.5">Relawan PJ</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Tidak ada data DPT yang sesuai filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci pencarian atau reset filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter, index) => {
                  const isPadlock = voter.lockStatus === 'GEMBOK';
                  const isLock = voter.lockStatus === 'KUNCI';
                  const isVerified = voter.verificationStatus === 'TERVERIFIKASI';
                  const currentVotingStatus = voter.votingStatus || (voter.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : voter.leanCandidate === 'munjilin' ? 'MENYOBLOS_MUNJILIN' : voter.leanCandidate === 'sigit' ? 'MENYOBLOS_SIGIT' : voter.leanCandidate === 'makful' ? 'MENYOBLOS_MAKFUL' : 'BELUM_MENENTUKAN');

                  return (
                    <tr key={voter.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{voter.name}</span>
                          {voter.isInTeam && (
                            <span title="Anggota Tim Pemenangan">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>NIK: {voter.nik}</span>
                          <span>&bull;</span>
                          <span>{voter.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({voter.age || 35} th)</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-800">{voter.dusun}</span>
                        <div className="text-[11px] text-emerald-700 font-bold">{voter.rt}</div>
                      </td>

                      {/* Status Berada di Tim Pemenangan */}
                      <td className="py-3 px-3.5">
                        {voter.isInTeam ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                                <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                Masuk Tim
                              </span>
                              <button
                                onClick={() => handleQuickToggleTeam(voter)}
                                title="Ubah status menjadi warga biasa"
                                className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                            <div className="text-[11px] text-emerald-700 font-semibold truncate max-w-[140px]">
                              {voter.teamRole || 'Relawan Tim'}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                              Warga Biasa
                            </span>
                            <button
                              onClick={() => handleQuickToggleTeam(voter)}
                              title="Tandai orang ini sudah masuk Tim Pemenangan"
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition active:scale-95 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Tim</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Pilihan Coblos Calon Kepala Desa */}
                      <td className="py-3 px-3.5">
                        <select
                          value={currentVotingStatus}
                          onChange={(e) => handleQuickChangeVotingStatus(voter, e.target.value as VotingChoiceStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:ring-1 focus:ring-emerald-500 transition cursor-pointer ${
                            currentVotingStatus === 'MENYOBLOS_LATIF'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : currentVotingStatus === 'MENYOBLOS_MUNJILIN'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : currentVotingStatus === 'MENYOBLOS_SIGIT'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : currentVotingStatus === 'MENYOBLOS_MAKFUL'
                              ? 'bg-purple-50 text-purple-900 border-purple-300'
                              : currentVotingStatus === 'GOLPUT'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="MENYOBLOS_LATIF">🗳️ No. 1 - Ahmad Latif Usman</option>
                          <option value="MENYOBLOS_MUNJILIN">No. 2 - Munjilin</option>
                          <option value="MENYOBLOS_SIGIT">No. 3 - Sigit</option>
                          <option value="MENYOBLOS_MAKFUL">No. 4 - Makful</option>
                          <option value="BELUM_MENENTUKAN">❓ Belum Menentukan (Swing)</option>
                          <option value="GOLPUT">❌ Golput (Tidak Memilih)</option>
                        </select>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          {isPadlock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                              <Lock className="w-3 h-3 text-emerald-600" />
                              DIGEMBOK
                            </span>
                          ) : isLock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
                              <KeyRound className="w-3 h-3 text-blue-600" />
                              DIKUNCI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                              Belum Dikunci
                            </span>
                          )}

                          {/* Quick Toggle Dropdown / Buttons */}
                          <div className="flex items-center gap-1">
                            {!isPadlock && (
                              <button
                                onClick={() => handleQuickToggleLock(voter, 'GEMBOK')}
                                title="Set ke DIGEMBOK (Ring 1)"
                                className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {!isLock && (
                              <button
                                onClick={() => handleQuickToggleLock(voter, 'KUNCI')}
                                title="Set ke DIKUNCI"
                                className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">
                          {voter.nominal > 0 ? (
                            <span className="text-amber-700 font-mono">
                              Rp {voter.nominal.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </div>
                        {voter.nominalNotes && (
                          <div className="text-[11px] text-slate-500 italic truncate max-w-[140px]">
                            {voter.nominalNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => handleQuickToggleVerif(voter)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terverifikasi
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              Belum Diverifikasi
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-slate-700 font-medium">
                          {voter.volunteerInCharge || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(voter)}
                            title="Edit Data Pemilih"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pemilih "${voter.name}" dari DPT?`)) {
                                onDeleteVoter(voter.id);
                              }
                            }}
                            title="Hapus Pemilih"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Voter */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingVoter ? 'Edit Data Pemilih DPT' : 'Tambah Pemilih DPT Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoter} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama pemilih sesuai KTP..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={formData.nik || ''}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="330412..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dusun *</label>
                  <select
                    value={formData.dusun}
                    onChange={(e) => {
                      const newDusun = e.target.value;
                      const dObj = DUSUN_LIST.find((d) => d.name === newDusun);
                      setFormData({
                        ...formData,
                        dusun: newDusun,
                        rt: dObj ? dObj.rts[0] : 'RT 01',
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    {DUSUN_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RT *</label>
                  <select
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    {formAvailableRTs.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usia / Umur</label>
                  <input
                    type="number"
                    value={formData.age || 35}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Masuk Tim Pemenangan (Tandai Berada di Tim) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="check-is-in-team"
                    checked={formData.isInTeam || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isInTeam: e.target.checked,
                        teamRole: e.target.checked ? (formData.teamRole || 'Relawan RT') : '',
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="check-is-in-team" className="text-xs font-bold text-emerald-950 cursor-pointer flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    Tandai: Orang ini SUDAH BERADA DI TIM Pemenangan Ahmad Latif Usman
                  </label>
                </div>

                {formData.isInTeam && (
                  <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                        Peran / Posisi di Tim Pemenangan
                      </label>
                      <input
                        type="text"
                        value={formData.teamRole || ''}
                        onChange={(e) => setFormData({ ...formData, teamRole: e.target.value })}
                        placeholder="Contoh: Koordinator RT, Saksi TPS..."
                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                        Pilihan Cepat Peran:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {['Koordinator RT', 'Saksi TPS', 'Penggerak RT', 'Relawan Lapangan'].map((role) => (
                          <button
                            type="button"
                            key={role}
                            onClick={() => setFormData({ ...formData, teamRole: role })}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition ${
                              formData.teamRole === role
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Pilihan Coblos Calon Kepala Desa (Tandai Menyoblos Calon) */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-blue-600" />
                  Status Coblos Calon Lurah (Kepala Desa) *
                </label>
                <select
                  value={formData.votingStatus || (formData.leanCandidate === 'ahmad_latif_usman' ? 'MENYOBLOS_LATIF' : formData.leanCandidate === 'munjilin' ? 'MENYOBLOS_MUNJILIN' : formData.leanCandidate === 'sigit' ? 'MENYOBLOS_SIGIT' : formData.leanCandidate === 'makful' ? 'MENYOBLOS_MAKFUL' : 'BELUM_MENENTUKAN')}
                  onChange={(e) => {
                    const val = e.target.value as VotingChoiceStatus;
                    let lean: CandidateId | 'swing' = 'ahmad_latif_usman';
                    if (val === 'MENYOBLOS_MUNJILIN') lean = 'munjilin';
                    else if (val === 'MENYOBLOS_SIGIT') lean = 'sigit';
                    else if (val === 'MENYOBLOS_MAKFUL') lean = 'makful';
                    else if (val === 'BELUM_MENENTUKAN' || val === 'GOLPUT') lean = 'swing';

                    setFormData({
                      ...formData,
                      votingStatus: val,
                      leanCandidate: lean,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MENYOBLOS_LATIF">🗳️ No. 1 - AHMAD LATIF USMAN (Calon Kita)</option>
                  <option value="MENYOBLOS_MUNJILIN">No. 2 - Munjilin</option>
                  <option value="MENYOBLOS_SIGIT">No. 3 - Sigit</option>
                  <option value="MENYOBLOS_MAKFUL">No. 4 - Makful</option>
                  <option value="BELUM_MENENTUKAN">❓ Belum Menentukan (Swing / Ragu-ragu)</option>
                  <option value="GOLPUT">❌ Golput / Tidak Menggunakan Hak Suara</option>
                </select>
              </div>

              {/* Status Penguncian & Nominal (Core Requirement) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Status Penguncian Pemilih
                    </label>
                    <select
                      value={formData.lockStatus}
                      onChange={(e) => setFormData({ ...formData, lockStatus: e.target.value as LockStatus })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-900"
                    >
                      <option value="GEMBOK">DIGEMBOK (Ring 1 - Komitmen 100%)</option>
                      <option value="KUNCI">DIKUNCI (Simpatisan Mantap)</option>
                      <option value="BELUM">Belum Dikunci (Mengambang/Swing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      Nominal Tali Asih / Operasional (Rp)
                    </label>
                    <input
                      type="number"
                      step={25000}
                      value={formData.nominal || 0}
                      onChange={(e) => setFormData({ ...formData, nominal: parseInt(e.target.value, 10) || 0 })}
                      placeholder="Contoh: 100000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono font-bold text-amber-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Catatan Khusus Nominal / Logistik
                  </label>
                  <input
                    type="text"
                    value={formData.nominalNotes || ''}
                    onChange={(e) => setFormData({ ...formData, nominalNotes: e.target.value })}
                    placeholder="Contoh: Bantuan operasional keluarga, sudah terima amplop, dll..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Verifikasi</label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as VerificationStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold"
                  >
                    <option value="TERVERIFIKASI">Terverifikasi (Valid)</option>
                    <option value="BELUM_VERIFIKASI">Belum Diverifikasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp Pemilih</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relawan Penanggung Jawab (PJ)</label>
                  <input
                    type="text"
                    value={formData.volunteerInCharge || ''}
                    onChange={(e) => setFormData({ ...formData, volunteerInCharge: e.target.value })}
                    placeholder="Nama relawan RT setempat..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Nama jalan / RT / nomor rumah..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : editingVoter ? 'Simpan Perubahan' : 'Simpan ke DPT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Import DPT dari Excel (.xlsx / .csv)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPreviewImportData([]);
                  setImportingFile(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-center bg-slate-50/50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {importingFile ? importingFile.name : 'Pilih file Excel (.xlsx / .csv) atau seret ke sini'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung file ekspor KPU, template desa, maupun format bebas dengan kolom nama, dusun, dan RT
                </p>
              </div>

              {previewImportData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">
                      Pratinjau Data ({previewImportData.length} baris pemilih terbaca)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Menampilkan 5 baris pertama
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48 text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Dusun</th>
                          <th className="p-2">RT</th>
                          <th className="p-2">Status Kunci</th>
                          <th className="p-2">Nominal (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewImportData.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold">{row.name}</td>
                            <td className="p-2">{row.dusun}</td>
                            <td className="p-2">{row.rt}</td>
                            <td className="p-2">{row.lockStatus}</td>
                            <td className="p-2">Rp {Number(row.nominal || 0).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Format Template Excel</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setPreviewImportData([]);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={previewImportData.length === 0 || isSubmitting}
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Mengimpor...' : `Impor ${previewImportData.length} Pemilih`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
