# Installation Guide

## Windows

### Prerequisites

- **Windows 10 or 11** (64-bit)
- **NVIDIA GPU** with at least 6GB VRAM (8GB recommended)
- **Latest NVIDIA Drivers**

### Installation

1. **Download**: Get the latest `.exe` from our [Releases Page](https://github.com/datashi14/prunejuice/releases).
2. **Install**: Double-click `OpenCreativeSuite-Setup.exe`.
3. **First Run**: A terminal will open to download AI models (~5GB). Wait for it to complete.

---

## macOS

### Prerequisites

- **macOS 12.0 (Monterey)** or later
- **Apple Silicon (M1/M2/M3)** OR **Intel Mac with AMD GPU** (8GB+ RAM)
- _Note: Performance is best on M1 Pro/Max or better._

### Installation

1. **Download**: Get the latest `.dmg` from our [Releases Page](https://github.com/datashi14/prunejuice/releases).
2. **Install**: Open the `.dmg` and drag the **Open Creative Suite** icon to your **Applications** folder.
3. **First Run**:
   - Open the app from Applications.
   - You may see a security warning. If so, Ctrl+Click the app and select "Open".
   - It will download the necessary CoreML optimized models on first launch.

---

## Linux

### Prerequisites

- **Ubuntu 22.04 LTS** or newer (recommended)
- **NVIDIA GPU** with proprietary drivers installed (CUDA 11.8+)
- **16GB RAM**

### Installation (AppImage)

1. **Download**: Get the `.AppImage` from our [Releases Page](https://github.com/datashi14/prunejuice/releases).
2. **Make Executable**:
   ```bash
   chmod +x OpenCreativeSuite-x86_64.AppImage
   ```
3. **Run**:
   ```bash
   ./OpenCreativeSuite-x86_64.AppImage
   ```

### Installation (.deb)

1. Download the `.deb` file.
2. Install:
   ```bash
   sudo dpkg -i open-creative-suite_1.0.0_amd64.deb
   sudo apt-get install -f  # Fix dependencies if needed
   ```
3. Run `open-creative-suite` from your terminal or app launcher.
