/**
 * Digital Contact Card - Logic
 * Handles QR generation, vCard creation, and Share/Download fallbacks.
 */
(function () {
  'use strict';

  // ====== CONTACT DATA (vCard Configuration) ======
  const CONTACT = {
    fullName: 'Santiago F. Cadena M.',
    firstName: 'Santiago F.',
    lastName: 'Cadena M.',
    organization: '',
    title: 'Software Developer',
    phone: '+593987285574',
    email: 'santicadena@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/santiago-cadena-4847b012b',
    website: '',
    birthday: '1977-01-05' // Included in vCard only
  };

  // Cache DOM elements
  const qrTarget = document.getElementById('qrTarget');
  const saveBtn = document.getElementById('saveBtn');
  const shareBtn = document.getElementById('shareBtn');
  const pageUrl = window.location.href;

  /**
   * Generates the QR code using the local library or an external fallback API.
   */
  function renderQR() {
    if (typeof QRCode === 'undefined') {
      // Fallback: If CDN library fails, use external API
      const img = document.createElement('img');
      img.alt = 'Código QR de esta tarjeta';
      img.width = 200;
      img.height = 200;
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(pageUrl);
      qrTarget.appendChild(img);
      return;
    }

    try {
      QRCode.toCanvas(pageUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#0a0a0a', light: '#ffffff' }
      }, function (err, canvas) {
        if (err) {
          console.error('QR generation failed:', err);
          return;
        }
        canvas.setAttribute('aria-label', 'Código QR de esta tarjeta');
        qrTarget.appendChild(canvas);
      });
    } catch (e) {
      console.error('QR exception:', e);
    }
  }

  /**
   * Escapes characters for vCard 3.0 compliance (RFC 2426).
   * @param {string} value
   * @returns {string}
   */
  function esc(value) {
    return String(value ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  /**
   * Builds a valid vCard 3.0 string.
   * @returns {string}
   */
  function makeVCard() {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + esc(CONTACT.lastName) + ';' + esc(CONTACT.firstName) + ';;;',
      'FN:' + esc(CONTACT.fullName),
      CONTACT.organization ? 'ORG:' + esc(CONTACT.organization) : '',
      CONTACT.title ? 'TITLE:' + esc(CONTACT.title) : '',
      CONTACT.phone ? 'TEL;TYPE=CELL:' + esc(CONTACT.phone) : '',
      CONTACT.email ? 'EMAIL;TYPE=INTERNET:' + esc(CONTACT.email) : '',
      CONTACT.linkedin ? 'URL;TYPE=LinkedIn:' + esc(CONTACT.linkedin) : '',
      CONTACT.website ? 'URL:' + esc(CONTACT.website) : '',
      CONTACT.birthday ? 'BDAY:' + CONTACT.birthday.replace(/-/g, '') : '',
      'END:VCARD'
    ].filter(Boolean);
    return lines.join('\r\n') + '\r\n';
  }

  /**
   * Handles the "Save" action.
   * Native Share for mobile (iOS/Android) or forced download for desktop.
   */
  function handleSave() {
    const vcard = makeVCard();
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const file = new File([blob], 'Santiago-F-Cadena.vcf', { type: 'text/vcard' });

    // Check if device supports native share of files (iOS/Android)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: CONTACT.fullName,
        text: 'Guarda mi contacto'
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      // Fallback: Standard download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Santiago-F-Cadena.vcf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Handles the "Share" action.
   * Native share for mobile/desktop, or clipboard copy fallback.
   */
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: CONTACT.fullName,
          text: 'Guarda mi contacto digital.',
          url: pageUrl
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      // Fallback: Copy link to clipboard
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(pageUrl);
          alert('¡Enlace copiado al portapapeles!');
        } catch (err) {
          console.error('Clipboard error:', err);
        }
      }
    }
  }

  // Initialize Event Listeners
  saveBtn.addEventListener('click', handleSave);
  shareBtn.addEventListener('click', handleShare);

  // Initial Rendering
  renderQR();
})();