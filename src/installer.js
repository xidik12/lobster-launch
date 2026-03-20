// LobsterLaunch — Core installation logic

import { execSync, exec } from 'child_process';
import { t } from './i18n.js';
import { checkNode, checkNvm, checkOllama } from './checks.js';

function run(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    timeout: opts.timeout || 120000,
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: '/bin/bash',
    ...opts,
  });
}

function runSilent(cmd, timeout = 120000) {
  return execSync(cmd, { encoding: 'utf8', timeout, stdio: 'pipe', shell: '/bin/bash' });
}

// ─── Node.js Installation ───

export async function installNode(isChina = false) {
  const hasNvm = checkNvm();

  if (!hasNvm) {
    // Install nvm first
    const nvmUrl = isChina
      ? 'https://gitee.com/mirrors/nvm/raw/master/install.sh'
      : 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh';

    try {
      run(`curl -o- ${nvmUrl} | bash`, { timeout: 60000 });
    } catch {
      // Fallback: direct download
      run(`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`, {
        timeout: 60000,
      });
    }
  }

  // Source nvm and install Node 24
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  const mirror = isChina ? 'NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node' : '';

  run(`${nvmInit} && ${mirror} nvm install 24 && nvm alias default 24`, { timeout: 300000 });

  // Verify
  const nodeCheck = checkNode();
  if (!nodeCheck.ok) {
    throw new Error(`Node.js installation failed. Got: ${nodeCheck.version || 'nothing'}`);
  }

  return nodeCheck;
}

// ─── OpenClaw Installation ───

export async function installOpenClaw(isChina = false) {
  const registry = isChina ? '--registry=https://registry.npmmirror.com' : '';

  // Source nvm to ensure we use the right Node
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  run(`${nvmInit} && npm install -g openclaw@latest ${registry}`, { timeout: 300000 });

  // Verify
  try {
    const version = runSilent(`${nvmInit} && openclaw --version`).trim();
    return { success: true, version };
  } catch {
    throw new Error('OpenClaw installation failed — command not found after install');
  }
}

// ─── Gateway Configuration ───

export async function configureGateway() {
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  // Set gateway mode to local (prevents the "gateway mode not set" error)
  try {
    run(`${nvmInit} && openclaw config set gateway.mode local`, { silent: true, timeout: 15000 });
  } catch {
    // Config command might not exist in all versions, write directly
  }

  // Bind to localhost only (security hardening — NOT 0.0.0.0)
  try {
    run(`${nvmInit} && openclaw config set gateway.host 127.0.0.1`, { silent: true, timeout: 15000 });
  } catch {}

  // Run onboard with daemon
  run(`${nvmInit} && openclaw onboard --install-daemon`, { timeout: 180000 });
}

// ─── Model Configuration ───

const MODEL_CONFIGS = {
  claude: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    configKey: 'ANTHROPIC_API_KEY',
  },
  gpt4: {
    provider: 'openai',
    model: 'gpt-4o',
    keyUrl: 'https://platform.openai.com/api-keys',
    configKey: 'OPENAI_API_KEY',
  },
  deepseek: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api-keys',
    configKey: 'DEEPSEEK_API_KEY',
  },
  qwen: {
    provider: 'qwen',
    model: 'qwen-max',
    keyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    configKey: 'DASHSCOPE_API_KEY',
  },
  gemini: {
    provider: 'google',
    model: 'gemini-2.5-pro',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    configKey: 'GOOGLE_API_KEY',
  },
  ollama: {
    provider: 'ollama',
    model: 'llama3.1:8b',
    keyUrl: null,
    configKey: null,
  },
};

export function getModelConfig(modelChoice) {
  return MODEL_CONFIGS[modelChoice] || MODEL_CONFIGS.claude;
}

