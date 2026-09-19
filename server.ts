import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  VoterDPT,
  RTResult,
  CampaignBroadcast,
  ActiveUser,
  ALL_RTS,
} from './src/types';
import {
  INITIAL_DPT,
  INITIAL_BROADCASTS,
  generateInitialRTResults,
  generateFullDPTList,
} from './src/data/mockData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-Memory Database Store with initial data
let dptStore: VoterDPT[] = [...INITIAL_DPT];
let broadcastsStore: CampaignBroadcast[] = [...INITIAL_BROADCASTS];
let rtResultsStore: RTResult[] = generateInitialRTResults();
let activeSessionsStore: Map<string, ActiveUser> = new Map();
let currentAdminPassword = 'admin'; // Kata sandi admin dinamis (dapat diubah oleh admin)

// Seed initial active users for testing admin monitor
activeSessionsStore.set('sess-demo-admin', {
  sessionId: 'sess-demo-admin',
  username: 'admin',
  role: 'admin',
  loginTime: new Date(Date.now() - 3600000).toISOString(),
  lastActive: new Date().toISOString(),
  device: 'PC Admin Desktop (Chrome)',
});

activeSessionsStore.set('sess-demo-user1', {
  sessionId: 'sess-demo-user1',
  username: 'Budi Santoso (RT 03)',
  role: 'user',
  dusun: 'Dusun Tracap',
  rt: 'RT 03',
  loginTime: new Date(Date.now() - 1800000).toISOString(),
  lastActive: new Date(Date.now() - 10000).toISOString(),
  device: 'Smartphone Android (Chrome)',
});

activeSessionsStore.set('sess-demo-user2', {
  sessionId: 'sess-demo-user2',
  username: 'Hendro Sugito (RT 14)',
  role: 'user',
  dusun: 'Dusun Karangsari',
  rt: 'RT 14',
  loginTime: new Date(Date.now() - 900000).toISOString(),
  lastActive: new Date(Date.now() - 5000).toISOString(),
  device: 'HP Relawan (Safari)',
});

// Periodic cleanup of sessions inactive for more than 2 minutes
setInterval(() => {
  const cutoff = Date.now() - 120000;
  for (const [key, user] of activeSessionsStore.entries()) {
    if (new Date(user.lastActive).getTime() < cutoff && user.sessionId !== 'sess-demo-admin') {
      activeSessionsStore.delete(key);
    }
  }
}, 30000);

// API ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Auth & Realtime Active Users
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password, dusun, rt, device } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  // Admin credentials check: username: admin, password: currentAdminPassword
  if (username.trim().toLowerCase() === 'admin') {
    if (password === currentAdminPassword) {
      const sessionId = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const activeUser: ActiveUser = {
        sessionId,
        username: 'admin (Super Admin)',
        role: 'admin',
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        device: device || 'Web Browser',
      };
      activeSessionsStore.set(sessionId, activeUser);
      return res.json({
        success: true,
        user: {
          sessionId,
          username: 'admin',
          role: 'admin',
        },
      });
    } else {
      return res.status(401).json({ error: 'Kata sandi admin salah!' });
    }
  }

  // User credentials check: password must be 'user', username is custom name (user cannot change password)
  if (password === 'user') {
    const sessionId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const activeUser: ActiveUser = {
      sessionId,
      username: username.trim(),
      role: 'user',
      dusun: dusun || 'Dusun Tracap',
      rt: rt || 'RT 01',
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      device: device || 'HP / PC Relawan',
    };
    activeSessionsStore.set(sessionId, activeUser);
    return res.json({
      success: true,
      user: {
        sessionId,
        username: username.trim(),
        role: 'user',
        dusun: activeUser.dusun,
        rt: activeUser.rt,
      },
    });
  } else {
    return res.status(401).json({ error: 'Kata sandi salah! (Untuk relawan/user gunakan kata sandi: user)' });
  }
});

// Endpoint untuk ganti kata sandi admin (Hanya Admin yang dapat mengganti kata sandi)
app.post('/api/auth/change-admin-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Kata sandi saat ini dan kata sandi baru wajib diisi' });
  }

  if (currentPassword !== currentAdminPassword) {
    return res.status(401).json({ error: 'Kata sandi saat ini tidak sesuai' });
  }

  if (newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'Kata sandi baru minimal 4 karakter' });
  }

  currentAdminPassword = newPassword.trim();
  res.json({ success: true, message: 'Kata sandi admin berhasil diperbarui' });
});

