// ============================================================
// Arabosfera — arab tili savollari (hammasi بالعربية)
// ============================================================

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Arabcha o'qish matnlari (Reading)
export const READING_PASSAGES = [
  {
    id: 'r1',
    title: 'يَوْمُ أَحْمَد',
    ar: 'يَذْهَبُ أَحْمَدُ إِلَى الْجَامِعَةِ فِي الصَّبَاحِ. هُوَ طَالِبٌ فِي كُلِّيَّةِ اللُّغَاتِ. يَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ. بَعْدَ الدُّرُوسِ يَذْهَبُ إِلَى الْمَكْتَبَةِ لِلْمُطَالَعَةِ.',
    uz: 'Ahmad ertalab universitetga boradi.',
  },
  {
    id: 'r2',
    title: 'مَسَاءُ الْعَائِلَة',
    ar: 'تَجْتَمِعُ الْعَائِلَةُ فِي الْمَسَاءِ حَوْلَ الْمَائِدَةِ. يَتَحَدَّثُونَ عَنْ يَوْمِهِمْ وَيَشْرَبُونَ الشَّايَ. الْأُمُّ تُحِبُّ الْقِرَاءَةَ وَالْأَبُ يُحِبُّ الرِّيَاضَةَ.',
    uz: 'Oila kechqurun yig‘iladi.',
  },
]

const DIFF_TO_CEFR = { oson: 'A1', orta: 'B1', qiyin: 'C1' }

