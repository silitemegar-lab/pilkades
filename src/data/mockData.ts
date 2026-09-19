import {
  VoterDPT,
  RTResult,
  CampaignBroadcast,
  DUSUN_LIST,
  ALL_RTS,
} from '../types';

export const INITIAL_BROADCASTS: CampaignBroadcast[] = [
  {
    id: 'bc-1',
    title: 'Konsolidasi Akbar Relawan Pemenangan Ahmad Latif Usman',
    content:
      'Kepada seluruh relawan Dusun Tracap, Jojogan, Karangsari, dan Wonoroto: Rapat koordinasi pemantapan saksi dan validasi data pemilih (kunci & gembok) akan diadakan besok malam pukul 19.30 WIB di Posko Induk Kemenangan.',
    category: 'PENTING',
    author: 'Admin Tim Kemenangan',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    pinned: true,
  },
  {
    id: 'bc-2',
    title: 'Instruksi Khusus Saksi TPS & Pengawalan Pemilih Kunci/Gembok',
    content:
      'Pastikan seluruh pemilih yang berstatus GEMBOK didampingi hadir tepat waktu ke TPS pagi hari. Segera laporkan perkembangan suara per RT melalui aplikasi secara berkala.',
    category: 'INSTRUKSI',
    author: 'Koordinator Lapangan',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    pinned: true,
  },
  {
    id: 'bc-3',
    title: 'Penyaluran Tali Asih & Logistik Relawan Tiap RT',
    content:
      'Nominal operasional dan tali asih pemilih kunci telah diverifikasi oleh tim bendahara posko pusat. Pastikan tanda terima dan data di aplikasi sinkron.',
    category: 'INFORMASI',
    author: 'Bendahara Tim',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'bc-4',
    title: 'Jadwal Sambang Tokoh Masyarakat & Pengajian Bersama Pak Latif',
    content:
      'Pak Ahmad Latif Usman akan bersilaturahmi ke Dusun Karangsari (RT 14-21) pada hari Rabu malam dan Dusun Wonoroto (RT 22-28) pada hari Kamis malam.',
    category: 'JADWAL',
    author: 'Humas Kampanye',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

// Generate realistic full DPT data covering all 4 dusuns and all 28 RTs
export function generateFullDPTList(): VoterDPT[] {
  const maleNames = [
    'Sutrisno Wibowo', 'Agus Purnomo', 'Warsito Santoso', 'Haji Marzuki', 'Kuswanto',
    'Fajar Nugroho', 'Suhartono', 'Yudi Prasetyo', 'Hadi Gunawan', 'Sukirno',
    'Doni Pratama', 'Budi Waluyo', 'Mulyono', 'Ahmad Syafii', 'Rizki Maulana',
    'Teguh Prasojo', 'Darminto', 'Bambang Supriyanto', 'Slamet Riyadi', 'Joko Susilo',
    'Widodo Saputra', 'Paryono', 'Sugeng Raharjo', 'Eko Wahyudi', 'Dwi Santoso',
    'Heru Purnomo', 'Triyono', 'Supardi', 'Kasiman', 'Kusnadi',
    'Ngatiman', 'Sumarno', 'Suparno', 'Wahyudi Pratama', 'Hariyanto',
    'Ari Wibowo', 'Iwan Setiawan', 'Untung Slamet', 'Basuki Rahmat', 'Bambang Irawan'
  ];

  const femaleNames = [
    'Sri Rahayu', 'Dewi Lestari', 'Tri Wahyuni', 'Endang Purwati', 'Nur Aini',
    'Siti Aminah', 'Rina Marlina', 'Sunarti', 'Wulan Dari', 'Khotimah',
    'Umi Kalsum', 'Siti Fatimah', 'Ratna Sari', 'Yuliana', 'Suprihatin',
    'Sri Utami', 'Wiji Lestari', 'Siti Maryam', 'Sumini', 'Suratmi',
    'Tuminah', 'Warsini', 'Parmi', 'Ngatini', 'Suyati',
    'Kurniawati', 'Dewi Anggraeni', 'Nurul Hidayah', 'Fitri Handayani', 'Indah Permata'
  ];

  const streetNames = [
    'Jl. Kenanga', 'Jl. Melati', 'Jl. Mawar', 'Jl. Anggrek', 'Jl. Flamboyan',
    'Blok Utara', 'Blok Selatan', 'Blok Krajan', 'Blok Kulon', 'Blok Wetan',
    'Gang Masjid', 'Gang Makmur', 'Gang Sejahtera', 'Jl. Balai Desa', 'Gang Tani'
  ];

  const result: VoterDPT[] = [];
  let idCounter = 100;

  ALL_RTS.forEach((rtItem, rtIndex) => {
    const { rt, dusun } = rtItem;
    const rtNum = parseInt(rt.replace('RT ', ''), 10);

    // Voter 1: Koordinator RT (Pasti di Tim & Pasti Nyoblos Latif - Gembok)
    const mName1 = maleNames[(rtIndex * 3) % maleNames.length];
    idCounter++;
    result.push({
      id: `dpt-${idCounter}`,
      nik: `330412${String(1500000000 + idCounter * 73921).slice(0, 10)}`,
      name: mName1,
      gender: 'L',
      age: 38 + (rtIndex % 20),
      dusun,
      rt,
      address: `${streetNames[rtIndex % streetNames.length]} No. ${(rtIndex * 3 + 4)}, ${dusun}`,
      isInTeam: true,
      teamRole: `Koordinator ${rt}`,
      votingStatus: 'MENYOBLOS_LATIF',
      lockStatus: 'GEMBOK',
      nominal: 150000,
      nominalNotes: `Koordinator Tim ${rt}, logistik komplit`,
      leanCandidate: 'ahmad_latif_usman',
      verificationStatus: 'TERVERIFIKASI',
      volunteerInCharge: mName1,
      phone: `0812${String(23450000 + rtIndex * 331).slice(0, 8)}`,
      notes: `Tokoh penggerak warga ${rt}`,
      updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 1800000)).toISOString(),
    });

    // Voter 2: Saksi TPS / Kader Perempuan (Pasti di Tim & Pasti Nyoblos Latif)
    const fName1 = femaleNames[(rtIndex * 2) % femaleNames.length];
    idCounter++;
    result.push({
      id: `dpt-${idCounter}`,
      nik: `330412${String(2500000000 + idCounter * 81243).slice(0, 10)}`,
      name: fName1,
      gender: 'P',
      age: 30 + (rtIndex % 25),
      dusun,
      rt,
      address: `${streetNames[(rtIndex + 2) % streetNames.length]} No. ${(rtIndex * 2 + 7)}, ${dusun}`,
      isInTeam: true,
      teamRole: `Saksi TPS ${rt}`,
      votingStatus: 'MENYOBLOS_LATIF',
      lockStatus: 'GEMBOK',
      nominal: 150000,
      nominalNotes: 'Mandat saksi resmi Posko Induk',
      leanCandidate: 'ahmad_latif_usman',
      verificationStatus: 'TERVERIFIKASI',
      volunteerInCharge: mName1,
      phone: `0852${String(11220000 + rtIndex * 415).slice(0, 8)}`,
      notes: 'Siap kawal TPS sampai penghitungan C1',
      updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 2400000)).toISOString(),
    });

    // Voter 3: Simpatisan Dikunci (Bukan Pengurus Tim Formal tapi Solid Nyoblos Latif)
    const mName2 = maleNames[(rtIndex * 3 + 1) % maleNames.length];
    idCounter++;
    result.push({
      id: `dpt-${idCounter}`,
      nik: `330412${String(3500000000 + idCounter * 62119).slice(0, 10)}`,
      name: mName2,
      gender: 'L',
      age: 42 + (rtIndex % 18),
      dusun,
      rt,
      address: `${streetNames[(rtIndex + 4) % streetNames.length]} RT ${rtNum}, ${dusun}`,
      isInTeam: false,
      teamRole: 'Simpatisan Warga',
      votingStatus: 'MENYOBLOS_LATIF',
      lockStatus: 'KUNCI',
      nominal: 100000,
      nominalNotes: 'Tali asih operasional warga',
      leanCandidate: 'ahmad_latif_usman',
      verificationStatus: 'TERVERIFIKASI',
      volunteerInCharge: mName1,
      phone: `0813${String(98760000 + rtIndex * 522).slice(0, 8)}`,
      notes: 'Keluarga inti 3 suara mantap Pak Latif',
      updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 3600000)).toISOString(),
    });

    // Voter 4: Warga Perempuan Komitmen Kunci (Nyoblos No. 1)
    const fName2 = femaleNames[(rtIndex * 2 + 1) % femaleNames.length];
    idCounter++;
    result.push({
      id: `dpt-${idCounter}`,
      nik: `330412${String(4500000000 + idCounter * 53421).slice(0, 10)}`,
      name: fName2,
      gender: 'P',
      age: 35 + (rtIndex % 22),
      dusun,
      rt,
      address: `Blok Krajan ${rt}, ${dusun}`,
      isInTeam: false,
      teamRole: 'Kader Warga',
      votingStatus: 'MENYOBLOS_LATIF',
      lockStatus: 'KUNCI',
      nominal: 100000,
      nominalNotes: 'Silaturahmi keluarga sudah terlaksana',
      leanCandidate: 'ahmad_latif_usman',
      verificationStatus: 'TERVERIFIKASI',
      volunteerInCharge: mName1,
      notes: 'Aktif pengajian dan arisan RT',
      updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 4800000)).toISOString(),
    });

    // Voter 5: Warga Mengambang / Swing (Belum Menentukan & Belum Masuk Tim) -> Target Kampanye
    const mName3 = maleNames[(rtIndex * 3 + 2) % maleNames.length];
    idCounter++;
    result.push({
      id: `dpt-${idCounter}`,
      nik: `330412${String(5500000000 + idCounter * 49832).slice(0, 10)}`,
      name: mName3,
      gender: 'L',
      age: 28 + (rtIndex % 30),
      dusun,
      rt,
      address: `${streetNames[(rtIndex + 1) % streetNames.length]} ${rt}, ${dusun}`,
      isInTeam: false,
      teamRole: '',
      votingStatus: 'BELUM_MENENTUKAN',
      lockStatus: 'BELUM',
      nominal: 0,
      nominalNotes: '',
      leanCandidate: 'swing',
      verificationStatus: 'BELUM_VERIFIKASI',
      volunteerInCharge: mName1,
      phone: `0877${String(34560000 + rtIndex * 219).slice(0, 8)}`,
      notes: 'Perlu didekati lebih lanjut oleh relawan pemuda',
      updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 7200000)).toISOString(),
    });

    // Voter 6 di RT genap: Warga yang sempat condong ke calon lain agar bisa diedit/diajak masuk tim
    if (rtNum % 2 === 0) {
      const otherCandidateStatus: 'MENYOBLOS_MUNJILIN' | 'MENYOBLOS_SIGIT' | 'MENYOBLOS_MAKFUL' =
        rtNum % 6 === 0 ? 'MENYOBLOS_MAKFUL' : rtNum % 4 === 0 ? 'MENYOBLOS_SIGIT' : 'MENYOBLOS_MUNJILIN';
      const otherLean =
        otherCandidateStatus === 'MENYOBLOS_MUNJILIN'
          ? 'munjilin'
          : otherCandidateStatus === 'MENYOBLOS_SIGIT'
          ? 'sigit'
          : 'makful';

      idCounter++;
      result.push({
        id: `dpt-${idCounter}`,
        nik: `330412${String(6500000000 + idCounter * 38291).slice(0, 10)}`,
        name: `${maleNames[(rtIndex + 17) % maleNames.length]} (Kerabat)`,
        gender: 'L',
        age: 45 + (rtIndex % 15),
        dusun,
        rt,
        address: `Jalan Batas Desa RT ${rtNum}, ${dusun}`,
        isInTeam: false,
        teamRole: '',
        votingStatus: otherCandidateStatus,
        lockStatus: 'BELUM',
        nominal: 0,
        nominalNotes: '',
        leanCandidate: otherLean,
        verificationStatus: 'TERVERIFIKASI',
        volunteerInCharge: mName1,
        notes: `Kecenderungan ke ${otherLean}, target rangkul dan ajak dialog timses`,
        updatedAt: new Date(Date.now() - (rtIndex * 3600000 + 9000000)).toISOString(),
      });
    }
  });

  return result.map((v) => ({ ...v, createdBy: 'admin' }));
}

export const INITIAL_DPT: VoterDPT[] = generateFullDPTList();

// Initialize sample voting results per RT across all 28 RTs
export function generateInitialRTResults(): RTResult[] {
  return ALL_RTS.map((item, index) => {
    // Determine realistic distribution leaning favorably to Ahmad Latif Usman
    const totalDpt = 180 + ((index * 13) % 70); // 180 to 240 voters per RT
    const votesLatif = 85 + ((index * 17) % 55); // high percentage
    const votesMunjilin = 20 + ((index * 7) % 25);
    const votesSigit = 15 + ((index * 5) % 20);
    const votesMakful = 10 + ((index * 9) % 20);
    const invalidVotes = 2 + (index % 5);

    return {
      rt: item.rt,
      dusun: item.dusun,
      tpsName: `TPS ${String(index + 1).padStart(2, '0')} (${item.rt})`,
      totalDpt,
      votesLatif,
      votesMunjilin,
      votesSigit,
      votesMakful,
      invalidVotes,
      lastUpdated: new Date(Date.now() - (28 - index) * 600000).toISOString(),
      reporter: index % 2 === 0 ? `Saksi Relawan ${item.rt}` : 'Koordinator Lapangan',
      isVerified: true,
    };
  });
}
