// LobsterLaunch — Main orchestrator
// One-click OpenClaw auto-setup with beautiful TUI

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { t, tArray, setLang, getLang } from './i18n.js';
import { runAllChecks, detectOS } from './checks.js';
import {
  installNode,
  installOpenClaw,
  configureGateway,
  configureModel,
  getModelConfig,
  installSkills,
  getSkillsForPurpose,
  configureChannels,
  hardenSecurity,
  runDoctor,
  openDashboard,
} from './installer.js';

// ─── Branding ───

const LOBSTER = gradient(['#FF6B35', '#FF2D2D', '#FF6B35']);
const SUCCESS = chalk.green.bold;
const WARN = chalk.yellow;
const ERR = chalk.red.bold;
const DIM = chalk.dim;
const BOLD = chalk.bold;
const LINK = chalk.cyan.underline;

function banner() {
  const art = figlet.textSync('LobsterLaunch', {
    font: 'Small',
    horizontalLayout: 'fitted',
  });

  console.log('');
  console.log(LOBSTER(art));
  console.log('');
  console.log(
    boxen(
      `${BOLD('One-click OpenClaw setup')} — ready in under 2 minutes\n` +
        `${DIM('一键安装 OpenClaw — 不到2分钟即可就绪')}\n\n` +
        `${DIM('v1.0.0 • github.com/lobster-launch/lobster-launch')}`,
      {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: '#FF6B35',
      }
    )
  );
}

// ─── Spinner helper ───

function spin(text) {
  return ora({ text, color: 'red', spinner: 'dots' }).start();
}

// ─── Step display ───

let totalSteps = 7;
let currentStep = 0;

function stepHeader(text) {
  currentStep++;
  const progress = `[${currentStep}/${totalSteps}]`;
  console.log(`\n${LOBSTER(progress)} ${BOLD(text)}`);
  console.log(DIM('─'.repeat(50)));
}

// ─── Main Flow ───

