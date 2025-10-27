document.addEventListener("DOMContentLoaded", () => {
  const contenido = document.getElementById("contenido-dinamico");
  const linkArea = document.getElementById("link-area");
  const linkCursos = document.getElementById("link-cursos");

  // Cargar por defecto "Mis cursos"
  cargarContenido("mis-cursos.html");

  linkArea.addEventListener("click", (e) => {
    e.preventDefault();
    cambiarActivo(linkArea);
    cargarContenido("area-personal.html");
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

  function publicarNotificacion(mensaje) {
    notificaciones.push(mensaje);
    actualizarNotificaciones();
  }

  function actualizarNotificaciones() {
    contador.textContent = notificaciones.length;
    listaNotificaciones.innerHTML = notificaciones
      .map(n => `<p>${n}</p>`)
      .join("") || `<p class="empty-message">No hay notificaciones nuevas.</p>`;
  }

  campana.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  // Simulación del patrón Publisher–Subscriber
  setInterval(() => {
    const ejemplos = [
      "Nueva tarea publicada en Entornos Virtuales",
      "Calificación actualizada en Software de Arquitectura",
      "Mensaje nuevo del docente Liliana",
      "Recordatorio: entrega de práctica mañana"
    ];
    const mensaje = ejemplos[Math.floor(Math.random() * ejemplos.length)];
    publicarNotificacion(mensaje);
  }, 10000);

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

// Mostrar / ocultar el menú al hacer clic en el avatar
avatar.addEventListener("click", () => {
  menu.classList.toggle("show");
});

// Cerrar el menú si se hace clic fuera de él
document.addEventListener("click", (e) => {
  if (!avatar.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove("show");
  }
});

// Acción de "Salir"
logoutBtn.addEventListener("click", () => {
  // Aquí puedes poner tu lógica de backend (por ejemplo, cerrar sesión o limpiar token)
  alert("Sesión finalizada. ¡Hasta pronto!");
  window.location.href = "login.html"; // Redirige al login o inicio
});

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