/** Barcha savol va variantlar — arab tilida */
export const QUESTION_BANK = [
  {
    id: 'q1', level: 'oson', cefr: 'A1',
    text: 'أَيْنَ يَذْهَبُ أَحْمَدُ بَعْدَ الدُّرُوسِ؟',
    options: ['إِلَى السُّوقِ', 'إِلَى الْمَكْتَبَةِ', 'إِلَى الْبَيْتِ', 'إِلَى الْمَسْجِدِ'],
    correct: 1,
    readingPassage: READING_PASSAGES[0].ar,
  },
  {
    id: 'q2', level: 'oson', cefr: 'A1',
    text: 'مَاذَا يَدْرُسُ أَحْمَدُ؟',
    options: ['الطِّبَّ', 'اللُّغَاتِ', 'الِاقْتِصَادَ', 'الْقَانُونَ'],
    correct: 1,
    readingPassage: READING_PASSAGES[0].ar,
  },
  {
    id: 'q3', level: 'oson', cefr: 'A2',
    text: 'مَتَى تَجْتَمِعُ الْعَائِلَةُ؟',
    options: ['فِي الصَّبَاحِ', 'فِي الظُّهْرِ', 'فِي الْمَسَاءِ', 'فِي اللَّيْلِ'],
    correct: 2,
    readingPassage: READING_PASSAGES[1].ar,
  },
  {
    id: 'q4', level: 'oson', cefr: 'A2',
    text: 'مَا مَعْنَى كَلِمَةِ «مَكْتَبَة»؟',
    options: ['مَدْرَسَة', 'مَكَانُ الْكُتُبِ', 'سُوق', 'حَدِيقَة'],
    correct: 1,
  },
  {
    id: 'q5', level: 'orta', cefr: 'B1',
    text: 'مَا مَعْنَى «مُطَالَعَة» فِي النَّصِّ؟',
    options: ['نَوْم', 'قِرَاءَة', 'كِتَابَة', 'سَفَر'],
    correct: 1,
    readingPassage: READING_PASSAGES[0].ar,
  },
  {
    id: 'q6', level: 'orta', cefr: 'B1',
    text: 'مَا زَمَنُ الْفِعْلِ «يَدْرُسُ»؟',
    options: ['الْمَاضِي', 'الْمُضَارِع', 'الْأَمْر', 'اسْمُ الْفَاعِل'],
    correct: 1,
  },
  {
    id: 'q7', level: 'orta', cefr: 'B2',
    text: 'مَاذَا تُحِبُّ الْأُمُّ؟',
    options: ['الرِّيَاضَةَ', 'الْقِرَاءَةَ', 'السَّفَرَ', 'الطَّبْخَ'],
    correct: 1,
    readingPassage: READING_PASSAGES[1].ar,
  },
  {
    id: 'q8', level: 'orta', cefr: 'B2',
    text: 'أَيْنَ يَجْلِسُونَ حَوْلَ الْمَائِدَةِ؟',
    options: ['فِي الْمَدْرَسَةِ', 'فِي الْبَيْتِ', 'فِي السُّوقِ', 'فِي الْمَكْتَبَةِ'],
    correct: 1,
    readingPassage: READING_PASSAGES[1].ar,
  },
  {
    id: 'q9', level: 'qiyin', cefr: 'C1',
    text: 'مَا جَمْعُ كَلِمَةِ «كِتَاب»؟',
    options: ['كُتَّاب', 'كُتُب', 'مَكْتَبَات', 'كَوَاتِب'],
    correct: 1,
  },
  {
    id: 'q10', level: 'qiyin', cefr: 'C1',
    text: 'أَيُّ جُمْلَةٍ صَحِيحَةٌ؟',
    options: [
      'الطَّالِبُ يَذْهَبُونَ إِلَى الْجَامِعَةِ',
      'الطُّلَّابُ يَذْهَبُونَ إِلَى الْجَامِعَةِ',
      'الطَّالِبُ تَذْهَبُ إِلَى الْجَامِعَةِ',
      'الطُّلَّابُ يَذْهَبُ إِلَى الْجَامِعَةِ',
    ],
    correct: 1,
  },
  {
    id: 'q11', level: 'oson', cefr: 'A1',
    text: 'مَا مَعْنَى «صَبَاح»؟',
    options: ['مَسَاء', 'صَبَاح / صَبَاحًا', 'لَيْل', 'ظُهْر'],
    correct: 1,
  },
  {
    id: 'q12', level: 'oson', cefr: 'A2',
    text: 'كَيْفَ تَقُولُ «سَّلَامٌ عَلَيْكُمْ» بِالْعَرَبِيَّةِ؟',
    options: ['مَرْحَبًا', 'السَّلَامُ عَلَيْكُمْ', 'شُكْرًا', 'مَعَ السَّلَامَةِ'],
    correct: 1,
  },
  {
    id: 'q13', level: 'orta', cefr: 'B1',
    text: 'مَا ضِدُّ كَلِمَةِ «كَبِير»؟',
    options: ['طَوِيل', 'صَغِير', 'جَمِيل', 'جَدِيد'],
    correct: 1,
  },
  {
    id: 'q14', level: 'orta', cefr: 'B2',
    text: 'أَكْمِلْ: «أَنَا _____ الطَّعَامَ».',
    options: ['يَأْكُلُ', 'آكُلُ', 'تَأْكُلِينَ', 'نَأْكُلُونَ'],
    correct: 1,
  },
  {
    id: 'q15', level: 'qiyin', cefr: 'C2',
    text: 'مَا إِعْرَابُ كَلِمَةِ «الْكِتَابَ» فِي: «قَرَأْتُ الْكِتَابَ»؟',
    options: ['مَرْفُوع', 'مَنْصُوب', 'مَجْرُور', 'مَجْزُوم'],
    correct: 1,
  },
  {
    id: 'q16', level: 'oson', cefr: 'A1',
    text: 'كَمْ يَوْمًا فِي الْأُسْبُوعِ؟',
    options: ['خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة'],
    correct: 2,
  },
  {
    id: 'q17', level: 'orta', cefr: 'B1',
    text: 'مَا مَعْنَى «جَامِعَة»؟',
    options: ['مَدْرَسَة اِبْتِدَائِيَّة', 'مُؤَسَّسَة تَعْلِيمٍ عَالٍ', 'مُسْتَشْفَى', 'مَطَار'],
    correct: 1,
  },
  {
    id: 'q18', level: 'qiyin', cefr: 'C1',
    text: 'أَيُّ كَلِمَةٍ هِيَ مَصْدَرٌ؟',
    options: ['يَكْتُبُ', 'كَتَبَ', 'كِتَابَة', 'كَاتِب'],
    correct: 2,
  },
  {
    id: 'q19', level: 'oson', cefr: 'A2',
    text: 'مَا لَوْنُ السَّمَاءِ عَادَةً؟',
    options: ['أَحْمَر', 'أَزْرَق', 'أَخْضَر', 'أَصْفَر'],
    correct: 1,
  },
  {
    id: 'q20', level: 'orta', cefr: 'B2',
    text: 'اِخْتَرِ الْجَوَابَ الصَّحِيحَ: «هُمْ _____ فِي الْمَكْتَبَةِ».',
    options: ['يَقْرَأُ', 'يَقْرَأُونَ', 'تَقْرَأُ', 'نَقْرَأُ'],
    correct: 1,
  },
]

