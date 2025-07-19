from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
# Connect to MongoDB
mongo = MongoClient(os.getenv("Mongo_URI"))
db = mongo["movieDB"]  # 🔁 Replace with actual DB name

def compute_ctr():
    pipeline = [
        {"$group": {
            "_id": {"movieId": "$movieId", "action": "$action"},
            "count": {"$sum": 1}
        }},
        {"$group": {
            "_id": "$_id.movieId",
            "actions": {
                "$push": {
                    "action": "$_id.action",
                    "count": "$count"
                }
            }
        }}
    ]

    results = list(mongo.db.movie_logs.aggregate(pipeline))

    for item in results:
        movie_id = item["_id"]
        counts = {a["action"]: a["count"] for a in item["actions"]}
        impressions = counts.get("impression", 1)  # Avoid divide by zero
        clicks = counts.get("click", 0)
        ctr = clicks / impressions

        # Save CTR in movies collection
        mongo.db.movies.update_one(
            {"movieId": int(movie_id)},
            {"$set": {"ctr": ctr}}
        )

if __name__ == "__main__":
    compute_ctr()