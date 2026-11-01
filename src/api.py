from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional

# Importamos tu motor de prompts que ya creamos
from src.prompt_engine import PromptEngine, EngineInput, EngineOutput

app = FastAPI(title="Prompt Engine API", version="1.0")

# Habilitar CORS para que el HTML local pueda comunicarse con la API de Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PromptEngine()

@app.post("/api/generate", response_model=EngineOutput)
def generate_professional_prompt(user_input: EngineInput):
    """Endpoint que recibe la petición del frontend y retorna el prompt optimizado."""
    try:
        result = engine.generate(user_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api:app", host="127.0.0.1", port=8000, reload=True)
