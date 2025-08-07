from flask import Flask, request, jsonify
import os, json, uuid, random, string
from flask import send_from_directory

app = Flask(__name__, static_folder="../admin_frontend", static_url_path="")
app.secret_key = "supersecret123"

USER_FILE = "backend/users.json"

def load_users():
    if not os.path.exists(USER_FILE):
        with open(USER_FILE, "w") as f:
            json.dump([], f)
    with open(USER_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=4)

def generate_password(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "admindash.html")

@app.route("/create-account", methods=["POST"])
def create_account():
    first = request.form["first_name"]
    last = request.form["last_name"]
    email = request.form["email"]
    role = request.form["role"]
    password = generate_password()
    account_id = str(uuid.uuid4())

    users = load_users()

    if any(user["email"] == email for user in users):
        return jsonify({"status": "error", "message": "Email already exists."})

    new_user = {
        "id": account_id,
        "first_name": first,
        "last_name": last,
        "email": email,
        "role": role,
        "password": password
    }

    users.append(new_user)
    save_users(users)

    return jsonify({"status": "success", "message": f"Account for {email} created! Temporary password: {password}"})

if __name__ == "__main__":
    app.run(debug=True)
