
import sqlite3

conn = sqlite3.connect('streamrank.db')
cursor = conn.cursor()

print("=" * 50)
print("USUARIOS")
print("=" * 50)
usuarios = cursor.execute("SELECT * FROM users").fetchall()
for user in usuarios:
    print(f"ID: {user[0]} | Email: {user[1]} | Password (hash): {user[2][:50]}...")

print("\n" + "=" * 50)
print("LISTAS")
print("=" * 50)
listas = cursor.execute("SELECT * FROM listas").fetchall()
if listas:
    for item in listas:
        print(f"ID: {item[0]} | User: {item[1]} | Título: {item[2]} | Tipo: {item[3]}")
else:
    print("(vacío)")

conn.close()
