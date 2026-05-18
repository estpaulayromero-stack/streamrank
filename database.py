import sqlite3

conn = sqlite3.connect('streamrank.db')

cursor = conn.cursor()

# ==========================
# TABLA USUARIOS
# ==========================

cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
''')

# ==========================
# TABLA LISTAS (favoritos/guardados)
# ==========================

cursor.execute('''
CREATE TABLE IF NOT EXISTS listas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    titulo     TEXT NOT NULL,
    tipo       TEXT NOT NULL,
    genero     TEXT,
    plataforma TEXT,
    imagen_url TEXT,
    rating     TEXT,
    fecha_agregado TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
''')

conn.commit()
conn.close()

print("Base de datos creada correctamente")