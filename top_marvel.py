import requests

API_KEY = "904483be1b785c0c354704cfef7156bc"

url = "https://api.themoviedb.org/3/discover/movie"

params = {
    "api_key": API_KEY,
    "language": "es-ES",
    "with_companies": 420,
    "sort_by": "vote_average.desc",
    "vote_count.gte": 1000
}

response = requests.get(url, params=params)

data = response.json()

peliculas = data["results"][:10]

print("\nTOP 10 MARVEL\n")

for i, peli in enumerate(peliculas, start=1):

    titulo = peli["title"]

    rating = peli["vote_average"]

    imagen = "https://image.tmdb.org/t/p/w500" + peli["poster_path"]

    print(f"{i}. {titulo}")

    print(f"⭐ Rating: {rating}")

    print(f"🖼 Poster: {imagen}")

    print()