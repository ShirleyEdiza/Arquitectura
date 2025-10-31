document.addEventListener("DOMContentLoaded", () => {
    const contenido = document.getElementById("contenido-dinamico");
    const linkArea = document.getElementById("link-area");
    const linkCursos = document.getElementById("link-cursos");
    // -------------------- SOCKET.IO -------------------- //
    // Mantenemos la conexión aquí si es para la comunicación general del cliente
    // Pero la conexión específica para 'nueva_notificacion' de NestJS se gestionará en conectarWebSockets
    const socket = io(); // Esta es la conexión para 'nueva-tarea'

    // Cargar por defecto "Mis cursos"
    cargarContenido("mis-cursos.html");

    // Cuando el usuario abre el área personal
    linkArea.addEventListener("click", (e) => {
        e.preventDefault();
        cambiarActivo(linkArea);
        cargarContenido("area-personal.html");

        // Esperar a que se cargue el timeline antes de agregar tareas pendientes
        const esperarTimeline = setInterval(() => {
            const timeline = document.getElementById("timeline-container");
            if (timeline) {
                clearInterval(esperarTimeline);

                if (window.tareasPendientes && window.tareasPendientes.length > 0) {
                    window.tareasPendientes.forEach(t => agregarTareaAreaPersonal(t));
                    window.tareasPendientes = []; // Limpiar la lista temporal
                }
            }
        }, 300); // revisa cada 300ms hasta que exista el contenedor
    });

    linkCursos.addEventListener("click", (e) => {
        e.preventDefault();
        cambiarActivo(linkCursos);
        cargarContenido("mis-cursos.html");
    });

    function cargarContenido(url) {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                if (contenido) contenido.innerHTML = html;
            })
            .catch(err => console.error("Error al cargar contenido:", err));
    }

    function cambiarActivo(enlace) {
        document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
        if (enlace) enlace.classList.add("active");
    }

    // -------------------- SISTEMA DE NOTIFICACIONES -------------------- //
    const notificaciones = [];
    const contador = document.getElementById("notification-counter");
    const listaNotificaciones = document.getElementById("notificaciones-lista");
    const campana = document.getElementById("bell-icon");
    const dropdown = document.getElementById("notification-dropdown");

    // Función para agregar notificación
    function publicarNotificacion(mensaje) {
        notificaciones.unshift(mensaje); // agregar al inicio
        actualizarNotificaciones();
    }

    function actualizarNotificaciones() {
        if (contador) contador.textContent = notificaciones.length;
        if (listaNotificaciones) {
            listaNotificaciones.innerHTML = notificaciones.length
                ? notificaciones.map(n => `<p>${n}</p>`).join("")
                : `<p class="empty-message">No hay notificaciones nuevas.</p>`;
        }
    }

    // Mostrar / ocultar dropdown
    if (campana && dropdown) {
        campana.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que se cierre solo por el listener de window
            dropdown.classList.toggle("show");
        });
    }

    // Cerrar dropdown si se hace clic fuera
    window.addEventListener("click", (e) => {
        if (dropdown && dropdown.classList.contains("show") && !campana.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });


    // -------------------- ESCUCHAR NUEVAS TAREAS -------------------- //
    socket.on("nueva-tarea", (tarea) => {
        console.log("📩 Nueva tarea recibida:", tarea);

        // 🔍 Verificar y asignar curso si no viene definido
        if (!tarea.cursoNombre || tarea.cursoNombre === "undefined") {
            // Esta lógica de asignación es un poco rígida, considera obtener roles y cursos del backend
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let cursoAsignado = "Curso no identificado";

            if (user.rol === 'docente') {
                const cursosDocente = ["Software de Arquitectura", "Redes y Conectividad", "Base de Datos"];
                cursoAsignado = cursosDocente.find(curso => tarea.titulo.includes(curso)) || "Curso no identificado";
            } else if (user.rol === 'estudiante') {
                const cursosEstudiante = ["Redes", "Inteligencia Artificial"]; // Ejemplo, debería venir del backend
                cursoAsignado = cursosEstudiante.find(curso => tarea.titulo.includes(curso)) || "Curso no identificado";
            }
            tarea.cursoNombre = cursoAsignado;
        }

        // --- CORRECCIÓN DE HORA (para la campanita) ---
        let fechaLimiteFormateadaCampana = "No especificada";
        if (tarea.fechaLimite) {
            fechaLimiteFormateadaCampana = new Date(tarea.fechaLimite).toLocaleString("es-EC", {
                dateStyle: "short",
                timeStyle: "short",
            });
        }

        // 💬 Mensaje para la campanita
        const mensaje = `📘 Nueva tarea en ${tarea.cursoNombre}: ${tarea.titulo} 🗓 Entrega: ${fechaLimiteFormateadaCampana}`;
        publicarNotificacion(mensaje);

        // 🔴 Mostrar el contador en rojo
        if (contador) {
            contador.textContent = notificaciones.length;
            contador.style.display = "inline-block";
        }

        // 🧩 Mostrar también en el área personal si está activa
        if (linkArea && linkArea.classList.contains("active")) {
            agregarTareaAreaPersonal(tarea);
        } else {
            if (!window.tareasPendientes) window.tareasPendientes = [];
            window.tareasPendientes.push(tarea);
        }

        // ---------------- Guardar también para "Ver todas" ----------------
        if (!window.tareasNotificacionesGlobal) window.tareasNotificacionesGlobal = [];
        window.tareasNotificacionesGlobal.push(tarea);
    });

    // -------------------- FUNCIÓN PARA MOSTRAR EN ÁREA PERSONAL -------------------- //
    function agregarTareaAreaPersonal(tarea) {
        const timeline = document.getElementById("timeline-container");

        if (!timeline) {
            console.warn("⏳ Timeline no cargado todavía, se agregará cuando abra el área personal.");
            return;
        }

        // --- CORRECCIÓN DE HORA AQUÍ (para el Área Personal) ---
        let fechaLimiteFormateadaArea = 'No especificada';
        if (tarea.fechaLimite) {
            fechaLimiteFormateadaArea = new Date(tarea.fechaLimite).toLocaleString('es-EC', {
                dateStyle: 'long',
                timeStyle: 'short'
            });
        }
        let fechaPublicacionFormateada = new Date().toLocaleDateString('es-EC', { dateStyle: 'long' });
        // --- FIN CORRECCIÓN ---

        const item = document.createElement("div");
        item.className = "timeline-item";

        // Ahora, agregamos data-curso al botón
        item.innerHTML = `
            <p class="timeline-date"><strong>📅 Fecha de publicación:</strong> ${fechaPublicacionFormateada}</p>
            <p class="timeline-task"><strong>📝 Tarea:</strong> ${tarea.titulo}</p>
            <p><strong>📘 Curso:</strong> ${tarea.cursoNombre}</p>
            <p><strong>🗓 Fecha límite:</strong> ${fechaLimiteFormateadaArea}</p>
            <p><strong>📄 Descripción:</strong> ${tarea.descripcion || "Sin descripción."}</p>
            ${tarea.material ? `<p><strong>📎 Material:</strong> ${tarea.material}</p>` : ""}
            <button class="ver-tarea-btn" data-curso="${tarea.cursoNombre}">Ver detalles</button>
        `;

        timeline.prepend(item); // Agrega la tarea al principio del timeline
    }


    // -------------------- CARGAR FOOTER -------------------- //
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;

                // Activar botón scroll una vez cargado el footer
                const scrollTopBtn = document.getElementById("scroll-to-top"); // Usa el ID correcto de tu footer.html
                if (scrollTopBtn) {
                    window.addEventListener("scroll", () => {
                        if (window.scrollY > 300) {
                            scrollTopBtn.style.display = "flex"; // Usar flex si es un ícono centrado
                        } else {
                            scrollTopBtn.style.display = "none";
                        }
                    });

                    scrollTopBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    });
                } else {
                    console.warn("Botón 'scroll-to-top' no encontrado en footer.html");
                }
            })
            .catch(error => console.error("Error al cargar el footer:", error));
    } else {
        console.error("No se encontró el contenedor del footer ('footer-container').");
    }


    // -------------------- MENÚ DEL USUARIO (AVATAR) -------------------- //
    const avatar = document.getElementById("user-avatar");
    const menu = document.getElementById("user-menu");
    const logoutBtn = document.getElementById("logout-btn");
    const userNameSpan = document.getElementById("user-name"); // Cambiado a Span

    // Mostrar nombre e iniciales automáticamente
    // (Simulación: Esto debería venir del login/backend)
    const usuario = {
        nombreCompleto: "SHIRLEY EDIZA CHELA LLUMIGUANO", // Ejemplo
    };

    if (userNameSpan) {
        userNameSpan.textContent = usuario.nombreCompleto;
    }

    if (avatar && userNameSpan) {
        avatar.textContent = usuario.nombreCompleto
            .split(" ")
            .map(p => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    // Mostrar / ocultar el menú al hacer clic en el avatar
    if (avatar && menu) {
        avatar.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("show");
        });

        // Cerrar el menú si se hace clic fuera
        window.addEventListener("click", (e) => { // Cambiado a window
            if (menu.classList.contains("show") && !avatar.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove("show");
            }
        });
    }

    // Acción de "Salir"
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            alert("Sesión finalizada. ¡Hasta pronto!");
            window.location.href = "login.html";
        });
    }


    // -------------------- VER TAREAS DE CADA CURSO (Navegación simulada) -------------------- //
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-tasks")) {
            e.preventDefault();
            const card = e.target.closest(".course-card");
            if (!card) return;
            const titulo = card.querySelector(".course-title")?.textContent.trim();
            if (!titulo) return;

            let pagina = "";
            switch (titulo) {
                case "INTELIGENCIA ARTIFICIAL": pagina = "curso-ia.html"; break;
                case "REDES": pagina = "redes.html"; break;
                // Agrega más casos según tus cursos
            }

            if (pagina) {
                cargarContenido(pagina);
            }
        }
    });
