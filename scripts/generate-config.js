// =============================================
// Genera js/config.js a partir de variables de entorno.
// Se ejecuta en el build de Vercel (y opcionalmente en local).
// =============================================

const fs   = require('fs');
const path = require('path');

const firebaseApiKey  = process.env.FIREBASE_API_KEY  || '';
const gcpApiKey       = process.env.GCP_API_KEY       || '';

if (!firebaseApiKey) {
  console.warn(
    '[generate-config] ADVERTENCIA: FIREBASE_API_KEY está vacía. ' +
    'Asegurate de configurarla en Vercel. ' +
    'Nota: ANTHROPIC_API_KEY ya no va aquí — la usa /api/claude.js en el servidor.'
  );
}

const content = `// Archivo generado automáticamente — no editar manualmente.
window.APP_CONFIG = {
  firebaseApiKey:  "${firebaseApiKey}",
  gcpApiKey:       "${gcpApiKey}"
};
`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('[generate-config] js/config.js generado correctamente.');
