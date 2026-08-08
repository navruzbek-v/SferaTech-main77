/** CEFR — har skill oldidan qisqa kirish (partlar ro‘yxatisiz) */

export const CEFR_BRIEFINGS = {
  reading: {
    key: 'reading',
    titleUz: 'Reading',
    subtitle: 'TEXT AND QUESTIONS',
    intro: 'Reading testiga o‘tyapsiz.',
    icon: 'book',
    accent: 'neon',
    durationLabel: 'Jami vaqt: 60 daqiqa',
    taskCountLabel: 'Partlar: 5',
    warning: 'Vaqt tugagandan keyin javoblar avtomatik yuboriladi.',
    cta: 'Boshlash',
  },

  listening: {
    key: 'listening',
    titleUz: 'Listening',
    subtitle: 'AUDIO AND QUESTIONS',
    intro: 'Listening testiga o‘tyapsiz.',
    icon: 'headphones',
    accent: 'neon',
    durationLabel: 'Jami vaqt: 40 daqiqa',
    taskCountLabel: 'Partlar: 6',
    warning: 'Vaqt tugagandan keyin javoblar avtomatik yuboriladi. Audio cheklangan marta tinglanadi.',
    cta: 'Boshlash',
  },

  writing: {
    key: 'writing',
    titleUz: 'Writing',
    subtitle: 'LETTER AND ESSAY',
    intro: 'Writing testiga o‘tyapsiz.',
    icon: 'pen',
    accent: 'orange',
    durationLabel: 'Jami vaqt: 60 daqiqa',
    taskCountLabel: 'Partlar: 3',
    warning: 'Vaqt tugagandan keyin javoblar avtomatik yuboriladi.',
    cta: 'Boshlash',
  },

  speaking: {
    key: 'speaking',
    titleUz: 'Speaking',
    subtitle: 'ORAL ANSWERS',
    intro: 'Speaking testiga o‘tyapsiz.',
    icon: 'mic',
    accent: 'neon',
    durationLabel: 'Tayyorgarlik + yozib olish',
    taskCountLabel: 'Savollar: 8',
    warning: 'Tayyorgarlik tugagach yozish avtomatik boshlanadi. Vaqt tugaganda qayta yozib bo‘lmaydi.',
    cta: 'Boshlash',
  },
}
