# Known Issues

This document tracks known issues in the current release. We believe in transparency - acknowledging limitations helps users make informed decisions and contributes to faster resolution.

---

## 🔶 v0.1.0 Alpha

### 1. xFormers Incompatibility with CUDA Torch 2.6.0+cu124

**Status**: Open  
**Severity**: Low (Performance impact only)  
**Affects**: Users attempting to install xFormers for speed optimization

**Description**:  
The latest xFormers package (0.0.33.post2) requires torch 2.9.1, which conflicts with the CUDA-enabled torch 2.6.0+cu124 needed for GPU acceleration. Installing xFormers will downgrade torch to a CPU-only version.

**Workaround**:  
Do not install xFormers. The application works correctly without it, just with slightly longer generation times (~20-30% slower).

**Resolution**:  
Waiting for xFormers to release a version compatible with torch 2.6.x+cu124.

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

### 3. Design Tab Requires Docker for Penpot

**Status**: By Design (Alpha)  
**Severity**: Medium  
**Affects**: Users wanting to use the Design canvas

**Description**:  
The Design tab shows a placeholder instead of the Penpot editor unless Penpot is running via Docker. This is intentional for the Alpha release to keep the installer size manageable.

**Workaround**:  
Run `docker-compose up -d` in the project root to start Penpot services. Penpot will then be available at http://localhost:9001 and embedded in the Design tab.

**Resolution**:  
Future releases may include a bundled lightweight canvas or optional Penpot download during installation.

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