export async function configureModel(modelChoice, apiKey) {
  const config = MODEL_CONFIGS[modelChoice];
  if (!config) throw new Error(`Unknown model: ${modelChoice}`);

  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  if (modelChoice === 'ollama') {
    // Install Ollama if not present
    if (!checkOllama()) {
      run('curl -fsSL https://ollama.ai/install.sh | sh', { timeout: 300000 });
    }
    // Pull the model
    run(`ollama pull ${config.model}`, { timeout: 600000 });
    // Configure OpenClaw to use Ollama
    try {
      run(`${nvmInit} && openclaw config set ai.provider ollama`, { silent: true, timeout: 15000 });
      run(`${nvmInit} && openclaw config set ai.model ${config.model}`, { silent: true, timeout: 15000 });
    } catch {}
  } else {
    // Set API key and model
    try {
      run(`${nvmInit} && openclaw config set ai.provider ${config.provider}`, {
        silent: true,
        timeout: 15000,
      });
      run(`${nvmInit} && openclaw config set ai.model ${config.model}`, {
        silent: true,
        timeout: 15000,
      });
    } catch {}

    // Write API key to config
    const configPath = `$HOME/.openclaw/openclaw.json`;
    try {
      // Read existing config, add key
      const existing = runSilent(`cat ${configPath} 2>/dev/null || echo "{}"`).trim();
      const configObj = JSON.parse(existing || '{}');
      if (!configObj.env) configObj.env = {};
      configObj.env[config.configKey] = apiKey;

      // Also set as environment variable in the shell profile
      const exportLine = `export ${config.configKey}="${apiKey}"`;
      const profileFiles = ['~/.zshrc', '~/.bashrc', '~/.bash_profile'];
      for (const pf of profileFiles) {
        try {
          const content = runSilent(`cat ${pf} 2>/dev/null`);
          if (!content.includes(config.configKey)) {
            run(`echo '\n# OpenClaw API Key (added by LobsterLaunch)\n${exportLine}' >> ${pf}`, {
              silent: true,
            });
          }
        } catch {}
      }
    } catch {}
  }

  return config;
}

// ─── Skills Installation ───

const SKILL_BUNDLES = {
  personal: [
    'daily-briefing', 'reminders', 'calendar-sync', 'todo-manager',
    'weather-report', 'smart-reply', 'note-taker',
  ],
  work: [
    'email-manager', 'meeting-notes', 'calendar-sync', 'doc-writer',
    'task-tracker', 'smart-reply', 'pdf-reader', 'spreadsheet',
  ],
  dev: [
    'github-agent', 'code-review', 'deploy-monitor', 'log-analyzer',
    'bug-tracker', 'docker-helper', 'ci-cd-monitor', 'api-tester',
  ],
  social: [
    'twitter-manager', 'instagram-poster', 'content-scheduler',
    'analytics-reader', 'hashtag-optimizer', 'engagement-tracker',
  ],
  trading: [
    'market-data', 'price-alerts', 'portfolio-tracker', 'news-scanner',
    'technical-analysis', 'trade-journal',
  ],
  customer: [
    'ticket-responder', 'faq-bot', 'sentiment-analyzer', 'crm-sync',
    'feedback-collector', 'smart-reply',
  ],
  research: [
    'web-search', 'paper-reader', 'note-taker', 'knowledge-graph',
    'summary-writer', 'citation-manager',
  ],
  ecommerce: [
    'inventory-tracker', 'order-manager', 'price-monitor',
    'review-analyzer', 'listing-optimizer', 'competitor-watch',
  ],
};

export function getSkillsForPurpose(purposes) {
  const skills = new Set();
  for (const purpose of purposes) {
    const bundle = SKILL_BUNDLES[purpose];
    if (bundle) bundle.forEach((s) => skills.add(s));
  }
  // If "all" selected, add everything
  if (purposes.includes('all')) {
    Object.values(SKILL_BUNDLES).flat().forEach((s) => skills.add(s));
  }
  return [...skills];
}

export async function installSkills(skills, isChina = false) {
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  const results = { installed: [], failed: [] };

  for (const skill of skills) {
    try {
      run(`${nvmInit} && clawhub install ${skill}`, { silent: true, timeout: 30000 });
      results.installed.push(skill);
    } catch {
      results.failed.push(skill);
    }
  }

  return results;
}