// En el DOMContentLoaded de script.js, actualiza estas funciones:

// 🔄 Obtener notificaciones del backend NestJS
async function obtenerNotificaciones() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario') || '{}');
        const notificaciones = await window.apiService.obtenerNotificaciones(user.id);
        
        notificaciones.forEach(notif => {
            if (!notif.leido) {
                publicarNotificacion(`📚 ${notif.mensaje}`);
            }
        });
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
    }
}

// 📡 WebSockets para notificaciones en tiempo real
function conectarWebSocketsParaNotificaciones() {
    const socket = io(window.APP_CONFIG.SOCKET_URL);

    socket.on('connect', () => {
        console.log('Conectado al servidor de notificaciones NestJS');
    });

    socket.on('notificacion_estudiante', (data) => {
        console.log("🔔 Nueva notificación recibida:", data);
        
        // Mostrar en el sistema de notificaciones
        publicarNotificacion(`🔔 ${data.mensaje}`);
        
        // Actualizar contador
        if (contador) {
            contador.textContent = parseInt(contador.textContent || '0') + 1;
            contador.style.display = "inline-block";
        }

        // Si está en el área personal, agregar la tarea
        if (document.getElementById('timeline-container')) {
            const tareaDesdeNotificacion = {
                titulo: data.mensaje,
                descripcion: 'Nueva tarea asignada',
                cursoNombre: 'Curso actual', // Ajustar según tus datos
                fechaLimite: data.fechaLimite || null
            };
            agregarTareaAreaPersonal(tareaDesdeNotificacion);
        }
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor de notificaciones');
    });

    return socket;
}

    // 📡 WebSockets para tiempo real (NestJS)
    function conectarWebSocketsParaNotificacionesNestJS() {
        // Asegúrate de que esta URL sea la correcta para tu backend NestJS de notificaciones
        const socketNestJS = io('http://localhost:3002');

        socketNestJS.on('connect', () => {
            console.log('Conectado al servidor de notificaciones de NestJS');
        });

        socketNestJS.on('nueva_notificacion', (data) => {
            console.log("🔔 Nueva notificación de NestJS recibida:", data);
            publicarNotificacion(`🔔 ${data.titulo}: ${data.contenido}`);

            // Verificar si el usuario está en el área personal y agregar la tarea
            if (document.getElementById('timeline-container')) {
                // Adaptar el formato de 'data' al de 'tarea' si es necesario
                const tareaDesdeNotificacion = {
                    titulo: data.titulo,
                    descripcion: data.contenido,
                    cursoNombre: data.curso || 'Curso no especificado', // Asume que 'data' tiene un campo 'curso'
                    fechaLimite: data.fechaLimite || null // Asume que 'data' puede tener 'fechaLimite'
                };
                agregarTareaAreaPersonal(tareaDesdeNotificacion);
            }
        });

        socketNestJS.on('disconnect', () => {
            console.log('Desconectado del servidor de notificaciones de NestJS');
        });

        socketNestJS.on('error', (error) => {
            console.error('Error en la conexión WebSocket de NestJS:', error);
        });

        return socketNestJS;
    }


    // --- LLAMADAS A LAS NUEVAS FUNCIONALIDADES ---
    obtenerNotificaciones(); // Cargar notificaciones existentes al inicio

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.rol === 'estudiante') {
        conectarWebSocketsParaNotificacionesNestJS(); // Conectar WebSockets si es estudiante
    }

}); // Fin de DOMContentLoaded