app.post('/api/auth/heartbeat', (req: Request, res: Response) => {
  const { sessionId, username, role, dusun, rt, device } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const existing = activeSessionsStore.get(sessionId);
  if (existing) {
    existing.lastActive = new Date().toISOString();
    if (dusun) existing.dusun = dusun;
    if (rt) existing.rt = rt;
    if (device) existing.device = device;
    activeSessionsStore.set(sessionId, existing);
  } else if (username && role) {
    activeSessionsStore.set(sessionId, {
      sessionId,
      username,
      role,
      dusun,
      rt,
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      device: device || 'Browser',
    });
  }

  res.json({ success: true, count: activeSessionsStore.size });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (sessionId && activeSessionsStore.has(sessionId)) {
    activeSessionsStore.delete(sessionId);
  }
  res.json({ success: true });
});

app.get('/api/active-users', (req: Request, res: Response) => {
  const cutoff = Date.now() - 60000; // active in last 60 seconds
  const list: ActiveUser[] = [];
  for (const user of activeSessionsStore.values()) {
    if (new Date(user.lastActive).getTime() >= cutoff) {
      list.push(user);
    }
  }
  res.json({ activeUsers: list, totalActive: list.length });
});

// 2. DPT Management
app.get('/api/dpt', (req: Request, res: Response) => {
  const { dusun, rt, lockStatus, search, role } = req.query;
  let results = [...dptStore];

  // Jika user/relawan: Hanya bisa mengakses data yang di-input oleh admin
  if (role === 'user') {
    results = results.filter((item) => item.createdBy === 'admin' || !item.createdBy);
  }

  if (dusun && dusun !== 'ALL') {
    results = results.filter((item) => item.dusun === dusun);
  }
  if (rt && rt !== 'ALL') {
    results = results.filter((item) => item.rt === rt);
  }
  if (lockStatus && lockStatus !== 'ALL' && role !== 'user') {
    results = results.filter((item) => item.lockStatus === lockStatus);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.volunteerInCharge && item.volunteerInCharge.toLowerCase().includes(q)) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.teamRole && item.teamRole.toLowerCase().includes(q))
    );
  }

  // Jika diakses oleh user biasa: sensor/sembunyikan status kunci/gembok dan nominal tali asih
  if (role === 'user') {
    results = results.map((item) => ({
      ...item,
      lockStatus: 'BELUM',
      nominal: 0,
      nominalNotes: '',
      nik: undefined,
    }));
  }

  res.json(results);
});

app.post('/api/dpt', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.dusun || !data.rt) {
    return res.status(400).json({ error: 'Nama, Dusun, dan RT wajib diisi' });
  }

  // Derive votingStatus if not provided
  let votingStatus = data.votingStatus;
  if (!votingStatus) {
    if (data.leanCandidate === 'ahmad_latif_usman') votingStatus = 'MENYOBLOS_LATIF';
    else if (data.leanCandidate === 'munjilin') votingStatus = 'MENYOBLOS_MUNJILIN';
    else if (data.leanCandidate === 'sigit') votingStatus = 'MENYOBLOS_SIGIT';
    else if (data.leanCandidate === 'makful') votingStatus = 'MENYOBLOS_MAKFUL';
    else votingStatus = 'BELUM_MENENTUKAN';
  }

  const newVoter: VoterDPT = {
    id: `dpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    gender: data.gender || 'L',
    age: Number(data.age) || 35,
    dusun: data.dusun,
    rt: data.rt,
    address: data.address || '',
    isInTeam: Boolean(data.isInTeam),
    teamRole: data.teamRole || (data.isInTeam ? 'Relawan Tim' : ''),
    votingStatus,
    lockStatus: data.lockStatus || 'BELUM',
    nominal: Number(data.nominal) || 0,
    nominalNotes: data.nominalNotes || '',
    leanCandidate: data.leanCandidate || 'ahmad_latif_usman',
    verificationStatus: data.verificationStatus || 'TERVERIFIKASI',
    volunteerInCharge: data.volunteerInCharge || '',
    phone: data.phone || '',
    notes: data.notes || '',
    createdBy: 'admin', // Diinput oleh admin
    updatedAt: new Date().toISOString(),
  };

  dptStore.unshift(newVoter);
  res.status(201).json(newVoter);
});

app.put('/api/dpt/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = dptStore.findIndex((v) => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Data DPT tidak ditemukan' });
  }

  dptStore[index] = {
    ...dptStore[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json(dptStore[index]);
});

app.delete('/api/dpt/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dptStore = dptStore.filter((v) => v.id !== id);
  res.json({ success: true, message: 'Data DPT berhasil dihapus' });
});

app.post('/api/dpt/bulk-import', (req: Request, res: Response) => {
  const { voters } = req.body;
  if (!Array.isArray(voters) || voters.length === 0) {
    return res.status(400).json({ error: 'Data voters kosong atau format tidak valid' });
  }

  const added: VoterDPT[] = [];
  for (const item of voters) {
    if (!item.name || !item.dusun || !item.rt) continue;

    let votingStatus = item.votingStatus;
    if (!votingStatus) {
      if (item.leanCandidate === 'ahmad_latif_usman') votingStatus = 'MENYOBLOS_LATIF';
      else if (item.leanCandidate === 'munjilin') votingStatus = 'MENYOBLOS_MUNJILIN';
      else if (item.leanCandidate === 'sigit') votingStatus = 'MENYOBLOS_SIGIT';
      else if (item.leanCandidate === 'makful') votingStatus = 'MENYOBLOS_MAKFUL';
      else votingStatus = 'BELUM_MENENTUKAN';
    }

    const voter: VoterDPT = {
      id: `dpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(item.name).trim(),
      gender: item.gender === 'P' || item.gender === 'Perempuan' ? 'P' : 'L',
      age: Number(item.age) || 35,
      dusun: item.dusun,
      rt: item.rt,
      address: item.address || '',
      isInTeam: Boolean(item.isInTeam),
      teamRole: item.teamRole || '',
      votingStatus,
      lockStatus: item.lockStatus === 'GEMBOK' ? 'GEMBOK' : item.lockStatus === 'KUNCI' ? 'KUNCI' : 'BELUM',
      nominal: Number(item.nominal) || 0,
      nominalNotes: item.nominalNotes || '',
      leanCandidate: item.leanCandidate || 'ahmad_latif_usman',
      verificationStatus: item.verificationStatus === 'BELUM_VERIFIKASI' ? 'BELUM_VERIFIKASI' : 'TERVERIFIKASI',
      volunteerInCharge: item.volunteerInCharge || '',
      phone: item.phone ? String(item.phone) : '',
      notes: item.notes || '',
      createdBy: 'admin', // Diinput oleh admin
      updatedAt: new Date().toISOString(),
    };
    added.push(voter);
  }

  dptStore = [...added, ...dptStore];
  res.json({ success: true, importedCount: added.length, total: dptStore.length });
});