const CEFR_CYCLE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** Arabcha savollar to‘plami (UI uchun) */
export function buildExamQuestions(n = 20, opts = {}) {
  const { examType = 'practice', targetLevel = null } = opts
  const levels = ['oson', 'orta', 'qiyin']
  const out = []
  for (let i = 0; i < n; i++) {
    const base = QUESTION_BANK[i % QUESTION_BANK.length]
    const cefr = examType === 'CEFR'
      ? (targetLevel || CEFR_CYCLE[i % CEFR_CYCLE.length])
      : (base.cefr || DIFF_TO_CEFR[levels[i % 3]])
    const options = [...base.options]
    out.push({
      ...base,
      id: `ar-${i}-${base.id}`,
      level: levels[i % 3],
      cefr,
      text: base.text,
      options,
      optionArabic: options.map(() => true),
      isArabic: true,
      correct: base.correct,
      readingPassage: base.readingPassage || null,
    })
  }
  return out
}

export function buildCefrExamQuestions(n = 20) {
  return buildExamQuestions(n, { examType: 'CEFR' })
}

/** Faqat arabcha savollarni saralash */
export function preferArabicQuestions(list, fallbackCount = 10) {
  const ar = (list || []).filter((q) => q?.isArabic || /[\u0600-\u06FF]/.test(q?.text || ''))
  if (ar.length) return ar
  return buildExamQuestions(fallbackCount)
}

export const LISTENING_TRACKS = [
  { id: 'a1', title: '1-audio: Bozorda suhbat', duration: '1:20' },
  { id: 'a2', title: '2-audio: Universitetda', duration: '1:45' },
  { id: 'a3', title: '3-audio: Sayohat rejasi', duration: '2:05' },
]

export const ESSAY_TOPICS = [
  { id: 'e1', title: 'اُكْتُبْ عَنْ مِهْنَتِكَ الْمُفَضَّلَةِ', minWords: 250, tag: 'شَخْصِي' },
  { id: 'e2', title: 'فَوَائِدُ التِّكْنُولُوجْيَا وَمَضَارُّهَا', minWords: 250, tag: 'مُجْتَمَع' },
  { id: 'e3', title: 'أَفْضَلُ طُرُقِ تَعَلُّمِ اللُّغَةِ', minWords: 250, tag: 'تَعْلِيم' },
]

export const LETTER_PROMPTS = [
  { id: 'l1', title: 'اُكْتُبْ رِسَالَةً رَسْمِيَّةً لِلطَّلَبِ عَنِ الْقَبُولِ فِي الْجَامِعَةِ', minWords: 120 },
]

export const SPEAKING_SHORT = [
  'تَحَدَّثْ عَنْ صَدِيقِكَ.',
  'تَحَدَّثْ عَنْ كِتَابِكَ الْمُفَضَّلِ.',
  'صِفِ الطَّقْسَ الْيَوْمَ.',
  'تَحَدَّثْ عَنْ عَائِلَتِكَ بِاخْتِصَارٍ.',
  'كَيْفَ تُعِدُّ طَعَامَكَ الْمُفَضَّلَ؟',
  'كَيْفَ تَقْضِي وَقْتَ فَرَاغِكَ؟',
  'صِفْ مَدِينَتَكَ.',
  'مَا هِيَ خُطَطُكَ لِلْمُسْتَقْبَلِ؟',
  'تَحَدَّثْ عَنْ فَصْلِكَ الْمُفَضَّلِ.',
  'مَا رَأْيُكَ فِي الرِّيَاضَةِ؟',
]

export const SPEAKING_LONG = [
  'كَيْفَ غَيَّرَ تَعَلُّمُ اللُّغَةِ حَيَاتَكَ؟ تَحَدَّثْ بِالتَّفْصِيلِ عَنِ الْأَسْبَابِ وَالصُّعُوبَاتِ وَالنَّتَائِجِ.',
]

// Foydalanuvchilar (admin — Foydalanuvchilar nazorati)
export const USERS = [
  { id: 1, name: 'DEVNODIR', username: '@devnodir', level: 'B2', xp: 4820, progress: 62, status: 'faol', banned: false },
  { id: 2, name: 'Sardor Aliyev', username: '@sardor_a', level: 'B1', xp: 3110, progress: 44, status: 'faol', banned: false },
  { id: 3, name: 'Malika Yusupova', username: '@malika_y', level: 'C1', xp: 6740, progress: 81, status: 'onlayn', banned: false },
  { id: 4, name: 'Jasur Karimov', username: '@jasur_k', level: 'A2', xp: 1290, progress: 21, status: 'oflayn', banned: false },
  { id: 5, name: 'Nigora Sobirova', username: '@nigora_s', level: 'B2', xp: 5200, progress: 70, status: 'onlayn', banned: true },
  { id: 6, name: 'Bekzod Toshev', username: '@bekzod_t', level: 'A1', xp: 640, progress: 12, status: 'faol', banned: false },
]

