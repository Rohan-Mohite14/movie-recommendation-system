from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Replace with your actual Mongo URI
app.config["MONGO_URI"] = "mongodb+srv://Virendra:MongoFirstCluster@movierec.vgfqr1z.mongodb.net/?retryWrites=true&w=majority&appName=MovieRec"
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
    if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{9,}$", password):
        return jsonify({"error": "Password must be at least 9 characters with 1 uppercase, 1 lowercase, and 1 number."}), 400

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

if __name__ == '__main__':
    app.run(debug=True)
