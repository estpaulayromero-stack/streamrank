import requests
from bs4 import BeautifulSoup
import json

url = "https://flixpatrol.com/top10/netflix/world/2026-05-06/"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, "html.parser")

top = []

items = soup.select("table tbody tr")

for i, item in enumerate(items[:10]):

    posicion = i + 1

    titulo = item.select_one("a").text.strip()

    top.append({
        "posicion": posicion,
        "titulo": titulo
    })

# guardar JSON
with open("netflix_top.json", "w", encoding="utf-8") as f:
    json.dump(top, f, indent=4, ensure_ascii=False)

print("JSON creado correctamente")