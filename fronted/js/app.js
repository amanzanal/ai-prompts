import { generateProfessionalPrompt } from './api.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prompt-form');
    const copyBtn = document.getElementById('copy-btn');

    // Evento de envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = UI.getFormValues();

        if (!payload.raw_prompt) {
            UI.showError("Por favor, introduce una idea o texto natural.");
            return;
        }

        UI.setLoading(true);

        try {
            const result = await generateProfessionalPrompt(payload);
            UI.showResult(result);
        } catch (error) {
            UI.showError(error.message);
        } finally {
            UI.setLoading(false);
        }
    });

    // Evento de copiado
    copyBtn.addEventListener('click', () => {
        const textToCopy = document.getElementById('output-text').textContent;
        if (textToCopy) {
            UI.copyToClipboard(textToCopy, copyBtn);
        }
    });
});