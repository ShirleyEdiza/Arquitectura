document.addEventListener("DOMContentLoaded", () => {
    const contenido = document.getElementById("contenido-dinamico");
    const linkArea = document.getElementById("link-area");
    const linkCursos = document.getElementById("link-cursos");
    // -------------------- SOCKET.IO -------------------- //
    const socket = io();

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

        // --- CORRECCIÓN DE HORA AQUÍ (para la campanita) ---
        let fechaLimiteFormateadaCampana = 'No especificada';
        if (tarea.fechaLimite) {
            fechaLimiteFormateadaCampana = new Date(tarea.fechaLimite).toLocaleString('es-EC', {
                dateStyle: 'short', // Ej: "30/10/25"
                timeStyle: 'short'  // Ej: "10:00 AM"
            });
        }
        // --- FIN CORRECCIÓN ---

        // Mensaje para la campanita (usa la fecha formateada)
        const mensaje = `Nueva tarea en ${tarea.cursoNombre}: ${tarea.titulo} (Entrega: ${fechaLimiteFormateadaCampana})`;
        publicarNotificacion(mensaje);

        // Mostrar el contador en rojo
        if (contador) {
            contador.textContent = notificaciones.length;
            contador.style.display = "inline-block"; // Asegura que sea visible
        }

        // Mostrar también en el área personal si está activa
        if (linkArea && linkArea.classList.contains("active")) {
            // Si el área personal ya está visible
            agregarTareaAreaPersonal(tarea);
        } else {
            // Guardar la tarea para mostrarla cuando el usuario entre
            if (!window.tareasPendientes) window.tareasPendientes = [];
            window.tareasPendientes.push(tarea);
        }
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
                dateStyle: 'long',  // Ej: "30 de octubre de 2025"
                timeStyle: 'short'  // Ej: "10:00 AM"
            });
        }
        let fechaPublicacionFormateada = new Date().toLocaleDateString('es-EC', { dateStyle: 'long' }); // Usa la fecha actual como publicación
        // --- FIN CORRECCIÓN ---


        const item = document.createElement("div");
        item.className = "timeline-item";

        // Ahora, usa la variable corregida en el innerHTML
        item.innerHTML = `
            <p class="timeline-date"><strong>📅 Fecha de publicación:</strong> ${fechaPublicacionFormateada}</p>
            <p class="timeline-task"><strong>📝 Tarea:</strong> ${tarea.titulo}</p>
            <p><strong>📘 Curso:</strong> ${tarea.cursoNombre}</p>
            <p><strong>🗓 Fecha límite:</strong> ${fechaLimiteFormateadaArea}</p> <p><strong>📄 Descripción:</strong> ${tarea.descripcion || "Sin descripción."}</p>
            ${tarea.material ? `<p><strong>📎 Material:</strong> ${tarea.material}</p>` : ""}
            <button class="ver-tarea-btn">Ver detalles</button>
        `;

        timeline.prepend(item);
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
    // Esta parte parece específica de la vista "mis-cursos", podría moverse allí si causa problemas
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-tasks")) { // Asume que tienes un botón/enlace con esta clase en mis-cursos.html
            e.preventDefault();
            const card = e.target.closest(".course-card"); // Asume que cada curso está en una tarjeta con esta clase
            if (!card) return;
            const titulo = card.querySelector(".course-title")?.textContent.trim(); // Asume que el título tiene esta clase
            if (!titulo) return;

            let pagina = "";
            // Lógica para determinar qué archivo cargar
            switch (titulo) {
                case "SOFTWARE DE ARQUITECTURA": pagina = "curso-arquitectura.html"; break;
                // ... Añade aquí los otros casos para cada curso ...
                case "GESTIÓN DE PROYECTOS": pagina = "gestion.html"; break;
                // default: console.warn("No se encontró página para el curso:", titulo); break;
            }

            if (pagina) {
                cargarContenido(pagina); // Carga el contenido del curso específico
                // Si quieres que el menú superior refleje esto (opcional):
                // cambiarActivo(null); // Desmarca "Área Personal" y "Mis Cursos"
            }
        }
    });

}); 