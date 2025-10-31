// public/js/api.js
class ApiService {
    constructor() {
        this.BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:3002/api/v1';
        console.log('✅ ApiService inicializado con URL:', this.BASE_URL);
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.BASE_URL}${endpoint}`;
            console.log('🌐 Haciendo request a:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log('📨 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Response data:', data);
            return data;

        } catch (error) {
            console.error('❌ Error en la petición API:', error);
            throw error;
        }
    }

    // ========== AUTH ==========
    async login(credenciales) {
        console.log('🔐 Intentando login con:', credenciales);
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                correo: credenciales.email,
                contrasena: credenciales.password
            })
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