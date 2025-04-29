from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import re
from flask_cors import CORS
from bson.regex import Regex
from datetime import datetime
from bson.objectid import ObjectId
import time
import random
import pickle
from hybrid_model import HybridRecommender


app = Flask(__name__)
CORS(app)

# Replace with your actual Mongo URI
app.config["MONGO_URI"] = "mongodb+srv://Virendra:MongoFirstCluster@movierec.vgfqr1z.mongodb.net/movieDB?retryWrites=true&w=majority&appName=MovieRec"
mongo = PyMongo(app)




@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    # Email validation: only gmail, hotmail, yahoo
    if not re.match(r"^[\w\.-]+@(gmail|hotmail|yahoo)\.com$", email):
        return jsonify({"error": "Invalid email. Only gmail, hotmail, and yahoo allowed."}), 400

        # Password validation: min 9 chars, 1 uppercase, 1 lowercase, 1 number
    if not re.match(r"^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[\W_]).{9,}$", password):
        return jsonify({"error": "Password must be at least 9 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character."}), 400

    # Phone validation
    if not re.match(r"^\d{10,15}$", phone):
        return jsonify({"error": "Phone must be 10 to 15 digits."}), 400

    existing_user = mongo.db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "User already exists."}), 400

    hashed_pw = generate_password_hash(password)
    user = {
        "name": name,
        "email": email,
        "phone": phone,
        "password": hashed_pw
    }
    mongo.db.users.insert_one(user)
    return jsonify({"message": "User registered successfully."}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found."}), 404

    if not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid password."}), 401

    return jsonify({
        "message": "Login successful.",
        "user": {
            "name": user['name'],
            "email": user['email'],
            "phone": user['phone']
        }
    }), 200



@app.route('/api/search')
def search_movies():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([])  # empty query returns nothing

    # Case‑insensitive regex search on title
    regex = Regex(f".*{query}.*", "i")
    movies = mongo.db.movies.find(
        {"title": regex},
        {"_id": 0, "movieId": 1, "title": 1, "genres": 1}
    ).limit(20)

    return jsonify(list(movies)), 200



@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.get_json()
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    session_id = data.get("session_id") or f"{user_id}_sess_{int(time.time())}"

    if not all([user_id, movie_id]):
        return jsonify(error="user_id and movie_id are required"), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"watchlist": movie_id}}
    )

    mongo.db.interactions.insert_one({
        "user_id": ObjectId(user_id),
        "movieId": movie_id,
        "rating": None,
        "watched": False,
        "timestamp": datetime.utcnow(),
        "session_id": session_id,
        "action": "watchlist_add"
    })

    return jsonify(message="Movie added to watchlist"), 200



@app.route('/api/watchlist/<user_id>', methods=['GET'])
def get_watchlist(user_id):
    user = mongo.db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"_id": 0, "watchlist": 1}
    )
    if not user:
        return jsonify(error="User not found"), 404

    movie_ids = user.get("watchlist", [])
    movies = list(
        mongo.db.movies.find(
            {"movieId": {"$in": movie_ids}},
            {"_id": 0, "movieId": 1, "title": 1, "genres": 1}
        )
    )
    return jsonify(movies), 200



@app.route('/api/watchlist', methods=['DELETE'])
def remove_from_watchlist():
    data = request.get_json()
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    session_id = data.get("session_id") or f"{user_id}_sess_{int(time.time())}"

    if not all([user_id, movie_id]):
        return jsonify(error="user_id and movie_id are required"), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"watchlist": movie_id}}
    )

    mongo.db.interactions.insert_one({
        "user_id": ObjectId(user_id),
        "movieId": movie_id,
        "rating": None,
        "watched": False,
        "timestamp": datetime.utcnow(),
        "session_id": session_id,
        "action": "watchlist_remove"
    })

    return jsonify(message="Movie removed from watchlist"), 200




@app.route('/api/watched/add', methods=['POST'])
def add_to_watched():
    data = request.get_json()
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    session_id = data.get("session_id") or f"{user_id}_sess_{int(time.time())}"

    if not all([user_id, movie_id, rating]):
        return jsonify({"error": "user_id, movie_id, and rating are required"}), 400

    try:
        rating_val = float(rating)
        assert 1.0 <= rating_val <= 5.0
    except:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$addToSet": {"watched": movie_id},
            "$set": {f"ratings.{movie_id}": rating_val}
        }
    )

    mongo.db.interactions.insert_one({
        "user_id": ObjectId(user_id),
        "movieId": movie_id,
        "rating": rating_val,
        "watched": True,
        "timestamp": datetime.utcnow(),
        "session_id": session_id,
        "action": "rate+watch"
    })

    return jsonify({"message": "Movie added to watched list and rating recorded"}), 201




