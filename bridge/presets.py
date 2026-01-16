PRESETS = {
    # Photorealistic
    "photographic": {
        "name": "Photographic",
        "prompt_suffix": ", 35mm photograph, film, bokeh, professional, 4k, highly detailed",
        "negative_prompt": "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly",
        "steps": 25,
        "guidance": 7.0
    },
    "product": {
        "name": "Product Photography",
        "prompt_suffix": ", professional product photography, studio lighting, white background, 8k, sharp focus",
        "negative_prompt": "dark, shadowy, blurry, low quality, distorted, watermark, text",
        "steps": 25,
        "guidance": 7.5
    },
    "portrait": {
        "name": "Professional Portrait",
        "prompt_suffix": ", professional headshot, rim lighting, sharp focus, 85mm lens, f/1.8",
        "negative_prompt": "ugly, deformed, disfigured, cartoon, illustration, low res",
        "steps": 25,
        "guidance": 6.5
    },

    # Artistic
    "anime": {
        "name": "Anime/Manga",
        "prompt_suffix": ", anime style, studio ghibli, makoto shinkai, vibrant colors, detailed background",
        "negative_prompt": "photo, realistic, 3d, ugly, bad anatomy",
        "steps": 20,
        "guidance": 7.5
    },
    "oil": {
        "name": "Oil Painting",
        "prompt_suffix": ", oil painting, thick impasto, visible brushstrokes, canvas texture, artstation",
        "negative_prompt": "photo, digital art, smooth, flat",
        "steps": 25,
        "guidance": 7.0
    },
    "watercolor": {
        "name": "Watercolor",
        "prompt_suffix": ", watercolor painting, wet on wet, soft edges, paper texture, artistic",
        "negative_prompt": "photo, sharp, harsh lines, solid colors",
        "steps": 25,
        "guidance": 6.0
    },
    
    # Graphic Design
    "minimalist": {
        "name": "Minimalist",
        "prompt_suffix": ", minimalist design, simple shapes, flat color, vector art, clean",
        "negative_prompt": "detailed, complex, textured, realistic, photo",
        "steps": 20,
        "guidance": 8.0
    },
    "cyberpunk": {
        "name": "Cyberpunk",
        "prompt_suffix": ", cyberpunk, neon lights, futuristic, dark, rain, high contrast",
        "negative_prompt": "daylight, sun, nature, organic, rustic",
        "steps": 30,
        "guidance": 7.5
    },
    "lightning": {
        "name": "Lightning (Fast)",
        "prompt_suffix": ", 4k, high quality",
        "negative_prompt": "low quality, bad quality",
        "steps": 6,
        "guidance": 0.0
    }
}

def get_preset(name):
    return PRESETS.get(name, {})

def list_presets():
    return [{"id": k, "name": v["name"]} for k, v in PRESETS.items()]
