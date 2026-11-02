import os
import json
import logging
from pathlib import Path
from typing import Literal, Optional, List
from pydantic import BaseModel, Field

# Configuración de Logging Profesional
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("PromptEngine")

# --- CONTRATOS DE DATOS (Pydantic) ---
TargetAIType = Literal["ChatGPT", "Midjourney", "Claude", "DALL-E", "Stable Diffusion"]
ObjectiveType = Literal["Crear imagen", "Redactar", "Código", "Análisis"]
RegisterType = Literal["Formal", "Informal", "Neutro"]

class EngineInput(BaseModel):
    """Estructura de entrada enriquecida que recibe el motor desde el frontend."""
    raw_prompt: str = Field(..., min_length=3, description="Idea base ingresada por el usuario")
    target_ai: TargetAIType = Field(..., description="IA de destino seleccionada")
    objective: ObjectiveType = Field(..., description="Objetivo principal del prompt")
    language_register: RegisterType = Field("Formal", description="Registro de lenguaje seleccionado")
    sub_type: Optional[str] = Field(None, description="Subtipo específico (ej. Correo, Refactorizar)")
    tech_language: Optional[str] = Field(None, description="Tecnología o lenguaje de programación")
    audience: Optional[str] = Field(None, description="Audiencia o tono específico")

class EngineOutput(BaseModel):
    """Estructura de salida devuelta al frontend."""
    raw_prompt: str
    target_ai: TargetAIType
    objective: ObjectiveType
    professional_prompt: str
    model_used: str = Field(..., description="Identificador del motor utilizado")

# --- MOTOR DE PROMPTS AVANZADO ---
class PromptEngine:
    """
    Motor central optimizado para la transformación de prompts mediante 
    Few-Shot Prompting dinámico basado en el dataset procesado (JSONL).
    """
    def __init__(self, model_name: str = "gpt-4o-mini", dataset_path: str = "data/processed/prompts_dataset.jsonl"):
        self.model_name = model_name
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.dataset_path = Path(dataset_path)
        self.few_shot_examples = self._load_dataset_examples()

    def _load_dataset_examples(self) -> List[dict]:
        """Carga ejemplos del dataset procesado para hacer Few-Shot Prompting."""
        examples = []
        if self.dataset_path.exists():
            try:
                with open(self.dataset_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip():
                            examples.append(json.loads(line))
                logger.info(f"Cargados {len(examples)} ejemplos de referencia para Few-Shot.")
            except Exception as e:
                logger.warning(f"No se pudieron cargar los ejemplos del dataset: {e}")
        return examples

    def _get_relevant_examples(self, target_ai: str, objective: str, limit: int = 2) -> str:
        """Filtra y formatea ejemplos relevantes del dataset según la IA y el objetivo."""
        filtered = [
            ex for ex in self.few_shot_examples 
            if ex.get("target_ai") == target_ai and ex.get("objective") == objective
        ]
        
        # Si no hay exactos, tomamos cualesquiera del dataset
        if not filtered:
            filtered = self.few_shot_examples[:limit]
        else:
            filtered = filtered[:limit]

        if not filtered:
            return "No hay ejemplos previos disponibles."

        formatted_text = "Ejemplos de referencia:\n"
        for ex in filtered:
            formatted_text += f"- Entrada: \"{ex['raw_prompt']}\"\n  Prompt Profesional Esperado: \"{ex['professional_prompt']}\"\n"
        return formatted_text

    def _build_system_prompt(self, user_input: EngineInput) -> str:
        """Construye un prompt de sistema altamente descriptivo con contexto enriquecido."""
        examples_text = self._get_relevant_examples(user_input.target_ai, user_input.objective)

        return (
            f"Eres un Arquitecto e Ingeniero de Prompts Senior especializado en maximizar el rendimiento de {user_input.target_ai}. "
            f"Tu objetivo principal es: {user_input.objective}. "
            f"El usuario requiere un registro de lenguaje: {user_input.register}. "
            f"{f'Subtipo o categoría: {user_input.sub_type}. ' if user_input.sub_type else ''}"
            f"{f'Tecnología involucrada: {user_input.tech_language}. ' if user_input.tech_language else ''}"
            f"{f'Audiencia objetivo: {user_input.audience}. ' if user_input.audience else ''}\n\n"
            "Tu tarea es transformar la idea cruda del usuario en un prompt magistral, estructurado y técnico "
            "que extraiga el 100% del potencial de la IA de destino.\n\n"
            f"{examples_text}\n"
            "Devuelve únicamente el texto del prompt profesional optimizado, sin introducciones ni comentarios adicionales."
        )

    def generate(self, user_input: EngineInput) -> EngineOutput:
        logger.info(f"Procesando prompt -> Target: {user_input.target_ai} | Objetivo: {user_input.objective}")

        system_prompt = self._build_system_prompt(user_input)
        user_content = f"Idea original: {user_input.raw_prompt}"

        try:
            professional_prompt = ""

            # Conexión real con OpenAI si la API Key está configurada
            if self.api_key:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                
                response = client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    temperature=0.7
                )
                professional_prompt = response.choices.message.content.strip()
            else:
                # Motor de respaldo inteligente (Mock avanzado para desarrollo local)
                logger.warning("OPENAI_API_KEY no detectada. Usando motor de simulación avanzada.")
                tech_tag = f"[{user_input.tech_language}] " if user_input.tech_language else ""
                sub_tag = f"({user_input.sub_type})" if user_input.sub_type else ""
                
                professional_prompt = (
                    f"Actuate as an elite expert in {user_input.target_ai} engineering. "
                    f"Objective: {user_input.objective} {sub_tag}. Register: {user_input.register}. "
                    f"{tech_tag}Context and requirements derived from user input: '{user_input.raw_prompt}'. "
                    "Execute with maximum precision, adhering strictly to professional standards, robust architecture, and flawless delivery."
                )

            logger.info("Prompt profesional generado con éxito.")

            return EngineOutput(
                raw_prompt=user_input.raw_prompt,
                target_ai=user_input.target_ai,
                objective=user_input.objective,
                professional_prompt=professional_prompt,
                model_used=self.model_name
            )

        except Exception as e:
            logger.error(f"Error crítico en el motor de prompts: {e}")
            raise RuntimeError(f"Fallo en la inferencia del PromptEngine: {e}")

# --- PRUEBA LOCAL ---
if __name__ == "__main__":
    engine = PromptEngine()
    test_input = EngineInput(
        raw_prompt="función para ordenar una lista en python",
        target_ai="Claude",
        objective="Código",
        register="Formal",
        sub_type="Crear nueva función / script",
        tech_language="Python"
    )
    res = engine.generate(test_input)
    print(res.model_dump_json(indent=2))