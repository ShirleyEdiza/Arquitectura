-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plataforma_educativa;
USE plataforma_educativa;

-- ===========================
-- TABLA: USUARIOS
-- ===========================
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Docente', 'Estudiante') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- TABLA: CURSOS
-- ===========================
CREATE TABLE Cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_curso VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_docente INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_docente) REFERENCES Usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ===========================
-- TABLA: INSCRIPCIONES
-- ===========================
-- (relación muchos a muchos entre estudiantes y cursos)
CREATE TABLE Inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudiante) REFERENCES Usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE (id_estudiante, id_curso)
);

-- ===========================
-- TABLA: TAREAS
-- ===========================
CREATE TABLE Tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE,
    id_curso INT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ===========================
-- TABLA: NOTIFICACIONES
-- ===========================
CREATE TABLE Notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    mensaje VARCHAR(255) NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_tarea INT NOT NULL,
    id_estudiante INT NOT NULL,
    estado ENUM('Pendiente', 'Leida') DEFAULT 'Pendiente',
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES Usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ===========================
-- DATOS DE PRUEBA (Opcional)
-- ===========================
INSERT INTO Usuarios (nombre, correo, contrasena, rol)
VALUES
('Lesly', 'lesly@educa.com', '12345', 'Docente'),
('Shirley', 'shirley@educa.com', '12345', 'Estudiante'),
('Liliana', 'liliana@educa.com', '12345', 'Estudiante'),
('Kevin', 'kevin@educa.com', '12345', 'Estudiante'),
('Paul', 'paul@educa.com', '12345', 'Estudiante');

INSERT INTO Cursos (nombre_curso, descripcion, id_docente)
VALUES ('Arquitectura de Software', 'Curso sobre patrones y estilos arquitectónicos', 1);

INSERT INTO Inscripciones (id_estudiante, id_curso)
VALUES (2, 1), (3, 1), (4, 1), (5, 1);

INSERT INTO Tareas (titulo, descripcion, fecha_limite, id_curso)
VALUES ('Proyecto Publisher-Subscriber', 'Desarrollar el módulo de notificaciones en tiempo real.', '2025-11-10', 1);

INSERT INTO Notificaciones (mensaje, id_tarea, id_estudiante)
VALUES
('Nueva tarea publicada: Proyecto Publisher-Subscriber', 1, 2),
('Nueva tarea publicada: Proyecto Publisher-Subscriber', 1, 3),
('Nueva tarea publicada: Proyecto Publisher-Subscriber', 1, 4),
('Nueva tarea publicada: Proyecto Publisher-Subscriber', 1, 5);
