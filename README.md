# 🦞 LobsterLaunch

**One-click OpenClaw auto-setup — ready in under 2 minutes.**

**一键安装 OpenClaw — 不到2分钟即可就绪。**

Stop paying $200 for OpenClaw installation. LobsterLaunch does it all for free.

不用再花钱找人装OpenClaw了。LobsterLaunch完全免费。

---

## Quick Start

### Option 1: One command (macOS / Linux / WSL2)

```bash
curl -fsSL https://raw.githubusercontent.com/xidik12/lobster-launch/main/scripts/install.sh | bash
```

### Option 2: npm install

```bash
npm install -g lobster-launch
lobster-launch
```

### Option 3: macOS double-click

Download [`LobsterLaunch.command`](https://raw.githubusercontent.com/xidik12/lobster-launch/main/scripts/LobsterLaunch.command) and double-click it.

---

## What It Does

LobsterLaunch asks you **5 questions**, then installs and configures everything automatically:

| Step | What happens |
|------|-------------|
| 1. System check | Detects OS, Node.js, RAM, disk space, network (China auto-detection) |
| 2. AI model | Choose from Claude, GPT-4o, DeepSeek, Qwen, Gemini, or local Ollama |
| 3. Channels | Select messaging apps: Telegram, WhatsApp, WeChat, Discord, Slack, Feishu, and 15+ more |
| 4. Use case | Pick your purpose — we auto-install the right skill bundle |
| 5. Security | One-click hardening: localhost binding, approval mode, rate limits, memory pruning |

Then it automatically:
- ✅ Installs **Node.js 24** via nvm (if missing or outdated)
- ✅ Installs **OpenClaw** globally
- ✅ Configures the **gateway** (local mode, daemon)
- ✅ Sets up your **AI model** with API key
- ✅ Installs **skill bundles** for your use case
- ✅ Configures **messaging channels**
- ✅ Applies **security hardening**
- ✅ Runs **diagnostics** to fix any issues
- ✅ Opens the **dashboard** in your browser

---

## Supported AI Models

| Model | Provider | Best for |
|-------|----------|----------|
| Claude | Anthropic | Best overall quality |
| GPT-4o | OpenAI | Great alternative |
| DeepSeek | DeepSeek | Best value, popular in China |
| Qwen (通义千问) | Alibaba | Best for Chinese tasks |
| Gemini | Google | Good free tier |
| Local (Ollama) | Your machine | Free, offline, private |

## Supported Channels (20+)

Telegram · WhatsApp · WeChat (微信) · Discord · Slack · Feishu (飞书) · LINE · iMessage · Signal · Matrix · Microsoft Teams · Email · and more

## Smart Skill Bundles

Tell LobsterLaunch what you want to do:

| Use Case | Skills installed |
|----------|----------------|
| 🏠 Personal assistant | Calendar, reminders, todos, weather, notes |
| 💼 Work productivity | Email, meetings, docs, tasks, PDFs |
| 💻 Software development | GitHub, code review, deploy, CI/CD, logs |
| 📱 Social media | Twitter, Instagram, analytics, scheduling |
| 📈 Trading & finance | Market data, alerts, portfolio, analysis |
| 🎧 Customer support | Tickets, FAQ, sentiment, CRM |
| 🔬 Research | Web search, papers, notes, citations |
| 🛒 E-commerce | Inventory, orders, pricing, reviews |

---

## China Network Optimization / 中国网络优化

LobsterLaunch auto-detects Chinese networks and:
- Uses **npmmirror** for fast npm downloads
- Uses **Gitee mirror** for nvm installation
- Supports **DeepSeek** and **Qwen** models natively
- Includes **WeChat** and **Feishu** channels
- Full **中文界面** (Chinese interface)

---

## Built-in Doctor

Fix common OpenClaw issues with one command:

```bash
lobster-launch doctor
```

Auto-fixes:
- Gateway mode not set
- Port 18789 conflicts
- Invalid config keys
- Missing gateway token
- Post-upgrade config breakage

---

## Security Hardening

LobsterLaunch applies security best practices by default:

- **Gateway bound to `127.0.0.1`** (not `0.0.0.0` — prevents network exposure)
- **Approval mode enabled** (require confirmation for sensitive actions)
- **Auto-exec disabled** (prevent prompt injection attacks)
- **Memory pruning** (limit to 10K entries to prevent bloat)
- **Rate limiting** (60 requests/minute)

---

## Pro Version

| Feature | Free | Pro ($9.99/mo) |
|---------|------|----------------|
| Auto-setup wizard | ✅ | ✅ |
| 6 AI models | ✅ | ✅ |
| 20+ channels | ✅ | ✅ |
| Basic skill bundles | ✅ | ✅ |
| Security hardening | ✅ | ✅ |
| Built-in doctor | ✅ | ✅ |
| Auto-updates | ❌ | ✅ |
| 50+ premium skills | ❌ | ✅ |
| Multi-agent orchestration | ❌ | ✅ |
| Channel auto-reconnect | ❌ | ✅ |
| Health monitoring | ❌ | ✅ |
| Priority support (EN + 中文) | ❌ | ✅ |

---

## Requirements

- **macOS 12+**, **Linux (Ubuntu 20.04+)**, or **Windows (WSL2)**
- **8 GB RAM** (16 GB recommended for multi-agent)
- **10 GB disk space**
- Internet connection
- API key from your chosen AI provider (not needed for Ollama)

---

## Contributing

PRs welcome! Please open an issue first for major changes.

```bash
git clone https://github.com/xidik12/lobster-launch.git
cd lobster-launch
npm install
node bin/lobster-launch.js
```

## License

MIT

---

<p align="center">
  <b>🦞 Stop paying for OpenClaw setup. LobsterLaunch is free forever. 🦞</b><br>
  <b>🦞 不用再花钱装OpenClaw了。LobsterLaunch永远免费。 🦞</b>
</p>
