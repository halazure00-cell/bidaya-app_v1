import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(process.env.VERCEL ? '/tmp/bidayat.db' : 'bidayat.db');
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    arabic TEXT,
    description TEXT,
    timeOfDay TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    locked INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS body_scans (
    id TEXT PRIMARY KEY,
    part TEXT NOT NULL,
    arabic TEXT NOT NULL,
    errorCommitted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS heart_diseases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    arabic TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wirid_logs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    arabic TEXT,
    description TEXT,
    count INTEGER DEFAULT 0,
    target INTEGER DEFAULT 33,
    lastUpdated TEXT
  );

  CREATE TABLE IF NOT EXISTS prayer_logs (
    date TEXT PRIMARY KEY,
    subuh INTEGER DEFAULT 0,
    dzuhur INTEGER DEFAULT 0,
    ashar INTEGER DEFAULT 0,
    maghrib INTEGER DEFAULT 0,
    isya INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS network_protocols (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    target TEXT NOT NULL,
    title TEXT NOT NULL,
    arabic TEXT,
    description TEXT,
    completed INTEGER DEFAULT 0
  );
`);

// Seed Data
const tasksCount = db.prepare('SELECT count(*) as count FROM tasks').get() as { count: number };

if (tasksCount.count === 0) {
  // ... (Tasks seed data remains the same) ...
  const tasks = [
    // Morning (Fajr & Early Morning)
    { 
      id: 't1', 
      title: 'Adab Bangun Tidur', 
      arabic: 'آداب الاستيقاظ من النوم', 
      description: 'Hendaknya engkau bangun sebelum terbit fajar. Saat terbangun, segera berdzikir kepada Allah dan bersyukur karena Dia telah menghidupkanmu kembali. Niatkan untuk menggunakan hari ini dalam ketaatan.',
      timeOfDay: 'Morning', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't2', 
      title: 'Adab Masuk Kamar Kecil', 
      arabic: 'آداب دخول الخلاء', 
      description: 'Dahulukan kaki kiri saat masuk dan kaki kanan saat keluar. Jangan membawa sesuatu yang bertuliskan nama Allah. Beristinjalah dengan sempurna dan jagalah kebersihan.',
      timeOfDay: 'Morning', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't3', 
      title: 'Adab Wudhu', 
      arabic: 'آداب الوضوء', 
      description: 'Jangan sekadar membasuh anggota tubuh, tapi hadirkan hati. Mulailah dengan Bismillah, bersiwak, dan sempurnakan basuhan. Ingatlah bahwa wudhu membersihkan dosa-dosa kecil.',
      timeOfDay: 'Morning', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't4', 
      title: 'Adab Pergi ke Masjid', 
      arabic: 'آداب الخروج إلى المسجد', 
      description: 'Berjalanlah dengan tenang (sakinah) dan wibawa (waqar). Jangan tergesa-gesa. Berdoalah sepanjang perjalanan menuju rumah Allah.',
      timeOfDay: 'Morning', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't5', 
      title: 'Adab Masuk Masjid', 
      arabic: 'آداب دخول المسجد', 
      description: 'Masuklah dengan kaki kanan, lalu shalat Tahiyatul Masjid dua rakaat sebelum duduk. Niatkan i\'tikaf selama berada di dalamnya.',
      timeOfDay: 'Morning', 
      completed: 0, 
      locked: 0 
    },
    
    // Afternoon (Duha to Asr)
    { 
      id: 't6', 
      title: 'Adab Setelah Terbit Matahari', 
      arabic: 'آداب ما بعد طلوع الشمس', 
      description: 'Jangan habiskan waktumu dengan sia-sia. Gunakan untuk menuntut ilmu yang bermanfaat, berdzikir, atau membantu sesama muslim. Hindari perdebatan dan permusuhan.',
      timeOfDay: 'Afternoon', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't7', 
      title: 'Persiapan Shalat', 
      arabic: 'الاستعداد لسائر الصلوات', 
      description: 'Bersiaplah sebelum waktu shalat tiba. Sempurnakan wudhu dan pakaianmu. Shalatlah di awal waktu secara berjamaah, karena itu adalah sebaik-baik amalan.',
      timeOfDay: 'Afternoon', 
      completed: 0, 
      locked: 0 
    },
    
    // Evening (Maghrib to Isha)
    { 
      id: 't8', 
      title: 'Adab Shalat', 
      arabic: 'آداب الصلاة', 
      description: 'Shalatlah dengan khusyuk, seakan-akan engkau melihat Allah. Jika tidak mampu, yakinlah bahwa Allah melihatmu. Jangan menoleh atau memikirkan hal duniawi.',
      timeOfDay: 'Evening', 
      completed: 0, 
      locked: 0 
    },
    { 
      id: 't9', 
      title: 'Adab Hari Jumat', 
      arabic: 'آداب الجمعة', 
      description: 'Hari Jumat adalah hari raya mingguan. Mandilah, pakai wangi-wangian, berangkat lebih awal ke masjid, dan perbanyak shalawat serta membaca surat Al-Kahfi.',
      timeOfDay: 'Evening', 
      completed: 0, 
      locked: 0 
    },

    // Night
    { 
      id: 't10', 
      title: 'Adab Tidur', 
      arabic: 'آداب النوم', 
      description: 'Tidurlah dalam keadaan suci (berwudhu). Menghadap kiblat (miring ke kanan). Bacalah doa dan ayat kursi. Niatkan bangun malam untuk Tahajud.',
      timeOfDay: 'Night', 
      completed: 0, 
      locked: 0 
    },
  ];

  const insertTask = db.prepare('INSERT INTO tasks (id, title, arabic, description, timeOfDay, completed, locked) VALUES (@id, @title, @arabic, @description, @timeOfDay, @completed, @locked)');
  tasks.forEach(task => insertTask.run(task));

  const bodyScans = [
    { id: 'b1', part: 'Mata', arabic: 'العين', errorCommitted: 0 },
    { id: 'b2', part: 'Telinga', arabic: 'الأذن', errorCommitted: 0 },
    { id: 'b3', part: 'Lisan', arabic: 'اللسان', errorCommitted: 0 },
    { id: 'b4', part: 'Perut', arabic: 'البطن', errorCommitted: 0 },
    { id: 'b5', part: 'Kemaluan', arabic: 'الفرج', errorCommitted: 0 },
    { id: 'b6', part: 'Tangan', arabic: 'اليد', errorCommitted: 0 },
    { id: 'b7', part: 'Kaki', arabic: 'الرجل', errorCommitted: 0 },
  ];
  const insertBodyScan = db.prepare('INSERT INTO body_scans (id, part, arabic, errorCommitted) VALUES (@id, @part, @arabic, @errorCommitted)');
  bodyScans.forEach(scan => insertBodyScan.run(scan));

  const heartDiseases = [
    { id: 'h1', name: 'Hasad (Dengki)', arabic: 'الحسد', level: 1, description: 'Menginginkan hilangnya nikmat dari orang lain.' },
    { id: 'h2', name: 'Riya\' (Pamer)', arabic: 'الرياء', level: 1, description: 'Beramal untuk dilihat dan dipuji manusia.' },
    { id: 'h3', name: 'Ujub (Bangga Diri)', arabic: 'العجب', level: 1, description: 'Merasa kagum pada diri sendiri dan melupakan karunia Allah.' },
  ];
  const insertHeartDisease = db.prepare('INSERT INTO heart_diseases (id, name, arabic, level, description) VALUES (@id, @name, @arabic, @level, @description)');
  
  // Check if heart_diseases table is empty before seeding
  const heartDiseasesCount = db.prepare('SELECT count(*) as count FROM heart_diseases').get() as { count: number };
  if (heartDiseasesCount.count === 0) {
      heartDiseases.forEach(disease => insertHeartDisease.run(disease));
  }

  // Seed Wirid Logs
  const wiridLogs = [
    { 
      id: 'w1', 
      name: 'Istighfar', 
      arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
      description: 'Memohon ampunan kepada Allah SWT atas segala dosa dan khilaf.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
    { 
      id: 'w2', 
      name: 'Shalawat', 
      arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
      description: 'Bershalawat kepada Nabi Muhammad SAW sebagai tanda cinta dan penghormatan.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
    { 
      id: 'w3', 
      name: 'Tahlil', 
      arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
      description: 'Kalimat tauhid yang menegaskan tiada Tuhan selain Allah.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
  ];
  const insertWirid = db.prepare('INSERT INTO wirid_logs (id, name, arabic, description, count, target, lastUpdated) VALUES (@id, @name, @arabic, @description, @count, @target, @lastUpdated)');
  
  const wiridCount = db.prepare('SELECT count(*) as count FROM wirid_logs').get() as { count: number };
  if (wiridCount.count === 0) {
    wiridLogs.forEach(wirid => insertWirid.run(wirid));
  }
}

// Check and seed Wirid Logs independently if tasks check didn't cover it (e.g. tasks existed but wirid didn't)
const wiridCheck = db.prepare('SELECT count(*) as count FROM wirid_logs').get() as { count: number };
if (wiridCheck.count === 0) {
  const wiridLogs = [
    { 
      id: 'w1', 
      name: 'Istighfar', 
      arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
      description: 'Memohon ampunan kepada Allah SWT atas segala dosa dan khilaf.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
    { 
      id: 'w2', 
      name: 'Shalawat', 
      arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
      description: 'Bershalawat kepada Nabi Muhammad SAW sebagai tanda cinta dan penghormatan.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
    { 
      id: 'w3', 
      name: 'Tahlil', 
      arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
      description: 'Kalimat tauhid yang menegaskan tiada Tuhan selain Allah.',
      count: 0, 
      target: 100, 
      lastUpdated: new Date().toISOString() 
    },
  ];
  const insertWirid = db.prepare('INSERT INTO wirid_logs (id, name, arabic, description, count, target, lastUpdated) VALUES (@id, @name, @arabic, @description, @count, @target, @lastUpdated)');
  wiridLogs.forEach(wirid => insertWirid.run(wirid));
}

// Seed Network Protocols
const protocolsCount = db.prepare('SELECT count(*) as count FROM network_protocols').get() as { count: number };
if (protocolsCount.count === 0) {
  const protocols = [
    // Vertical (Server) - Adab with Allah
    {
      id: 'np1',
      category: 'Vertical',
      target: 'Allah',
      title: 'Khusyu\' (Fokus)',
      arabic: 'الخشوع',
      description: 'Menghadirkan hati dan merasa rendah diri di hadapan Allah dalam setiap ibadah.',
      completed: 0
    },
    {
      id: 'np2',
      category: 'Vertical',
      target: 'Allah',
      title: 'Tawakkal (Berserah)',
      arabic: 'التوكل',
      description: 'Menyerahkan segala urusan kepada Allah setelah berusaha maksimal.',
      completed: 0
    },
    
    // Horizontal (Clients) - Parents
    {
      id: 'np3',
      category: 'Horizontal',
      target: 'Parents',
      title: 'Birrul Walidain',
      arabic: 'بر الوالدين',
      description: 'Berbuat baik, berkata lembut, dan tidak membantah orang tua.',
      completed: 0
    },

    // Horizontal (Clients) - Scholars/Teachers
    {
      id: 'np4',
      category: 'Horizontal',
      target: 'Scholars',
      title: 'Ta\'zim (Memuliakan)',
      arabic: 'التعظيم',
      description: 'Menghormati guru, mendengarkan dengan seksama, dan tidak mendebatnya.',
      completed: 0
    },

    // Horizontal (Clients) - General People
    {
      id: 'np5',
      category: 'Horizontal',
      target: 'General',
      title: 'Tawadhu (Rendah Hati)',
      arabic: 'التواضع',
      description: 'Tidak merasa lebih baik dari orang lain dan menebarkan salam.',
      completed: 0
    },

    // Horizontal (Clients) - Ignorant People
    {
      id: 'np6',
      category: 'Horizontal',
      target: 'Ignorant',
      title: 'Tarkul Mira\' (Hindari Debat)',
      arabic: 'ترك المراء',
      description: 'Menghindari perdebatan yang tidak bermanfaat, terutama dengan orang bodoh.',
      completed: 0
    }
  ];

  const insertProtocol = db.prepare('INSERT INTO network_protocols (id, category, target, title, arabic, description, completed) VALUES (@id, @category, @target, @title, @arabic, @description, @completed)');
  protocols.forEach(p => insertProtocol.run(p));
}

// API Routes
app.get('/api/state', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all().map((t: any) => ({ ...t, completed: Boolean(t.completed), locked: Boolean(t.locked) }));
  const bodyScans = db.prepare('SELECT * FROM body_scans').all().map((b: any) => ({ ...b, errorCommitted: Boolean(b.errorCommitted) }));
  const heartDiseases = db.prepare('SELECT * FROM heart_diseases').all();
  const wiridLogs = db.prepare('SELECT * FROM wirid_logs').all();
  const networkProtocols = db.prepare('SELECT * FROM network_protocols').all().map((p: any) => ({ ...p, completed: Boolean(p.completed) }));
  
  // Get today's prayer log
  const today = new Date().toISOString().split('T')[0];
  let prayerLog = db.prepare('SELECT * FROM prayer_logs WHERE date = ?').get(today);
  
  if (!prayerLog) {
    // Create default if not exists
    try {
      db.prepare('INSERT INTO prayer_logs (date) VALUES (?)').run(today);
      prayerLog = { date: today, subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
    } catch (e) {
      // Handle race condition if insert fails
      prayerLog = db.prepare('SELECT * FROM prayer_logs WHERE date = ?').get(today);
    }
  }

  // Get last 30 days of prayer logs for stats
  const prayerStats = db.prepare('SELECT * FROM prayer_logs ORDER BY date DESC LIMIT 30').all();

  res.json({
    tasks,
    bodyScans,
    heartDiseases,
    wiridLogs,
    networkProtocols,
    todayPrayer: prayerLog,
    prayerStats
  });
});

app.post('/api/network-protocols/:id/toggle', (req, res) => {
  const { id } = req.params;
  const protocol = db.prepare('SELECT completed FROM network_protocols WHERE id = ?').get(id) as { completed: number };
  if (protocol) {
    const newStatus = protocol.completed ? 0 : 1;
    db.prepare('UPDATE network_protocols SET completed = ? WHERE id = ?').run(newStatus, id);
    res.json({ success: true, completed: Boolean(newStatus) });
  } else {
    res.status(404).json({ error: 'Protocol not found' });
  }
});

app.post('/api/prayers/:date', (req, res) => {
  const { date } = req.params;
  const { prayer, status } = req.body; // prayer: 'subuh' | 'dzuhur' etc, status: boolean
  
  try {
    // Ensure record exists
    const exists = db.prepare('SELECT 1 FROM prayer_logs WHERE date = ?').get(date);
    if (!exists) {
      db.prepare('INSERT INTO prayer_logs (date) VALUES (?)').run(date);
    }

    const stmt = db.prepare(`UPDATE prayer_logs SET ${prayer} = ? WHERE date = ?`);
    stmt.run(status ? 1 : 0, date);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update prayer:', error);
    res.status(500).json({ error: 'Failed to update prayer' });
  }
});

app.post('/api/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT completed FROM tasks WHERE id = ?').get(id) as { completed: number };
  if (task) {
    const newStatus = task.completed ? 0 : 1;
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newStatus, id);
    res.json({ success: true, completed: Boolean(newStatus) });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.post('/api/body-scans/:id/toggle', (req, res) => {
  const { id } = req.params;
  const scan = db.prepare('SELECT errorCommitted FROM body_scans WHERE id = ?').get(id) as { errorCommitted: number };
  if (scan) {
    const newStatus = scan.errorCommitted ? 0 : 1;
    db.prepare('UPDATE body_scans SET errorCommitted = ? WHERE id = ?').run(newStatus, id);
    res.json({ success: true, errorCommitted: Boolean(newStatus) });
  } else {
    res.status(404).json({ error: 'Body scan not found' });
  }
});

app.post('/api/heart-diseases/:id', (req, res) => {
  const { id } = req.params;
  const { level } = req.body;
  if (level >= 1 && level <= 10) {
    db.prepare('UPDATE heart_diseases SET level = ? WHERE id = ?').run(level, id);
    res.json({ success: true, level });
  } else {
    res.status(400).json({ error: 'Invalid level' });
  }
});

app.post('/api/wirid/:id/update', (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  db.prepare('UPDATE wirid_logs SET count = ?, lastUpdated = ? WHERE id = ?').run(count, new Date().toISOString(), id);
  res.json({ success: true, count });
});

app.post('/api/reset', (req, res) => {
  db.prepare('UPDATE tasks SET completed = 0').run();
  db.prepare('UPDATE body_scans SET errorCommitted = 0').run();
  db.prepare('UPDATE heart_diseases SET level = 1').run();
  db.prepare('UPDATE wirid_logs SET count = 0').run();
  db.prepare('UPDATE network_protocols SET completed = 0').run();
  res.json({ success: true });
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files (if built)
    // For this environment, we rely on dev mode mostly, but good practice
    app.use(express.static('dist'));
  }

  // Start server only if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
}

startServer();

export default app;
