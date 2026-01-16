import torch
import gc
import psutil
from typing import Literal

class VRAMManager:
    def __init__(self, device: str = 'cuda'):
        self.device = device if torch.cuda.is_available() else 'cpu'
        self.vram_limit_gb = 7.5
        self.monitor_active = False

    def enable_all_optimizations(self, pipe):
        """
        Apply all Diffusers built-in memory optimizations.
        Crucial for running SDXL on 8GB VRAM.
        """
        print("Enabling VRAM optimizations...")
        
        # 1. Model CPU Offload:
        # Offloads UNet and Text Encoders to CPU when not manually used.
        # This is the most effective single optimization for low VRAM.
        pipe.enable_model_cpu_offload()
        
        # 2. Sequential CPU Offload (Alternative to model_cpu_offload if strictly needed, 
        # but model_cpu_offload is usually faster).
        # pipe.enable_sequential_cpu_offload() 
        
        # 3. VAE Slicing:
        # Processes VAE decoding in chunks.
        pipe.enable_vae_slicing()
        
        # 4. VAE Tiling:
        # Processes images in tiles during VAE encode/decode.
        pipe.enable_vae_tiling()
        
        # 5. Attention Slicing (useful if standard attention is OOMing):
        pipe.enable_attention_slicing(slice_size="max")
        
        # 6. xFormers (Memory efficient attention):
        try:
            pipe.enable_xformers_memory_efficient_attention()
            print("xFormers enabled.")
        except Exception as e:
            print(f"Could not enable xFormers: {e}")

        return pipe

    def pre_generation_cleanup(self):
        """
        Aggressive cleanup before a new generation.
        """
        if self.device == 'cpu': pass
        
        print("Cleaning VRAM before generation...")
        gc.collect()
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
    
    def post_generation_cleanup(self):
        """
        Cleanup after generation to release peaks.
        """
        if self.device == 'cpu': pass
        
        gc.collect()
        torch.cuda.empty_cache()

    def check_memory_status(self):
        """
        Check current memory usage.
        """
        if self.device == 'cuda':
            allocated = torch.cuda.memory_allocated() / 1024**3
            reserved = torch.cuda.memory_reserved() / 1024**3
            print(f"VRAM Allocated: {allocated:.2f} GB | Reserved: {reserved:.2f} GB")
        
        # Check System RAM as well
        ram = psutil.virtual_memory()
        print(f"Sys RAM Used: {ram.used / 1024**3:.2f} GB ({ram.percent}%)")
        
        return allocated if self.device == 'cuda' else 0

    def enforce_limit(self):
        """
        Raise error or take action if over limit.
        """
        current_usage = self.check_memory_status()
        if current_usage > self.vram_limit_gb:
            print(f"WARNING: VRAM usage ({current_usage:.2f} GB) exceeds limit ({self.vram_limit_gb} GB)")
            self.post_generation_cleanup()

if __name__ == "__main__":
    vram = VRAMManager()
    vram.check_memory_status()
