#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║  LobsterLaunch — One-click OpenClaw Auto-Setup       ║
# ║  Usage: curl -fsSL https://lobsterlaunch.dev/i | bash ║
# ╚══════════════════════════════════════════════════════╝

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[38;5;208m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

LOBSTER="${ORANGE}🦞${NC}"

echo ""
echo -e "${ORANGE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${ORANGE}║${NC}  ${BOLD}LobsterLaunch${NC} — OpenClaw Auto-Setup     ${ORANGE}║${NC}"
echo -e "${ORANGE}║${NC}  ${DIM}一键安装 OpenClaw${NC}                        ${ORANGE}║${NC}"
echo -e "${ORANGE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ─── Detect OS ───
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)  OS_NAME="macOS" ;;
  Linux)
    if grep -qi microsoft /proc/version 2>/dev/null; then
      OS_NAME="WSL2"
    else
      OS_NAME="Linux"
    fi
    ;;
  *)
    echo -e "${RED}✗ Unsupported OS: $OS${NC}"
    echo -e "${YELLOW}LobsterLaunch supports macOS, Linux, and Windows (WSL2)${NC}"
    exit 1
    ;;
esac

echo -e "${LOBSTER} Detected: ${BOLD}${OS_NAME}${NC} (${ARCH})"

# ─── Check/install Node.js ───
check_node() {
  if command -v node &>/dev/null; then
    NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 22 ]; then
      echo -e "${GREEN}✓${NC} Node.js v${NODE_VERSION} — good"
      return 0
    else
      echo -e "${YELLOW}!${NC} Node.js v${NODE_VERSION} is too old (need v22+)"
      return 1
    fi
  else
    echo -e "${YELLOW}!${NC} Node.js not found"
    return 1
  fi
}

install_node() {
  echo -e "${LOBSTER} Installing Node.js 24..."

  # Check if nvm exists
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  if ! command -v nvm &>/dev/null; then
    echo -e "  ${DIM}Installing nvm...${NC}"

    # Try Chinese mirror first if npm is slow
    if curl -sf --max-time 3 https://registry.npmmirror.com/ &>/dev/null; then
      curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh 2>/dev/null | bash || \
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    else
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    fi

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  fi

  nvm install 24
  nvm alias default 24
  echo -e "${GREEN}✓${NC} Node.js $(node -v) installed"
}

if ! check_node; then
  install_node
fi

# ─── Ensure nvm is loaded ───
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ─── Check internet & detect China ───
echo -e "${LOBSTER} Checking network..."
IS_CHINA=false
if curl -sf --max-time 3 https://registry.npmmirror.com/ &>/dev/null; then
  NPM_TIME=$(curl -o /dev/null -sf --max-time 5 -w '%{time_total}' https://registry.npmjs.org/openclaw 2>/dev/null || echo "10")
  MIRROR_TIME=$(curl -o /dev/null -sf --max-time 5 -w '%{time_total}' https://registry.npmmirror.com/openclaw 2>/dev/null || echo "10")
  # Simple comparison using awk
  if echo "$MIRROR_TIME $NPM_TIME" | awk '{exit !($1 < $2 * 0.5)}'; then
    IS_CHINA=true
    echo -e "${GREEN}✓${NC} Network OK (中国网络 — using npmmirror)"
  else
    echo -e "${GREEN}✓${NC} Network OK"
  fi
else
  echo -e "${GREEN}✓${NC} Network OK"
fi

REGISTRY_FLAG=""
if [ "$IS_CHINA" = true ]; then
  REGISTRY_FLAG="--registry=https://registry.npmmirror.com"
fi

# ─── Install LobsterLaunch ───
echo -e "${LOBSTER} Installing LobsterLaunch..."

# Check if already installed
if command -v lobster-launch &>/dev/null; then
  echo -e "${GREEN}✓${NC} LobsterLaunch already installed — updating..."
  npm update -g lobster-launch $REGISTRY_FLAG 2>/dev/null || true
else
  npm install -g lobster-launch@latest $REGISTRY_FLAG
fi

echo -e "${GREEN}✓${NC} LobsterLaunch installed!"
echo ""

# ─── Launch the wizard ───
echo -e "${LOBSTER} ${BOLD}Starting setup wizard...${NC}"
echo ""

exec lobster-launch
