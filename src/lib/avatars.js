// Helper functions for Accused / Suspect Mugshot Portraits and Visual Evidence Assets

export const DEFAULT_MUGSHOTS = {
  'Sameer Khan': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_sameer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_sameer)"/>
      <circle cx="60" cy="46" r="22" fill="#D97706"/>
      <path d="M42 40 Q60 30 78 40 Q75 22 60 22 Q45 22 42 40 Z" fill="#1E293B"/>
      <circle cx="53" cy="45" r="2.5" fill="#0F172A"/>
      <circle cx="67" cy="45" r="2.5" fill="#0F172A"/>
      <path d="M52 56 Q60 62 68 56" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 51 Q60 54 70 51" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M26 102 C26 78 42 70 60 70 C78 70 94 78 94 102 Z" fill="#334155"/>
      <path d="M44 76 L60 94 L76 76" fill="#CBD5E1"/>
      <rect x="34" y="96" width="52" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 01</text>
    </svg>
  `),
  'Vikram Rathi': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_vikram" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E1B4B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_vikram)"/>
      <circle cx="60" cy="46" r="21" fill="#FBBF24"/>
      <path d="M41 42 Q60 26 79 42 Q76 18 60 18 Q44 18 41 42 Z" fill="#0F172A"/>
      <!-- Glasses -->
      <rect x="47" y="42" width="11" height="8" rx="2" fill="none" stroke="#0F172A" stroke-width="1.8"/>
      <rect x="62" y="42" width="11" height="8" rx="2" fill="none" stroke="#0F172A" stroke-width="1.8"/>
      <line x1="58" y1="46" x2="62" y2="46" stroke="#0F172A" stroke-width="1.5"/>
      <path d="M53 58 Q60 63 67 58" stroke="#451A03" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M28 102 C28 78 42 72 60 72 C78 72 92 78 92 102 Z" fill="#1E293B"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 02</text>
    </svg>
  `),
  'Ajay Deshmukh': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_ajay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#312E81"/>
          <stop offset="100%" stop-color="#1E1B4B"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_ajay)"/>
      <circle cx="60" cy="46" r="22" fill="#F59E0B"/>
      <path d="M40 38 Q60 20 80 38 Q74 24 60 24 Q46 24 40 38 Z" fill="#18181B"/>
      <circle cx="53" cy="45" r="2.2" fill="#18181B"/>
      <circle cx="67" cy="45" r="2.2" fill="#18181B"/>
      <path d="M53 57 Q60 61 67 57" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26 102 C26 78 42 70 60 70 C78 70 94 78 94 102 Z" fill="#3B82F6"/>
      <rect x="34" y="96" width="52" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 03</text>
    </svg>
  `),
  'Maya Shelar': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_maya" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#831843"/>
          <stop offset="100%" stop-color="#500724"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_maya)"/>
      <circle cx="60" cy="45" r="20" fill="#FDE68A"/>
      <path d="M38 48 Q35 22 60 20 Q85 22 82 48 Q86 68 82 72 Q78 54 78 45 Q60 38 42 45 Q42 54 38 72 Q34 68 38 48 Z" fill="#18181B"/>
      <circle cx="54" cy="45" r="2" fill="#18181B"/>
      <circle cx="66" cy="45" r="2" fill="#18181B"/>
      <path d="M55 56 Q60 59 65 56" stroke="#9F1239" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M30 102 C30 80 42 74 60 74 C78 74 90 80 90 102 Z" fill="#9D174D"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 09</text>
    </svg>
  `),
  'Karan Mehra': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_karan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#14532D"/>
          <stop offset="100%" stop-color="#064E3B"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_karan)"/>
      <circle cx="60" cy="46" r="21" fill="#FCD34D"/>
      <path d="M41 40 Q60 24 79 40 Q76 22 60 22 Q44 22 41 40 Z" fill="#0F172A"/>
      <circle cx="53" cy="45" r="2.2" fill="#0F172A"/>
      <circle cx="67" cy="45" r="2.2" fill="#0F172A"/>
      <path d="M53 57 Q60 62 67 57" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 102 C28 78 42 72 60 72 C78 72 92 78 92 102 Z" fill="#047857"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 08</text>
    </svg>
  `),
  'Suresh Shinde': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_suresh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#451A03"/>
          <stop offset="100%" stop-color="#1C1917"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_suresh)"/>
      <circle cx="60" cy="46" r="22" fill="#D97706"/>
      <path d="M42 42 Q60 26 78 42 Q75 22 60 22 Q45 22 42 42 Z" fill="#1C1917"/>
      <circle cx="53" cy="45" r="2.2" fill="#1C1917"/>
      <circle cx="67" cy="45" r="2.2" fill="#1C1917"/>
      <path d="M48 52 Q60 56 72 52" stroke="#1C1917" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M52 60 Q60 64 68 60" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26 102 C26 78 42 70 60 70 C78 70 94 78 94 102 Z" fill="#78350F"/>
      <rect x="34" y="96" width="52" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 05</text>
    </svg>
  `),
  'Rohit Salunkhe': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_rohit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0F766E"/>
          <stop offset="100%" stop-color="#115E59"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_rohit)"/>
      <circle cx="60" cy="46" r="21" fill="#FBBF24"/>
      <path d="M42 38 Q60 22 78 38 Q74 20 60 20 Q46 20 42 38 Z" fill="#0F172A"/>
      <circle cx="53" cy="45" r="2.2" fill="#0F172A"/>
      <circle cx="67" cy="45" r="2.2" fill="#0F172A"/>
      <path d="M53 58 Q60 62 67 58" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 102 C28 78 42 72 60 72 C78 72 92 78 92 102 Z" fill="#0D9488"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 04</text>
    </svg>
  `),
  'Pappu More': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_pappu" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7C2D12"/>
          <stop offset="100%" stop-color="#431407"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_pappu)"/>
      <circle cx="60" cy="46" r="22" fill="#D97706"/>
      <path d="M41 40 Q60 26 79 40 Q75 22 60 22 Q45 22 41 40 Z" fill="#18181B"/>
      <circle cx="53" cy="45" r="2.2" fill="#18181B"/>
      <circle cx="67" cy="45" r="2.2" fill="#18181B"/>
      <path d="M52 58 Q60 62 68 58" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26 102 C26 78 42 70 60 70 C78 70 94 78 94 102 Z" fill="#9A3412"/>
      <rect x="34" y="96" width="52" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 07</text>
    </svg>
  `),
  'Arjun Pawar': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_arjun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#581C87"/>
          <stop offset="100%" stop-color="#3B0764"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_arjun)"/>
      <circle cx="60" cy="46" r="21" fill="#F59E0B"/>
      <path d="M42 38 Q60 20 78 38 Q74 20 60 20 Q46 20 42 38 Z" fill="#0F172A"/>
      <circle cx="53" cy="45" r="2.2" fill="#0F172A"/>
      <circle cx="67" cy="45" r="2.2" fill="#0F172A"/>
      <path d="M53 58 Q60 62 67 58" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 102 C28 78 42 72 60 72 C78 72 92 78 92 102 Z" fill="#7E22CE"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 06</text>
    </svg>
  `),
  'Dinesh Jha': 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg_dinesh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#172554"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#bg_dinesh)"/>
      <circle cx="60" cy="46" r="21" fill="#FCD34D"/>
      <path d="M41 40 Q60 24 79 40 Q76 22 60 22 Q44 22 41 40 Z" fill="#0F172A"/>
      <!-- Small mustache -->
      <path d="M52 52 Q60 55 68 52" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="53" cy="45" r="2.2" fill="#0F172A"/>
      <circle cx="67" cy="45" r="2.2" fill="#0F172A"/>
      <path d="M53 59 Q60 63 67 59" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M28 102 C28 78 42 72 60 72 C78 72 92 78 92 102 Z" fill="#2563EB"/>
      <rect x="36" y="96" width="48" height="14" rx="3" fill="#DC2626"/>
      <text x="60" y="106" fill="#FFFFFF" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">ACCUSED · 10</text>
    </svg>
  `)
};

export function getAccusedPhoto(entityOrName) {
  if (!entityOrName) return null;
  if (typeof entityOrName === 'object') {
    if (entityOrName.imageUrl) return entityOrName.imageUrl;
    if (entityOrName.identifiers?.imageUrl) return entityOrName.identifiers.imageUrl;
    if (entityOrName.name && DEFAULT_MUGSHOTS[entityOrName.name]) return DEFAULT_MUGSHOTS[entityOrName.name];
    return null;
  }
  if (typeof entityOrName === 'string') {
    return DEFAULT_MUGSHOTS[entityOrName] || null;
  }
  return null;
}
