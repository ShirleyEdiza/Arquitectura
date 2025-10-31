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

    // ========== AUTH ==========
    async login(credenciales) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credenciales)
        });
    }

    // ========== TAREAS (PUBLISHER) ==========
    async obtenerTareas() {
        return await this.request('/publisher/tareas');
    }

    async obtenerTareasPorCurso(idCurso) {
        return await this.request(`/publisher/tareas?cursoId=${idCurso}`);
    }

    async crearTarea(tareaData) {
        return await this.request('/publisher/tarea', {
            method: 'POST',
            body: JSON.stringify(tareaData)
        });
    }

    async consultarTareas(filtros) {
        return await this.request('/publisher/consultar', {
            method: 'POST',
            body: JSON.stringify(filtros)
        });
    }

    // ========== NOTIFICACIONES ==========
    async obtenerNotificaciones(idEstudiante) {
        return await this.request(`/notifications?estudianteId=${idEstudiante}`);
    }

    async obtenerNotificacionesNoLeidas(idEstudiante) {
        return await this.request(`/notifications/no-leidas?estudianteId=${idEstudiante}`);
    }

    async marcarNotificacionComoLeida(idNotificacion) {
        return await this.request(`/notifications/${idNotificacion}/leer`, {
            method: 'PATCH'
        });
    }

    // ========== PUBLICAR NOTIFICACIONES ==========
    async enviarNotificacion(notificacionData) {
        return await this.request('/publisher/notificacion', {
            method: 'POST',
            body: JSON.stringify(notificacionData)
        });
    }
}

// Crear instancia global
window.apiService = new ApiService();