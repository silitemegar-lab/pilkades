export type CandidateId = 'ahmad_latif_usman' | 'munjilin' | 'sigit' | 'makful';

export interface Candidate {
  id: CandidateId;
  name: string;
  ballotNumber: number;
  nickname: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isMainCandidate?: boolean;
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'ahmad_latif_usman',
    name: 'Ahmad Latif Usman',
    ballotNumber: 1,
    nickname: 'Pak Latif',
    tagline: 'Membangun Desa Makmur, Transparan, & Amanah',
    color: '#059669',
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    borderColor: 'border-emerald-500',
    isMainCandidate: true,
  },
  {
    id: 'munjilin',
    name: 'Munjilin',
    ballotNumber: 2,
    nickname: 'Pak Munjilin',
    tagline: 'Bersama Menuju Perubahan',
    color: '#3b82f6',
    bgColor: 'bg-blue-50 text-blue-800 border-blue-300',
    borderColor: 'border-blue-500',
  },
  {
    id: 'sigit',
    name: 'Sigit',
    ballotNumber: 3,
    nickname: 'Pak Sigit',
    tagline: 'Kemajuan dan Kesejahteraan Warga',
    color: '#f59e0b',
    bgColor: 'bg-amber-50 text-amber-800 border-amber-300',
    borderColor: 'border-amber-500',
  },
  {
    id: 'makful',
    name: 'Makful',
    ballotNumber: 4,
    nickname: 'Pak Makful',
    tagline: 'Rukun, Gotong Royong, Sejahtera',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50 text-purple-800 border-purple-300',
    borderColor: 'border-purple-500',
  },
];

export interface DusunConfig {
  id: string;
  name: string;
  rts: string[];
  description: string;
}

export const DUSUN_LIST: DusunConfig[] = [
  {
    id: 'tracap',
    name: 'Dusun Tracap',
    rts: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05', 'RT 06', 'RT 07'],
    description: 'Wilayah Barat / RT 01 s/d RT 07',
  },
  {
    id: 'jojogan',
    name: 'Dusun Jojogan',
    rts: ['RT 08', 'RT 09', 'RT 10', 'RT 11', 'RT 12', 'RT 13'],
    description: 'Wilayah Tengah / RT 08 s/d RT 13',
  },
  {
    id: 'karangsari',
    name: 'Dusun Karangsari',
    rts: ['RT 14', 'RT 15', 'RT 16', 'RT 17', 'RT 18', 'RT 19', 'RT 20', 'RT 21'],
    description: 'Wilayah Timur / RT 14 s/d RT 21',
  },
  {
    id: 'wonoroto',
    name: 'Dusun Wonoroto',
    rts: ['RT 22', 'RT 23', 'RT 24', 'RT 25', 'RT 26', 'RT 27', 'RT 28'],
    description: 'Wilayah Selatan / RT 22 s/d RT 28',
  },
];

export const ALL_RTS: { rt: string; dusun: string }[] = DUSUN_LIST.flatMap((d) =>
  d.rts.map((rt) => ({ rt, dusun: d.name }))
);

export type LockStatus = 'BELUM' | 'KUNCI' | 'GEMBOK';
export type VerificationStatus = 'TERVERIFIKASI' | 'BELUM_VERIFIKASI';

export type VotingChoiceStatus =
  | 'MENYOBLOS_LATIF'
  | 'MENYOBLOS_MUNJILIN'
  | 'MENYOBLOS_SIGIT'
  | 'MENYOBLOS_MAKFUL'
  | 'BELUM_MENENTUKAN'
  | 'GOLPUT';

export interface VoterDPT {
  id: string;
  nik?: string; // NIK dihapus dari tampilan aplikasi sesuai permintaan
  name: string;
  gender: 'L' | 'P';
  age?: number;
  dusun: string;
  rt: string;
  address?: string;
  // Fitur Penandaan Tim & Pilihan Coblos
  isInTeam: boolean; // Menandai apakah orang tersebut sudah berada di tim pemenangan/relawan
  teamRole?: string; // Peran di tim (misal: 'Koordinator RT', 'Saksi TPS', 'Timses Ring 1', 'Relawan Lapangan', 'Simpatisan')
  votingStatus: VotingChoiceStatus; // Status apakah menyoblos No. 1 Ahmad Latif Usman, calon lain, atau belum menentukan
  lockStatus: LockStatus; // KUNCI vs GEMBOK vs BELUM (hanya diakses oleh Admin)
  nominal: number; // Nominal komitmen/tali asih (hanya diakses oleh Admin)
  nominalNotes?: string;
  leanCandidate: CandidateId | 'swing';
  verificationStatus: VerificationStatus;
  volunteerInCharge?: string; // Nama relawan penanggung jawab
  phone?: string;
  notes?: string;
  createdBy?: 'admin' | string; // Menandai penginput data (hanya data inputan admin yang dapat diakses user)
  updatedAt: string;
}

export interface RTResult {
  rt: string;
  dusun: string;
  tpsName: string;
  totalDpt: number;
  votesLatif: number;
  votesMunjilin: number;
  votesSigit: number;
  votesMakful: number;
  invalidVotes: number;
  lastUpdated: string;
  reporter: string;
  isVerified: boolean;
}

export interface CampaignBroadcast {
  id: string;
  title: string;
  content: string;
  category: 'PENTING' | 'INSTRUKSI' | 'JADWAL' | 'INFORMASI';
  author: string;
  createdAt: string;
  pinned?: boolean;
}

export interface ActiveUser {
  sessionId: string;
  username: string;
  role: 'admin' | 'user';
  dusun?: string;
  rt?: string;
  loginTime: string;
  lastActive: string;
  device?: string;
}

export interface UserSession {
  sessionId: string;
  username: string;
  role: 'admin' | 'user';
  dusun?: string;
  rt?: string;
}
