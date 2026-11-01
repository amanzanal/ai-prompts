// Maneja la persistencia de datos entre páginas usando sessionStorage
export const AppState = {
    getLanguage() {
        return sessionStorage.getItem('app_language') || 'es';
    },
    setLanguage(lang) {
        sessionStorage.setItem('app_language', lang);
    },

    getObjective() {
        return sessionStorage.getItem('app_objective') || '';
    },
    setObjective(objective) {
        sessionStorage.setItem('app_objective', objective);
    },

    clear() {
        sessionStorage.removeItem('app_objective');
    }
};