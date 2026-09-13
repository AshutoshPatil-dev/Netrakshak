import { el, icon } from '../lib/dom.js';
import { state } from '../state.js';

export function openFilePreview(fileOrInfo) {
  if (!fileOrInfo) return;
  let fileUrl = '';
  let fileName = 'Document';
  let fileType = '';
  let fileSize = '';
  let fileHash = '';

  if (fileOrInfo instanceof File) {
    fileName = fileOrInfo.name;
    fileType = fileOrInfo.type;
    fileSize = (fileOrInfo.size / 1024).toFixed(1) + ' KB';
    fileUrl = URL.createObjectURL(fileOrInfo);
    fileHash = state.fileHash || '';
  } else if (typeof fileOrInfo === 'object') {
    fileName = fileOrInfo.name || 'Document';
    fileType = fileOrInfo.type || (fileOrInfo.file ? fileOrInfo.file.type : '');
    fileSize = fileOrInfo.size ? (fileOrInfo.size / 1024).toFixed(1) + ' KB' : (fileOrInfo.file ? (fileOrInfo.file.size / 1024).toFixed(1) + ' KB' : '');
    fileUrl = fileOrInfo.url || (fileOrInfo.file ? URL.createObjectURL(fileOrInfo.file) : '');
    fileHash = fileOrInfo.hash || state.fileHash || '';
  }

  state.previewModalFile = { name: fileName, type: fileType, size: fileSize, url: fileUrl, hash: fileHash };
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

  const { name, type, size, url, hash } = state.previewModalFile;
  const isImage = type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(name);

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
      el('div', { class: 'preview-fallback-icon' }, [icon('file')]),
      el('strong', {}, [name]),
      el('span', { class: 'muted' }, [`Format: ${type || 'Binary / Document'}`]),
      el('span', { class: 'muted' }, [`Size: ${size || 'N/A'}`])
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
          el('strong', { class: 'file-preview-modal-title' }, [name]),
          el('span', { class: 'file-preview-modal-sub' }, [
            `${size ? size + ' · ' : ''}${isImage ? 'Image preview' : isPdf ? 'PDF document' : 'Evidence file'}${hash ? ' · Fingerprint: ' + hash.slice(0, 16) + '…' : ''}`
          ])
        ]),
        el('button', { class: 'icon-btn close-preview-btn', title: 'Close preview', onclick: closeFilePreview }, [icon('close')])
      ]),
      el('div', { class: 'file-preview-modal-body' }, [previewContent]),
      el('div', { class: 'file-preview-modal-footer' }, [
        el('button', { class: 'outline-btn', onclick: closeFilePreview }, ['Close']),
        url ? el('a', { href: url, download: name, class: 'primary-btn small', target: '_blank' }, [icon('arrow'), 'Open in New Tab']) : null
      ])
    ])
  ]);

  document.body.appendChild(modal);
}
