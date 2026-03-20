// LobsterLaunch — Internationalization (English + Chinese)

const translations = {
  en: {
    welcome: 'Welcome to LobsterLaunch!',
    subtitle: 'One-click OpenClaw setup — ready in under 2 minutes',
    langSelect: 'Select language / 选择语言',

    // System checks
    checkingSystem: 'Checking your system...',
    osDetected: 'OS detected',
    nodeFound: 'Node.js found',
    nodeNotFound: 'Node.js not found — will install automatically',
    nodeOutdated: 'Node.js {version} is too old (need v22.16+) — will upgrade',
    nodeOk: 'Node.js {version} — perfect!',
    diskSpace: 'Disk space',
    diskOk: '{free} GB free — enough',
    diskLow: 'Only {free} GB free — need at least 10 GB',
    ramOk: '{ram} GB RAM — good',
    ramLow: '{ram} GB RAM — OpenClaw recommends 8 GB+',
    systemReady: 'System ready!',

    // Wizard questions
    q_model: 'Which AI model do you want to use?',
    q_model_hint: '(Claude is recommended for best results)',
    q_apiKey: 'Enter your {provider} API key:',
    q_apiKey_hint: 'Get one at {url}',
    q_apiKey_local: 'No API key needed for local models!',
    q_channels: 'Which messaging apps do you want to connect?',
    q_channels_hint: '(You can add more later)',
    q_purpose: 'What will you mainly use OpenClaw for?',
    q_purpose_hint: '(We\'ll install the best skills for your use case)',
    q_security: 'Enable security hardening? (Recommended)',

    // Model choices
    model_claude: 'Claude (Anthropic) — Best overall',
    model_gpt4: 'GPT-4o (OpenAI) — Great alternative',
    model_deepseek: 'DeepSeek — Best value, popular in China',
    model_qwen: 'Qwen (Alibaba) — Great for Chinese tasks',
    model_gemini: 'Gemini (Google) — Good free tier',
    model_ollama: 'Local (Ollama) — Free, runs on your machine',

    // Channel choices
    chan_telegram: 'Telegram',
    chan_whatsapp: 'WhatsApp',
    chan_wechat: 'WeChat (微信)',
    chan_discord: 'Discord',
    chan_slack: 'Slack',
    chan_feishu: 'Feishu (飞书/Lark)',
    chan_line: 'LINE',
    chan_imessage: 'iMessage (macOS only)',
    chan_signal: 'Signal',
    chan_matrix: 'Matrix',
    chan_teams: 'Microsoft Teams',
    chan_email: 'Email (IMAP/SMTP)',

    // Purpose choices
    purpose_personal: 'Personal assistant (schedule, reminders, tasks)',
    purpose_work: 'Work productivity (email, docs, meetings)',
    purpose_dev: 'Software development (code, deploy, monitor)',
    purpose_social: 'Social media management',
    purpose_trading: 'Trading & finance',
    purpose_customer: 'Customer support',
    purpose_research: 'Research & knowledge management',
    purpose_ecommerce: 'E-commerce & sales',
    purpose_all: 'Everything — install all skills',

    // Installation
    installingNode: 'Installing Node.js {version}...',
    installingOpenClaw: 'Installing OpenClaw...',
    configuringGateway: 'Configuring gateway...',
    settingUpModel: 'Setting up {model} as your AI brain...',
    installingSkills: 'Installing {count} skills for your use case...',
    configuringChannels: 'Setting up {count} messaging channels...',
    hardeningSecurity: 'Applying security hardening...',
    runningDoctor: 'Running diagnostics...',

    // Progress
    progress: 'Progress',
    step: 'Step {current} of {total}',

    // Completion
    setupComplete: 'OpenClaw is ready!',
    dashboardUrl: 'Dashboard: http://127.0.0.1:18789/',
    openDashboard: 'Opening dashboard in your browser...',
    nextSteps: 'Next steps:',
    next1: 'Open the dashboard above to manage your agent',
    next2: 'Send a message in {channel} to start chatting',
    next3: 'Run "openclaw skills" to browse more skills',
    next4: 'Run "lobster-launch doctor" to fix any issues',

    // Pro upsell
    proTitle: 'Upgrade to LobsterLaunch Pro',
    proFeatures: [
      'Auto-update OpenClaw when new versions drop',
      'Premium skill bundles (50+ curated skills)',
      'Security hardening & monitoring dashboard',
      'Multi-agent orchestration setup',
      'Priority support (English + 中文)',
      'Channel auto-reconnect & health checks',
    ],
    proPrice: 'Just $9.99/month — lobsterlaunch.dev/pro',
    proSkip: 'Skip for now (you can upgrade anytime)',

    // Errors
    errUnsupportedOS: 'Unsupported OS. LobsterLaunch supports macOS, Linux, and Windows (WSL2).',
    errNoInternet: 'No internet connection detected. Please connect and try again.',
    errInstallFailed: 'Installation failed: {error}',
    errApiKeyInvalid: 'API key looks invalid. Please check and try again.',

    // Doctor
    doctorTitle: 'LobsterLaunch Doctor — Auto-fixing common issues',
    doctorFixing: 'Fixing: {issue}',
    doctorFixed: 'Fixed {count} issues!',
    doctorClean: 'Everything looks good — no issues found!',
  },

  zh: {
    welcome: '欢迎使用 LobsterLaunch！',
    subtitle: '一键安装 OpenClaw — 不到2分钟即可就绪',
    langSelect: 'Select language / 选择语言',

    checkingSystem: '正在检查您的系统...',
    osDetected: '检测到操作系统',
    nodeFound: '已找到 Node.js',
    nodeNotFound: '未找到 Node.js — 将自动安装',
    nodeOutdated: 'Node.js {version} 版本太旧（需要 v22.16+）— 将自动升级',
    nodeOk: 'Node.js {version} — 完美！',
    diskSpace: '磁盘空间',
    diskOk: '{free} GB 可用 — 足够',
    diskLow: '仅 {free} GB 可用 — 至少需要 10 GB',
    ramOk: '{ram} GB 内存 — 良好',
    ramLow: '{ram} GB 内存 — OpenClaw 建议 8 GB+',
    systemReady: '系统准备就绪！',

    q_model: '您想使用哪个 AI 模型？',
    q_model_hint: '（推荐 Claude 以获得最佳效果）',
    q_apiKey: '请输入您的 {provider} API 密钥：',
    q_apiKey_hint: '获取地址：{url}',
    q_apiKey_local: '本地模型不需要 API 密钥！',
    q_channels: '您想连接哪些即时通讯应用？',
    q_channels_hint: '（之后可以随时添加更多）',
    q_purpose: '您主要用 OpenClaw 做什么？',
    q_purpose_hint: '（我们将为您的需求安装最佳技能包）',
    q_security: '启用安全加固？（推荐）',

    model_claude: 'Claude (Anthropic) — 综合最佳',
    model_gpt4: 'GPT-4o (OpenAI) — 优秀替代',
    model_deepseek: 'DeepSeek — 性价比最高，国内热门',
    model_qwen: '通义千问 (Qwen) — 中文任务最佳',
    model_gemini: 'Gemini (Google) — 免费额度好',
    model_ollama: '本地运行 (Ollama) — 免费，离线可用',

    chan_telegram: 'Telegram',
    chan_whatsapp: 'WhatsApp',
    chan_wechat: '微信 (WeChat)',
    chan_discord: 'Discord',
    chan_slack: 'Slack',
    chan_feishu: '飞书 (Feishu/Lark)',
    chan_line: 'LINE',
    chan_imessage: 'iMessage (仅限 macOS)',
    chan_signal: 'Signal',
    chan_matrix: 'Matrix',
    chan_teams: 'Microsoft Teams',
    chan_email: '电子邮件 (IMAP/SMTP)',

    purpose_personal: '个人助手（日程、提醒、任务）',
    purpose_work: '办公效率（邮件、文档、会议）',
    purpose_dev: '软件开发（编码、部署、监控）',
    purpose_social: '社交媒体管理',
    purpose_trading: '交易与金融',
    purpose_customer: '客户服务',
    purpose_research: '研究与知识管理',
    purpose_ecommerce: '电子商务与销售',
    purpose_all: '全部功能 — 安装所有技能',

    installingNode: '正在安装 Node.js {version}...',
    installingOpenClaw: '正在安装 OpenClaw...',
    configuringGateway: '正在配置网关...',
    settingUpModel: '正在设置 {model} 作为 AI 大脑...',
    installingSkills: '正在为您安装 {count} 个技能...',
    configuringChannels: '正在设置 {count} 个通讯渠道...',
    hardeningSecurity: '正在应用安全加固...',
    runningDoctor: '正在运行诊断...',

    progress: '进度',
    step: '第 {current} 步，共 {total} 步',

    setupComplete: 'OpenClaw 已就绪！',
    dashboardUrl: '控制面板：http://127.0.0.1:18789/',
    openDashboard: '正在浏览器中打开控制面板...',
    nextSteps: '接下来：',
    next1: '打开上方控制面板管理您的智能体',
    next2: '在 {channel} 中发送消息开始对话',
    next3: '运行 "openclaw skills" 浏览更多技能',
    next4: '运行 "lobster-launch doctor" 修复问题',

    proTitle: '升级至 LobsterLaunch Pro',
    proFeatures: [
      '自动更新 OpenClaw 到最新版本',
      '高级技能包（50+ 精选技能）',
      '安全加固与监控面板',
      '多智能体编排设置',
      '优先支持（中文 + English）',
      '通讯渠道自动重连与健康检查',
    ],
    proPrice: '仅 ¥68/月 — lobsterlaunch.dev/pro',
    proSkip: '暂时跳过（随时可以升级）',

    errUnsupportedOS: '不支持的操作系统。LobsterLaunch 支持 macOS、Linux 和 Windows (WSL2)。',
    errNoInternet: '未检测到网络连接。请连接网络后重试。',
    errInstallFailed: '安装失败：{error}',
    errApiKeyInvalid: 'API 密钥似乎无效。请检查后重试。',

    doctorTitle: 'LobsterLaunch 诊断 — 自动修复常见问题',
    doctorFixing: '正在修复：{issue}',
    doctorFixed: '已修复 {count} 个问题！',
    doctorClean: '一切正常 — 未发现问题！',
  },
};

let currentLang = 'en';

export function setLang(lang) {
  currentLang = lang;
}

export function getLang() {
  return currentLang;
}

export function t(key, vars = {}) {
  let text = translations[currentLang]?.[key] || translations.en[key] || key;
  if (typeof text === 'string') {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export function tArray(key) {
  return translations[currentLang]?.[key] || translations.en[key] || [];
}
