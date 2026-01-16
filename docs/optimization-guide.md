# Optimization Guide

## Core Techniques

We use a three-pronged approach to run SDXL on consumer hardware (8GB VRAM).

### 1. Model Pruning (`optimization/pruning.py`)

We use **L1 Unstructured Pruning** to remove 50% of the less important weights from the UNet model.

- **Target**: Reduce model size from ~6.8GB to ~3.4GB.
- **Method**: `torch.nn.utils.prune.global_unstructured`
- **Result**: Faster loading, less disk usage.

### 2. INT8 Quantization (`optimization/quantization.py`)

We convert FP16/FP32 weights to INT8 dynamic quantization for linear layers.

- **Target**: Reduce VRAM footprint by ~40-50%.
- **Method**: `torch.ao.quantization.quantize_dynamic`
- **Focus**: `torch.nn.Linear` layers in UNet and Text Encoders.

### 3. VRAM Management (`optimization/vram-manager.py`)

Aggressive offloading and cleanup is required.

- **Model Offload**: Keep only the active component (UNet/VAE/Encoder) in VRAM.
- **VAE Slicing/Tiling**: Process images in chunks to avoid VAE OOM spikes.
- **xFormers**: Use memory-efficient attention.
- **GC**: Explicit garbage collection before critical steps.

## Benchmark Targets

- **Resolution**: 1024x1024
- **VRAM**: < 7.5GB Peak
- **Speed**: < 6.0s (RTX 3070)
