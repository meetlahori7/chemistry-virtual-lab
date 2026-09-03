import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lahor\\.gemini\\antigravity\\brain\\6253403b-39ca-4dd8-ad24-358b61ad7094';

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
    const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:4173', { method: 'PUT' });
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

    // --- 1. DESKTOP 1440x900 SCREENSHOT ---
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
    writeFileSync(join(ARTIFACT_DIR, 'desktop_1440.png'), desktopBuf);
    writeFileSync(join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'desktop_1440.png'), desktopBuf);
    console.log('Saved desktop_1440.png');

    // --- 2. MOBILE 390x844 (3D Scene View) ---
    console.log('Setting viewport to 390x844 (iPhone 14/15)...');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    // Reload page at mobile viewport so React mounts with isMobile = true
    await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:4173' });
    await sleep(3500);

    console.log('Capturing mobile_390_3d.png...');
    const mobile3DShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobile3DBuf = Buffer.from(mobile3DShot.data, 'base64');
    writeFileSync(join(ARTIFACT_DIR, 'mobile_390_3d.png'), mobile3DBuf);
    writeFileSync(join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_3d.png'), mobile3DBuf);
    console.log('Saved mobile_390_3d.png');

    // --- 3. MOBILE 390x844 (Chemicals Drawer View) ---
    console.log('Clicking Chemicals tab...');
    await clickSelector(ws, '.nav-tab-btn', 'Chemicals');
    await sleep(1000);

    console.log('Capturing mobile_390_chemicals.png...');
    const mobileChemShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobileChemBuf = Buffer.from(mobileChemShot.data, 'base64');
    writeFileSync(join(ARTIFACT_DIR, 'mobile_390_chemicals.png'), mobileChemBuf);
    writeFileSync(join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_chemicals.png'), mobileChemBuf);
    console.log('Saved mobile_390_chemicals.png');

    // --- 4. MOBILE 390x844 (Telemetry Drawer View) ---
    console.log('Clicking Telemetry tab...');
    await clickSelector(ws, '.nav-tab-btn', 'Telemetry');
    await sleep(1000);

    console.log('Capturing mobile_390_telemetry.png...');
    const mobileTelShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobileTelBuf = Buffer.from(mobileTelShot.data, 'base64');
    writeFileSync(join(ARTIFACT_DIR, 'mobile_390_telemetry.png'), mobileTelBuf);
    writeFileSync(join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_telemetry.png'), mobileTelBuf);
    console.log('Saved mobile_390_telemetry.png');

    // --- 5. MOBILE 390x844 (Protocol Drawer View) ---
    console.log('Clicking Protocol tab...');
    await clickSelector(ws, '.nav-tab-btn', 'Protocol');
    await sleep(1000);

    console.log('Capturing mobile_390_protocol.png...');
    const mobileProtoShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    const mobileProtoBuf = Buffer.from(mobileProtoShot.data, 'base64');
    writeFileSync(join(ARTIFACT_DIR, 'mobile_390_protocol.png'), mobileProtoBuf);
    writeFileSync(join('c:\\Users\\lahor\\OneDrive\\Desktop\\chemistry-virtual-lab', 'mobile_390_protocol.png'), mobileProtoBuf);
    console.log('Saved mobile_390_protocol.png');

    ws.close();
  } finally {
    chromeProcess.kill();
    console.log('Done.');
  }
}

run();
