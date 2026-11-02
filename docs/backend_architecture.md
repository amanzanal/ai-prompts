# Documentación de Arquitectura del Backend

Este documento describe la arquitectura, diseño, contratos de datos y responsabilidades del **Backend** de la aplicación **Prompt Architect AI**, construido con **FastAPI**, **Pydantic v2** y un motor modular de Few-Shot Prompting.

---

## 1. Estructura de Directorios del Backend

El backend se encuentra organizado bajo principios de diseño limpio y separación de responsabilidades dentro de la carpeta `src/`:

```text
ai-prompt/
├── data/
│   ├── raw/
│   │   └── prompts_dataset.csv       # Dataset fuente estructurado
│   └── processed/
│       └── prompts_dataset.jsonl     # Dataset validado y procesado (1 JSON por línea)
├── src/
│   ├── __init__.py
│   ├── api.py                        # Servidor REST y endpoints con FastAPI
│   ├── prompt_engine.py              # Motor central de ingeniería de prompts y Few-Shot
│   └── data_pipeline.py              # Pipeline ETL para validación Pydantic del dataset
```

---

## 2. Componentes y Módulos Principales

### A. `src/data_pipeline.py` (Pipeline de Datos)
Responsable de la ingesta, validación y transformación del dataset de entrenamiento.
* **Modelo Pydantic (`PromptSchema`):** Valida estrictamente cada fila del CSV asegurando que cumpla con los tipos permitidos para `target_ai` (*ChatGPT*, *Midjourney*, *Claude*, *DALL-E*, *Stable Diffusion*) y `objective` (*Crear imagen*, *Redactar*, *Código*, *Análisis*).
* **Salida JSONL:** Transforma el archivo plano tabular en un formato de streaming de objetos JSON (`prompts_dataset.jsonl`), optimizado para lectura secuencial por parte del motor.

### B. `src/prompt_engine.py` (Motor de Prompts)
El núcleo lógico del sistema encargado de la transformación de ideas crudas en prompts de nivel profesional.
* **Few-Shot Prompting Dinámico:** Lee automáticamente los ejemplos del archivo JSONL y filtra los más relevantes basándose en la IA de destino y el objetivo seleccionado por el usuario.
* **Construcción de Contexto Enriquecido:** Combina los inputs estructurados (`language_register`, `sub_type`, `tech_language`, `audience`) en un prompt de sistema robusto y estructurado.
* **Sistema Híbrido (API / Fallback):** Si detecta la variable de entorno `OPENAI_API_KEY`, realiza llamadas reales al modelo de OpenAI (`gpt-4o-mini`). De lo contrario, activa un motor de simulación avanzada para permitir desarrollo y pruebas offline sin interrumpir el flujo.

### C. `src/api.py` (Capa de Exposición REST)
Expone la funcionalidad del motor de prompts a través de una API web rápida y moderna basada en **FastAPI**.
* **CORS Habilitado:** Permite la comunicación segura con aplicaciones de frontend alojadas en servidores locales o remotos independientes.
* **Validación Automática:** Utiliza esquemas Pydantic en los endpoints para rechazar peticiones mal formadas con códigos de error claros (`422 Unprocessable Entity`).

---

## 3. Especificación de Endpoints

### `POST /api/generate`
Recibe la petición enriquecida desde el frontend y retorna el prompt profesional optimizado.

* **Payload de Entrada (`EngineInput`):**
  ```json
  {
    "raw_prompt": "función en python para ordenar una lista",
    "target_ai": "Claude",
    "objective": "Código",
    "language_register": "Formal",
    "sub_type": "Crear nueva función / script",
    "tech_language": "Python",
    "audience": "Desarrolladores backend"
  }
  ```

* **Respuesta Exitosa (`EngineOutput` - Código `200 OK`):**
  ```json
  {
    "raw_prompt": "función en python para ordenar una lista",
    "target_ai": "Claude",
    "objective": "Código",
    "professional_prompt": "Escribe una función robusta en Python...",
    "model_used": "gpt-4o-mini"
  }
  ```

---

## 4. Guía de Ejecución Local

1. **Validar y procesar el dataset:**
   ```bash
   python src/data_pipeline.py
   ```

2. **Iniciar el servidor backend con Uvicorn:**
   ```bash
   python -m uvicorn src.api:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Documentación Interactiva (Swagger UI):**
   Una vez iniciado el servidor, puedes probar los endpoints directamente abriendo en tu navegador:
   `http://127.0.0.1:8000/docs`