from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import sys
import os
from typing import Optional, List

# Add parent directory to path to import optimization modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from bridge.fooocus_connector import FooocusConnector
    from bridge.presets import list_presets, get_preset
except ImportError:
    from fooocus_connector import FooocusConnector
    from presets import list_presets, get_preset

app = FastAPI()
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

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Prunejuice AI Backend"}

@app.get("/styles")
def get_styles():
    return list_presets()

@app.post("/generate")
def generate(req: GenerateRequest):
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
def get_models():
    return connector.list_models()

@app.post("/models/switch")
def switch_model(req: ModelSwitchRequest):
    success = connector.load_model(req.model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"success": True, "current_model": req.model_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
