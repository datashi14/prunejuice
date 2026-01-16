# Known Issues

This document tracks known issues in the current release. We believe in transparency - acknowledging limitations helps users make informed decisions and contributes to faster resolution.

---

## 🔶 v0.1.0 Alpha

### 1. xFormers Dependency Replaced by Native SDPA (Torch 2.6)

**Status**: Resolved / Integrated  
**Severity**: Low (Informational)  
**Affects**: Performance optimization

**Description**:  
We have migrated the inference engine to utilize native **Scaled Dot Product Attention (SDPA)** available in Torch 2.6. This provides near-parity with xFormers performance without the version-hell dependency conflicts.

**Workaround**:  
None needed. Acceleration is now baked into the native runtime.

---

### 2. First-Run Model Warm-Up Delay

**Status**: Expected Behavior  
**Severity**: Low  
**Affects**: All users on first generation

**Description**:  
The first image generation after launching the backend takes significantly longer (30-60 seconds additional) as the Stable Diffusion XL model is loaded into VRAM. Subsequent generations are much faster.

**Workaround**:  
None needed. This is expected behavior. The model stays in memory for subsequent generations.

**Resolution**:  
Future versions may include a "preload model" option during startup.

---

### 3. Design Tab Auto-Connects to Docker

**Status**: Alpha Feature  
**Severity**: Low  
**Affects**: Users using Penpot

**Description**:  
The Design tab now automatically attempts to connect to a local Penpot instance at `http://localhost:9001`. If it is not running (e.g. via Docker Desktop), a workaround instruction page is shown.

**Workaround**:  
Run `docker-compose up -d` and click "Retry Connection" in the app.

---

### 4. Backend Services Require Manual Start (Alpha)

**Status**: By Design (Alpha)  
**Severity**: Medium  
**Affects**: All users

**Description**:  
The AI backend (Python server + Node bridge) must be started manually before using the app. The installed Electron app does not automatically start these services in the Alpha release.

**Workaround**:  
Run `start-backend.bat` (Windows) from the project root before launching the app.

**Resolution**:  
The v1.0 release will include automatic service lifecycle management.

---

## Reporting New Issues

Found something not listed here? Please open an issue on GitHub:  
https://github.com/datashi14/prunejuice/issues

Include:

- Your OS and GPU
- Steps to reproduce
- Error messages or screenshots