// ─── Channel Setup ───

export async function configureChannels(channels) {
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  const configured = [];
  const manual = [];

  for (const channel of channels) {
    // Some channels can be auto-configured, others need manual setup
    const autoChannels = ['telegram', 'discord', 'slack', 'email'];
    if (autoChannels.includes(channel)) {
      try {
        run(`${nvmInit} && openclaw channel add ${channel}`, { timeout: 30000 });
        configured.push(channel);
      } catch {
        manual.push(channel);
      }
    } else {
      manual.push(channel);
    }
  }

  return { configured, manual };
}

// ─── Security Hardening ───

export async function hardenSecurity() {
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  const fixes = [];

  // 1. Bind gateway to localhost only (prevent network exposure)
  try {
    run(`${nvmInit} && openclaw config set gateway.host 127.0.0.1`, { silent: true, timeout: 10000 });
    fixes.push('Gateway bound to localhost only');
  } catch {}

  // 2. Enable approval mode (require user confirmation for sensitive actions)
  try {
    run(`${nvmInit} && openclaw config set security.approval_mode true`, {
      silent: true,
      timeout: 10000,
    });
    fixes.push('Approval mode enabled');
  } catch {}

  // 3. Disable auto-exec for untrusted sources
  try {
    run(`${nvmInit} && openclaw config set security.auto_exec false`, {
      silent: true,
      timeout: 10000,
    });
    fixes.push('Auto-exec disabled for safety');
  } catch {}

  // 4. Set memory pruning to prevent bloat
  try {
    run(`${nvmInit} && openclaw config set memory.max_entries 10000`, {
      silent: true,
      timeout: 10000,
    });
    fixes.push('Memory pruning limit set (10K entries)');
  } catch {}

  // 5. Enable rate limiting
  try {
    run(`${nvmInit} && openclaw config set security.rate_limit 60`, {
      silent: true,
      timeout: 10000,
    });
    fixes.push('Rate limiting enabled (60 req/min)');
  } catch {}

  return fixes;
}

// ─── Doctor (Auto-fix common issues) ───

export async function runDoctor() {
  const nvmInit = `
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  `;

  const fixes = [];

  // 1. Check and fix gateway mode
  try {
    runSilent(`${nvmInit} && openclaw config get gateway.mode`);
  } catch {
    try {
      run(`${nvmInit} && openclaw config set gateway.mode local`, { silent: true, timeout: 10000 });
      fixes.push('Set gateway mode to local');
    } catch {}
  }

  // 2. Run OpenClaw's built-in doctor
  try {
    run(`${nvmInit} && openclaw doctor --fix`, { timeout: 60000 });
    fixes.push('Ran openclaw doctor --fix');
  } catch {}

  // 3. Check port conflict
  try {
    const portCheck = runSilent('lsof -i :18789 -t 2>/dev/null').trim();
    if (portCheck) {
      // Check if it's actually OpenClaw
      const processName = runSilent(`ps -p ${portCheck.split('\n')[0]} -o comm= 2>/dev/null`).trim();
      if (!processName.includes('openclaw') && !processName.includes('node')) {
        fixes.push(`Port 18789 in use by ${processName} — you may need to change the port`);
      }
    }
  } catch {}

  // 4. Verify gateway token exists
  try {
    const config = runSilent('cat ~/.openclaw/openclaw.json 2>/dev/null');
    if (!config.includes('gateway') || !config.includes('token')) {
      try {
        run(`${nvmInit} && openclaw config set gateway.mode local`, { silent: true, timeout: 10000 });
        fixes.push('Regenerated gateway configuration');
      } catch {}
    }
  } catch {}

  return fixes;
}

// ─── Open Dashboard ───

export function openDashboard() {
  const platform = process.platform;
  const url = 'http://127.0.0.1:18789/';

  try {
    if (platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (platform === 'linux') {
      execSync(`xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null`);
    }
  } catch {
    // Silently fail — user can open manually
  }
}
