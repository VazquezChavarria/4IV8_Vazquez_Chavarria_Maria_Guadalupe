CREATE DATABASE IF NOT EXISTS videos_db;
USE videos_db;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  duracion VARCHAR(20),
  estado ENUM('pendiente','en_proceso','completado') DEFAULT 'pendiente',
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ediciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_id INT NOT NULL,
  editor VARCHAR(100) NOT NULL,
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

INSERT INTO categorias (nombre, descripcion) VALUES
  ('Tutoriales', 'Videos educativos'),
  ('Comerciales', 'Spots publicitarios'),
  ('Corporativo', 'Videos institucionales');

INSERT INTO videos (titulo, duracion, estado, categoria_id) VALUES
  ('Intro Corporativa 2024', '00:02:30', 'completado', 3),
  ('Tutorial After Effects', '00:45:00', 'en_proceso', 1),
  ('Spot Verano 2024', '00:00:30', 'pendiente', 2);

INSERT INTO ediciones (video_id, editor, notas) VALUES
  (1, 'Carlos López', 'Aprobado por cliente'),
  (2, 'Ana Martínez', 'Falta agregar subtítulos'),
  (3, 'Pedro Ruiz', 'En espera de aprobación');