export const LEADERBOARD = [...USERS]
  .sort((a, b) => b.xp - a.xp)
  .map((u, i) => ({ rank: i + 1, ...u }))

export const EXAM_SUBMISSIONS = [
  { id: 's1', user: 'DEVNODIR', type: 'at-Tanal', date: '2026-07-12', reading: 18, listening: 16, writing: null, speaking: null, status: 'baholanmoqda' },
  { id: 's2', user: 'Malika Yusupova', type: 'CEFR', date: '2026-07-11', reading: 20, listening: 19, writing: 88, speaking: 92, status: 'yakunlangan' },
  { id: 's3', user: 'Sardor Aliyev', type: 'at-Tanal', date: '2026-07-10', reading: 14, listening: 12, writing: 60, speaking: null, status: 'baholanmoqda' },
]

export const VOCAB = [
  { id: 'v1', ar: 'كِتَاب', uz: 'kitob', level: 'A1' },
  { id: 'v2', ar: 'مَكْتَبَة', uz: 'kutubxona', level: 'A2' },
  { id: 'v3', ar: 'جَامِعَة', uz: 'universitet', level: 'A2' },
  { id: 'v4', ar: 'مُطَالَعَة', uz: 'mutolaa', level: 'B1' },
  { id: 'v5', ar: 'اِجْتِمَاع', uz: 'yig‘ilish', level: 'B2' },
]

// Bosh menyu kartalari (student dashboard grid)
export const MENU_TILES = [
  { key: 'all', label: 'Barcha testlar', icon: 'ListChecks', color: 'text-sky-300' },
  { key: 'errors', label: 'Xatolarni tuzatish', icon: 'AlertTriangle', color: 'text-red-300', badge: 7 },
  { key: 'topics', label: 'Mavzular', icon: 'BookOpen', color: 'text-amber-300' },
  { key: 'tickets', label: 'Biletlar', icon: 'Ticket', color: 'text-violet-300' },
  { key: 'sets', label: '50/100 talik', icon: 'LayoutGrid', color: 'text-emerald-300' },
  { key: 'real', label: 'Real imtihon', icon: 'GraduationCap', color: 'text-rose-300' },
  { key: 'distract', label: 'Chalg‘ituvchi', icon: 'Shuffle', color: 'text-orange-300' },
  { key: 'saved', label: 'Saqlanganlar', icon: 'Bookmark', color: 'text-teal-300' },
  { key: 'keywords', label: 'Kalit so‘zlar', icon: 'KeyRound', color: 'text-lime-300' },
  { key: 'numbers', label: 'Raqamli savollar', icon: 'Hash', color: 'text-cyan-300' },
]

// ============================================================
// Duolingo uslubidagi o'quv yo'lagi — Mavzular bo'limi uchun
// Har bir "unit" ichida bosqichma-bosqich ochiladigan darslar (lesson)
// ============================================================
export const TOPICS = [
  {
    id: 'u1', title: 'Alifbo va tovushlar', color: 'text-sky-300', accent: '#38BDF8',
    lessons: [
      { id: 'u1l1', title: 'Harflar 1', icon: 'Star', done: true },
      { id: 'u1l2', title: 'Harflar 2', icon: 'Star', done: true },
      { id: 'u1l3', title: 'Unlilar (harakat)', icon: 'BookOpen', done: true },
      { id: 'u1l4', title: 'Bo‘lim testi', icon: 'Trophy', done: false },
    ],
  },
  {
    id: 'u2', title: 'Asosiy lug‘at', color: 'text-amber-300', accent: '#FBBF24',
    lessons: [
      { id: 'u2l1', title: 'Salomlashish', icon: 'MessageCircle', done: true },
      { id: 'u2l2', title: 'Oila', icon: 'Users', done: false },
      { id: 'u2l3', title: 'Ranglar va sonlar', icon: 'Hash', done: false },
      { id: 'u2l4', title: 'Bo‘lim testi', icon: 'Trophy', done: false },
    ],
  },
  {
    id: 'u3', title: 'Grammatika asoslari', color: 'text-violet-300', accent: '#A78BFA',
    lessons: [
      { id: 'u3l1', title: 'Ot va sifat', icon: 'BookOpen', done: false },
      { id: 'u3l2', title: 'Fe’l zamonlari', icon: 'Clock', done: false },
      { id: 'u3l3', title: 'Gap tuzilishi', icon: 'AlignLeft', done: false },
      { id: 'u3l4', title: 'Bo‘lim testi', icon: 'Trophy', done: false },
    ],
  },
  {
    id: 'u4', title: 'O‘qish va matn', color: 'text-rose-300', accent: '#FB7185',
    lessons: [
      { id: 'u4l1', title: 'Qisqa matnlar', icon: 'FileText', done: false },
      { id: 'u4l2', title: 'Savol-javob', icon: 'HelpCircle', done: false },
      { id: 'u4l3', title: 'Yakuniy sinov', icon: 'Trophy', done: false },
    ],
  },
]

