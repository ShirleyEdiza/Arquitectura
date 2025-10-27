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
        window.tareasPendientes = [];
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
      .then(html => contenido.innerHTML = html)
      .catch(err => console.error("Error al cargar contenido:", err));
  }

  function cambiarActivo(enlace) {
    document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
    enlace.classList.add("active");
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
  contador.textContent = notificaciones.length;
  listaNotificaciones.innerHTML = notificaciones.length
    ? notificaciones.map(n => `<p>${n}</p>`).join("")
    : `<p class="empty-message">No hay notificaciones nuevas.</p>`;
}

// Mostrar / ocultar dropdown
campana.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

// -------------------- ESCUCHAR NUEVAS TAREAS -------------------- //
socket.on("nueva-tarea", (tarea) => {
  console.log("📩 Nueva tarea recibida:", tarea);

  // Mensaje para la campanita
  const mensaje = `Nueva tarea en ${tarea.curso}: ${tarea.titulo} (Entrega: ${tarea.fechaLimite})`;
  publicarNotificacion(mensaje);

  // Mostrar el contador en rojo
  contador.textContent = notificaciones.length;
  contador.style.display = "inline-block";

  // Mostrar también en el área personal si está activa
  // Mostrar también en el área personal
if (linkArea.classList.contains("active")) {
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
  // Buscar el contenedor de la línea de tiempo
  const timeline = document.getElementById("timeline-container");

  if (!timeline) {
    console.warn("⏳ Timeline no cargado todavía, se agregará cuando abra el área personal.");
    return;
  }

  // Crear un nuevo bloque completo con detalles
  const item = document.createElement("div");
  item.className = "timeline-item";
  item.innerHTML = `
    <p class="timeline-date"><strong>📅 Fecha de publicación:</strong> ${tarea.fecha}</p>
    <p class="timeline-task"><strong>📝 Tarea:</strong> ${tarea.titulo}</p>
    <p><strong>📘 Curso:</strong> ${tarea.curso}</p>
    <p><strong>🗓 Fecha límite:</strong> ${tarea.fechaLimite}</p>
    <p><strong>📄 Descripción:</strong> ${tarea.descripcion}</p>
    ${tarea.material ? `<p><strong>📎 Material:</strong> <a href="${tarea.material}" target="_blank">Ver archivo</a></p>` : ""}
    <button class="ver-tarea-btn">Ver detalles</button>
  `;

  // Insertar al principio (nueva tarea arriba)
  timeline.prepend(item);
}

  // -------------------- CARGAR FOOTER -------------------- //
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;

      // Una vez cargado el footer, activar botón scroll
      const scrollTopBtn = document.getElementById("scrollTopBtn");
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          scrollTopBtn.style.display = "block";
        } else {
          scrollTopBtn.style.display = "none";
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    })
    .catch(error => console.error("Error al cargar el footer:", error));
});
// -------------------- MENÚ DEL USUARIO (AVATAR) -------------------- //
const avatar = document.getElementById("user-avatar");
const menu = document.getElementById("user-menu");
const logoutBtn = document.getElementById("logout-btn");
const userName = document.getElementById("user-name");

// Mostrar nombre e iniciales automáticamente (funciona para docente y estudiante)
if (userName && avatar) {
  // nombre (ya lo tienes en usuario.nombreCompleto si quieres)
  // para docente, puedes ponerlo directamente desde HTML o desde JS
  avatar.textContent = userName.textContent
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0,2)
    .toUpperCase();
}

// Mostrar / ocultar el menú al hacer clic en el avatar
if (avatar && menu) {
  avatar.addEventListener("click", () => menu.classList.toggle("show"));

  // Cerrar el menú si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!avatar.contains(e.target) && !menu.contains(e.target)) {
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


// -------------------- CARGAR NOMBRE DEL USUARIO -------------------- //
// (Simulación: luego el backend enviará estos datos)
const usuario = {
  nombreCompleto: "SHIRLEY EDIZA CHELA LLUMIGUANO",
};



// Mostrar nombre e iniciales automáticamente
document.getElementById("user-name").textContent = usuario.nombreCompleto;
document.getElementById("user-avatar").textContent = usuario.nombreCompleto
  .split(" ")
  .map(p => p[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

// -------------------- VER TAREAS DE CADA CURSO -------------------- //
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-tasks")) {
    const card = e.target.closest(".course-card");
    const titulo = card.querySelector(".course-title").textContent.trim();
    let pagina = "";

    switch (titulo) {
      case "SOFTWARE DE ARQUITECTURA":
        pagina = "curso-arquitectura.html";
        break;
      case "BASES DE CONOCIMIENTO":
        pagina = "curso-bases.html";
        break;
      case "INTEGRACIÓN DE SISTEMAS":
        pagina = "curso-integracion.html";
        break;
      case "INTELIGENCIA ARTIFICIAL":
        pagina = "curso-ia.html";
        break;
      case "DESARROLLO WEB AVANZADO":
        pagina = "curso-desarrollo.html";
        break;
      case "GESTIÓN DE PROYECTOS":
        pagina = "gestion.html";
        break;
    }

    if (pagina) {
      fetch(pagina)
        .then(res => res.text())
        .then(html => {
          document.getElementById("contenido-dinamico").innerHTML = html;
          document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
        })
        .catch(err => console.error("Error al cargar curso:", err));
    }
    
  }
  
});