@app.route('/api/rate', methods=['POST'])
def rate_movie():
    data = request.get_json()
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    session_id = data.get("session_id") or f"{user_id}_sess_{int(time.time())}"

    if not all([user_id, movie_id, rating]):
        return jsonify({"error": "user_id, movie_id, and rating required"}), 400

    try:
        rating_val = float(rating)
        assert 1.0 <= rating_val <= 5.0
    except:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$addToSet": {"watched": movie_id},
            "$set": {f"ratings.{movie_id}": rating_val}
        }
    )

    mongo.db.interactions.insert_one({
        "user_id": ObjectId(user_id),
        "movieId": movie_id,
        "rating": rating_val,
        "watched": True,
        "timestamp": datetime.utcnow(),
        "session_id": session_id,
        "action": "rate+watch"
    })

    return jsonify({"message": "Movie rated and added to watched list"}), 200



@app.route('/api/watched/get/<user_id>', methods=['GET'])
def get_watched(user_id):
    user = mongo.db.users.find_one({"user_id": int(user_id)})
    if not user:
        return jsonify({"watched": []}), 200  # safe default

    watched = user.get("watched", [])
    return jsonify({"watched": watched}), 200




@app.route('/remove_from_watched', methods=['POST'])
def remove_from_watched():
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    session_id = data.get('session_id') or f"{user_id}_sess_{int(time.time())}"

    if not user_id or not movie_id:
        return jsonify({'message': 'user_id and movie_id are required'}), 400

    user = mongo.db.users.find_one_and_update(
        {"user_id": int(user_id)},
        {"$pull": {"watched": movie_id}}
    )

    if not user or movie_id not in user.get("watched", []):
        return jsonify({'message': 'Movie not found in watched list'}), 404

    mongo.db.interactions.insert_one({
        "user_id": int(user_id),
        "movieId": int(movie_id),
        "rating": None,
        "watched": False,
        "timestamp": int(time.time() * 1000),
        "session_id": session_id,
        "action": "unwatch"
    })

    return jsonify({'message': 'Movie removed from watched list and interaction recorded'}), 200




# app = Flask(__name__)
# app.config["MONGO_URI"] = "mongodb://localhost:27017/movieDB"
# mongo = PyMongo(app)

# Load all movies once into memory (for small datasets)
all_movies = list(mongo.db.movies.find().limit(5000))


@app.route("/api/movies/random", methods=["GET"])
def get_random_movies():
    sample_movies = random.sample(all_movies, 100)
    # Remove _id from each document
    for movie in sample_movies:
        movie.pop("_id", None)
    return jsonify(sample_movies)



# @app.route("/api/movies/recommendations", methods=["GET"])
# def get_recommendations():
#     user_id = request.args.get("user_id")
#
#     # Dummy logic, replace with real hybrid recommender
#     # Here we use random.sample for simplicity
#     recommended = random.sample(all_movies, 10)
#     return jsonify(recommended)


@app.route("/api/movies/genre", methods=["GET"])
def get_movies_by_genre():
    genre = request.args.get("genre")
    if not genre:
        return jsonify({"error": "Genre is required"}), 400

    filtered_movies = list(mongo.db.movies.find(
        {"genres": genre},
        {"_id": 0}  # Exclude _id directly in query
    ).limit(100))

    return jsonify(filtered_movies)




# Lazy load hybrid model
hybrid_model = None
def load_hybrid_model():
    global hybrid_model
    if hybrid_model is None:
        with open("models/hybrid_recommender.pkl", "rb") as f:  # adjust path if needed
            hybrid_model = pickle.load(f)

@app.route('/api/home-recommendations', methods=['GET'])
def home_recommendations():
    load_hybrid_model()

    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        # Convert user_id to int since your interactions schema uses int
        user_id = int(user_id)

        # Get recommended movieIds from the hybrid model
        recommended_ids = hybrid_model.recommend(user_id, top_n=15)  # your model should support this method

        # If no recommendations found (e.g., new user), fallback to random 15 movies
        if not recommended_ids:
            fallback_movies = mongo.db.movies.aggregate([{"$sample": {"size": 15}}])
            movies = [{
                "movieId": m.get("movieId"),
                "title": m.get("title"),
                "genres": m.get("genres", []),
                "plot": m.get("plot", "")
            } for m in fallback_movies]
            return jsonify(movies), 200

        # Fetch movie details from MongoDB for recommended movieIds
        movie_docs = mongo.db.movies.find(
            {"movieId": {"$in": recommended_ids}},
            {"_id": 0, "movieId": 1, "title": 1, "genres": 1, "plot": 1}
        )

        movies = list(movie_docs)
        return jsonify(movies), 200

    except Exception as e:
        print("Error in hybrid recommendation API:", e)
        return jsonify({"error": "Internal server error"}), 500




if __name__ == '__main__':
    app.run(debug=True)