export async function main() {
  // Handle --doctor flag
  if (process.argv.includes('doctor') || process.argv.includes('--doctor')) {
    return runDoctorMode();
  }

  banner();

  // ─── Step 0: Language Selection ───
  const { lang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'lang',
      message: 'Select language / 选择语言:',
      choices: [
        { name: 'English', value: 'en' },
        { name: '中文 (Chinese)', value: 'zh' },
      ],
    },
  ]);
  setLang(lang);

  // ─── Step 1: System Checks ───
  stepHeader(t('checkingSystem'));

  const s = spin(t('checkingSystem'));
  const checks = await runAllChecks();
  s.stop();

  // Display results
  const osIcon = checks.os.supported ? SUCCESS('✓') : ERR('✗');
  console.log(`  ${osIcon} ${t('osDetected')}: ${BOLD(checks.os.name)} (${checks.os.arch})`);

  if (checks.node.installed && checks.node.ok) {
    console.log(`  ${SUCCESS('✓')} ${t('nodeOk', { version: 'v' + checks.node.version })}`);
  } else if (checks.node.installed && !checks.node.ok) {
    console.log(
      `  ${WARN('!')} ${t('nodeOutdated', { version: 'v' + checks.node.version })}`
    );
  } else {
    console.log(`  ${WARN('!')} ${t('nodeNotFound')}`);
  }

  console.log(
    `  ${checks.disk.ok ? SUCCESS('✓') : WARN('!')} ${t('diskSpace')}: ${
      checks.disk.ok ? t('diskOk', { free: checks.disk.freeGB }) : t('diskLow', { free: checks.disk.freeGB })
    }`
  );

  console.log(
    `  ${checks.ram.ok ? SUCCESS('✓') : WARN('!')} ${
      checks.ram.ok ? t('ramOk', { ram: checks.ram.totalGB }) : t('ramLow', { ram: checks.ram.totalGB })
    }`
  );

  if (!checks.internet) {
    console.log(`\n${ERR(t('errNoInternet'))}`);
    process.exit(1);
  }
  console.log(`  ${SUCCESS('✓')} Internet: OK${checks.isChina ? ' (中国网络 — using mirrors)' : ''}`);

  if (checks.openclaw.installed) {
    console.log(`  ${SUCCESS('✓')} OpenClaw already installed: ${checks.openclaw.version}`);
  }

  if (!checks.os.supported) {
    console.log(`\n${ERR(t('errUnsupportedOS'))}`);
    if (checks.os.hint) console.log(WARN(checks.os.hint));
    process.exit(1);
  }

  console.log(`\n  ${SUCCESS('✓')} ${t('systemReady')}`);

  // ─── Step 2: Choose AI Model ───
  stepHeader(t('q_model'));

  const { modelChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'modelChoice',
      message: t('q_model'),
      choices: [
        { name: t('model_claude'), value: 'claude' },
        { name: t('model_gpt4'), value: 'gpt4' },
        { name: t('model_deepseek'), value: 'deepseek' },
        { name: t('model_qwen'), value: 'qwen' },
        { name: t('model_gemini'), value: 'gemini' },
        new inquirer.Separator(),
        { name: t('model_ollama'), value: 'ollama' },
      ],
    },
  ]);

  // Get API key (unless local model)
  let apiKey = '';
  const modelConfig = getModelConfig(modelChoice);

  if (modelChoice !== 'ollama') {
    const keyUrl = modelConfig.keyUrl;
    console.log(`\n  ${DIM(t('q_apiKey_hint', { url: keyUrl }))}`);

    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: t('q_apiKey', { provider: modelConfig.provider }),
        mask: '*',
        validate: (input) => {
          if (!input || input.length < 10) return t('errApiKeyInvalid');
          return true;
        },
      },
    ]);
    apiKey = key;
  } else {
    console.log(`\n  ${SUCCESS('✓')} ${t('q_apiKey_local')}`);
  }

  // ─── Step 3: Choose Channels ───
  stepHeader(t('q_channels'));

  const channelChoices = [
    { name: t('chan_telegram'), value: 'telegram' },
    { name: t('chan_whatsapp'), value: 'whatsapp' },
    { name: t('chan_wechat'), value: 'wechat' },
    { name: t('chan_discord'), value: 'discord' },
    { name: t('chan_slack'), value: 'slack' },
    { name: t('chan_feishu'), value: 'feishu' },
    { name: t('chan_line'), value: 'line' },
    { name: t('chan_email'), value: 'email' },
    { name: t('chan_teams'), value: 'teams' },
  ];

  // Add iMessage only on macOS
  if (checks.os.platform === 'darwin') {
    channelChoices.splice(7, 0, { name: t('chan_imessage'), value: 'imessage' });
  }

  const { channels } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'channels',
      message: t('q_channels'),
      choices: channelChoices,
      validate: (input) => {
        if (input.length === 0) return 'Select at least one channel';
        return true;
      },
    },
  ]);

  // ─── Step 4: Choose Purpose ───
  stepHeader(t('q_purpose'));

  const { purposes } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'purposes',
      message: t('q_purpose'),
      choices: [
        { name: t('purpose_personal'), value: 'personal' },
        { name: t('purpose_work'), value: 'work' },
        { name: t('purpose_dev'), value: 'dev' },
        { name: t('purpose_social'), value: 'social' },
        { name: t('purpose_trading'), value: 'trading' },
        { name: t('purpose_customer'), value: 'customer' },
        { name: t('purpose_research'), value: 'research' },
        { name: t('purpose_ecommerce'), value: 'ecommerce' },
        new inquirer.Separator(),
        { name: t('purpose_all'), value: 'all' },
      ],
      validate: (input) => {
        if (input.length === 0) return 'Select at least one purpose';
        return true;
      },
    },
  ]);

  // ─── Step 5: Security ───
  const { enableSecurity } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enableSecurity',
      message: t('q_security'),
      default: true,
    },
  ]);

  // ═══════════════════════════════════════════════════
  // ─── INSTALLATION BEGINS ───
  // ═══════════════════════════════════════════════════

  console.log(
    '\n' +
      boxen(LOBSTER('Installing OpenClaw — sit back and relax!'), {
        padding: { top: 0, bottom: 0, left: 2, right: 2 },
        borderStyle: 'round',
        borderColor: '#FF6B35',
      })
  );

  // ─── Install Node.js if needed ───
  if (!checks.node.ok) {
    stepHeader(t('installingNode', { version: '24' }));
    const s1 = spin(t('installingNode', { version: '24' }));
    try {
      await installNode(checks.isChina);
      s1.succeed(SUCCESS('Node.js 24 installed!'));
    } catch (err) {
      s1.fail(ERR(`Node.js install failed: ${err.message}`));
      console.log(WARN('Please install Node.js 24 manually: https://nodejs.org/'));
      process.exit(1);
    }
  } else {
    totalSteps--;
  }

  // ─── Install OpenClaw ───
  if (!checks.openclaw.installed) {
    stepHeader(t('installingOpenClaw'));
    const s2 = spin(t('installingOpenClaw'));
    try {
      const result = await installOpenClaw(checks.isChina);
      s2.succeed(SUCCESS(`OpenClaw ${result.version} installed!`));
    } catch (err) {
      s2.fail(ERR(`OpenClaw install failed: ${err.message}`));
      process.exit(1);
    }
  } else {
    totalSteps--;
    console.log(`\n  ${SUCCESS('✓')} OpenClaw already installed — skipping`);
  }

  // ─── Configure Gateway ───
  stepHeader(t('configuringGateway'));
  const s3 = spin(t('configuringGateway'));
  try {
    await configureGateway();
    s3.succeed(SUCCESS('Gateway configured!'));
  } catch (err) {
    s3.warn(WARN(`Gateway setup had issues: ${err.message} — will fix with doctor`));
  }

  // ─── Configure Model ───
  stepHeader(t('settingUpModel', { model: modelConfig.provider }));
  const s4 = spin(t('settingUpModel', { model: modelConfig.provider }));
  try {
    await configureModel(modelChoice, apiKey);
    s4.succeed(SUCCESS(`${modelConfig.provider} configured as AI brain!`));
  } catch (err) {
    s4.warn(WARN(`Model setup warning: ${err.message}`));
  }

  // ─── Install Skills ───
  const skillList = getSkillsForPurpose(purposes);
  stepHeader(t('installingSkills', { count: skillList.length }));
  const s5 = spin(t('installingSkills', { count: skillList.length }));
  try {
    const skillResults = await installSkills(skillList, checks.isChina);
    if (skillResults.failed.length > 0) {
      s5.warn(
        WARN(
          `Installed ${skillResults.installed.length}/${skillList.length} skills ` +
            `(${skillResults.failed.length} failed — install manually later)`
        )
      );
    } else {
      s5.succeed(SUCCESS(`${skillResults.installed.length} skills installed!`));
    }
  } catch (err) {
    s5.warn(WARN(`Skill installation had issues: ${err.message}`));
  }

  // ─── Configure Channels ───
  stepHeader(t('configuringChannels', { count: channels.length }));
  const s6 = spin(t('configuringChannels', { count: channels.length }));
  try {
    const chanResults = await configureChannels(channels);
    if (chanResults.manual.length > 0) {
      s6.warn(
        WARN(
          `${chanResults.configured.length} auto-configured. ` +
            `Manual setup needed for: ${chanResults.manual.join(', ')}`
        )
      );
    } else {
      s6.succeed(SUCCESS(`${chanResults.configured.length} channels configured!`));
    }
  } catch (err) {
    s6.warn(WARN(`Channel setup warning: ${err.message}`));
  }

  // ─── Security Hardening ───
  if (enableSecurity) {
    stepHeader(t('hardeningSecurity'));
    const s7 = spin(t('hardeningSecurity'));
    try {
      const secFixes = await hardenSecurity();
      s7.succeed(SUCCESS(`Security hardened! (${secFixes.length} settings applied)`));
      for (const fix of secFixes) {
        console.log(`    ${DIM('•')} ${fix}`);
      }
    } catch (err) {
      s7.warn(WARN(`Security hardening warning: ${err.message}`));
    }
  }

  // ─── Final Doctor Run ───
  const sd = spin(t('runningDoctor'));
  try {
    const doctorFixes = await runDoctor();
    if (doctorFixes.length > 0) {
      sd.succeed(`Diagnostics: fixed ${doctorFixes.length} issues`);
    } else {
      sd.succeed('Diagnostics: all clear!');
    }
  } catch {
    sd.stop();
  }

  // ═══════════════════════════════════════════════════
  // ─── COMPLETE! ───
  // ═══════════════════════════════════════════════════

  const firstChannel = channels[0] || 'Telegram';

  console.log('\n');
  console.log(
    boxen(
      `${LOBSTER('🦞 ' + t('setupComplete') + ' 🦞')}\n\n` +
        `${BOLD(t('dashboardUrl'))}\n` +
        `${LINK('http://127.0.0.1:18789/')}\n\n` +
        `${BOLD(t('nextSteps'))}\n` +
        `  1. ${t('next1')}\n` +
        `  2. ${t('next2', { channel: firstChannel })}\n` +
        `  3. ${t('next3')}\n` +
        `  4. ${t('next4')}\n\n` +
        `${DIM('Model: ' + modelConfig.provider + ' | Skills: ' + skillList.length + ' | Channels: ' + channels.length)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: '#00FF00',
      }
    )
  );

  // ─── Pro Upsell ───
  console.log(
    boxen(
      `${LOBSTER(BOLD(t('proTitle')))}\n\n` +
        tArray('proFeatures')
          .map((f) => `  ${chalk.yellow('★')} ${f}`)
          .join('\n') +
        `\n\n${BOLD(t('proPrice'))}`,
      {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 1, right: 1 },
        borderStyle: 'round',
        borderColor: '#FFD700',
      }
    )
  );

  // Open dashboard
  console.log(DIM(t('openDashboard')));
  openDashboard();
}

// ─── Doctor Mode ───

async function runDoctorMode() {
  console.log(BOLD(`\n🔧 ${t('doctorTitle')}\n`));

  const s = spin('Running diagnostics...');
  try {
    const fixes = await runDoctor();
    s.stop();

    if (fixes.length > 0) {
      console.log(SUCCESS(`\n${t('doctorFixed', { count: fixes.length })}`));
      for (const fix of fixes) {
        console.log(`  ${SUCCESS('✓')} ${fix}`);
      }
    } else {
      console.log(SUCCESS(`\n${t('doctorClean')}`));
    }
  } catch (err) {
    s.fail(`Doctor failed: ${err.message}`);
  }
}
