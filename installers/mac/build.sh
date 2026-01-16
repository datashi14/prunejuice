#!/bin/bash

# macOS Build Script for Open Creative Suite

echo "🚀 Building for macOS..."

# 1. Build Electron App
cd ../../desktop-app
npm run build
# electron-builder handling mac target via package.json config
npx electron-builder --mac

# 2. Bundle Models & Python
# In a real scenario, we'd use PyInstaller to make the Python backend a single binary
# echo "📦 Bundling Python backend..."
# pyinstaller --onefile ../bridge/python_server.py

# 3. Create DMG
# electron-builder handles this, but if we needed custom steps:
# create-dmg dist/mac/OpenCreativeSuite.app

echo "✅ Build Complete: desktop-app/dist/mac/"
