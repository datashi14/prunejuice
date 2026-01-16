import os
import torch
import sys
import time

# Ensure we can import from optimization
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from optimization.vram_manager import VRAMManager
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler

class FooocusConnector:
    def __init__(self):
        print("Initializing Fooocus Connector...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.vram_manager = VRAMManager(self.device)
        self.pipe = None
        self.current_model_id = None
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
        
        # Initial Load (Lazy or Default)
        # For prototype, we won't load immediately to save time until requested or use a lightweight check
        self.ensure_models_dir()

    def ensure_models_dir(self):
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)

    def load_optimized_pipeline(self, model_id="stabilityai/stable-diffusion-xl-base-1.0"):
        """
        Loads the pipeline with all Prunejuice optimizations.
        """
        if self.pipe is not None and self.current_model_id == model_id:
            return self.pipe
            
        print(f"Loading model {model_id}...")
        
        # 1. Clean up previous
        if self.pipe is not None:
            del self.pipe
            self.vram_manager.post_generation_cleanup()

        # 2. Load Pipeline (Simulate loading pruned/quantized if available)
        # In a real run, we would load 'models/pruned_sdxl.safetensors'
        # For now, we load standard and apply optimizations on fly
        
        # Check for local pruned model
        local_path = os.path.join(self.models_dir, model_id)
        if os.path.exists(local_path):
            load_path = local_path
        else:
            load_path = model_id # Fallback to HF

        try:
            # OPTIMIZATION: Use Native SDPA (Scaled Dot Product Attention) in Torch 2.6+
            print("Activating Native SDPA Backends...")
            torch.backends.cuda.enable_flash_sdp(True)
            torch.backends.cuda.enable_mem_efficient_sdp(True)
            torch.backends.cuda.enable_math_sdp(False) # Disable slow fallback math kernel

            self.pipe = StableDiffusionXLPipeline.from_pretrained(
                load_path,
                torch_dtype=torch.float16,
                use_safetensors=True,
                variant="fp16" # Ensure we try to get fp16 weights
            )
            
            # Additional ML Quality/Speed tweaks
            # self.pipe.enable_freeu(s1=0.9, s2=0.2, b1=1.2, b2=1.4) 
            
            # Scheduler
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(self.pipe.scheduler.config, use_karras_sigmas=True)
            
            # 3. Apply VRAM Optimizations (The Secret Sauce)
            self.pipe = self.vram_manager.enable_all_optimizations(self.pipe)
            
            self.current_model_id = model_id
            print(f"Model {model_id} loaded and optimized.")
            return self.pipe
            
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

    def generate(self, prompt, negative_prompt="", width=1024, height=1024, steps=20, guidance=7.5, seed=None):
        """
        Execute generation with VRAM management.
        """
        # Ensure model is loaded
        if self.pipe is None:
            self.load_optimized_pipeline()
            
        # VRAM Cleanup
        self.vram_manager.pre_generation_cleanup()
        
        # Generator seed
        generator = None
        if seed is not None:
            generator = torch.Generator(device="cpu").manual_seed(seed)
            
        print(f"Generating: '{prompt}' ({width}x{height})")

        # CRITICAL: CPU WARNING
        if self.device == "cpu":
            print("\n" + "!"*50)
            print("WARNING: COMPUTE DEVICE IS 'CPU'. GENERATION WILL BE EXTREMELY SLOW.")
            print("Please install CUDA Torch: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121")
            print("!"*50 + "\n")

        start_time = time.time()
        
        # Scheduler Logic for Lightning/Turbo
        if steps <= 8:
            print("Detecting low steps: Switching scheduler to EulerAncestral (Lightning/Turbo mode)")
            from diffusers import EulerAncestralDiscreteScheduler
            self.pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(self.pipe.scheduler.config, timestep_spacing="trailing")
        else:
            # Default to DPM++ 2M Karras for quality
            from diffusers import DPMSolverMultistepScheduler
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(self.pipe.scheduler.config, use_karras_sigmas=True)

        # Generate
        # Optimization note: Since we used 'enable_model_cpu_offload', we don't need to manually .to("cuda")
        image = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=steps,
            guidance_scale=guidance,
            generator=generator
        ).images[0]
        
        duration = time.time() - start_time
        print(f"Generation complete in {duration:.2f}s")
        
        # Save output
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        filename = f"out_{int(time.time())}.png"
        filepath = os.path.join(output_dir, filename)
        image.save(filepath)
        
        # Cleanup
        self.vram_manager.post_generation_cleanup()
        
        return {
            "image_url": filepath, # In real app, serve via static file server
            "metadata": {
                "width": width,
                "height": height,
                "steps": steps,
                "seed": seed,
                "model": self.current_model_id
            },
            "generation_time": duration
        }

    def list_models(self):
        # Scan models directory
        models = ["stabilityai/stable-diffusion-xl-base-1.0"] # Default
        if os.path.exists(self.models_dir):
            for f in os.listdir(self.models_dir):
                 if f.endswith(".safetensors") or os.path.isdir(os.path.join(self.models_dir, f)):
                     models.append(f)
        return {"models": models, "current": self.current_model_id}

    def load_model(self, model_id):
        pipe = self.load_optimized_pipeline(model_id)
        return pipe is not None

if __name__ == "__main__":
    connector = FooocusConnector()
    # connector.generate("test prompt")
