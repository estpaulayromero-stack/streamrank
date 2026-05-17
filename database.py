import sqlite3

conexion = sqlite3.connect("streamrank.db")

cursor = conexion.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    username TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS listas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    titulo TEXT,
    plataforma TEXT,
    genero TEXT,
    rating TEXT,
    descripcion TEXT
)
""")

conexion.commit()

print("Base de datos creada correctamente")