import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from pymongo import MongoClient
from bson.objectid import ObjectId
from scipy.sparse import csr_matrix


class HybridRecommender:
    def __init__(self, mongo_uri, db_name):
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.movies_df = None
        self.tfidf_matrix = None
        self.cosine_sim = None
        self.movie_indices = None
        self.user_factors = None
        self.movie_factors = None
        self.user_id_map = None
        self.collab_movie_ids = None
        self.collab_movie_index = None
        self.movie_ctr = {}

    def load_movies(self):
        movie_docs = list(self.db.movies.find())
        movies = []

        for m in movie_docs:
            try:
                movieId = int(m.get("movieId"))
                title = m.get("title", "")
                genres = " ".join(m.get("genres", [])) if isinstance(m.get("genres"), list) else ""
                plot = m.get("plot", "")
                ctr = float(m.get("CTR", 0))
                self.movie_ctr[movieId] = ctr

                movies.append({
                    "movieId": movieId,
                    "title": title,
                    "genres": genres,
                    "plot": plot,
                    "ctr": ctr
                })
            except:
                continue

        self.movies_df = pd.DataFrame(movies)
        self.movies_df["text"] = self.movies_df["title"] + " " + self.movies_df["genres"] + " " + self.movies_df["plot"]
        self.movie_indices = pd.Series(self.movies_df.index, index=self.movies_df['movieId'])

    def load_interactions(self):
        interactions = []
        for inter in self.db.interactions.find({"rating": {"$ne": None}}):
            try:
                user_id = str(inter["user_id"])
                movieId = int(inter["movieId"])
                rating = float(inter["rating"])
                interactions.append({"user_id": user_id, "movieId": movieId, "rating": rating})
            except:
                continue

        user_ratings = []
        for user in self.db.users.find():
            try:
                uid = str(user["_id"])
                ratings = user.get("ratings", {})
                for mid, rating in ratings.items():
                    user_ratings.append({
                        "user_id": uid,
                        "movieId": int(mid),
                        "rating": float(rating)
                    })
            except:
                continue

        return pd.concat([pd.DataFrame(interactions), pd.DataFrame(user_ratings)], ignore_index=True)

    def train(self):
        self.load_movies()
        combined_df = self.load_interactions()

        # Content-Based
        tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = tfidf.fit_transform(self.movies_df["text"])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)

        # Collaborative Filtering
        user_movie_matrix = combined_df.pivot_table(index='user_id', columns='movieId', values='rating').fillna(0)
        self.user_id_map = {uid: idx for idx, uid in enumerate(user_movie_matrix.index)}
        self.collab_movie_ids = user_movie_matrix.columns.tolist()
        self.collab_movie_index = {mid: idx for idx, mid in enumerate(self.collab_movie_ids)}

        sparse_matrix = csr_matrix(user_movie_matrix.values)
        svd = TruncatedSVD(n_components=50, random_state=42)
        self.user_factors = svd.fit_transform(sparse_matrix)
        self.movie_factors = svd.components_.T

    def recommend(self, user_id, mode="hybrid", recent_movie_ids=None, top_n=25):
        if self.movies_df is None or self.movie_indices is None:
            self.train()

        recent_movie_ids = recent_movie_ids or []
        content_scores = np.zeros(len(self.movies_df))
        collab_scores = np.zeros(len(self.movies_df))
        session_scores = np.zeros(len(self.movies_df))

        # Content-Based
        try:
            user_ratings = []
            for r in self.db.interactions.find({"user_id": user_id, "rating": {"$ne": None}}):
                user_ratings.append((int(r["movieId"]), float(r["rating"])))
            user_doc = self.db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                for mid, rating in user_doc.get("ratings", {}).items():
                    user_ratings.append((int(mid), float(rating)))

            sim_scores = np.zeros(len(self.movies_df))
            for mid, rating in user_ratings:
                if mid in self.movie_indices:
                    idx = self.movie_indices[mid]
                    sim_scores += rating * self.cosine_sim[idx]

            if user_ratings:
                content_scores = sim_scores / len(user_ratings)
        except:
            pass

        # Collaborative Filtering
        try:
            if user_id in self.user_id_map:
                uidx = self.user_id_map[user_id]
                user_vec = self.user_factors[uidx]
                result = user_vec @ self.movie_factors.T
                for mid, score in zip(self.collab_movie_ids, result):
                    if mid in self.movie_indices:
                        collab_scores[self.movie_indices[mid]] = score
        except:
            pass

        # Session-Based (recent movies)
        try:
            session_sim = np.zeros(len(self.movies_df))
            valid_ids = [mid for mid in recent_movie_ids if mid in self.movie_indices]
            for mid in valid_ids:
                idx = self.movie_indices[mid]
                session_sim += self.cosine_sim[idx]

            if valid_ids:
                session_scores = session_sim / len(valid_ids)
        except:
            pass

        # Hybrid fusion
        weights = {
            "content": 0.5,
            "collaborative": 0.5,
            "session": 1.0,
            "hybrid": 0.4,
        }

        if mode == "content":
            final_scores = content_scores
        elif mode == "collaborative":
            final_scores = collab_scores
        elif mode == "session":
            final_scores = session_scores
        else:
            final_scores = (
                0.4 * content_scores +
                0.4 * collab_scores +
                0.2 * session_scores
            )

        # Handle cold start: if all scores are 0
        if np.sum(final_scores) == 0:
            self.movies_df["score"] = self.movies_df["movieId"].map(self.movie_ctr)
        else:
            self.movies_df["score"] = final_scores

        sorted_df = self.movies_df.sort_values(by="score", ascending=False).drop_duplicates(subset="movieId")
        results = []
        for _, row in sorted_df.head(top_n).iterrows():
            results.append({
                "id": str(row["movieId"]),
                "title": row["title"],
                "plot": row["plot"],
                "genre": row["genres"].split(),
                "ctr": round(row.get("ctr", 0), 4),
                "score": round(row.get("score", 0), 4)
            })

        return results
