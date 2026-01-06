// Utility functions matching PHP behavior

export function formatCurrency(amount: number, lang: 'fr' | 'ar' = 'fr'): string {
  const currency = lang === 'ar' ? 'د.ت' : 'TND'
  return new Intl.NumberFormat(lang === 'ar' ? 'fr-TN' : 'fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + currency
}

export function getAllowedStakes(): number[] {
  // Match PHP config: ALLOWED_STAKES = '5,10,20,30,50'
  return [5, 10, 20, 30, 50]
}

export function generateShareLink(matchId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/join?match=${matchId}`
  }
  return `/join?match=${matchId}`
}

// Translations
export const translations = {
  fr: {
    choose_game: 'Choisissez un jeu',
    play: 'Jouer',
    create_challenge: 'Créer un défi',
    join_lobby: 'Rejoindre la salle',
    balance: 'Solde',
    profile: 'Profil',
    logout: 'Déconnexion',
    stake: 'Mise',
    waiting_opponent: 'En attente d\'un adversaire...',
    accept: 'Accepter',
    cancel: 'Annuler',
  },
  ar: {
    choose_game: 'اختر لعبة',
    play: 'لعب',
    create_challenge: 'إنشاء تحدٍ',
    join_lobby: 'انضم إلى الغرفة',
    balance: 'الرصيد',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    stake: 'الرهان',
    waiting_opponent: 'في انتظار الخصم...',
    accept: 'قبول',
    cancel: 'إلغاء',
  }
}

export function t(key: keyof typeof translations.fr, lang: 'fr' | 'ar' = 'fr'): string {
  return translations[lang][key] || key
}

