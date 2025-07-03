from pymongo import MongoClient

client = MongoClient("mongodb+srv://Virendra:MongoFirstCluster@MovieRec.vgfqr1z.mongodb.net/?retryWrites=true&w=majority&appName=MovieRec")
db = client["movieDB"]
collection = db["movie_logs"]

result = collection.delete_many({ "action": "impression" })
print(f"{result.deleted_count} documents deleted.")
