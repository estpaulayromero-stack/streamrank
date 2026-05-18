from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
CORS(app)

DATABASE = "streamrank.db"


# ==========================
# CONEXIÓN DB
# ==========================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# ==========================
# REGISTRO
# ==========================

@app.route('/registro', methods=['POST'])
def registro():
    data = request.get_json()
    email    = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Faltan datos"}), 400

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()

    if user:
        conn.close()
        return jsonify({"error": "El correo ya existe"}), 400

    hashed = generate_password_hash(password)

    conn.execute(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        (email, hashed)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Usuario registrado correctamente"})


# ==========================
# LOGIN
# ==========================

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email    = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Faltan datos"}), 400

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    return jsonify({"message": "Login exitoso", "email": email})


# ==========================
# LISTAS — AGREGAR
# ==========================

@app.route('/listas', methods=['POST'])
def agregar_lista():
    data = request.get_json()

    email      = data.get('email')
    titulo     = data.get('titulo')
    tipo       = data.get('tipo')
    genero     = data.get('genero', '')
    plataforma = data.get('plataforma', '')
    imagen_url = data.get('imagen_url', '')
    rating     = data.get('rating', '')

    if not email or not titulo or not tipo:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Evitar duplicados
    existente = conn.execute(
        "SELECT id FROM listas WHERE user_id = ? AND titulo = ?",
        (user['id'], titulo)
    ).fetchone()

    if existente:
        conn.close()
        return jsonify({"error": "Ya está en tu lista"}), 400

    conn.execute(
        '''INSERT INTO listas (user_id, titulo, tipo, genero, plataforma, imagen_url, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (user['id'], titulo, tipo, genero, plataforma, imagen_url, rating)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Agregado a tu lista correctamente"})


# ==========================
# LISTAS — OBTENER
# ==========================

@app.route('/listas/<email>', methods=['GET'])
def obtener_listas(email):
    conn = get_db_connection()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    items = conn.execute(
        "SELECT * FROM listas WHERE user_id = ? ORDER BY fecha_agregado DESC",
        (user['id'],)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in items])


# ==========================
# LISTAS — ELIMINAR
# ==========================

@app.route('/listas/<int:item_id>', methods=['DELETE'])
def eliminar_lista(item_id):
    data  = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Falta el email"}), 400

    conn = get_db_connection()

    user = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    item = conn.execute(
        "SELECT id FROM listas WHERE id = ? AND user_id = ?",
        (item_id, user['id'])
    ).fetchone()

    if not item:
        conn.close()
        return jsonify({"error": "Item no encontrado o no te pertenece"}), 404

    conn.execute("DELETE FROM listas WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Eliminado correctamente"})


# ==========================
# INICIAR SERVIDOR
# ==========================

if __name__ == '__main__':
    app.run(debug=True)