import torch
from diffusers import StableDiffusionXLPipeline
from torch.ao.quantization import quantize_dynamic
import os
import time

class ModelQuantizer:
    def __init__(self, model_path: str):
        """
        Load a model (presumably pruned) for quantization.
        """
        print(f"Loading model for quantization from {model_path}...")
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_path,
            torch_dtype=torch.float32, # Dynamic quantization requires fp32 input usually
            use_safetensors=True
        )
        print("Model loaded.")

    def quantize_unet(self):
        """
        Apply INT8 dynamic quantization to the UNet.
        """
        print("Quantizing UNet to INT8...")
        
        # We target Linear and LSTM layers for dynamic quantization. 
        # SDXL UNet is mostly Conv2d and Linear (in attention).
        # Dynamic quantization is effective for Linear layers.
        self.pipe.unet = quantize_dynamic(
            self.pipe.unet,
            {torch.nn.Linear},
            dtype=torch.qint8
        )
        print("UNet quantization complete.")

    def quantize_text_encoders(self):
        """
        Quantize text encoders.
        """
        print("Quantizing Text Encoders...")
        self.pipe.text_encoder = quantize_dynamic(
            self.pipe.text_encoder,
            {torch.nn.Linear},
            dtype=torch.qint8
        )
        self.pipe.text_encoder_2 = quantize_dynamic(
            self.pipe.text_encoder_2,
            {torch.nn.Linear},
            dtype=torch.qint8
        )
        print("Text Encoder quantization complete.")

    def benchmark_memory(self):
        """
        Measure VRAM usage of the current model state.
        """
        if not torch.cuda.is_available():
            print("CUDA not available, skipping VRAM benchmark.")
            return
            
        torch.cuda.reset_peak_memory_stats()
        torch.cuda.empty_cache()
        
        self.pipe.to("cuda")
        
        # Run a dummy inference to trigger peak usage
        self.pipe("benchmark", num_inference_steps=1)
        
        max_mem = torch.cuda.max_memory_allocated() / 1024**3
        print(f"Peak VRAM Usage: {max_mem:.2f} GB")
        
        self.pipe.to("cpu")

    def benchmark_speed(self):
        """
        Measure generation speed.
        """
        if not torch.cuda.is_available():
            print("CUDA not available, skipping Speed benchmark.")
            return

        self.pipe.to("cuda")
        print("Warming up...")
        self.pipe("warmup", num_inference_steps=5)
        
        print("Benchmarking speed (1024x1024, 20 steps)...")
        start = time.time()
        self.pipe("benchmark prompt", num_inference_steps=20)
        end = time.time()
        
        print(f"Generation Time: {end - start:.2f} seconds")
        self.pipe.to("cpu")

    def save_quantized_model(self, output_path: str):
        """
        Save the quantized model.
        Note: Standard save_pretrained might not preserve dynamic quantization wrappers 
        correctly without specific handling or pickling, but for this prototype we'll try standard save.
        """
        print(f"Saving quantized model to {output_path}...")
        # Torchscript or saving via torch.save might be necessary for quantized modules
        # but Diffusers has some support. We will use a custom save for the dict
        # or rely on local caching.
        
        # For full robust saving, usually we export to ONNX or use torch.jit.save
        # Here we will attempt standard saving, but note that dynamic quantization 
        # is often runtime-applied.
        self.pipe.save_pretrained(output_path)
        print("Save complete.")

if __name__ == "__main__":
    # Example usage
    # quantizer = ModelQuantizer("models/pruned_sdxl")
    # quantizer.quantize_unet()
    # quantizer.quantize_text_encoders()
    # quantizer.benchmark_memory()
    pass