// Reset & Muat Ulang DPT Lengkap 28 RT
app.post('/api/dpt/reset-seed', (req: Request, res: Response) => {
  dptStore = generateFullDPTList();
  res.json({ success: true, count: dptStore.length, voters: dptStore });
});

// 3. RT Vote Count Results
app.get('/api/votes', (req: Request, res: Response) => {
  const { dusun, rt } = req.query;
  let list = [...rtResultsStore];
  if (dusun && dusun !== 'ALL') {
    list = list.filter((r) => r.dusun === dusun);
  }
  if (rt && rt !== 'ALL') {
    list = list.filter((r) => r.rt === rt);
  }
  res.json(list);
});

app.post('/api/votes', (req: Request, res: Response) => {
  const { rt, dusun, votesLatif, votesMunjilin, votesSigit, votesMakful, invalidVotes, reporter } = req.body;
  if (!rt) {
    return res.status(400).json({ error: 'RT wajib diisi' });
  }

  const index = rtResultsStore.findIndex((r) => r.rt === rt);
  if (index >= 0) {
    rtResultsStore[index] = {
      ...rtResultsStore[index],
      votesLatif: Number(votesLatif) || 0,
      votesMunjilin: Number(votesMunjilin) || 0,
      votesSigit: Number(votesSigit) || 0,
      votesMakful: Number(votesMakful) || 0,
      invalidVotes: Number(invalidVotes) || 0,
      reporter: reporter || rtResultsStore[index].reporter,
      lastUpdated: new Date().toISOString(),
    };
    return res.json(rtResultsStore[index]);
  } else {
    const newItem: RTResult = {
      rt,
      dusun: dusun || 'Dusun Tracap',
      tpsName: `TPS ${rt}`,
      totalDpt: 200,
      votesLatif: Number(votesLatif) || 0,
      votesMunjilin: Number(votesMunjilin) || 0,
      votesSigit: Number(votesSigit) || 0,
      votesMakful: Number(votesMakful) || 0,
      invalidVotes: Number(invalidVotes) || 0,
      reporter: reporter || 'Relawan',
      lastUpdated: new Date().toISOString(),
      isVerified: true,
    };
    rtResultsStore.push(newItem);
    return res.json(newItem);
  }
});

// 4. Campaign News & Notifications
app.get('/api/news', (req: Request, res: Response) => {
  res.json(broadcastsStore);
});

app.post('/api/news', (req: Request, res: Response) => {
  const { title, content, category, author, pinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Judul dan isi berita wajib diisi' });
  }

  const newsItem: CampaignBroadcast = {
    id: `bc-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    category: category || 'INFORMASI',
    author: author || 'Admin Tim Pemenangan',
    createdAt: new Date().toISOString(),
    pinned: Boolean(pinned),
  };

  broadcastsStore.unshift(newsItem);
  res.status(201).json(newsItem);
});

app.delete('/api/news/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  broadcastsStore = broadcastsStore.filter((n) => n.id !== id);
  res.json({ success: true });
});

// Start Server and Mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pilkades Ahmad Latif Usman Server running on port ${PORT}`);
  });
}

startServer();
