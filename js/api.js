// js/api.js
class ApiService {
     constructor() {
        this.BASE_URL = window.APP_CONFIG.API_BASE_URL;
     }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en la petición API:', error);
            throw error;
        }
    }

    // ========== TAREAS ==========
    async obtenerTareas() {
        return await this.request('/tareas');
    }

    async obtenerTareasPorCurso(idCurso) {
        return await this.request(`/tareas/curso/${idCurso}`);
    }

    async crearTarea(tareaData) {
        return await this.request('/tareas', {
            method: 'POST',
            body: JSON.stringify(tareaData)
        });
    }

    // ========== NOTIFICACIONES ==========
    async obtenerNotificaciones(idEstudiante) {
        return await this.request(`/notificaciones/${idEstudiante}`);
    }

    // ========== USUARIOS ==========
    async login(credenciales) {
        return await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credenciales)
        });
    }
}

// Crear instancia global
window.apiService = new ApiService();