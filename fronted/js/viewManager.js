import { AppState } from './state.js';
import { translations } from './i18n.js';

export const ViewManager = {
    showStep(stepId) {
        document.querySelectorAll('.view-step').forEach(el => {
            el.classList.remove('active-view');
            el.classList.add('hidden-view');
        });
        const target = document.getElementById(stepId);
        target.classList.remove('hidden-view');
        target.classList.add('active-view');

        if (stepId === 'step-objective' && AppState.objective) {
            this.selectObjectiveCard(AppState.objective);
        }
    },

    selectObjectiveCard(selectedObjective) {
        document.querySelectorAll('.objective-card').forEach(card => {
            const objective = card.getAttribute('data-objective');
            
            if (objective === selectedObjective) {
                // Clases de Tailwind cuando ESTÁ seleccionado (Color llamativo y persistente)
                card.classList.remove('border-slate-700', 'bg-slate-950');
                card.classList.add('border-indigo-500', 'bg-indigo-950/80', 'ring-2', 'ring-indigo-500', 'shadow-lg', 'shadow-indigo-500/20');
            } else {
                // Clases por defecto cuando NO está seleccionado
                card.classList.remove('border-indigo-500', 'bg-indigo-950/80', 'ring-2', 'ring-indigo-500', 'shadow-lg', 'shadow-indigo-500/20');
                card.classList.add('border-slate-700', 'bg-slate-950');
            }
        });
    },

    updateLanguage(lang) {
        AppState.language = lang;
        const t = translations[lang];

        document.getElementById('app-title').textContent = t.title;
        document.getElementById('app-subtitle').textContent = t.subtitle;
        document.getElementById('step1-title').textContent = t.step1_title;
        document.getElementById('back-to-step-1').textContent = t.change_objective;
        document.getElementById('target-ai-label').textContent = t.target_ai_label;
        document.getElementById('submit-btn').textContent = t.submit_btn;
        document.getElementById('result-title').textContent = t.result_title;
        document.getElementById('copy-btn').textContent = t.copy_btn;

        document.getElementById('obj-redactar-title').textContent = t.obj_redactar_title;
        document.getElementById('obj-redactar-desc').textContent = t.obj_redactar_desc;
        document.getElementById('obj-codigo-title').textContent = t.obj_codigo_title;
        document.getElementById('obj-codigo-desc').textContent = t.obj_codigo_desc;
        document.getElementById('obj-imagen-title').textContent = t.obj_imagen_title;
        document.getElementById('obj-imagen-desc').textContent = t.obj_imagen_desc;
        document.getElementById('obj-analisis-title').textContent = t.obj_analisis_title;
        document.getElementById('obj-analisis-desc').textContent = t.obj_analisis_desc;

        if (AppState.objective) {
            this.renderDynamicFields(AppState.objective);
        }
    },

    renderDynamicFields(objective) {
        const container = document.getElementById('dynamic-fields');
        const title = document.getElementById('details-title');
        const t = translations[AppState.language];

        title.textContent = `${t.step2_title}: ${objective}`;

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
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">${t.code_lang_label}</label>
                        <input type="text" id="tech_language" placeholder="${t.code_lang_placeholder}" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:ring-2 focus:ring-indigo-500">
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
};