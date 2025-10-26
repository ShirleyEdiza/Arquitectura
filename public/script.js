// ===== CLIENTE =====
// Este archivo maneja tanto al Publisher (Docente) como a los Subscribers (Estudiantes)

// 1️⃣ Conexión con el BROKER (Servidor)
const socket = io();

// 2️⃣ Lógica del SUBSCRIBER
const listaNotificaciones = document.getElementById("lista-notificaciones");

socket.on("nueva-notificacion", (data) => {
  const item = document.createElement("li");
  item.textContent = `🆕 ${data.mensaje}`;
  listaNotificaciones.appendChild(item);
});

// 3️⃣ Lógica del PUBLISHER
const btnPublicar = document.getElementById("btn-publicar");
const inputMensaje = document.getElementById("mensaje-tarea");

btnPublicar.addEventListener("click", () => {
  const mensaje = inputMensaje.value.trim();
  if (mensaje === "") return alert("Por favor, escribe una tarea o mensaje.");

  socket.emit("publicar-tarea", { mensaje });
  inputMensaje.value = "";
});
