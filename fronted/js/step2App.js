import { AppState } from './state.js';
import { translations } from './i18n.js';
import { generateProfessionalPrompt } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const objective = AppState.getObjective();
    
    // Si no hay objetivo guardado, volver automáticamente a la primera página
    if (!objective) {
        window.location.href = 'index.html';
        return;
    }

    const langSelector = document.getElementById('lang-selector');
    langSelector.value = AppState.getLanguage();

    renderDynamicFields(objective, AppState.getLanguage());
    updateLanguage(AppState.getLanguage());

    langSelector.addEventListener('change', (e) => {
        AppState.setLanguage(e.target.value);
        renderDynamicFields(objective, e.target.value);
        updateLanguage(e.target.value);
    });

    // Envío del formulario
    document.getElementById('step2-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const target_ai = document.getElementById('target_ai').value;
        const raw_prompt = document.getElementById('raw_prompt').value.trim();
        const register = document.getElementById('language_register').value;

        const subTypeElem = document.getElementById('sub_type');
        const audienceElem = document.getElementById('audience');
        const techLangElem = document.getElementById('tech_language');

        let richContext = raw_prompt;
        richContext += ` [Registro/Tono: ${register}]`;
        if (subTypeElem) richContext += ` [Subtipo: ${subTypeElem.value}]`;
        if (audienceElem) richContext += ` [Audiencia: ${audienceElem.value}]`;
        if (techLangElem) richContext += ` [Lenguaje Tech: ${techLangElem.value}]`;

        const payload = { target_ai, objective, raw_prompt: richContext };
        const submitBtn = document.getElementById('submit-btn');
        const t = translations[AppState.getLanguage()];

        submitBtn.disabled = true;
        submitBtn.textContent = t.loading_btn;

        try {
            const result = await generateProfessionalPrompt(payload);
            document.getElementById('output-text').textContent = result.professional_prompt;
            document.getElementById('source-text').textContent = `Motor: ${result.model_used || 'Local'}`;
            document.getElementById('result-container').classList.remove('hidden');
        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = t.submit_btn;
        }
    });

    // Copiar resultado
    document.getElementById('copy-btn').addEventListener('click', function() {
        const text = document.getElementById('output-text').textContent;
        const t = translations[AppState.getLanguage()];
        navigator.clipboard.writeText(text).then(() => {
            this.textContent = t.copied;
            setTimeout(() => { this.textContent = t.copy_btn; }, 2000);
        });
    });
});

function renderDynamicFields(objective, lang) {
    const container = document.getElementById('dynamic-fields');
    const t = translations[lang];
    let html = '';

    if (objective === 'Redactar' || objective === 'Writing') {
        html = `
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.redaccion_type}</label>
                <select id="sub_type" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="${t.redaccion_options.email}">${t.redaccion_options.email}</option>
                    <option value="${t.redaccion_options.summary}">${t.redaccion_options.summary}</option>
                    <option value="${t.redaccion_options.restructure}">${t.redaccion_options.restructure}</option>
                    <option value="${t.redaccion_options.blog}">${t.redaccion_options.blog}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.audience_label}</label>
                <input type="text" id="audience" placeholder="${t.audience_placeholder}" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
            </div>
        `;
    } else if (objective === 'Código' || objective === 'Coding') {
        html = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.code_lang_label}</label>
                    <select id="tech_language" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
                        <option value="${t.code_lang_options.python}">${t.code_lang_options.python}</option>
                        <option value="${t.code_lang_options.javascript}">${t.code_lang_options.javascript}</option>
                        <option value="${t.code_lang_options.sql}">${t.code_lang_options.sql}</option>
                        <option value="${t.code_lang_options.html_css}">${t.code_lang_options.html_css}</option>
                        <option value="${t.code_lang_options.java_csharp}">${t.code_lang_options.java_csharp}</option>
                        <option value="${t.code_lang_options.cpp}">${t.code_lang_options.cpp}</option>
                        <option value="${t.code_lang_options.other}">${t.code_lang_options.other}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.code_action_label}</label>
                    <select id="sub_type" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
                        <option value="${t.code_options.create}">${t.code_options.create}</option>
                        <option value="${t.code_options.refactor}">${t.code_options.refactor}</option>
                        <option value="${t.code_options.debug}">${t.code_options.debug}</option>
                        <option value="${t.code_options.tests}">${t.code_options.tests}</option>
                    </select>
                </div>
            </div>
        `;
    } else if (objective === 'Crear imagen' || objective === 'Image Generation') {
        html = `
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.image_mode_label}</label>
                <select id="sub_type" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="${t.image_options.create}">${t.image_options.create}</option>
                    <option value="${t.image_options.edit}">${t.image_options.edit}</option>
                </select>
            </div>
        `;
    } else {
        html = `
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.analysis_label}</label>
                <input type="text" id="sub_type" placeholder="${t.analysis_placeholder}" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
            </div>
        `;
    }

    html += `
        <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.raw_prompt_label}</label>
            <textarea id="raw_prompt" rows="3" required placeholder="${t.raw_prompt_placeholder}" 
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
        </div>
    `;

    container.innerHTML = html;
}

function updateLanguage(lang) {
    const t = translations[lang];
    const objective = AppState.getObjective();
    
    document.getElementById('app-title').textContent = t.title;
    document.getElementById('details-title').textContent = `${t.step2_title}: ${objective}`;
    document.getElementById('back-link').textContent = t.change_objective;
    
    // Traducción del desplegable de registro de lenguaje
    document.getElementById('register-label').textContent = t.register_label;
    const registerSelect = document.getElementById('language_register');
    if (registerSelect) {
        registerSelect.options[0].textContent = t.register_options.formal;
        registerSelect.options[1].textContent = t.register_options.informal;
        registerSelect.options[2].textContent = t.register_options.neutral;
    }

    document.getElementById('target-ai-label').textContent = t.target_ai_label;
    document.getElementById('submit-btn').textContent = t.submit_btn;
    document.getElementById('result-title').textContent = t.result_title;
    document.getElementById('copy-btn').textContent = t.copy_btn;
}