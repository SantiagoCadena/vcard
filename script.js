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

  // CORRECCIÓN S6864: String.raw tanto en búsquedas como en reemplazos
  function esc(value) {
    return String(value ?? '')
      .replace(String.raw`\\`, String.raw`\\`)
      .replace(String.raw`\r?\n`, String.raw`\n`)
      .replace(String.raw`\;`, String.raw`\;`)
      .replace(String.raw`\,`, String.raw`\,`);
  }

  // Convertir la imagen a Base64 para que el teléfono guarde la foto siempre
  async function getPhotoBase64() {
    try {
      const response = await fetch('foto.png');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Error cargando la foto:', e);
      return null;
    }
  }

  // Generar vCard (asíncrono)
  async function makeVCard() {
    const photoBase64 = await getPhotoBase64();
    
    let photoLine = '';
    if (photoBase64) {
      const base64Data = photoBase64.split(',')[1];
      photoLine = 'PHOTO;ENCODING=b;TYPE=PNG:' + base64Data;
    } else {
      photoLine = 'PHOTO;VALUE=URI;TYPE=PNG:' + new URL('foto.png', window.location.href).href;
    }

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + esc(CONTACT.lastName) + ';' + esc(CONTACT.firstName) + ';;;',
      'FN:' + esc(CONTACT.fullName),
      CONTACT.title ? 'TITLE:' + esc(CONTACT.title) : '',
      CONTACT.phone ? 'TEL;TYPE=CELL:' + esc(CONTACT.phone) : '',
      CONTACT.email ? 'EMAIL;TYPE=INTERNET:' + esc(CONTACT.email) : '',
      CONTACT.linkedin ? 'URL;TYPE=LinkedIn:' + esc(CONTACT.linkedin) : '',
      // CORRECCIÓN S7781: replaceAll en lugar de replace con /g
      CONTACT.birthday ? 'BDAY:' + CONTACT.birthday.replaceAll('-', '') : '', 
      photoLine,
      'END:VCARD'
    ].filter(Boolean);
    return lines.join('\r\n') + '\r\n';
  }

  // Guardar contacto (multi-fallback)
  async function handleSave() {
    const vcardString = await makeVCard();
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });

    // 1. Compartir archivo nativo
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], 'Santiago-F-Cadena.vcf', { type: 'text/vcard' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: CONTACT.fullName, text: 'Añade este contacto' });
          return;
        }
      } catch (err) { console.log('Share cancelado o falló:', err); }
    }

    // 2. Descarga directa
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Santiago-F-Cadena.vcf';
      document.body.appendChild(a);
      a.click();
      // CORRECCIÓN S7762: Usar remove() en lugar de removeChild
      a.remove(); 
      URL.revokeObjectURL(url);
      return;
    } catch (e) { console.error('Descarga Blob falló:', e); }

    // 3. Abrir data URI
    try {
      const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcardString);
      window.open(dataUri, '_blank');
      return;
    } catch (e) { console.error('Abrir data URI falló:', e); }

    // 4. Último recurso
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