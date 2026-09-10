import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lahor\\.gemini\\antigravity\\brain\\6253403b-39ca-4dd8-ad24-358b61ad7094';
const DIST_DIR = 'c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab\\dist';
const PORT = 4173;

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(DIST_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function clickSelector(ws, selector, textMatch = null) {
  const evalRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('${selector}'));
        const el = ${textMatch ? `els.find(e => e.textContent.includes('${textMatch}'))` : `els[0]`};
        if (!el) return { error: 'Element not found: ${selector} [${textMatch || ""}]' };
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()
    `,
    returnByValue: true,
  });

  if (evalRes.result?.value?.error) {
    console.error(evalRes.result.value.error);
    return false;
  }

  const { x, y } = evalRes.result.value;
  console.log(`Clicking at (${Math.round(x)}, ${Math.round(y)}) for ${selector} [${textMatch || ''}]`);

  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });
  return true;
}

async function run() {
  console.log(`Starting built-in HTTP server on port ${PORT}...`);
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`Server listening on http://127.0.0.1:${PORT}`);

  console.log('Launching headless Chrome with remote debugging...');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--user-data-dir=C:\\Users\\lahor\\.gemini\\antigravity\\brain\\6253403b-39ca-4dd8-ad24-358b61ad7094\\scratch\\chrome-profile',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);

  try {
    const targetRes = await fetch(`http://127.0.0.1:9222/json/new?http://127.0.0.1:${PORT}`, { method: 'PUT' });
    const targetJson = await targetRes.json();
    console.log('Opened target:', targetJson.webSocketDebuggerUrl);

    const ws = new WebSocket(targetJson.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    console.log('Connected to CDP WebSocket');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');
    await sendCDP(ws, 'Runtime.enable');

    // --- 1. DESKTOP 1440x900 (Initial Rest State) ---
    console.log('Setting viewport to 1440x900...');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(3500); // Wait for WebGL scene to load fully

    console.log('Capturing desktop_1440.png...');
    const desktopShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const desktopBuf = Buffer.from(desktopShot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_1440.png'), desktopBuf);
    fs.writeFileSync(path.join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'desktop_1440.png'), desktopBuf);
    console.log('Saved desktop_1440.png');

    // --- 2. DESKTOP 1440x900 (Ignite / Heating Active - Testing Beaker Size Invariance) ---
    console.log('Clicking Ignite Burner...');
    await clickSelector(ws, '.lab-btn', 'Ignite Burner');
    await sleep(2000);

    console.log('Capturing desktop_1440_ignite.png...');
    const igniteShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const igniteBuf = Buffer.from(igniteShot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_1440_ignite.png'), igniteBuf);
    fs.writeFileSync(path.join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'desktop_1440_ignite.png'), igniteBuf);
    console.log('Saved desktop_1440_ignite.png');

    // --- 3. DESKTOP 1440x900 (Dispensing NaOH to reach pink endpoint - Testing Vibrant Color Visibility) ---
    console.log('Dispensing NaOH base...');
    await clickSelector(ws, '.lab-btn', 'NaOH');
    await sleep(800);
    await clickSelector(ws, '.lab-btn', 'NaOH');
    await sleep(800);
    await clickSelector(ws, '.lab-btn', 'NaOH');
    await sleep(1500);

    console.log('Capturing desktop_1440_pink.png...');
    const pinkShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const pinkBuf = Buffer.from(pinkShot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_1440_pink.png'), pinkBuf);
    fs.writeFileSync(path.join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'desktop_1440_pink.png'), pinkBuf);
    console.log('Saved desktop_1440_pink.png');

    // --- 4. MOBILE 390x844 (3D Scene View) ---
    console.log('Setting viewport to 390x844 (iPhone 14/15)...');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    // Reload at mobile viewport
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}` });
    await sleep(3500);

    console.log('Capturing mobile_390_3d.png...');
    const mobile3DShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobile3DBuf = Buffer.from(mobile3DShot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_390_3d.png'), mobile3DBuf);
    fs.writeFileSync(path.join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_3d.png'), mobile3DBuf);
    console.log('Saved mobile_390_3d.png');

    // --- 5. MOBILE 390x844 (Chemicals Drawer View) ---
    console.log('Clicking Chemicals tab...');
    await clickSelector(ws, '.nav-tab-btn', 'Chemicals');
    await sleep(1000);

    console.log('Capturing mobile_390_chemicals.png...');
    const mobileChemShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobileChemBuf = Buffer.from(mobileChemShot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_390_chemicals.png'), mobileChemBuf);
    fs.writeFileSync(path.join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_chemicals.png'), mobileChemBuf);
    console.log('Saved mobile_390_chemicals.png');

    ws.close();
  } finally {
    chromeProcess.kill();
    server.close();
    console.log('Done.');
  }
}

run();
