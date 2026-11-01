# Conceptual de cómo entrenarías el modelo con tu JSONL
from datasets import load_dataset
from trl import SFTTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer

# 1. Cargar tu dataset procesado
dataset = load_dataset("json", data_files="data/processed/prompts_dataset.jsonl")

# 2. Cargar un modelo base de código abierto
model = AutoModelForCausalLM.from_pretrained("unsloth/llama-3-8b-Instruct")
tokenizer = AutoTokenizer.from_pretrained("unsloth/llama-3-8b-Instruct")

# 3. Entrenar el modelo (aquí es donde el modelo "aprende" a ser preciso)
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    dataset_text_field="professional_prompt", # Lo que debe aprender a generar
    max_seq_length=512,
)
trainer.train()

# 4. Guardar los pesos aprendidos en tu carpeta /models
model.save_pretrained("models/prompt_expert_v1")
