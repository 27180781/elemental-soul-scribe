const { app, BrowserWindow, protocol, net, Menu, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// The built web app lives in ./dist. We serve it through a custom, privileged
// scheme ("app://") instead of loading it directly from file://.
//
// Why not file://?
//   1. Chromium blocks fetch() of local files under file://, which would break
//      the PDF export (it fetches the Kanuba fonts at runtime).
//   2. file:// gives every load an *opaque* origin, so IndexedDB (where all of
//      the user's data is stored via localForage) is not reliably persisted
//      between runs.
// A standard, secure custom scheme gives us a stable origin (app://bundle),
// a real fetch() API, and durable offline storage — exactly like the web.

const SCHEME = 'app';
const HOST = 'bundle';
const DIST = path.join(__dirname, 'dist');

// In development we load the live Vite dev server instead of the built bundle,
// so hot-reload works. `npm run electron:dev` passes `--dev-url=...`.
const devArg = process.argv.find((a) => a.startsWith('--dev-url='));
const DEV_URL = devArg ? devArg.slice('--dev-url='.length) : null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function resolveRequest(requestUrl) {
  const { pathname } = new URL(requestUrl);
  let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';

  const filePath = path.join(DIST, rel);

  // Guard against path traversal outside of the bundled dist directory.
  const relToDist = path.relative(DIST, filePath);
  if (relToDist.startsWith('..') || path.isAbsolute(relToDist)) {
    return null;
  }
  return filePath;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#1a1a2e',
    icon: path.join(DIST, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Open external links (if any) in the system browser rather than in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (DEV_URL) {
    win.loadURL(DEV_URL);
  } else {
    win.loadURL(`${SCHEME}://${HOST}/index.html`);
  }
}

app.whenReady().then(() => {
  // Minimal application menu (keeps standard shortcuts like copy/paste, zoom,
  // and fullscreen while hiding the developer-facing defaults).
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: 'fileMenu' },
      { role: 'editMenu' },
      {
        label: 'View',
        submenu: [
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ])
  );

  protocol.handle(SCHEME, (request) => {
    const filePath = resolveRequest(request.url);
    if (!filePath) {
      return new Response('Forbidden', { status: 403 });
    }
    // net.fetch resolves file:// URLs, streams the body, and sets the correct
    // Content-Type from the file extension automatically.
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
