import { BidayatState } from '../types';

export const defaultState: BidayatState = {
  tasks: [
    { id: 't1', title: 'Adab Bangun Tidur', arabic: 'آداب الاستيقاظ من النوم', description: 'Hendaknya engkau bangun sebelum terbit fajar. Saat terbangun, segera berdzikir kepada Allah dan bersyukur karena Dia telah menghidupkanmu kembali. Niatkan untuk menggunakan hari ini dalam ketaatan.', timeOfDay: 'Morning', completed: false, locked: false },
    { id: 't2', title: 'Adab Masuk Kamar Kecil', arabic: 'آداب دخول الخلاء', description: 'Dahulukan kaki kiri saat masuk dan kaki kanan saat keluar. Jangan membawa sesuatu yang bertuliskan nama Allah. Beristinjalah dengan sempurna dan jagalah kebersihan.', timeOfDay: 'Morning', completed: false, locked: false },
    { id: 't3', title: 'Adab Wudhu', arabic: 'آداب الوضوء', description: 'Jangan sekadar membasuh anggota tubuh, tapi hadirkan hati. Mulailah dengan Bismillah, bersiwak, dan sempurnakan basuhan. Ingatlah bahwa wudhu membersihkan dosa-dosa kecil.', timeOfDay: 'Morning', completed: false, locked: false },
    { id: 't4', title: 'Adab Pergi ke Masjid', arabic: 'آداب الخروج إلى المسجد', description: 'Berjalanlah dengan tenang (sakinah) dan wibawa (waqar). Jangan tergesa-gesa. Berdoalah sepanjang perjalanan menuju rumah Allah.', timeOfDay: 'Morning', completed: false, locked: false },
    { id: 't5', title: 'Adab Masuk Masjid', arabic: 'آداب دخول المسجد', description: 'Masuklah dengan kaki kanan, lalu shalat Tahiyatul Masjid dua rakaat sebelum duduk. Niatkan i\'tikaf selama berada di dalamnya.', timeOfDay: 'Morning', completed: false, locked: false },
    { id: 't6', title: 'Adab Setelah Terbit Matahari', arabic: 'آداب ما بعد طلوع الشمس', description: 'Jangan habiskan waktumu dengan sia-sia. Gunakan untuk menuntut ilmu yang bermanfaat, berdzikir, atau membantu sesama muslim. Hindari perdebatan dan permusuhan.', timeOfDay: 'Afternoon', completed: false, locked: false },
    { id: 't7', title: 'Persiapan Shalat', arabic: 'الاستعداد لسائر الصلوات', description: 'Bersiaplah sebelum waktu shalat tiba. Sempurnakan wudhu dan pakaianmu. Shalatlah di awal waktu secara berjamaah, karena itu adalah sebaik-baik amalan.', timeOfDay: 'Afternoon', completed: false, locked: false },
    { id: 't8', title: 'Adab Shalat', arabic: 'آداب الصلاة', description: 'Shalatlah dengan khusyuk, seakan-akan engkau melihat Allah. Jika tidak mampu, yakinlah bahwa Allah melihatmu. Jangan menoleh atau memikirkan hal duniawi.', timeOfDay: 'Evening', completed: false, locked: false },
    { id: 't9', title: 'Adab Hari Jumat', arabic: 'آداب الجمعة', description: 'Hari Jumat adalah hari raya mingguan. Mandilah, pakai wangi-wangian, berangkat lebih awal ke masjid, dan perbanyak shalawat serta membaca surat Al-Kahfi.', timeOfDay: 'Evening', completed: false, locked: false },
    { id: 't10', title: 'Adab Tidur', arabic: 'آداب النوم', description: 'Tidurlah dalam keadaan suci (berwudhu). Menghadap kiblat (miring ke kanan). Bacalah doa dan ayat kursi. Niatkan bangun malam untuk Tahajud.', timeOfDay: 'Night', completed: false, locked: false },
  ],
  bodyScans: [
    { id: 'b1', part: 'Mata', arabic: 'العين', errorCommitted: false },
    { id: 'b2', part: 'Telinga', arabic: 'الأذن', errorCommitted: false },
    { id: 'b3', part: 'Lisan', arabic: 'اللسان', errorCommitted: false },
    { id: 'b4', part: 'Perut', arabic: 'البطن', errorCommitted: false },
    { id: 'b5', part: 'Kemaluan', arabic: 'الفرج', errorCommitted: false },
    { id: 'b6', part: 'Tangan', arabic: 'اليد', errorCommitted: false },
    { id: 'b7', part: 'Kaki', arabic: 'الرجل', errorCommitted: false },
  ],
  heartDiseases: [
    { id: 'h1', name: 'Hasad (Dengki)', arabic: 'الحسد', level: 1, description: 'Menginginkan hilangnya nikmat dari orang lain.' },
    { id: 'h2', name: 'Riya\' (Pamer)', arabic: 'الرياء', level: 1, description: 'Beramal untuk dilihat dan dipuji manusia.' },
    { id: 'h3', name: 'Ujub (Bangga Diri)', arabic: 'العجب', level: 1, description: 'Merasa kagum pada diri sendiri dan melupakan karunia Allah.' },
  ],
  wiridLogs: [
    { id: 'w1', name: 'Istighfar', arabic: 'أَسْتَغْفِرُ ٱللَّهَ', description: 'Memohon ampunan kepada Allah SWT atas segala dosa dan khilaf.', count: 0, target: 100, lastUpdated: new Date().toISOString() },
    { id: 'w2', name: 'Shalawat', arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', description: 'Bershalawat kepada Nabi Muhammad SAW sebagai tanda cinta dan penghormatan.', count: 0, target: 100, lastUpdated: new Date().toISOString() },
    { id: 'w3', name: 'Tahlil', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', description: 'Kalimat tauhid yang menegaskan tiada Tuhan selain Allah.', count: 0, target: 100, lastUpdated: new Date().toISOString() },
  ],
  networkProtocols: [
    { id: 'np1', category: 'Vertical', target: 'Allah', title: 'Khusyu\' (Fokus)', arabic: 'الخشوع', description: 'Menghadirkan hati dan merasa rendah diri di hadapan Allah dalam setiap ibadah.', completed: false },
    { id: 'np2', category: 'Vertical', target: 'Allah', title: 'Tawakkal (Berserah)', arabic: 'التوكل', description: 'Menyerahkan segala urusan kepada Allah setelah berusaha maksimal.', completed: false },
    { id: 'np3', category: 'Horizontal', target: 'Parents', title: 'Birrul Walidain', arabic: 'بر الوالدين', description: 'Berbuat baik, berkata lembut, dan tidak membantah orang tua.', completed: false },
    { id: 'np4', category: 'Horizontal', target: 'Scholars', title: 'Ta\'zim (Memuliakan)', arabic: 'التعظيم', description: 'Menghormati guru, mendengarkan dengan seksama, dan tidak mendebatnya.', completed: false },
    { id: 'np5', category: 'Horizontal', target: 'General', title: 'Tawadhu (Rendah Hati)', arabic: 'التواضع', description: 'Tidak merasa lebih baik dari orang lain dan menebarkan salam.', completed: false },
    { id: 'np6', category: 'Horizontal', target: 'Ignorant', title: 'Tarkul Mira\' (Hindari Debat)', arabic: 'ترك المراء', description: 'Menghindari perdebatan yang tidak bermanfaat, terutama dengan orang bodoh.', completed: false }
  ],
  todayPrayer: null,
  prayerStats: []
};
