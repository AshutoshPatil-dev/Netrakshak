export const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node[k] = v;
    else if (k === 'value') node.value = v;
    else if (k === 'selected' || k === 'checked' || k === 'disabled' || k === 'hidden') node[k] = Boolean(v);
    else node.setAttribute(k, v);
  });
  children.forEach(c => {
    if (c !== null && c !== undefined) node.append(c);
  });
  return node;
};

export const icon = (name) => ({
  shield: '◈', search: '⌕', grid: '▦', network: '◎', file: '▤',
  database: '◫', settings: '⚙', arrow: '→', check: '✓', lock: '▣',
  upload: '↑', expand: '⤢', close: '×', alert: '!', pulse: '◉',
  users: '👥', plus: '+', audit: '≡', sparkle: '✦', user: '👤'
}[name] || '•');

export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

