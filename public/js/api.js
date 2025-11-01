// public/js/api.js
class ApiService {
    constructor() {
        this.BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:3002/api/v1';
        console.log('✅ ApiService inicializado con URL:', this.BASE_URL);
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.BASE_URL}${endpoint}`;
            console.log('🌐 Haciendo request a:', url, 'Options:', options);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log('📨 Response status:', response.status);
            console.log('📨 Response ok:', response.ok);

            // Obtener el texto de la respuesta primero
            const responseText = await response.text();
            console.log('📨 Response text:', responseText);

            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.warn('⚠️ Response no es JSON válido, usando texto:', responseText);
                data = { message: responseText };
            }

            // Si la respuesta no es exitosa, lanzar error con la data parseada
            if (!response.ok) {
                console.error('❌ Error response:', data);
                
                // Si el backend retornó un objeto de error, usarlo
                if (data.error || data.message) {
                    throw new Error(data.error || data.message);
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }

            console.log('✅ Response data (parsed):', data);
            return data;

        } catch (error) {
            console.error('❌ Error en la petición API:', error);
            throw error;
        }
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

    async obtenerTarea(idTarea) {
        return await this.request(`/publisher/tarea/${idTarea}`);
    }

    async actualizarTarea(idTarea, tareaData) {
        console.log('🔄 Actualizando tarea ID:', idTarea, 'Datos:', tareaData);
        return await this.request(`/publisher/tarea/${idTarea}`, {
            method: 'PUT',
            body: JSON.stringify(tareaData)
        });
    }

    // ✅ SOLO el método para llamar a la API - sin lógica de UI
    async eliminarTarea(idTarea) {
        console.log('🗑️ ApiService: Eliminando tarea ID:', idTarea);
        
        try {
            const response = await this.request(`/publisher/tarea/${idTarea}`, {
                method: 'DELETE'
            });
            
            console.log('✅ ApiService: Respuesta de eliminación:', response);
            return response;
            
        } catch (error) {
            console.error('❌ ApiService: Error eliminando tarea:', error);
            throw error;
        }
    }
}

// Crear instancia global
window.apiService = new ApiService();