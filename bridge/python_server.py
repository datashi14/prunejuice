from fastapi import FastAPI, HTTPException, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
import uvicorn
import sys
import os
import torch
import psutil
from typing import Optional
from starlette.status import HTTP_403_FORBIDDEN

# Add parent directory to path to import optimization modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from fooocus_connector import FooocusConnector
    from presets import list_presets, get_preset
    from security import generate_token
except ImportError:
    from bridge.fooocus_connector import FooocusConnector
    from bridge.presets import list_presets, get_preset
    from bridge.security import generate_token

# Initialize App and Security
app = FastAPI(title="Prunejuice AI Backend")
BRIDGE_TOKEN = generate_token()
api_key_header = APIKeyHeader(name="X-Bridge-Token", auto_error=False)

async def get_token_header(api_key: str = Depends(api_key_header)):
    if api_key == BRIDGE_TOKEN:
        return api_key
    raise HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Invalid or missing Bridge Token"
    )

connector = FooocusConnector()

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = ""
    width: int = 1024
    height: int = 1024
    num_inference_steps: int = 20
    guidance_scale: float = 7.5
    seed: Optional[int] = None
    style: Optional[str] = None

class ModelSwitchRequest(BaseModel):
    model_id: str

@app.get("/health")
def health_check():
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None"
    vram_free = 0
    vram_total = 0
    if torch.cuda.is_available():
        vram_free, vram_total = torch.cuda.mem_get_info()
    
    return {
        "status": "ok",
        "hardware": {
            "gpu": gpu_name,
            "vram_free_gb": round(vram_free / (1024**3), 2),
            "vram_total_gb": round(vram_total / (1024**3), 2),
            "ram_usage_percent": psutil.virtual_memory().percent,
            "cuda_available": torch.cuda.is_available(),
            "torch_version": torch.__version__
        },
        "model": {
            "current": connector.current_model_id,
            "loaded": connector.pipe is not None
        }
    }

@app.post("/recover")
def recover_gpu(token: str = Depends(get_token_header)):
    """Force clears CUDA cache to recover from OOM or fragmentation."""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        import gc
        gc.collect()
        return {"status": "recovered", "freed": True}
    return {"status": "skipped", "freed": False}

@app.get("/styles")
def get_styles():
    return list_presets()

@app.post("/generate")
def generate(req: GenerateRequest, token: str = Depends(get_token_header)):
    try:
        # Apply style if present
        p_prompt = req.prompt
        p_neg = req.negative_prompt
        p_steps = req.num_inference_steps
        p_guidance = req.guidance_scale
        
        if req.style:
            preset = get_preset(req.style)
            if preset:
                p_prompt += preset.get("prompt_suffix", "")
                p_neg = preset.get("negative_prompt", "") + " " + p_neg
                p_steps = preset.get("steps", p_steps)
                p_guidance = preset.get("guidance", p_guidance)

        result = connector.generate(
            prompt=p_prompt,
            negative_prompt=p_neg,
            width=req.width,
            height=req.height,
            steps=p_steps,
            guidance=p_guidance,
            seed=req.seed
        )
        return result
    except RuntimeError as e:
        if "out of memory" in str(e).lower():
            torch.cuda.empty_cache()
            raise HTTPException(
                status_code=507, 
                detail={
                    "error_code": "CUDA_OOM",
                    "message": "GPU ran out of memory. Try reducing resolution or closing other apps.",
                    "details": str(e)
                }
            )
        raise HTTPException(status_code=500, detail={"error_code": "INFERENCE_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})

@app.get("/models")
def get_models():
    return connector.list_models()

@app.post("/models/switch")
def switch_model(req: ModelSwitchRequest, token: str = Depends(get_token_header)):
    success = connector.load_model(req.model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"success": True, "current_model": req.model_id}

if __name__ == "__main__":
    # Bind to 127.0.0.1 for security
    print(f"Starting backend with security token: {BRIDGE_TOKEN}")
    uvicorn.run(app, host="127.0.0.1", port=8000)
