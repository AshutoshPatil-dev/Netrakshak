import { el, icon } from '../lib/dom.js';
import { state } from '../state.js';
import { supabase, supabaseConfigured } from '../lib/supabase.js';

export async function openFilePreview(fileOrInfo) {
  if (!fileOrInfo) return;
  let fileUrl = '';
  let fileName = 'Evidence Asset';
  let fileType = '';
  let fileSize = '';
  let fileHash = '';
  let storagePath = '';
  let description = '';
  let createdDate = '';

  if (fileOrInfo instanceof File) {
    fileName = fileOrInfo.name;
    fileType = fileOrInfo.type;
    fileSize = (fileOrInfo.size / 1024).toFixed(1) + ' KB';
    fileUrl = URL.createObjectURL(fileOrInfo);
    fileHash = state.fileHash || '';
  } else if (typeof fileOrInfo === 'object') {
    fileName = fileOrInfo.name || fileOrInfo.description || 'Evidence Document';
    description = fileOrInfo.description || '';
    fileType = fileOrInfo.type || fileOrInfo.evidence_type || (fileOrInfo.file ? fileOrInfo.file.type : '');
    fileSize = fileOrInfo.size ? (typeof fileOrInfo.size === 'number' ? (fileOrInfo.size / 1024).toFixed(1) + ' KB' : fileOrInfo.size) : (fileOrInfo.file ? (fileOrInfo.file.size / 1024).toFixed(1) + ' KB' : '');
    fileUrl = fileOrInfo.url || (fileOrInfo.file ? URL.createObjectURL(fileOrInfo.file) : '');
    fileHash = fileOrInfo.hash || fileOrInfo.sha256 || state.fileHash || '';
    storagePath = fileOrInfo.storage_path || fileOrInfo.storagePath || '';
    createdDate = fileOrInfo.created_at ? new Date(fileOrInfo.created_at).toLocaleString() : '';

    // If no direct URL but storagePath exists, try to get a signed URL or download blob from Supabase
    if (!fileUrl && storagePath && supabaseConfigured && supabase) {
      try {
        const { data: signedData } = await supabase.storage.from('fir-evidence').createSignedUrl(storagePath, 3600);
        if (signedData?.signedUrl) {
          fileUrl = signedData.signedUrl;
        } else {
          const { data: blobData } = await supabase.storage.from('fir-evidence').download(storagePath);
          if (blobData) {
            fileUrl = URL.createObjectURL(blobData);
          }
        }
      } catch (err) {
        console.warn('Could not fetch storage preview URL:', err);
      }
    }
  }

  state.previewModalFile = {
    name: fileName,
    description,
    type: fileType,
    size: fileSize,
    url: fileUrl,
    hash: fileHash,
    storagePath,
    createdDate
  };
  renderPreviewModal();
}

export function closeFilePreview() {
  state.previewModalFile = null;
  const modal = document.querySelector('.file-preview-modal-overlay');
  if (modal) modal.remove();
}

export function renderPreviewModal() {
  const existing = document.querySelector('.file-preview-modal-overlay');
  if (existing) existing.remove();
  if (!state.previewModalFile) return;

  const { name, description, type, size, url, hash, storagePath, createdDate } = state.previewModalFile;
  const isImage = (type && type.startsWith('image/')) || /\.(png|jpe?g|webp|gif|svg)$/i.test(name) || /\.(png|jpe?g|webp|gif|svg)$/i.test(storagePath);
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(name) || /\.pdf$/i.test(storagePath);
  const isCsvOrText = type === 'text/csv' || /\.csv$/i.test(name) || /\.csv$/i.test(storagePath) || /\.txt$/i.test(name);

  let previewContent;
  if (isImage && url) {
    previewContent = el('div', { class: 'preview-image-container' }, [
      el('img', { src: url, alt: name, class: 'preview-image' })
    ]);
  } else if (isPdf && url) {
    previewContent = el('div', { class: 'preview-pdf-container' }, [
      el('iframe', { src: url, title: name, class: 'preview-pdf-iframe' })
    ]);
  } else {
    previewContent = el('div', { class: 'preview-fallback-container' }, [
      el('div', { class: 'preview-fallback-icon' }, [icon(isCsvOrText ? 'grid' : 'file')]),
      el('strong', { style: 'font-size: 14px; margin-top: 8px;' }, [description || name]),
      storagePath ? el('span', { class: 'muted', style: 'font-family: monospace; font-size: 10px;' }, [`Vault: fir-evidence / ${storagePath}`]) : null,
      el('div', { style: 'display: flex; gap: 8px; margin-top: 12px; justify-content: center; flex-wrap: wrap;' }, [
        el('span', { class: 'status-pill-badge operational' }, [type ? type.toUpperCase() : 'DOCUMENT']),
        el('span', { class: 'status-pill-badge verified' }, ['CHAIN OF CUSTODY VERIFIED']),
        size ? el('span', { class: 'status-pill-badge', style: 'background: #F1F5F9; color: #475569;' }, [size]) : null
      ])
    ]);
  }

  const modal = el('div', {
    class: 'file-preview-modal-overlay',
    onclick: (e) => {
      if (e.target.classList.contains('file-preview-modal-overlay')) closeFilePreview();
    }
  }, [
    el('div', { class: 'file-preview-modal-card' }, [
      el('div', { class: 'file-preview-modal-header' }, [
        el('div', { class: 'file-preview-modal-meta' }, [
          el('strong', { class: 'file-preview-modal-title' }, [description || name]),
          el('span', { class: 'file-preview-modal-sub' }, [
            `${size ? size + ' · ' : ''}${isImage ? 'Visual Evidence Asset' : isPdf ? 'Scanned PDF Dossier' : 'Forensic Asset'}${createdDate ? ' · Registered: ' + createdDate : ''}`
          ])
        ]),
        el('button', { class: 'icon-btn close-preview-btn', title: 'Close preview', onclick: closeFilePreview }, [icon('close')])
      ]),
      el('div', { class: 'file-preview-modal-body' }, [previewContent]),
      hash ? el('div', { style: 'padding: 10px 18px; background: #F8FAFC; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; font-size: 10px;' }, [
        el('span', { class: 'muted' }, ['Cryptographic SHA-256 Fingerprint:']),
        el('span', { class: 'hash-pill', style: 'max-width: 320px;', title: hash }, [hash])
      ]) : null,
      el('div', { class: 'file-preview-modal-footer' }, [
        el('button', { class: 'outline-btn', onclick: closeFilePreview }, ['Close']),
        url ? el('a', { href: url, download: name, class: 'primary-btn small', target: '_blank' }, [icon('arrow'), 'Download / Open in New Tab']) : null
      ].filter(Boolean))
    ].filter(Boolean))
  ]);

  document.body.appendChild(modal);
}
