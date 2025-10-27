const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ===== SIMULACIÓN DE USUARIOS =====
const usuarios = [
  { email: "docente@uni.com", password: "12345", rol: "docente" },
  { email: "estudiante@uni.com", password: "12345", rol: "estudiante" },
];

// ===== RUTA LOGIN =====
app.post("/login", (req, res) => {
  console.log("Cuerpo recibido:", req.body); // depuración

  const { email, password } = req.body;

  // Limpiar espacios y comparar en minúsculas
  const user = usuarios.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() &&
           u.password === password.trim()
  );

  if (!user) return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  res.json({ rol: user.rol });
});

// ===== LÓGICA PUB/SUB =====
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado.");

  socket.on("publicar-tarea", (tarea) => {
    console.log("📢 Nueva tarea publicada:", tarea);

    // Emitir a todos los estudiantes
    io.emit("nueva-tarea", {
      curso: tarea.sala, // ✅ corregido
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fechaLimite: tarea.fechaLimite,
      material: tarea.material,
      fecha: new Date().toLocaleDateString()
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado.");
  });
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
