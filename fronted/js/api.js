const API_URL = 'http://127.0.0.1:8000/api/generate';

export async function generateProfessionalPrompt(payload) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Error al conectar con el servidor de IA.');
    }
    return await response.json();
}