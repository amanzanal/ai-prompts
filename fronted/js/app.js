import { AppState } from './state.js';
import { ViewManager } from './viewManager.js';
import { translations } from './i18n.js';
import { generateProfessionalPrompt } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('lang-selector').addEventListener('change', (e) => {
        ViewManager.updateLanguage(e.target.value);
    });

    // Paso 1: Click en Objetivo
    document.querySelectorAll('.objective-card').forEach(card => {
        card.addEventListener('click', () => {
            const objective = card.getAttribute('data-objective');
            AppState.objective = objective;
            
            // Marcar visualmente la tarjeta seleccionada
            ViewManager.selectObjectiveCard(objective);

            // Renderizar detalles y avanzar de paso
            ViewManager.renderDynamicFields(objective);
            ViewManager.showStep('step-details');
        });
    });

    document.getElementById('back-to-step-1').addEventListener('click', () => {
        ViewManager.showStep('step-objective');
    });

    document.getElementById('wizard-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        AppState.target_ai = document.getElementById('target_ai').value;
        AppState.raw_prompt = document.getElementById('raw_prompt').value.trim();
        
        const subTypeElem = document.getElementById('sub_type');
        const audienceElem = document.getElementById('audience');
        const techLangElem = document.getElementById('tech_language');

        let richContext = AppState.raw_prompt;
        if (subTypeElem) richContext += ` [Subtype: ${subTypeElem.value}]`;
        if (audienceElem) richContext += ` [Audience/Tone: ${audienceElem.value}]`;
        if (techLangElem) richContext += ` [Tech: ${techLangElem.value}]`;

        const payload = {
            target_ai: AppState.target_ai,
            objective: AppState.objective,
            raw_prompt: richContext
        };

        const submitBtn = document.getElementById('submit-btn');
        const t = translations[AppState.language];

        submitBtn.disabled = true;
        submitBtn.textContent = t.loading_btn;

        try {
            const result = await generateProfessionalPrompt(payload);
            document.getElementById('output-text').textContent = result.professional_prompt;
            document.getElementById('source-text').textContent = `Engine: ${result.model_used || 'Local'}`;
            document.getElementById('result-container').classList.remove('hidden');
        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = t.submit_btn;
        }
    });

    document.getElementById('copy-btn').addEventListener('click', function() {
        const text = document.getElementById('output-text').textContent;
        const t = translations[AppState.language];
        navigator.clipboard.writeText(text).then(() => {
            this.textContent = t.copied;
            setTimeout(() => { this.textContent = t.copy_btn; }, 2000);
        });
    });
});