#!/bin/bash

# Linux Build Script for Open Creative Suite

echo "🐧 Building for Linux..."

# 1. Build Electron App
cd ../../desktop-app
npm run build

# 2. Create AppImage and Deb
# electron-builder handles this via package.json config
npx electron-builder --linux AppImage deb

echo "✅ Build Complete: desktop-app/dist/linux/"
