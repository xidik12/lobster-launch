// LobsterLaunch — System checks & prerequisites

import { execSync } from 'child_process';
import os from 'os';
import { t } from './i18n.js';

const MIN_NODE_MAJOR = 22;
const MIN_NODE_MINOR = 16;
const RECOMMENDED_NODE = '24';
const MIN_DISK_GB = 10;
const MIN_RAM_GB = 8;

export function detectOS() {
  const platform = os.platform();
  const arch = os.arch();
  const release = os.release();

  if (platform === 'darwin') return { platform, arch, name: 'macOS', release, supported: true };
  if (platform === 'linux') {
    // Check if WSL
    try {
      const proc = execSync('cat /proc/version 2>/dev/null', { encoding: 'utf8' });
      if (proc.toLowerCase().includes('microsoft')) {
        return { platform: 'wsl', arch, name: 'Windows (WSL2)', release, supported: true };
      }
    } catch {}
    return { platform, arch, name: 'Linux', release, supported: true };
  }
  if (platform === 'win32') {
    return { platform, arch, name: 'Windows', release, supported: false, hint: 'Please use WSL2. Run: wsl --install' };
  }
  return { platform, arch, name: platform, release, supported: false };
}

export function checkNode() {
  try {
    const version = execSync('node --version 2>/dev/null', { encoding: 'utf8' }).trim();
    const match = version.match(/v(\d+)\.(\d+)\.(\d+)/);
    if (!match) return { installed: false };

    const [, major, minor, patch] = match.map(Number);
    const isOk = major > MIN_NODE_MAJOR || (major === MIN_NODE_MAJOR && minor >= MIN_NODE_MINOR);

    return {
      installed: true,
      version: `${major}.${minor}.${patch}`,
      major,
      minor,
      patch,
      ok: isOk,
      needsUpgrade: !isOk,
    };
  } catch {
    return { installed: false, ok: false };
  }
}

export function checkNvm() {
  try {
    execSync('command -v nvm 2>/dev/null || [ -s "$HOME/.nvm/nvm.sh" ]', {
      encoding: 'utf8',
      shell: '/bin/bash',
    });
    return true;
  } catch {
    return false;
  }
}

export function checkDiskSpace() {
  try {
    const platform = os.platform();
    let freeGB;

    if (platform === 'darwin' || platform === 'linux') {
      const output = execSync("df -g / 2>/dev/null | tail -1 | awk '{print $4}'", {
        encoding: 'utf8',
      }).trim();
      freeGB = parseInt(output, 10);
      if (isNaN(freeGB)) {
        // Fallback: df -k
        const outputK = execSync("df -k / 2>/dev/null | tail -1 | awk '{print $4}'", {
          encoding: 'utf8',
        }).trim();
        freeGB = Math.floor(parseInt(outputK, 10) / 1048576);
      }
    }

    return {
      freeGB: freeGB || 0,
      ok: (freeGB || 0) >= MIN_DISK_GB,
    };
  } catch {
    return { freeGB: 0, ok: true }; // Don't block on check failure
  }
}

export function checkRAM() {
  const totalBytes = os.totalmem();
  const totalGB = Math.round(totalBytes / (1024 ** 3));
  return {
    totalGB,
    ok: totalGB >= MIN_RAM_GB,
  };
}

export function checkInternet() {
  try {
    execSync('curl -sf --max-time 5 https://registry.npmjs.org/ > /dev/null 2>&1');
    return true;
  } catch {
    try {
      execSync('curl -sf --max-time 5 https://npmmirror.com/ > /dev/null 2>&1');
      return true; // Chinese mirror works — user is likely in China
    } catch {
      return false;
    }
  }
}

export function checkChineseNetwork() {
  // Detect if user is likely in China (npm registry slow, Chinese mirror fast)
  try {
    const start = Date.now();
    execSync('curl -sf --max-time 3 https://registry.npmjs.org/openclaw > /dev/null 2>&1');
    const npmTime = Date.now() - start;

    const start2 = Date.now();
    execSync('curl -sf --max-time 3 https://registry.npmmirror.com/openclaw > /dev/null 2>&1');
    const mirrorTime = Date.now() - start2;

    return mirrorTime < npmTime * 0.5; // Chinese mirror significantly faster
  } catch {
    return false;
  }
}

export function checkOpenClaw() {
  try {
    const version = execSync('openclaw --version 2>/dev/null', { encoding: 'utf8' }).trim();
    return { installed: true, version };
  } catch {
    return { installed: false };
  }
}

export function checkOllama() {
  try {
    execSync('ollama --version 2>/dev/null', { encoding: 'utf8' });
    return true;
  } catch {
    return false;
  }
}

export function checkPort(port = 18789) {
  try {
    execSync(`lsof -i :${port} 2>/dev/null`);
    return { inUse: true };
  } catch {
    return { inUse: false };
  }
}

export async function runAllChecks() {
  const osInfo = detectOS();
  const node = checkNode();
  const disk = checkDiskSpace();
  const ram = checkRAM();
  const internet = checkInternet();
  const isChina = internet ? checkChineseNetwork() : false;
  const openclaw = checkOpenClaw();
  const ollama = checkOllama();
  const port = checkPort();

  return {
    os: osInfo,
    node,
    disk,
    ram,
    internet,
    isChina,
    openclaw,
    ollama,
    port,
    canProceed: osInfo.supported && internet && disk.ok,
  };
}
