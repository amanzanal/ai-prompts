export const UI = {
    getFormValues() {
        return {
            target_ai: document.getElementById('target_ai').value,
            objective: document.getElementById('objective').value,
            raw_prompt: document.getElementById('raw_prompt').value.trim()
        };
    },

    setLoading(isLoading) {
        const btn = document.getElementById('submit-btn');
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Optimizando...`;
        } else {
            btn.disabled = false;
            btn.textContent = "Optimizar Prompt";
        }
    },

    showResult(data) {
        const container = document.getElementById('result-container');
        const outputText = document.getElementById('output-text');
        const sourceText = document.getElementById('source-text');

        outputText.textContent = data.professional_prompt;
        sourceText.textContent = `Modelo: ${data.model_used || 'Motor Local'}`;
        container.classList.remove('hidden');
    },

    showError(message) {
        alert(`❌ Error: ${message}`);
    },

    copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = "¡Copiado!";
            buttonElement.classList.add("bg-emerald-600", "text-white");
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.classList.remove("bg-emerald-600", "text-white");
            }, 2000);
        });
    }
};