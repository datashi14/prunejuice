# Prune Juice - Quick Start Guide

## ⚡ First Time Setup (5 minutes)

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Note**: This will download ~3GB of PyTorch and AI libraries. If you have an NVIDIA GPU with CUDA, use:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
cd bridge
npm install
```

### 3. Start the Backend

**Option A - Automatic (Windows)**:

```bash
start-backend.bat
```

**Option B - Manual**:

```bash
# Terminal 1 - Python AI Server
cd bridge
python python_server.py

# Terminal 2 - Node Bridge API
node api-server.js
```

### 4. Launch the App

- Run `desktop-app/dist/Prune Juice Setup 0.1.0.exe`
- Go to the AI tab
- Enter a prompt and click Generate!

## 🔧 Troubleshooting

**"No module named 'diffusers'"**
→ Run `pip install -r requirements.txt`

**"CUDA not available"**
→ Install CUDA PyTorch: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121`

**Generation is very slow (2+ hours)**
→ You're using CPU. Install CUDA PyTorch (see above)

**Port 8000 or 8080 already in use**
→ Kill existing processes or restart your machine
