#!/bin/bash
# ══════════════════════════════════════════
# LobsterLaunch — Double-click to install OpenClaw
# Just double-click this file on macOS!
# ══════════════════════════════════════════

# Change to home directory
cd "$HOME"

# Run the installer
curl -fsSL https://lobsterlaunch.dev/install | bash

# Keep terminal open to see results
echo ""
echo "Press any key to close..."
read -n 1
