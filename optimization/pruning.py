import torch
import torch.nn.utils.prune as prune
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel
import gc
import os
from typing import Optional, Dict

class ModelPruner:
    def __init__(self, model_path: str = "stabilityai/stable-diffusion-xl-base-1.0"):
        """
        Initialize the model pruner with a base SDXL model.
        
        Args:
            model_path: HuggingFace model ID or local path
        """
        print(f"Loading model from {model_path} for pruning...")
        # Load in fp16 to save memory during loading, but we might need fp32 for pruning precision 
        # depending on the technique. For L1 unstructured, fp16 is usually fine.
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            model_path, 
            torch_dtype=torch.float16, 
            use_safetensors=True, 
            variant="fp16"
        )
        self.pipe.to("cpu") # Keep on CPU initially
        print("Model loaded.")

    def prune_unet(self, amount: float = 0.50):
        """
        Prune the UNet component using L1 unstructured pruning.
        
        Args:
            amount: Fraction of weights to prune (0.0 to 1.0)
        """
        print(f"Pruning UNet by {amount*100}%...")
        unet = self.pipe.unet
        
        # Collect linear and conv layers
        parameters_to_prune = []
        for name, module in unet.named_modules():
            if isinstance(module, torch.nn.Linear) or isinstance(module, torch.nn.Conv2d):
                parameters_to_prune.append((module, 'weight'))
        
        # Apply global unstructured pruning
        # Global pruning is better than local because it allows 'moving' the parameters 
        # to where they are most needed across layers.
        prune.global_unstructured(
            parameters_to_prune,
            pruning_method=prune.L1Unstructured,
            amount=amount,
        )
        
        # Make pruning permanent
        for module, name in parameters_to_prune:
            prune.remove(module, name)
            
        print("UNet pruning complete.")
        self._print_sparsity(unet)

    def prune_text_encoders(self, amount: float = 0.30):
        """
        Prune text encoders (usually less aggressive than UNet).
        """
        print(f"Pruning Text Encoders by {amount*100}%...")
        
        for i, text_encoder in enumerate([self.pipe.text_encoder, self.pipe.text_encoder_2]):
            if text_encoder is None: continue
            
            p_list = []
            for name, module in text_encoder.named_modules():
                if isinstance(module, torch.nn.Linear):
                    p_list.append((module, 'weight'))
            
            prune.global_unstructured(
                p_list,
                pruning_method=prune.L1Unstructured,
                amount=amount,
            )
            
            for module, name in p_list:
                prune.remove(module, name)
                
            print(f"Text Encoder {i+1} pruning complete.")
            self._print_sparsity(text_encoder)

    def _print_sparsity(self, model):
        """Helper to calculate and print global sparsity"""
        total_zeros = 0
        total_elements = 0
        for name, module in model.named_modules():
            if hasattr(module, 'weight'):
                total_zeros += torch.sum(module.weight == 0)
                total_elements += module.weight.nelement()
        
        if total_elements > 0:
            print(f"Global Sparsity: {100. * total_zeros / total_elements:.2f}%")

    def validate_quality(self, test_prompts: list = None):
        """
        Generate test images to validate quality hasn't degraded too much.
        """
        if test_prompts is None:
            test_prompts = ["A professional photograph of an astronaut riding a horse", "An oil painting of a cottage"]
            
        print("Running validation generation...")
        self.pipe.to(self.device)
        
        # Simple generation test
        images = self.pipe(prompt=test_prompts, num_inference_steps=20).images
        
        # In a real scenario, we would calculate FID scores here.
        # For now, we return the images for manual inspection or save them.
        for i, img in enumerate(images):
            img.save(f"prune_test_{i}.png")
        print("Validation images saved.")
        self.pipe.to("cpu")

    def save_pruned_model(self, output_path: str):
        """Save the pruned pipeline."""
        print(f"Saving pruned model to {output_path}...")
        self.pipe.save_pretrained(output_path, safe_serialization=True)
        print("Save complete.")

if __name__ == "__main__":
    # Example usage
    pruner = ModelPruner()
    pruner.prune_unet(amount=0.50)
    pruner.prune_text_encoders(amount=0.30)
    # pruner.save_pruned_model("models/pruned_sdxl")
