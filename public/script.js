// En script.js, agregar estas funciones:

// 🔄 Obtener notificaciones del backend
async function obtenerNotificaciones() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`/api/notifications?estudianteId=${user.id || user.cursoId}`);
    
    if (response.ok) {
      const notificaciones = await response.json();
      notificaciones.forEach(notif => {
        if (!notif.leido) {
          publicarNotificacion(`📚 ${notif.titulo}: ${notif.contenido}`);
        }
      });
    }
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
  }
}

// 📡 WebSockets para tiempo real (OPCIONAL - si implementas en NestJS)
function conectarWebSockets() {
  const socket = io('http://localhost:3002'); // Conectar a NestJS
  
  socket.on('nueva_notificacion', (data) => {
    publicarNotificacion(`🔔 ${data.titulo}: ${data.contenido}`);
    
    // Agregar a la línea de tiempo si está en área personal
    if (document.getElementById('timeline-container')) {
      agregarTareaAreaPersonal(data);
    }
  });
  
  return socket;
}

// Llamar cuando el estudiante cargue la página
document.addEventListener('DOMContentLoaded', () => {
  // ... código existente ...
  
  // Nueva funcionalidad
  obtenerNotificaciones();
  
  // Si es estudiante, conectar WebSockets
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.rol === 'estudiante') {
    conectarWebSockets();
  }
});