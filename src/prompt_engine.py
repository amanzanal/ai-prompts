import os
import logging
from typing import Literal, Optional
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

class EngineInput(BaseModel):
    """Estructura de entrada que recibe el motor desde el frontend."""
    raw_prompt: str = Field(..., min_length=3, description="Texto natural ingresado por el usuario")
    target_ai: TargetAIType = Field(..., description="IA de destino seleccionada")
    objective: ObjectiveType = Field(..., description="Objetivo principal del prompt")
    tone: Optional[str] = Field("Profesional", description="Tono opcional para el resultado")

class EngineOutput(BaseModel):
    """Estructura de salida que se devuelve al frontend para pintar en pantalla."""
    raw_prompt: str
    target_ai: TargetAIType
    objective: ObjectiveType
    professional_prompt: str
    model_used: str = Field(..., description="Identificador del modelo o tipo de motor utilizado")

# --- MOTOR DE PROMPTS PRINCIPAL ---
class PromptEngine:
    """
    Motor central encargado de transformar prompts naturales en profesionales 
    utilizando el conocimiento aprendido (Fine-Tuning / Few-Shot avanzado).
    """
    def __init__(self, model_name: str = "gpt-4o-mini"): # O tu modelo fine-tuned: ft:gpt-4o-mini:...
        self.model_name = model_name
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            logger.warning("No se encontró la variable de entorno OPENAI_API_KEY. Asegúrate de configurarla si usas llamadas por API.")

    def _build_system_prompt(self, target_ai: TargetAIType, objective: ObjectiveType) -> str:
        """Construye las directrices de comportamiento del modelo basadas en la IA destino."""
        return (
            f"Eres un experto Ingeniero de Prompts especializado en optimizar instrucciones para {target_ai}. "
            f"El objetivo del usuario es: {objective}. "
            "Tu tarea es transformar la idea informal del usuario en un prompt profesional, estructurado, "
            "preciso y optimizado para obtener el 100% del rendimiento de la IA de destino. "
            "Devuelve únicamente el prompt profesional optimizado, sin texto introductorio ni explicaciones adicionales."
        )

    def generate(self, user_input: EngineInput) -> EngineOutput:
        """
        Procesa la entrada del usuario y ejecuta la inferencia contra el modelo de IA.
        """
        logger.info(f"Generando prompt para Target AI: {user_input.target_ai} | Objetivo: {user_input.objective}")

        system_prompt = self._build_system_prompt(user_input.target_ai, user_input.objective)
        user_content = f"Idea original del usuario: {user_input.raw_prompt}"

        try:
            # --- AQUí SE CONECTARÍA CON TU MODELO (API o Modelo Local) ---
            # Si usas OpenAI / tu modelo fine-tuned, la llamada real sería algo así:
            # client = OpenAI(api_key=self.api_key)
            # response = client.chat.completions.create(
            #     model=self.model_name,
            #     messages=[
            #         {"role": "system", "content": system_prompt},
            #         {"role": "user", "content": user_content}
            #     ],
            #     temperature=0.7
            # )
            # professional_prompt = response.choices[0].message.content.strip()

            # (Simulación funcional para desarrollo local mientras configuras tu API/Modelo)
            professional_prompt = (
                f"[Prompt Profesional optimizado por {self.model_name} para {user_input.target_ai}]: "
                f"Actúa con precisión experta. Contexto: {user_input.raw_prompt}. "
                f"Asegura una ejecución impecable orientada a {user_input.objective}."
            )

            logger.info("Prompt profesional generado exitosamente.")

            return EngineOutput(
                raw_prompt=user_input.raw_prompt,
                target_ai=user_input.target_ai,
                objective=user_input.objective,
                professional_prompt=professional_prompt,
                model_used=self.model_name
            )

        except Exception as e:
            logger.error(f"Error crítico durante la generación del prompt: {e}")
            raise RuntimeError(f"Fallo en el motor de prompts: {e}")

# --- BLOQUE DE PRUEBA LOCAL ---
if __name__ == "__main__":
    # Instanciamos el motor
    engine = PromptEngine()

    # Simulamos lo que llegaría desde el frontend (tus selectores e input)
    input_data = EngineInput(
        raw_prompt="un gato astronauta en la luna",
        target_ai="Midjourney",
        objective="Crear imagen"
    )

    # Ejecutamos la generación
    resultado = engine.generate(input_data)
    
    print("\n--- RESULTADO DEL MOTOR ---")
    print(resultado.model_dump_json(indent=2))
