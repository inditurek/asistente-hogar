// =============================================
// Genera js/config.js a partir de variables de entorno.
// Se ejecuta en el build de Vercel (y opcionalmente en local).
// =============================================

const fs   = require('fs');
const path = require('path');

const firebaseApiKey  = process.env.FIREBASE_API_KEY  || '';
const gcpApiKey       = process.env.GCP_API_KEY       || '';
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';

if (!firebaseApiKey || !anthropicApiKey) {
  console.warn(
    '[generate-config] ADVERTENCIA: Alguna variable de entorno está vacía. ' +
    'Asegurate de configurar FIREBASE_API_KEY, GCP_API_KEY y ANTHROPIC_API_KEY en Vercel.'
  );
}

const content = `// Archivo generado automáticamente — no editar manualmente.
window.APP_CONFIG = {
  firebaseApiKey:  "${firebaseApiKey}",
  gcpApiKey:       "${gcpApiKey}",
  anthropicApiKey: "${anthropicApiKey}"
};
`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('[generate-config] js/config.js generado correctamente.');
