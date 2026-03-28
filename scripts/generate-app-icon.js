/**
 * MigraineScan — App Icon & Splash Asset Generator
 *
 * Generates all required PNG assets from SVG source.
 *
 * Usage:
 *   npm install sharp --no-save
 *   node scripts/generate-app-icon.js
 *
 * Outputs:
 *   assets/icon.png                     — 1024×1024 App Store icon
 *   assets/splash-icon.png              — 1284×2778 splash screen
 *   assets/adaptive-icon.png            — 1024×1024 Android adaptive foreground
 *   assets/android-icon-background.png  — 1024×1024 Android adaptive background
 *   assets/android-icon-monochrome.png  — 1024×1024 Android monochrome
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// ─── Brand constants ──────────────────────────────────────────────────────────

const BRAND_BLUE      = '#3b82f6';
const GRAD_LIGHT      = '#60a5fa';
const GRAD_DARK       = '#1d4ed8';
const BOLT_FILL       = 'rgba(29,78,216,0.75)';

// ─── SVG helpers ─────────────────────────────────────────────────────────────

/** Brain + bolt symbol, centered in a 100×100 coordinate space */
function brainBoltPaths(symbolColor = 'white', boltColor = BOLT_FILL) {
  return `
    <ellipse cx="50" cy="43" rx="24" ry="26" fill="${symbolColor}"/>
    <rect x="44" y="67" width="12" height="10" rx="3" fill="${symbolColor}"/>
    <polygon points="55,24 43,47 52,47 43,64 63,39 54,39" fill="${boltColor}"/>
  `;
}

// ─── Icon (1024×1024) ─────────────────────────────────────────────────────────

function iconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">
  <rect width="100" height="100" fill="${BRAND_BLUE}"/>
  ${brainBoltPaths('white', BOLT_FILL)}
</svg>`;
}

// ─── Splash screen (1284×2778) ────────────────────────────────────────────────
// The image itself carries the full gradient so it looks correct on all devices.
// app.config backgroundColor (#FDFBF7) fills any gap on smaller screens.

function splashSVG() {
  // Symbol is scaled up and centered vertically above midpoint
  // Text is positioned below the symbol
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1284 2778" width="1284" height="2778">
  <defs>
    <linearGradient id="bg" x1="80%" y1="0%" x2="20%" y2="100%">
      <stop offset="0%" stop-color="${GRAD_LIGHT}"/>
      <stop offset="100%" stop-color="${GRAD_DARK}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#bg)"/>

  <!-- Brain + bolt symbol — centered at (642, 1180), scaled to ~380px -->
  <g transform="translate(642, 1180) scale(3.8) translate(-50, -50)">
    <ellipse cx="50" cy="43" rx="24" ry="26" fill="white"/>
    <rect x="44" y="67" width="12" height="10" rx="3" fill="white"/>
    <polygon points="55,24 43,47 52,47 43,64 63,39 54,39" fill="rgba(29,78,216,0.75)"/>
  </g>

  <!-- App name -->
  <text
    x="642" y="1440"
    text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    font-weight="900"
    font-size="96"
    fill="white"
    letter-spacing="-2"
  >MigraineScan</text>

  <!-- Tagline -->
  <text
    x="642" y="1536"
    text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    font-weight="400"
    font-size="52"
    fill="rgba(255,255,255,0.7)"
  >Migraine trigger food scanning</text>

  <!-- Byline -->
  <text
    x="642" y="2680"
    text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    font-weight="400"
    font-size="40"
    fill="rgba(255,255,255,0.35)"
    letter-spacing="1"
  >by SafeScan Systems</text>
</svg>`;
}

// ─── Android adaptive foreground (1024×1024, transparent bg) ─────────────────

function androidForegroundSVG() {
  // Symbol within 72% safe zone (~737px). Scale to fit at ~480px in 1024 canvas.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Transparent background — Android composites the background layer separately -->
  <g transform="translate(512, 512) scale(4.8) translate(-50, -50)">
    <ellipse cx="50" cy="43" rx="24" ry="26" fill="white"/>
    <rect x="44" y="67" width="12" height="10" rx="3" fill="white"/>
    <polygon points="55,24 43,47 52,47 43,64 63,39 54,39" fill="rgba(29,78,216,0.75)"/>
  </g>
</svg>`;
}

// ─── Android adaptive background (1024×1024, solid brand color) ──────────────

function androidBackgroundSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="${BRAND_BLUE}"/>
</svg>`;
}

// ─── Android monochrome (1024×1024, black bg + white symbol) ─────────────────

function androidMonochromeSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="black"/>
  <g transform="translate(512, 512) scale(4.8) translate(-50, -50)">
    <ellipse cx="50" cy="43" rx="24" ry="26" fill="white"/>
    <rect x="44" y="67" width="12" height="10" rx="3" fill="white"/>
    <polygon points="55,24 43,47 52,47 43,64 63,39 54,39" fill="rgba(255,255,255,0.5)"/>
  </g>
</svg>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  const tasks = [
    {
      name: 'icon.png',
      svg: iconSVG(),
      width: 1024,
      height: 1024,
    },
    {
      name: 'splash-icon.png',
      svg: splashSVG(),
      width: 1284,
      height: 2778,
    },
    {
      name: 'adaptive-icon.png',
      svg: androidForegroundSVG(),
      width: 1024,
      height: 1024,
    },
    {
      name: 'android-icon-background.png',
      svg: androidBackgroundSVG(),
      width: 1024,
      height: 1024,
    },
    {
      name: 'android-icon-monochrome.png',
      svg: androidMonochromeSVG(),
      width: 1024,
      height: 1024,
    },
  ];

  for (const task of tasks) {
    const outPath = path.join(ASSETS_DIR, task.name);
    await sharp(Buffer.from(task.svg))
      .resize(task.width, task.height)
      .png()
      .toFile(outPath);
    console.log(`✓ ${task.name} (${task.width}×${task.height})`);
  }

  console.log('\nAll assets generated in assets/');
  console.log('Run `eas build` to pick up the new native splash and icon.');
}

generate().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
