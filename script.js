(function () {
  'use strict';

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

  const qrTarget = document.getElementById('qrTarget');
  const saveBtn = document.getElementById('saveBtn');
  const shareBtn = document.getElementById('shareBtn');
  const pageUrl = window.location.href;

  // Generar QR
  function renderQR() {
    if (typeof QRCode === 'undefined') {
      const img = document.createElement('img');
      img.alt = 'Código QR de esta tarjeta';
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(pageUrl);
      qrTarget.appendChild(img);
      return;
    }
    QRCode.toCanvas(pageUrl, { width: 200, margin: 2, color: { dark: '#0a0a0a', light: '#ffffff' } }, function (err, canvas) {
      if (err) return;
      canvas.setAttribute('aria-label', 'Código QR de esta tarjeta');
      qrTarget.appendChild(canvas);
    });
  }

  // Escapar caracteres especiales
  function esc(value) {
    return String(value ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  // Generar vCard con FOTO incluida (CORREGIDO)
  function makeVCard() {
    // Construir la URL absoluta de la foto (funciona en GitHub Pages)
    const photoUrl = new URL('foto.png', window.location.href).href;

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + esc(CONTACT.lastName) + ';' + esc(CONTACT.firstName) + ';;;',
      'FN:' + esc(CONTACT.fullName),
      CONTACT.title ? 'TITLE:' + esc(CONTACT.title) : '',
      CONTACT.phone ? 'TEL;TYPE=CELL:' + esc(CONTACT.phone) : '',
      CONTACT.email ? 'EMAIL;TYPE=INTERNET:' + esc(CONTACT.email) : '',
      CONTACT.linkedin ? 'URL;TYPE=LinkedIn:' + esc(CONTACT.linkedin) : '',
      CONTACT.birthday ? 'BDAY:' + CONTACT.birthday.replace(/-/g, '') : '',
      'PHOTO;VALUE=URI;TYPE=PNG:' + photoUrl, // <--- AÑADIDO PARA LA FOTO
      'END:VCARD'
    ].filter(Boolean);
    return lines.join('\r\n') + '\r\n';
  }

  // Guardar contacto (multi-fallback)
  async function handleSave() {
    const vcardString = makeVCard();
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });

    // 1. Compartir archivo nativo (iOS, Android moderno)
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], 'Santiago-F-Cadena.vcf', { type: 'text/vcard' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: CONTACT.fullName, text: 'Añade este contacto' });
          return;
        }
      } catch (err) { console.log('Share cancelado o falló:', err); }
    }

    // 2. Descarga directa con Blob URL (escritorio, algunos Android)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Santiago-F-Cadena.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    } catch (e) { console.error('Descarga Blob falló:', e); }

    // 3. Abrir data URI (puede funcionar en Redmi)
    try {
      const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcardString);
      window.open(dataUri, '_blank');
      return;
    } catch (e) { console.error('Abrir data URI falló:', e); }

    // 4. Último recurso: mostrar contenido
    alert('Tu navegador no permite guardar automáticamente.\nCopia el siguiente texto y guárdalo como archivo .vcf:\n\n' + vcardString);
  }

  // Compartir
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: CONTACT.fullName, text: 'Guarda mi contacto digital.', url: pageUrl });
      } catch (err) { console.log('Share cancelado:', err); }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        alert('¡Enlace copiado al portapapeles!');
      } catch (err) { console.error('Clipboard error:', err); }
    }
  }

  // Eventos
  saveBtn.addEventListener('click', handleSave);
  shareBtn.addEventListener('click', handleShare);

  // Inicializar
  renderQR();
})();