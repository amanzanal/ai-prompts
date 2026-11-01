# 📘 Documentación Completa del Proyecto: Prompt Architect AI

**Prompt Architect AI** es una plataforma end-to-end orientada al procesamiento de lenguaje natural y la ingeniería de prompts. Su objetivo principal es transformar ideas e instrucciones informales expresadas en lenguaje natural en prompts profesionales, estructurados y de alto rendimiento optimizados para modelos de inteligencia artificial específicos (como ChatGPT, Midjourney, Claude, DALL-E y Stable Diffusion).

---

## 1. Estructura General del Proyecto

El proyecto sigue una arquitectura limpia (Clean Architecture) orientada a la mantenibilidad y modularidad. Para garantizar la máxima mantenibilidad del frontend nativo sin frameworks, la interfaz se divide físicamente en páginas HTML dedicadas (`index.html` para la selección principal y `step2.html` para la configuración detallada), utilizando `sessionStorage` para sincronizar la traza de datos entre páginas.

```
ai-promt/
├── data/
│   ├── raw/
│   │   └── prompts_dataset.csv     # Dataset base con ejemplos raw
│   └── processed/
│       ├── .gitkeep
│       └── prompts_dataset.jsonl   # Dataset validado y formateado para entrenamiento/ML
├── docs/
│   └── project_documentation.md    # Documentación general del proyecto (este archivo)
├── frontend/
│   ├── index.html                  # Página 1: Selección de Objetivo Principal
│   ├── step2.html                  # Página 2: Configuración Detallada, Registro y Generación
│   ├── css/
│   │   └── styles.css              # Estilos compartidos y utilidades visuales
│   └── js/
│       ├── app.js                  # Lógica para index.html (Navegación y persistencia)
│       ├── step2App.js             # Lógica para step2.html (Formulario dinámico y API)
│       ├── api.js                  # Cliente HTTP (conexión con FastAPI)
│       ├── i18n.js                 # Diccionario multilenguaje (ES / EN)
│       ├── state.js                # Gestor de estado local y sincronización con sessionStorage
│       └── viewManager.js          # Renderizado de campos dinámicos e internacionalización
├── models/
│   └── .gitkeep                    # Almacenamiento local para pesos de modelos entrenados
├── src/
│   ├── __init__.py
│   ├── api.py                      # Servidor REST con FastAPI
│   ├── data_pipeline.py            # Limpieza, validación con Pydantic y exportación JSONL
│   └── prompt_engine.py            # Motor principal de generación e inferencia
├── .gitignore                      # Configuración de exclusiones de MLOps y seguridad
└── requirements.txt                # Dependencias de Python
```

---

## 2. Arquitectura del Backend & Data Pipeline

### 2.1 Pipeline de Datos (`src/data_pipeline.py`)

El pipeline de datos es el encargado de la ingesta, validación y formateo de datos para el motor de aprendizaje o Fine-Tuning.

* **Validación con Pydantic:** Cada fila del dataset CSV (`data/raw/prompts_dataset.csv`) es validada para asegurar la presencia y consistencia de los campos obligatorios: `target_ai`, `objective`, `raw_prompt` y `professional_prompt`.
* **Procesamiento a JSONL:** Transforma los registros en un archivo estructurado `data/processed/prompts_dataset.jsonl` optimizado para procesos de Few-Shot learning o fine-tuning de modelos LLM (OpenAI / Hugging Face).

### 2.2 Motor de Prompts (`src/prompt_engine.py`)

El `PromptEngine` constituye la capa de abstracción sobre el modelo de IA.

* **Input Validation (`EngineInput`):** Garantiza que las peticiones del usuario tengan el formato requerido (`raw_prompt`, `target_ai`, `objective`, `tone`).
* **Inferencia & Context Enrichment:** Construye el prompt del sistema especializado según la IA destino seleccionada y delega la ejecución al LLM (Fine-Tuned o API).
* **Output Standard (`EngineOutput`):** Retorna una respuesta limpia conteniendo el prompt optimizado y los metadatos del modelo utilizado.

