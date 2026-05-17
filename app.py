from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# CONEXIÓN
def conectar():
    return sqlite3.connect("streamrank.db")

# RUTA PRINCIPAL
@app.route("/")
def inicio():
    return "Servidor funcionando"

# REGISTRO
@app.route("/registro", methods=["POST"])
def registro():

    datos = request.json

    email = datos["email"]
    password = datos["password"]
    username = datos["username"]

    conexion = conectar()
    cursor = conexion.cursor()

    try:

        cursor.execute("""
        INSERT INTO usuarios (email, password, username)
        VALUES (?, ?, ?)
        """, (email, password, username))

        conexion.commit()

        return jsonify({
            "mensaje": "Usuario registrado"
        })

    except:

        return jsonify({
            "mensaje": "Ese correo ya existe"
        })

# EJECUTAR
if __name__ == "__main__":
    app.run(debug=True)