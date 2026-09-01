/**
 * Digital Contact Card - Logic
 * Robust handling of vCard saving with multiple fallbacks.
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
    birthday: '1977-01-05'
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
   * Attempts to download the vCard using a hidden anchor element.
   * Works on desktop browsers and some Android browsers.
   */
  function downloadVCard(vcardString) {
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Santiago-F-Cadena.vcf';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Opens the vCard as a data URI in a new tab/window.
   * This is the fallback for iOS Safari, where downloads are blocked
   * but opening a vCard file triggers the "Add to Contacts" prompt.
   */
  function openVCardInNewTab(vcardString) {
    const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcardString);
    window.open(dataUri, '_blank');
  }

  /**
   * Main handler for the "Añadir Contacto" button.
   * Tries: 1) Native share with file (iOS/Android) -> 2) Direct download -> 3) Open in new tab.
   */
  async function handleSave() {
    const vcardString = makeVCard();
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });

    // Intento 1: Compartir archivo nativo (mejor experiencia en móviles)
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], 'Santiago-F-Cadena.vcf', { type: 'text/vcard' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: CONTACT.fullName,
            text: 'Añade este contacto'
          });
          return; // Si se compartió, no hacer nada más
        }
      } catch (err) {
        console.log('Share failed or cancelled:', err);
        // Si el usuario cancela o falla, continuar al siguiente método
      }
    }

    // Intento 2: Descarga directa (funciona en escritorio y algunos Android)
    try {
      downloadVCard(vcardString);
      return;
    } catch (e) {
      console.error('Download failed:', e);
    }

    // Intento 3: Abrir en nueva pestaña (fallback iOS)
    openVCardInNewTab(vcardString);
  }

  /**
   * Handles the "Share" action (compartir tarjeta completa).
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
      // Fallback: Copiar enlace al portapapeles
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(pageUrl);
          alert('¡Enlace copiado al portapapeles!');
        }
      } catch (err) {
        console.error('Clipboard error:', err);
      }
    }
  }

  // Initialize Event Listeners
  saveBtn.addEventListener('click', handleSave);
  shareBtn.addEventListener('click', handleShare);

  // Initial Rendering
  renderQR();
})();