# CLAUDE.md — Asistente del Hogar

Este archivo le da contexto a Claude sobre el proyecto para que pueda trabajar de manera consistente en cada sesión sin tener que explorar el código desde cero.

---

## Descripción del proyecto

**Asistente del Hogar** es una Progressive Web App (PWA) para organizar la vida del hogar. Permite gestionar tareas domésticas por día, planificar recetas semanales, generar listas de compras automáticas y registrar el historial de jornadas de trabajo. Soporta múltiples usuarios con roles distintos (pareja, familia, personal del hogar).

- **UI**: Español argentino
- **Producción**: Vercel (auto-deploy desde rama `main`)
- **Tipo de app**: SPA (Single Page Application) sin router, con múltiples vistas en el mismo HTML

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | Vanilla JavaScript (sin frameworks — intencional) |
| Bundler | Vite 5 |
| Base de datos | Firebase Firestore (tiempo real) |
| Autenticación | Firebase Auth (Google OAuth) |
| PWA | vite-plugin-pwa + service worker |
| IA | Claude API (via proxy serverless) |
| Deploy | Vercel (funciones serverless + build estático) |
| Estilo | CSS puro con variables CSS (mobile-first) |

---

## Estructura de archivos clave

```
asistente-hogar/
├── index.html              → Template principal. Contiene TODAS las vistas y handlers inline onclick="window.fn()"
├── src/
│   ├── main.js             → Entry point de Vite. Expone funciones a window.*, inicializa auth y listeners
│   ├── firebase.js         → Inicialización de Firebase (db, auth)
│   └── store/
│       └── listeners.js    → Listeners onSnapshot de Firestore (7 documentos en tiempo real)
├── js/
│   ├── state.js            → Estado global de la app + helpers de Firebase + save() debounced
│   ├── data.js             → DEFAULT_TASKS, PRELOADED_RECIPES (20 recetas), getCurrentSeason()
│   ├── tasks.js            → CRUD de tareas, sesiones de trabajo, reloj
│   ├── menu.js             → Vista de recetas: filtros, detalle, CRUD
│   ├── week-plan.js        → Plan semanal: selector de 3 recetas
│   ├── shopping.js         → Lista de compras: generación y categorización automática
│   ├── notes.js            → Notas por día con autor y timestamp
│   ├── history.js          → Historial de jornadas y panel de gestión de usuarios
│   ├── navigation.js       → showView(), notificaciones, getRecommendedRecipes()
│   ├── roles.js            → Roles admin/user, currentUser, applyRoleToUI()
│   └── app.js              → Integración con Claude API para sugerencias de recetas
├── api/
│   └── claude.js           → Proxy serverless Vercel: reenvía pedidos al API de Anthropic
├── css/
│   └── styles.css          → Todo el CSS (~970 líneas, variables CSS, temas por día)
├── vite.config.js          → Config de Vite + PWA
├── vercel.json             → Config de deploy en Vercel
└── manifest.json           → Manifest de PWA
```

---

## Variables de entorno

El `.env` local ya está configurado. Si se agregan nuevas variables, deben añadirse también en el dashboard de Vercel.

```
VITE_FIREBASE_API_KEY=...   # Se expone al frontend via import.meta.env (prefijo VITE_ obligatorio)
CLAUDE_API_KEY=...           # Solo en Vercel serverless — NUNCA en el cliente
```

> **Importante**: Variables sin prefijo `VITE_` no llegan al navegador. El API key de Claude debe quedarse solo en el servidor.

---

## Comandos de desarrollo

```bash
npm run dev      # Inicia el servidor de desarrollo en localhost
npm run build    # Genera el build de producción en dist/
npm run preview  # Previsualiza el build localmente
```

---

## Flujo de trabajo Git

El proyecto está migrando a un flujo con ramas y Pull Requests. Las reglas son:

1. **Nunca trabajar directamente en `main`**
2. Crear una rama por cada feature o corrección:
   ```bash
   git checkout -b feat/nombre-descripcion
   # o
   git checkout -b fix/descripcion-del-bug
   ```