# @app.route('/api/rate', methods=['POST'])
# def rate_movie():
#     data = request.json
#     user_id    = data.get("user_id")
#     movie_id   = data.get("movie_id")
#     rating     = data.get("rating")
#     session_id = data.get("session_id")
#
#     # basic validation
#     if not all([user_id, movie_id, rating, session_id]):
#         return jsonify(error="user_id, movie_id, rating, session_id required"), 400
#     try:
#         rating_val = float(rating)
#         assert 1.0 <= rating_val <= 5.0
#     except (ValueError, AssertionError):
#         return jsonify(error="rating must be 1‑5"), 400
#
#     # 1) store/update rating in user doc (dict: movieId -> rating)
#     mongo.db.users.update_one(
#         {"_id": ObjectId(user_id)},
#         { "$set": { f"ratings.{movie_id}": rating_val } }
#     )
#
#     # 2) log interaction row
#     mongo.db.interactions.insert_one({
#         "user_id":    ObjectId(user_id),
#         "movieId":    movie_id,
#         "rating":     rating_val,
#         "watched":    True,
#         "timestamp":  datetime.utcnow(),
#         "session_id": session_id,
#         "action":     "rate"
#     })
#
#     return jsonify(message="Rating saved"), 200
#
#
# @app.route('/api/watched/add', methods=['POST'])
# def add_to_watched():
#     data = request.get_json()
#     user_id = data.get("user_id")
#     movie_id = data.get("movie_id")
#
#     if not user_id or not movie_id:
#         return jsonify({"error": "user_id and movie_id are required"}), 400
#
#     user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#
#     if movie_id in user.get("watched", []):
#         return jsonify({"message": "Movie already in watched list"}), 200
#
#     mongo.db.interactions.update_one(
#         {"_id": ObjectId(user_id)},
#         {"$addToSet": {"watched": movie_id}}
#     )
#
#     # Update interactions collection (optional but recommended for recommendation)
#     mongo.db.interactions.insert_one({
#         "user_id": ObjectId(user_id),
#         "movieId": (movie_id),
#         "watched": True,
#         "timestamp": datetime.now(),
#         "session_id": f"{user_id}_sess_{int(time.time())}",
#         "action": "watched"
#     })
#
#     return jsonify({"message": "Movie added to watched list"}), 201
#
#
#
# @app.route('/api/watched/get/<int:user_id>', methods=['GET'])
# def get_watched(user_id):
#     user = mongo.db.users.find_one({"user_id": user_id})
#     if not user:
#         return jsonify({"watched": []}), 200  # return empty list instead of error
#
#     watched = user.get("watched", [])
#     return jsonify({"watched": watched}), 200
#
#
#
#
# @app.route('/remove_from_watched', methods=['POST'])
# def remove_from_watched():
#     data = request.get_json()
#     user_id = data.get('user_id')
#     movie_id = data.get('movie_id')
#     session_id = data.get('session_id', f"{user_id}_sess_0")
#
#     if not user_id or not movie_id:
#         return jsonify({'message': 'user_id and movie_id are required'}), 400
#
#     user = mongo.db.users.find_one_and_update(
#         {"user_id": user_id},
#         {"$pull": {"watched": movie_id}}
#     )
#
#     if not user or movie_id not in user.get("watched", []):
#         return jsonify({'message': 'Movie not found in watched list'}), 404
#
#     # Add unwatch interaction
#     mongo.db.interactions.insert_one({
#         "user_id": int(user_id),
#         "movieId": int(movie_id),
#         "rating": None,
#         "watched": False,
#         "timestamp": int(time.time() * 1000),
#         "session_id": session_id,
#         "action": "unwatch"
#     })
#
#     return jsonify({'message': 'Movie removed from watched list and interaction recorded'}), 200











# @app.route('/api/watchlist', methods=['POST'])
# def add_to_watchlist():
#     data = request.json
#     user_id  = data.get("user_id")
#     movie_id = data.get("movie_id")
#
#     if not all([user_id, movie_id]):
#         return jsonify(error="user_id and movie_id required"), 400
#
#     mongo.db.users.update_one(
#         {"_id": ObjectId(user_id)},
#         {"$addToSet": {"watchlist": movie_id}}
#     )
#     return jsonify(message="Added to watchlist"), 200
#
#
#
# @app.route('/api/watchlist/<user_id>')
# def get_watchlist(user_id):
#     user = mongo.db.users.find_one(
#         {"_id": ObjectId(user_id)},
#         {"_id": 0, "watchlist": 1}
#     )
#     if not user:
#         return jsonify(error="User not found"), 404
#
#     movie_ids = user.get("watchlist", [])
#     movies = list(
#         mongo.db.movies.find(
#             {"movieId": {"$in": movie_ids}},
#             {"_id": 0, "movieId": 1, "title": 1, "genres": 1}
#         )
#     )
#     return jsonify(movies), 200
#
#
#
# @app.route('/api/watchlist', methods=['DELETE'])
# def remove_from_watchlist():
#     data = request.json
#     user_id  = data.get("user_id")
#     movie_id = data.get("movie_id")
#
#     if not all([user_id, movie_id]):
#         return jsonify(error="user_id and movie_id required"), 400
#
#     mongo.db.users.update_one(
#         {"_id": ObjectId(user_id)},
#         {"$pull": {"watchlist": movie_id}}
#     )
#     return jsonify(message="Removed from watchlist"), 200