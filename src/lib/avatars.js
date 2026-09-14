// Procedural Accused / Suspect Mugshot Portraits and Visual Evidence Assets

export function generateProceduralAvatar(name) {
  if (!name || typeof name !== 'string') return null;
  const cleanName = name.trim();
  if (!cleanName) return null;

  // Derive initials
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  // Hash code for deterministic color palette
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;

  const bgGradStart = `hsl(${hue1}, 45%, 15%)`;
  const bgGradEnd = `hsl(${hue2}, 55%, 8%)`;
  const accentColor = `hsl(${hue1}, 70%, 55%)`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="bg_${Math.abs(hash)}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="16" fill="url(#bg_${Math.abs(hash)})"/>
    <circle cx="60" cy="50" r="32" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-width="1.5"/>
    <text x="60" y="58" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" text-anchor="middle" letter-spacing="1">${initials}</text>
    <rect x="20" y="94" width="80" height="16" rx="4" fill="#0F172A" fill-opacity="0.8" stroke="#334155" stroke-width="1"/>
    <text x="60" y="105" fill="${accentColor}" font-family="monospace" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="1">POLICE DOSSIER</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function getAccusedPhoto(entityOrName) {
  if (!entityOrName) return null;
  if (typeof entityOrName === 'object') {
    if (entityOrName.imageUrl) return entityOrName.imageUrl;
    if (entityOrName.identifiers?.imageUrl) return entityOrName.identifiers.imageUrl;
    if (entityOrName.name) return generateProceduralAvatar(entityOrName.name);
    return null;
  }
  if (typeof entityOrName === 'string') {
    return generateProceduralAvatar(entityOrName);
  }
  return null;
}
