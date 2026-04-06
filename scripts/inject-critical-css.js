#!/usr/bin/env node
// scripts/inject-critical-css.js
// ================================================
// Inyecta el CSS crítico compilado en el <style> inline del HTML.
//
// FLUJO:
//   1. Compila scss/[page]-inline.scss → css/[page]-inline.css  (sass)
//   2. Lee el CSS compilado
//   3. Reemplaza el contenido del <style> en el HTML de destino
//
// USO:
//   node scripts/inject-critical-css.js
//   node scripts/inject-critical-css.js --page portada-economia
//   node scripts/inject-critical-css.js --watch
//
// EN PRODUCCIÓN:
//   Astro / Next.js / critters hacen esto automáticamente.
//   Este script es el equivalente local para desarrollo sin framework.
// ================================================

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Configuración ─────────────────────────────────────────────────
// Mapa página → { scss, css, html }
const PAGES = {
  'portada-economia': {
    scss: 'scss/portada-economia-inline.scss',
    css:  'css/portada-economia-inline.css',
    html: 'portada-economia.html',
  },
  // Añadir aquí nuevas portadas cuando se creen:
  // 'portada-deportes': {
  //   scss: 'scss/portada-deportes-inline.scss',
  //   css:  'css/portada-deportes-inline.css',
  //   html: 'portada-deportes.html',
  // },
};

// Marcadores que delimitan el <style> inline en el HTML.
// El script reemplaza TODO lo que haya entre estas dos cadenas.
const MARKER_START = '<style>';
const MARKER_END   = '</style>';

// ── Helpers ──────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

function log(msg)  { console.log(`[inject-critical] ${msg}`); }
function warn(msg) { console.warn(`[inject-critical] ⚠  ${msg}`); }
function ok(msg)   { console.log(`[inject-critical] ✓  ${msg}`); }
function err(msg)  { console.error(`[inject-critical] ✗  ${msg}`); process.exit(1); }

function compileSass(scssPath, cssPath) {
  const abs_scss = path.join(ROOT, scssPath);
  const abs_css  = path.join(ROOT, cssPath);
  if (!fs.existsSync(abs_scss)) {
    err(`SCSS no encontrado: ${scssPath}`);
  }
  log(`Compilando ${scssPath} → ${cssPath}`);
  try {
    execSync(
      `npx sass "${abs_scss}" "${abs_css}" --style=compressed --no-source-map`,
      { cwd: ROOT, stdio: 'pipe' }
    );
  } catch (e) {
    err(`Error al compilar SCSS:\n${e.stderr?.toString() || e.message}`);
  }
}

function injectIntoHtml(cssPath, htmlPath) {
  const abs_css  = path.join(ROOT, cssPath);
  const abs_html = path.join(ROOT, htmlPath);

  if (!fs.existsSync(abs_css)) {
    err(`CSS compilado no encontrado: ${cssPath}. Ejecuta primero la compilación.`);
  }
  if (!fs.existsSync(abs_html)) {
    err(`HTML no encontrado: ${htmlPath}`);
  }

  const css  = fs.readFileSync(abs_css, 'utf8').trim();
  let   html = fs.readFileSync(abs_html, 'utf8');

  const idxStart = html.indexOf(MARKER_START);
  const idxEnd   = html.indexOf(MARKER_END);

  if (idxStart === -1 || idxEnd === -1 || idxEnd <= idxStart) {
    err(`No se encontró un bloque <style>…</style> en ${htmlPath}.`);
  }

  const before  = html.slice(0, idxStart + MARKER_START.length);
  const after   = html.slice(idxEnd);
  const updated = before + css + after;

  if (updated === html) {
    ok(`${htmlPath} ya estaba actualizado.`);
    return;
  }

  fs.writeFileSync(abs_html, updated, 'utf8');

  const bytes = Buffer.byteLength(css, 'utf8');
  ok(`${htmlPath} actualizado (${(bytes / 1024).toFixed(1)} KB inline).`);
}

// ── Proceso ──────────────────────────────────────────────────────

// Leer argumentos
const args   = process.argv.slice(2);
const watch  = args.includes('--watch');
const pageArg = (() => {
  const idx = args.indexOf('--page');
  return idx !== -1 ? args[idx + 1] : null;
})();

// Seleccionar páginas a procesar
let pages;
if (pageArg) {
  if (!PAGES[pageArg]) {
    err(`Página desconocida: "${pageArg}". Opciones: ${Object.keys(PAGES).join(', ')}`);
  }
  pages = { [pageArg]: PAGES[pageArg] };
} else {
  pages = PAGES;
}

function runAll() {
  for (const [name, cfg] of Object.entries(pages)) {
    log(`── ${name} ──────────────────────────`);
    compileSass(cfg.scss, cfg.css);
    injectIntoHtml(cfg.css, cfg.html);
  }
  log('Listo.');
}

// Ejecución
runAll();

// Modo watch
if (watch) {
  log('Modo watch activo. Observando cambios en scss/...');
  const scssDir = path.join(ROOT, 'scss');

  let debounce;
  fs.watch(scssDir, { recursive: true }, (eventType, filename) => {
    if (!filename?.endsWith('.scss')) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      log(`Cambio detectado: ${filename}`);
      runAll();
    }, 200);
  });
}
