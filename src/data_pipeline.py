import logging
from pathlib import Path
from typing import List, Literal
import pandas as pd
from pydantic import BaseModel, Field, ValidationError

# Configuración de Logging Profesional
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("DataPipeline")

# --- DATA CONTRACT (Esquema de Validación) ---
TargetAIType = Literal["ChatGPT", "Midjourney", "Claude", "DALL-E", "Stable Diffusion"]
ObjectiveType = Literal["Crear imagen", "Redactar", "Código", "Análisis"]

class PromptSchema(BaseModel):
    """Contrato de datos estricto para cada registro del dataset."""
    target_ai: TargetAIType
    objective: ObjectiveType
    raw_prompt: str = Field(..., min_length=3, description="Prompt de entrada del usuario")
    professional_prompt: str = Field(..., min_length=10, description="Prompt refinado esperado")

class PromptDataPipeline:
    def __init__(self, raw_csv_path: str = "data/raw/prompts_dataset.csv", processed_jsonl_path: str = "data/processed/prompts_dataset.jsonl"):
        self.raw_csv_path = Path(raw_csv_path)
        self.processed_jsonl_path = Path(processed_jsonl_path)
        self.processed_jsonl_path.parent.mkdir(parents=True, exist_ok=True)

    def process_and_validate(self) -> List[PromptSchema]:
        """Lee el CSV crudo, valida fila por fila con Pydantic y guarda el resultado filtrado en JSONL."""
        if not self.raw_csv_path.exists():
            logger.error(f"Archivo no encontrado en la ruta: {self.raw_csv_path}")
            raise FileNotFoundError(f"No existe el archivo {self.raw_csv_path}")

        df = pd.read_csv(self.raw_csv_path)
        
        valid_records: List[PromptSchema] = []
        errors_count = 0

        # Transformación y Validación
        for index, row in df.iterrows():
            try:
                # Se valida la fila contra el modelo Pydantic
                record = PromptSchema(**row.to_dict())
                valid_records.append(record)
            except ValidationError as e:
                errors_count += 1
                logger.warning(f"Fila {index} descartada por error de validación: {e}")

        logger.info(f"Procesamiento completado. Registros válidos: {len(valid_records)} | Errores: {errors_count}")

        # Guardar en formato profesional JSONL (1 objeto JSON por línea)
        self._save_to_jsonl(valid_records)
        return valid_records

    def _save_to_jsonl(self, records: List[PromptSchema]) -> None:
        """Guarda la lista de registros validados en formato JSONL dentro de data/processed/."""
        with open(self.processed_jsonl_path, "w", encoding="utf-8") as f:
            for record in records:
                f.write(record.model_dump_json() + "\n")
        logger.info(f"Dataset procesado y guardado exitosamente en: {self.processed_jsonl_path}")

if __name__ == "__main__":
    # Ejecución del pipeline de datos
    pipeline = PromptDataPipeline()
    validated_data = pipeline.process_and_validate()
