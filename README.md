# Prune Juice

> **Your Personal AI Design Studio. Free. Private. Unlimited.**

![App Screenshot](https://placehold.co/1200x600/1f2937/ffffff.png?text=Open+Creative+Suite+Preview)

## What is it?

**Prune Juice** is a unified professional creative workspace that runs completely on your computer.

- 🎨 **Design**: Professional vector graphics and layout tools (powered by **Penpot**).
- 🤖 **Create**: Generate unlimited AI images in seconds (powered by **Fooocus/SDXL**).
- 🔒 **Private**: Your work stays on your PC. No cloud uploads.
- 💸 **Free**: No subscriptions. No credits to buy. Forever.

## Get Started

### 1. Download

Grab the version for your OS from our [**Releases Page**](https://github.com/datashi14/prunejuice/releases):

- 🪟 **Windows**: `OpenCreativeSuite-Setup.exe`
- 🍎 **macOS**: `OpenCreativeSuite.dmg`
- 🐧 **Linux**: `OpenCreativeSuite.AppImage`

### 2. Install

- **Windows**: Run the installer.
- **Mac**: Drag to Applications.
- **Linux**: Make executable and run.

See [docs/installation.md](docs/installation.md) for full details.

### 3. Create

1. Open the app.
2. Click **AI Generator** to make an image (try "A golden retriever puppy in space").
3. Click **Templates** to put that image into an Instagram post or business card.
4. Export and share!

---

## Requirements

To run this smoothly, your computer needs:

### Windows

- **Windows 10 or 11**
- **NVIDIA Graphics Card** (RTX 3060, 3070, or better recommended)
- **16GB RAM**

### macOS

- **Apple Silicon (M1/M2/M3)** or Intel with valid GPU
- **16GB RAM** (Unified Memory)

### Linux

- **Ubuntu 22.04+**
- **NVIDIA GPU** (CUDA 11.8+)
- **16GB RAM**

---

## Acknowledgements & Credits

This project exists thanks to the incredible open-source community. We specifically build upon and fork:

- 🖌️ **[Penpot](https://penpot.app/):** The open-source design tool for teams. Our design engine is a modification of their brilliant work.
- 🔮 **[Fooocus](https://github.com/lllyasviel/Fooocus):** The easiest and most powerful Stable Diffusion interface. Our AI generation capabilities utilize their optimization techniques.

We thank these teams for their contribution to open source.

---

<details>
<summary>👩‍💻 <strong>For Developers & Contributors</strong> (Click to expand)</summary>

### Tech Stack

- **Frontend**: Electron + React
- **Design Engine**: Penpot (Forked)
- **AI Engine**: Stable Diffusion XL (Optimized)
- **Backend**: Python + Node.js

### Setup for Development

1. Clone repo
2. `pip install -r requirements.txt`
3. `cd bridge && npm install`
4. `cd desktop-app && npm install`
5. Run services (see `docs/architecture.md`)
</details>

## License

MIT © Prune Juice Team
