-- ============================================================
--  StreamRank — Base de datos MariaDB para XAMPP
--  Importar desde phpMyAdmin o con:
--  mysql -u root -p < streamrank.sql
-- ============================================================

-- 1. Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS streamrank
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE streamrank;

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    email      VARCHAR(180)     NOT NULL,
    password   VARCHAR(255)     NOT NULL,          -- hash bcrypt / password_hash()
    username   VARCHAR(80)               DEFAULT NULL,
    foto_url   TEXT                      DEFAULT NULL,
    created_at DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: listas  (ítems guardados por cada usuario)
-- ============================================================
CREATE TABLE IF NOT EXISTS listas (
    id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED     NOT NULL,
    titulo         VARCHAR(255)     NOT NULL,
    tipo           ENUM('pelicula','serie') NOT NULL,   -- valores controlados
    genero         VARCHAR(100)              DEFAULT NULL,
    plataforma     VARCHAR(100)              DEFAULT NULL,
    imagen_url     TEXT                      DEFAULT NULL,
    rating         DECIMAL(3,1)              DEFAULT NULL, -- ej. 9.5
    fecha_agregado DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_user_titulo (user_id, titulo),          -- evita duplicados
    CONSTRAINT fk_listas_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ÍNDICES adicionales (mejoran consultas frecuentes)
-- ============================================================
CREATE INDEX idx_listas_user_id   ON listas (user_id);
CREATE INDEX idx_listas_tipo      ON listas (tipo);
CREATE INDEX idx_listas_plataforma ON listas (plataforma);


-- ============================================================
-- DATOS DE PRUEBA (opcional — borra este bloque en producción)
-- ============================================================

-- Usuario de prueba  (contraseña: test1234)
-- Hash generado con PHP: password_hash('test1234', PASSWORD_BCRYPT)
INSERT INTO users (email, password, username) VALUES
('test@gmail.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'Tester');

-- Ítems de ejemplo para ese usuario
INSERT INTO listas (user_id, titulo, tipo, genero, plataforma, imagen_url, rating) VALUES
(1, 'Breaking Bad',   'serie',    'Drama',         'NETFLIX',      'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',  9.5),
(1, 'The Dark Knight','pelicula', 'Acción',        'MAX',          'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',  9.0),
(1, 'Inception',      'pelicula', 'Ciencia Ficción','NETFLIX',     'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',  8.8);