// Biletlar bo'limi — 30 ta raqamli bilet
export const TICKETS = Array.from({ length: 30 }, (_, i) => ({
  id: `bilet-${i + 1}`,
  n: i + 1,
  count: 25,
  done: i < 5, // dastlabki 5 tasi bajarilgan (mock)
}))

// Kalit so'zlar / flesh-kartalar (Kalit so'zlar bo'limi uchun)
export const KEYWORDS = [
  { id: 'k1', ar: 'جَامِعَة', uz: 'universitet', hint: 'ta’lim muassasasi' },
  { id: 'k2', ar: 'مَكْتَبَة', uz: 'kutubxona', hint: 'kitoblar joyi' },
  { id: 'k3', ar: 'مُطَالَعَة', uz: 'mutolaa', hint: 'o‘qish jarayoni' },
  { id: 'k4', ar: 'اِجْتِمَاع', uz: 'yig‘ilish', hint: 'birga to‘planish' },
  { id: 'k5', ar: 'صَبَاح', uz: 'ertalab', hint: 'kun boshlanishi' },
  { id: 'k6', ar: 'مَسَاء', uz: 'kechqurun', hint: 'kun oxiri' },
]

// Bo'limlarga mos savol to'plamini qaytaradi (kalitga qarab)
export function questionsForSection(key, count = 10) {
  return buildExamQuestions(count).map((q) => ({ ...q, sectionKey: key }))
}

export const SUPPORT_TICKETS = [
  { id: 't1', user: 'Jasur Karimov', subject: 'Audio ochilmayapti', status: 'ochiq', date: '2026-07-13' },
  { id: 't2', user: 'Bekzod Toshev', subject: 'XP hisoblanmadi', status: 'javob berilgan', date: '2026-07-12' },
  { id: 't3', user: 'Nigora Sobirova', subject: 'Imtihon sanasi o‘zgarsinmi?', status: 'ochiq', date: '2026-07-11' },
]

export const SYSTEM_LOGS = [
  { id: 1, time: '14:32', text: 'Yangi foydalanuvchi ro‘yxatdan o‘tdi: @bekzod_t', type: 'signup' },
  { id: 2, time: '14:28', text: 'DEVNODIR at-Tanal imtihonini yakunladi', type: 'exam' },
  { id: 3, time: '14:15', text: 'Kontent menejeri: yangi audio qo‘shildi (3-audio)', type: 'db' },
  { id: 4, time: '13:58', text: 'Oktagon jangi yakunlandi: @malika_y g‘olib (+40 XP)', type: 'battle' },
  { id: 5, time: '13:40', text: 'Shpargalka ogohlantirishi: @jasur_k tabdan chiqdi', type: 'flag' },
]

export const HARD_QUESTIONS = [
  { id: 'q5', text: 'مَا مَعْنَى «مُطَالَعَة» فِي النَّصِّ؟', failRate: 68 },
  { id: 'q6', text: 'مَا زَمَنُ الْفِعْلِ «يَدْرُسُ»؟', failRate: 61 },
  { id: 'q4', text: 'مَا مَعْنَى كَلِمَةِ «مَكْتَبَة»؟', failRate: 42 },
  { id: 'q10', text: 'أَيُّ جُمْلَةٍ صَحِيحَةٌ؟', failRate: 55 },
]

export const ANALYTICS = {
  activeStudents: 913,
  avgScore: 74,
  topicFailRates: [
    { topic: 'Grammatika', fail: 38 },
    { topic: 'Lug‘at', fail: 22 },
    { topic: 'Tinglash', fail: 46 },
    { topic: 'Yozuv', fail: 51 },
    { topic: 'O‘qish', fail: 29 },
  ],
}
