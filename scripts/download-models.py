import os
import requests
import hashlib
from tqdm import tqdm
import sys

class ModelDownloader:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

        # Manifest of models to download
        # Using ByteDance's SDXL Lightning as the base for "optimized" behavior out of box if pruning isn't run yet
        self.manifest = {
            "sdxl_lightning": {
                "url": "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_unet.safetensors",
                "filename": "sdxl_lightning_4step_unet.safetensors",
                "sha256": "placeholder_hash_for_now", # In prod, put real hash
                "required": True
            },
            "sdxl_vae": {
                "url": "https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/resolve/main/diffusion_pytorch_model.safetensors",
                "filename": "sdxl_vae.safetensors",
                "sha256": "placeholder_hash_vae",
                "required": True
            }
        }

    def verify_file(self, filepath, expected_hash):
        if expected_hash.startswith("placeholder"): return True
        
        print(f"Verifying {os.path.basename(filepath)}...")
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest() == expected_hash

    def download_file(self, url, filename, expected_hash):
        filepath = os.path.join(self.model_dir, filename)
        
        if os.path.exists(filepath):
            if self.verify_file(filepath, expected_hash):
                print(f"✅ {filename} already exists and is valid.")
                return
            else:
                print(f"⚠️ {filename} exists but hash mismatch. Redownloading.")
        
        print(f"⬇️ Downloading {filename}...")
        
        response = requests.get(url, stream=True)
        total_size_in_bytes = int(response.headers.get('content-length', 0))
        block_size = 1024 # 1 Kibibyte
        progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True)
        
        with open(filepath, 'wb') as file:
            for data in response.iter_content(block_size):
                progress_bar.update(len(data))
                file.write(data)
        progress_bar.close()
        
        if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
            print("ERROR, something went wrong")
            os.remove(filepath)
        else:
            print(f"✅ {filename} downloaded.")

    def download_all(self):
        print("🚀 Starting Model Downloads...")
        for key, info in self.manifest.items():
            if info['required']:
                self.download_file(info['url'], info['filename'], info['sha256'])
        print("✨ All required models downloaded.")

if __name__ == "__main__":
    # Ensure requests and tqdm are installed
    try:
        import requests
        import tqdm
    except ImportError:
        print("Please run: pip install requests tqdm")
        sys.exit(1)
        
    downloader = ModelDownloader()
    downloader.download_all()