### 2.3 API Server (`src/api.py`)

Construido con **FastAPI**, expone los endpoints necesarios para conectar el motor en Python con cualquier cliente HTTP:

* **`POST /api/generate`**: Recibe la estructura `EngineInput` desde el frontend, ejecuta el `PromptEngine` y devuelve la respuesta `EngineOutput`.
* **Soporte CORS:** Habilitado para permitir la comunicación fluida con clientes en entornos de desarrollo local (`localhost`).

---

##  3. Arquitectura del Frontend Multi-Página (Vanilla JS Modular)

Para lograr un mantenimiento óptimo del frontend sin mezclar estructuras HTML pesadas en un solo archivo, la aplicación utiliza una arquitectura multi-página nativa:

### 3.1 Vistas HTML Separadas

1. **`index.html` (Paso 1):** Presenta la rejilla visual para la elección del objetivo principal (*Redactar*, *Código*, *Crear Imagen*, *Análisis*). Al hacer clic en una opción, marca la tarjeta visualmente y guarda la selección en `sessionStorage`, redirigiendo automáticamente a `step2.html`.
2. **`step2.html` (Paso 2):** Lee el objetivo guardado, inyecta los campos específicos necesarios y ofrece opciones avanzadas de configuración, incluyendo la selección del **Registro de Lenguaje** (Formal vs Informal).

### 3.2 Campos Específicos y Registro de Lenguaje

En `step2.html`, el usuario puede refinar el prompt especificando:
* **Nivel de Formato / Registro:** Selector explícito para definir si la salida debe usar un lenguaje **Formal / Corporativo** o **Informal / Cercano**.
* **Redacción:** Subtipo (Correo, Resumen, Blog, Reestructuración) y audiencia/destinatario.
* **Código:** Lenguaje técnico (Python, TS, SQL) y acción (Crear, Refactorizar, Debugging, Tests).
* **Imagen:** Modo de generación (Crear desde cero vs Editar/Modificar estilo).

### 3.3 Módulos JavaScript (`frontend/js/`)

* **`state.js`**: Proporciona métodos helper para escribir y leer el estado desde `sessionStorage`, garantizando que si el usuario vuelve atrás desde `step2.html` a `index.html`, la traza de selección se mantenga iluminada.
* **`i18n.js`**: Diccionario de traducción bilingüe (ES / EN) aplicado a ambas páginas HTML.
* **`viewManager.js`**: Construye dinámicamente los elementos de formulario en `step2.html` según el objetivo y el idioma activo.
* **`api.js`**: Gestiona las peticiones `POST` hacia la API de FastAPI.
* **`app.js` & `step2App.js`**: Controladores de eventos específicos para cada página HTML.

---

##  4. Estándares de Seguridad y MLOps (`.gitignore`)

El proyecto sigue estándares estritos de MLOps y seguridad:

* **Datos y Modelos Pesados Excluidos:** Se ignoran todos los archivos generados en `data/processed/*` y los artefactos en `models/*`, conservando los archivos `.gitkeep` para preservar la estructura de carpetas en Git.
* **Credenciales y Entornos Virtuales:** Se excluyen los archivos `.env` (API Keys) y las carpetas de entornos virtuales (`venv/`, `env/`).

---

## 5. Guía de Ejecución Local

### Paso 1: Levantar el Backend (FastAPI)

Desde la raíz del proyecto (`ai-promt/`), ejecuta el servidor uvicorn:

```bash
./venv/bin/python -m uvicorn src.api:app --reload
```
*Servidor activo en `http://127.0.0.1:8000`.*

### Paso 2: Levantar el Frontend

En otra terminal, entra en la carpeta `frontend/` y lanza el servidor de pruebas:

```bash
cd frontend
python -m http.server 8080
```
*Abre tu navegador y entra en `http://localhost:8080` (Cargará `index.html` y navegará a `step2.html` según la interacción del usuario).*