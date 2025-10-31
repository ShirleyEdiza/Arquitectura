// server.js - VERSIÓN CORREGIDA Y COMPLETA
const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Conexión a MySQL en Docker (puerto 3307)
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "root",
  database: "plataforma_educativa",
});

let mysqlDisponible = false;

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con MySQL en Docker:", err.message);
    console.log("📊 Usando datos de prueba temporalmente...");
    mysqlDisponible = false;
  } else {
    console.log("✅ Conexión exitosa a MySQL en Docker (puerto 3307)");
    mysqlDisponible = true;
  }
});

// Datos de prueba como respaldo
const usuariosPrueba = [
  {
    id_usuario: 1,
    nombre: 'Lesly Chamba Guayasamin',
    correo: 'lesly@educa.com',
    contrasena: '12345',
    rol: 'Docente'
  },
  {
    id_usuario: 2,
    nombre: 'Shirley Ediza Chela Llumiguano',
    correo: 'shirley@educa.com', 
    contrasena: '12345',
    rol: 'Estudiante'
  }
];

// Ruta principal → Login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Intento de login:', email);

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Email y contraseña son requeridos" });
  }

  if (mysqlDisponible) {
    const sql = "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?";
    db.query(sql, [email, password], (err, results) => {
      if (err) {
        console.error("❌ Error en consulta MySQL, usando datos de prueba:", err.message);
        loginConDatosPrueba(email, password, res);
        return;
      }

      if (results.length === 0) {
        console.log("❌ Credenciales incorrectas para:", email);
        return res.status(401).json({ mensaje: "Credenciales incorrectas" });
      }

      const user = results[0];
      console.log(`✅ Usuario logueado (MySQL): ${user.nombre} (${user.rol})`);
      
      res.json({ 
        rol: user.rol, 
        nombre: user.nombre,
        id: user.id_usuario,
        email: user.correo
      });
    });
  } else {
    loginConDatosPrueba(email, password, res);
  }
});

// Función helper para login con datos de prueba
function loginConDatosPrueba(email, password, res) {
  const usuario = usuariosPrueba.find(u => 
    u.correo === email && u.contrasena === password
  );

  if (!usuario) {
    console.log("❌ Credenciales incorrectas para:", email);
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  console.log(`✅ Usuario logueado (Datos prueba): ${usuario.nombre} (${usuario.rol})`);
  
  res.json({ 
    rol: usuario.rol, 
    nombre: usuario.nombre,
    id: usuario.id_usuario,
    email: usuario.correo
  });
}

// API de tareas
app.get('/api/tareas', (req, res) => {
  if (mysqlDisponible) {
    const sql = `
      SELECT t.*, c.nombre_curso 
      FROM Tareas t 
      JOIN Cursos c ON t.id_curso = c.id_curso 
      ORDER BY t.fecha_publicacion DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error al obtener tareas, usando datos de prueba:", err.message);
        enviarTareasPrueba(res);
        return;
      }
      res.json(results);
    });
  } else {
    enviarTareasPrueba(res);
  }
});

app.get('/api/tareas/curso/:id_curso', (req, res) => {
  const { id_curso } = req.params;
  
  if (mysqlDisponible) {
    const sql = `
      SELECT t.*, c.nombre_curso 
      FROM Tareas t 
      JOIN Cursos c ON t.id_curso = c.id_curso 
      WHERE t.id_curso = ?
      ORDER BY t.fecha_publicacion DESC
    `;
    
    db.query(sql, [id_curso], (err, results) => {
      if (err) {
        console.error("Error al obtener tareas del curso, usando datos de prueba:", err.message);
        enviarTareasPrueba(res);
        return;
      }
      res.json(results);
    });
  } else {
    enviarTareasPrueba(res);
  }
});

// Crear tarea
app.post('/api/tareas', (req, res) => {
  const { titulo, descripcion, fecha_limite, hora_limite, archivo_material, id_curso } = req.body;
  
  console.log('📝 Creando tarea:', titulo);

  if (mysqlDisponible) {
    const sql = `
      INSERT INTO Tareas (titulo, descripcion, fecha_limite, hora_limite, archivo_material, id_curso) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [titulo, descripcion, fecha_limite, hora_limite, archivo_material, id_curso], (err, result) => {
      if (err) {
        console.error("Error al crear tarea:", err.message);
        return res.status(500).json({ error: "Error del servidor" });
      }
      
      const selectSql = "SELECT t.*, c.nombre_curso FROM Tareas t JOIN Cursos c ON t.id_curso = c.id_curso WHERE t.id_tarea = ?";
      db.query(selectSql, [result.insertId], (err, results) => {
        if (err) {
          console.error("Error al obtener tarea creada:", err.message);
          return res.status(500).json({ error: "Error del servidor" });
        }
        
        const nuevaTarea = results[0];
        
        res.json({ 
          mensaje: "Tarea creada exitosamente", 
          tarea: nuevaTarea 
        });
      });
    });
  } else {
    const nuevaTarea = {
      id_tarea: Date.now(),
      titulo,
      descripcion,
      fecha_limite,
      hora_limite,
      nombre_curso: 'Software de Arquitectura',
      fecha_publicacion: new Date().toISOString()
    };
    
    setTimeout(() => {
      res.json({ 
        mensaje: "Tarea creada exitosamente (modo prueba)", 
        tarea: nuevaTarea 
      });
    }, 500);
  }
});

// Función helper para tareas de prueba
function enviarTareasPrueba(res) {
  const tareasPrueba = [
    {
      id_tarea: 1,
      titulo: 'Proyecto Publisher-Subscriber',
      descripcion: 'Desarrollar el módulo de notificaciones en tiempo real.',
      fecha_limite: '2025-11-10',
      hora_limite: '23:59:00',
      nombre_curso: 'Software de Arquitectura',
      fecha_publicacion: new Date().toISOString()
    }
  ];
  
  res.json(tareasPrueba);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor Express funcionando',
    mysql: mysqlDisponible ? 'Conectado' : 'Desconectado',
    mysql_port: 3307,
    timestamp: new Date().toISOString()
  });
});

// Debug usuarios
app.get('/debug/users', (req, res) => {
  if (mysqlDisponible) {
    db.query("SELECT id_usuario, nombre, correo, rol FROM usuarios", (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  } else {
    res.json(usuariosPrueba.map(u => ({
      id: u.id_usuario,
      nombre: u.nombre,
      email: u.correo,
      rol: u.rol
    })));
  }
});

// Verificar base de datos
app.get('/debug/database', (req, res) => {
  if (mysqlDisponible) {
    db.query("SHOW TABLES", (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        status: 'Conectado',
        tables: results,
        connection: {
          host: db.config.host,
          port: db.config.port,
          database: db.config.database
        }
      });
    });
  } else {
    res.json({
      status: 'Desconectado',
      message: 'MySQL no está disponible, usando datos de prueba',
      fallback_users: usuariosPrueba.length
    });
  }
});

// ⚠️ ESTO DEBE ESTAR AL FINAL - INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express ejecutándose en: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Debug users: http://localhost:${PORT}/debug/users`);
  console.log(`🔗 Database info: http://localhost:${PORT}/debug/database`);
  console.log(`🐳 MySQL configurado para Docker en puerto: 3307`);
});