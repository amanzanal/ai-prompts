const API_URL = 'http://127.0.0.1:8000/api/generate';

export async function generateProfessionalPrompt(payload) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en el servidor de IA.');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}