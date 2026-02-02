// setup-electron.js - Setup Electron for Elemental Soul Scribe
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('========================================');
console.log(' Elemental Soul Scribe - Electron Setup');
console.log('========================================');
console.log('');

// Step 1: Install packages
console.log('[1/5] Installing Electron packages...');
try {
  execSync('npm install --save-dev electron electron-builder concurrently wait-on', { 
    stdio: 'inherit',
    shell: true 
  });
  console.log('[OK] Packages installed');
} catch (error) {
  console.error('[ERROR] Failed to install packages');
  process.exit(1);
}

// Step 2: Create electron.cjs
console.log('');
console.log('[2/5] Creating electron.cjs...');
const electronCode = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#1a1a2e',
    icon: path.join(__dirname, 'public/favicon.ico'),
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
`;

fs.writeFileSync('electron.cjs', electronCode);
console.log('[OK] Created electron.cjs');

// Step 3: Update package.json
console.log('');
console.log('[3/5] Updating package.json...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.main = 'electron.cjs';
pkg.scripts['electron:dev'] = 'concurrently "vite" "wait-on http://localhost:8080 && electron ."';
pkg.scripts['electron:build'] = 'vite build && electron-builder';

pkg.build = {
  appId: 'com.elemental.soul.scribe',
  productName: 'Elemental Soul Scribe',
  directories: { output: 'release' },
  files: ['dist/**/*', 'electron.cjs'],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'public/favicon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('[OK] Updated package.json');

// Step 4: Update vite.config.ts
console.log('');
console.log('[4/5] Updating vite.config.ts...');
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');

if (!viteConfig.includes('base:')) {
  viteConfig = viteConfig.replace(
    'export default defineConfig(({ mode }) => ({',
    'export default defineConfig(({ mode }) => ({\n  base: "./", // For Electron'
  );
  fs.writeFileSync('vite.config.ts', viteConfig);
  console.log('[OK] Updated vite.config.ts');
} else {
  console.log('[OK] vite.config.ts already configured');
}

// Step 5: Create build helper
console.log('');
console.log('[5/5] Creating build helper...');

const buildBat = `@echo off
echo Building Elemental Soul Scribe EXE...
call npm run electron:build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo.
echo SUCCESS! Your EXE is in: release/
dir release\\*.exe
pause
`;

fs.writeFileSync('build-exe.bat', buildBat);
console.log('[OK] Created build-exe.bat');

console.log('');
console.log('========================================');
console.log(' SUCCESS! Setup Complete!');
console.log('========================================');
console.log('');
console.log('Next step: Build your EXE!');
console.log('  Double-click: build-exe.bat');
console.log('  Or run: npm run electron:build');
console.log('');
console.log('Your EXE will be in the "release" folder');
console.log('');
