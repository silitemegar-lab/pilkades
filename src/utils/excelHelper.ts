import * as XLSX from 'xlsx';
import { VoterDPT, LockStatus, VerificationStatus, CandidateId, VotingChoiceStatus } from '../types';

export function exportToExcel(voters: VoterDPT[], filename = 'DPT_Tim_Kemenangan_Ahmad_Latif_Usman.xlsx') {
  const rows = voters.map((v, idx) => ({
    No: idx + 1,
    'Nama Pemilih': v.name,
    'L/P': v.gender,
    Umur: v.age || '',
    Dusun: v.dusun,
    RT: v.rt,
    Alamat: v.address || '',
    'Masuk Tim Pemenangan': v.isInTeam ? 'YA (Masuk Tim)' : 'TIDAK (Warga Biasa)',
    'Peran di Tim': v.teamRole || (v.isInTeam ? 'Relawan' : '-'),
    'Status Pilihan Coblos':
      v.votingStatus === 'MENYOBLOS_LATIF'
        ? 'No. 1 - Pasti Coblos Ahmad Latif Usman'
        : v.votingStatus === 'MENYOBLOS_MUNJILIN'
        ? 'No. 2 - Munjilin'
        : v.votingStatus === 'MENYOBLOS_SIGIT'
        ? 'No. 3 - Sigit'
        : v.votingStatus === 'MENYOBLOS_MAKFUL'
        ? 'No. 4 - Makful'
        : 'Belum Menentukan (Ragu/Swing)',
    'Status Penguncian':
      v.lockStatus === 'GEMBOK'
        ? 'DIGEMBOK (Ring 1)'
        : v.lockStatus === 'KUNCI'
        ? 'DIKUNCI'
        : 'Belum Dikunci',
    'Nominal Tali Asih/Logistik (Rp)': v.nominal || 0,
    'Keterangan Nominal': v.nominalNotes || '',
    'Status Verifikasi':
      v.verificationStatus === 'TERVERIFIKASI' ? 'Sudah Terverifikasi' : 'Belum Diverifikasi',
    'Relawan Penanggung Jawab': v.volunteerInCharge || '',
    'No Telepon/WA': v.phone || '',
    'Catatan Khusus': v.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 }, // No
    { wch: 24 }, // Nama
    { wch: 6 }, // L/P
    { wch: 6 }, // Umur
    { wch: 18 }, // Dusun
    { wch: 8 }, // RT
    { wch: 25 }, // Alamat
    { wch: 22 }, // Masuk Tim Pemenangan
    { wch: 20 }, // Peran di Tim
    { wch: 32 }, // Status Pilihan Coblos
    { wch: 20 }, // Status Penguncian
    { wch: 22 }, // Nominal
    { wch: 25 }, // Keterangan Nominal
    { wch: 20 }, // Status Verifikasi
    { wch: 22 }, // Relawan PJ
    { wch: 15 }, // HP
    { wch: 30 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data DPT Pilkades');

  XLSX.writeFile(workbook, filename);
}

export function downloadTemplateExcel() {
  const templateRows = [
    {
      'Nama Pemilih': 'Contoh Nama Relawan',
      'L/P': 'L',
      Umur: 42,
      Dusun: 'Dusun Tracap',
      RT: 'RT 01',
      Alamat: 'RT 01 Krajan Tracap',
      'Masuk Tim (YA / TIDAK)': 'YA',
      'Peran di Tim': 'Koordinator RT 01',
      'Status Coblos (Latif / Munjilin / Sigit / Makful / Belum)': 'Latif',
      'Status Penguncian (KUNCI / GEMBOK / BELUM)': 'GEMBOK',
      'Nominal (Rp)': 150000,
      'Keterangan Nominal': 'Operasional koordinator',
      'Status Verifikasi (TERVERIFIKASI / BELUM)': 'TERVERIFIKASI',
      'Relawan Penanggung Jawab': 'Ahmad Latif Timses',
      'No Telepon/WA': '081234567890',
      'Catatan Khusus': 'Sudah komitmen penuh',
    },
    {
      'Nama Pemilih': 'Warga Contoh 2',
      'L/P': 'P',
      Umur: 38,
      Dusun: 'Dusun Jojogan',
      RT: 'RT 08',
      Alamat: 'RT 08 Pasar Jojogan',
      'Masuk Tim (YA / TIDAK)': 'TIDAK',
      'Peran di Tim': '',
      'Status Coblos (Latif / Munjilin / Sigit / Makful / Belum)': 'Latif',
      'Status Penguncian (KUNCI / GEMBOK / BELUM)': 'KUNCI',
      'Nominal (Rp)': 100000,
      'Keterangan Nominal': 'Tali asih silaturahmi',
      'Status Verifikasi (TERVERIFIKASI / BELUM)': 'TERVERIFIKASI',
      'Relawan Penanggung Jawab': 'Relawan Jojogan',
      'No Telepon/WA': '085200001111',
      'Catatan Khusus': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 6 },
    { wch: 6 },
    { wch: 18 },
    { wch: 8 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 28 },
    { wch: 15 },
    { wch: 25 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template DPT');
  XLSX.writeFile(workbook, 'Template_Import_DPT_Pilkades.xlsx');
}

export async function parseExcelFile(file: File): Promise<Partial<VoterDPT>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

        const parsed: Partial<VoterDPT>[] = json.map((row) => {
          // Normalize keys
          const getVal = (possibleKeys: string[]): unknown => {
            for (const key of possibleKeys) {
              for (const [k, v] of Object.entries(row)) {
                if (k.trim().toLowerCase().includes(key.toLowerCase())) {
                  return v;
                }
              }
            }
            return undefined;
          };

          const name = String(getVal(['nama', 'pemilih', 'name']) || '').trim();
          const nik = String(getVal(['nik', 'ktp', 'nomor']) || '').trim();
          const genderRaw = String(getVal(['l/p', 'gender', 'jenis kelamin']) || '').toUpperCase();
          const gender = genderRaw.startsWith('P') ? 'P' : 'L';
          const age = Number(getVal(['umur', 'usia', 'age'])) || 35;
          const dusunRaw = String(getVal(['dusun', 'wilayah']) || 'Dusun Tracap');
          const rtRaw = String(getVal(['rt', 'rukun tetangga']) || 'RT 01');

          // Normalize Dusun
          let dusun = 'Dusun Tracap';
          if (/jojogan/i.test(dusunRaw)) dusun = 'Dusun Jojogan';
          else if (/karangsari/i.test(dusunRaw)) dusun = 'Dusun Karangsari';
          else if (/wonoroto/i.test(dusunRaw)) dusun = 'Dusun Wonoroto';

          // Normalize RT (e.g. '1' -> 'RT 01', 'RT 01' -> 'RT 01')
          const rtNumMatch = rtRaw.match(/\d+/);
          const rtNum = rtNumMatch ? parseInt(rtNumMatch[0], 10) : 1;
          const rt = `RT ${String(rtNum).padStart(2, '0')}`;

          // Status Masuk Tim
          const teamRaw = String(getVal(['masuk tim', 'berada di tim', 'tim pemenangan', 'tim', 'is_in_team', 'relawan']) || '').toUpperCase();
          const isInTeam = teamRaw.includes('YA') || teamRaw.includes('TRUE') || teamRaw.includes('MASUK') || teamRaw.includes('TIM') || teamRaw.includes('1');
          const teamRole = String(getVal(['peran di tim', 'peran tim', 'jabatan tim', 'role']) || (isInTeam ? 'Relawan' : ''));

          // Status Pilihan Coblos
          const coblosRaw = String(getVal(['status coblos', 'coblos', 'nyoblos', 'pilihan coblos', 'pilihan', 'calon', 'kandidat', 'lean']) || '').toLowerCase();
          let votingStatus: VotingChoiceStatus = 'MENYOBLOS_LATIF';
          let leanCandidate: CandidateId | 'swing' = 'ahmad_latif_usman';

          if (coblosRaw.includes('munjilin') || coblosRaw.includes('2')) {
            votingStatus = 'MENYOBLOS_MUNJILIN';
            leanCandidate = 'munjilin';
          } else if (coblosRaw.includes('sigit') || coblosRaw.includes('3')) {
            votingStatus = 'MENYOBLOS_SIGIT';
            leanCandidate = 'sigit';
          } else if (coblosRaw.includes('makful') || coblosRaw.includes('4')) {
            votingStatus = 'MENYOBLOS_MAKFUL';
            leanCandidate = 'makful';
          } else if (coblosRaw.includes('swing') || coblosRaw.includes('belum') || coblosRaw.includes('ragu') || coblosRaw.includes('mengambang')) {
            votingStatus = 'BELUM_MENENTUKAN';
            leanCandidate = 'swing';
          } else if (coblosRaw.includes('golput') || coblosRaw.includes('tidak')) {
            votingStatus = 'GOLPUT';
            leanCandidate = 'swing';
          }

          // Normalize Lock Status
          const lockRaw = String(getVal(['gembok', 'kunci', 'status penguncian', 'lock']) || '').toUpperCase();
          let lockStatus: LockStatus = 'BELUM';
          if (lockRaw.includes('GEMBOK')) lockStatus = 'GEMBOK';
          else if (lockRaw.includes('KUNCI')) lockStatus = 'KUNCI';

          // Nominal
          const nominalVal = Number(getVal(['nominal', 'uang', 'tali asih', 'bantuan', 'biaya'])) || 0;
          const nominalNotes = String(getVal(['keterangan nominal', 'alasan']) || '');

          // Verification
          const verifRaw = String(getVal(['verifikasi', 'status verifikasi']) || '').toUpperCase();
          const verificationStatus: VerificationStatus =
            verifRaw.includes('BELUM') ? 'BELUM_VERIFIKASI' : 'TERVERIFIKASI';

          const volunteer = String(getVal(['relawan', 'pj', 'penanggung']) || '');
          const address = String(getVal(['alamat', 'lokasi', 'tempat']) || '');
          const phone = String(getVal(['telepon', 'hp', 'wa', 'telp']) || '');
          const notes = String(getVal(['catatan', 'keterangan', 'notes']) || '');

          return {
            name,
            nik,
            gender,
            age,
            dusun,
            rt,
            address,
            isInTeam,
            teamRole,
            votingStatus,
            lockStatus,
            nominal: nominalVal,
            nominalNotes,
            leanCandidate,
            verificationStatus,
            volunteerInCharge: volunteer,
            phone,
            notes,
          };
        });

        resolve(parsed.filter((p) => Boolean(p.name)));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
