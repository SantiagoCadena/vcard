# Tarjeta de Contacto Digital - Santiago F. Cadena M.

Esta es una tarjeta de presentación digital (vCard) de una sola página, optimizada para **móviles**. Al escanear el código QR, los usuarios pueden guardar tu contacto, llamarte, enviarte un WhatsApp o un correo electrónico directamente desde el navegador.

## ✨ Características

- **Diseño Moderno:** Interfaz oscura, elegante y totalmente responsive.
- **Animaciones Sutiles:** Efecto de entrada (fade-in-up) al cargar la página.
- **Guardar Contacto (.vcf):** Genera un archivo vCard 3.0 estándar.
- **Compartir Nativo:** Usa la API Web Share para compartir la tarjeta (y el archivo vCard) directamente por WhatsApp, Telegram, etc., en móviles.
- **Código QR Dinámico:** Genera automáticamente un QR que apunta a la URL actual de GitHub Pages.
- **Accesibilidad:** Etiquetas ARIA, soporte para `prefers-reduced-motion` y botones grandes fáciles de tocar.

## 🚀 Cómo usar y Desplegar

1. **Clona el repositorio** en tu máquina local.
2. **Reemplaza la foto**: Coloca tu imagen en la carpeta raíz y nómbrala `foto.png`. (Si usas otra, cambia el atributo `src` en `index.html`).
3. **Personaliza los datos**: Edita la sección `// ====== CONTACT DATA ======` dentro del `<script>` en `index.html` para cambiar tu nombre, teléfono, correo, etc.
4. **Sube a GitHub**:
   ```bash
   git add .
   git commit -m "Configuración inicial de la tarjeta"
   git push origin develop