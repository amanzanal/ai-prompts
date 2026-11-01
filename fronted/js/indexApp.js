import { AppState } from './state.js';
import { translations } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    const langSelector = document.getElementById('lang-selector');
    
    // Restaurar idioma guardado
    langSelector.value = AppState.getLanguage();
    updateLanguage(AppState.getLanguage());

    langSelector.addEventListener('change', (e) => {
        AppState.setLanguage(e.target.value);
        updateLanguage(e.target.value);
    });

    // Marcar visualmente si ya había un objetivo previo en sessionStorage
    const currentObj = AppState.getObjective();
    if (currentObj) {
        highlightCard(currentObj);
    }

    // Evento de selección de objetivo
    document.querySelectorAll('.objective-card').forEach(card => {
        card.addEventListener('click', () => {
            const objective = card.getAttribute('data-objective');
            AppState.setObjective(objective);
            highlightCard(objective);

            // Redirigir a la página 2 tras seleccionar
            setTimeout(() => {
                window.location.href = 'step2.html';
            }, 250);
        });
    });
});

function highlightCard(selectedObj) {
    document.querySelectorAll('.objective-card').forEach(card => {
        if (card.getAttribute('data-objective') === selectedObj) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function updateLanguage(lang) {
    const t = translations[lang];
    document.getElementById('app-title').textContent = t.title;
    document.getElementById('app-subtitle').textContent = t.subtitle;
    document.getElementById('step1-title').textContent = t.step1_title;
    document.getElementById('obj-redactar-title').textContent = t.obj_redactar_title;
    document.getElementById('obj-redactar-desc').textContent = t.obj_redactar_desc;
    document.getElementById('obj-codigo-title').textContent = t.obj_codigo_title;
    document.getElementById('obj-codigo-desc').textContent = t.obj_codigo_desc;
    document.getElementById('obj-imagen-title').textContent = t.obj_imagen_title;
    document.getElementById('obj-imagen-desc').textContent = t.obj_imagen_desc;
    document.getElementById('obj-analisis-title').textContent = t.obj_analisis_title;
    document.getElementById('obj-analisis-desc').textContent = t.obj_analisis_desc;
}