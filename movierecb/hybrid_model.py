# hybrid_model.py

import numpy as np

class HybridRecommender:
    def __init__(self, model_data):
        self.tfidf = model_data["tfidf"]
        self.cosine_sim = model_data["cosine_sim"]
        self.movie_indices = model_data["movie_indices"]
        self.user_factors = model_data["user_factors"]
        self.movie_factors = model_data["movie_factors"]
        self.collab_movie_ids = model_data["collab_movie_ids"]
        self.collab_movie_index = model_data["collab_movie_index"]
        self.user_id_map = model_data["user_id_map"]
        self.movies_df = model_data["movies_df"]

    def recommend(self, user_id, top_n=10):
        content_scores = np.zeros(len(self.movies_df))
        collab_scores = np.zeros(len(self.movies_df))

        if user_id in self.user_id_map:
            user_idx = self.user_id_map[user_id]
            user_vec = self.user_factors[user_idx]
            collab_result = user_vec.dot(self.movie_factors.T)
            for mid, score in zip(self.collab_movie_ids, collab_result):
                if mid in self.movie_indices:
                    collab_scores[self.movie_indices[mid]] = score

        final_scores = 0.5 * content_scores + 0.5 * collab_scores
        sorted_indices = final_scores.argsort()[::-1]
        top_movies = self.movies_df.iloc[sorted_indices].head(top_n)

        return top_movies["movieId"].tolist()