3. Hacer commits con mensajes descriptivos en español
4. Abrir un PR hacia `main` y esperar revisión antes de hacer merge
5. El merge a `main` dispara el auto-deploy en Vercel
6. Claude usa **worktrees** para trabajar en ramas sin afectar el repo principal

---

## Patrones críticos del código

### window.* globals — NO TOCAR SIN LEER `index.html`
`src/main.js` expone **todas** las funciones como `window.fn()`. El HTML tiene cientos de handlers inline como `onclick="toggleTask('lunes', id)"`. Si se renombra o elimina una función de `window`, el botón correspondiente en el HTML deja de funcionar.

### Sin frameworks — intencional
La app usa Vanilla JS por decisión de diseño. No proponer ni migrar a React, Vue, Svelte u otros frameworks.

### Estado global centralizado
Toda la lógica lee y escribe sobre el objeto `state` exportado desde `js/state.js`. No crear variables de estado locales en otros módulos.

### Persistencia: siempre usar `save()`
Para guardar datos en Firebase usar `save()` (que tiene un debounce de 800ms). No llamar `saveToFirebase()` directamente salvo casos muy específicos.

### Firestore con datos reales en producción
El esquema de los documentos Firestore tiene datos reales. Cualquier cambio estructural (renombrar campos, cambiar tipos) requiere mantener retrocompatibilidad o planificar una migración.

### Días hardcodeados
`lunes`, `miercoles`, `viernes` están hardcodeados en `data.js`, `index.html` y la lógica de navegación. Pueden flexibilizarse en el futuro, pero por ahora es así por diseño.

---

## Modelo de datos (Firestore)

### Colección principal: `hogar/`

| Documento | Contenido |
|-----------|-----------|
| `tasks` | Tareas por día (lunes/miercoles/viernes) y categoría |
| `sessions` | Estado del reloj y sesión activa |
| `history` | Array de jornadas completadas |
| `customRecipes` | Recetas creadas por el usuario |
| `menuChoice` | Receta elegida del día |
| `notes` | Notas por día con autor y timestamp |
| `weekPlan` | 3 recetas del plan semanal + metadata |
| `shoppingList` | Lista de compras generada |

### Colección de usuarios: `users/{uid}`
```
{ uid, role, name, email, joinedAt }
```

### Colección de config: `config/main`
```
{ founderId }  → UID del primer usuario registrado (Admin permanente)
```

---

## Sistema de roles

| Rol | Descripción |
|-----|-------------|
| **Admin** | Primer usuario en registrarse. Acceso total: gestionar tareas, historial, usuarios y recetas |
| **User** | Usuarios siguientes. Vista limitada: no ve botones de gestión ni el tab Historial |

- El Admin (founder) no puede ser degradado a User
- La app soporta usuarios mixtos: pareja, familia, personal del hogar

---

## Integración con Claude API

- El cliente llama a `/api/claude` (función serverless en Vercel)
- El serverless reenvía el pedido a `https://api.anthropic.com/v1/messages`
- Modelo utilizado: `claude-sonnet-4-20250514`
- El API key nunca llega al navegador

La función está en `api/claude.js`. El código que llama al endpoint está en `js/app.js`.

---

## Reglas para Claude al trabajar en este proyecto

- **El usuario no programa**: antes de implementar cualquier cambio, explicar qué se va a hacer y por qué en lenguaje claro y simple.
- Preferir siempre editar archivos existentes antes de crear nuevos.
- Los cambios en `index.html` son delicados: tiene la estructura de todas las vistas y los handlers inline. Revisar bien antes de modificar.
- Probar con `npm run dev` antes de proponer merge a `main`.
- Los comentarios en el código pueden escribirse en español.
- No asumir acceso a datos de producción en Firebase: consultar antes de proponer migraciones.
- Si hay dudas sobre el impacto de un cambio, preguntar antes de implementar.
