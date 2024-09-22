from flask import Flask, session, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure the app (make sure your config file has the necessary database URI)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # Using SQLite for local development
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a real secret key

db = SQLAlchemy(app)

# User model for database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()  # Get JSON data sent from the frontend
    username = data.get('username')
    password = data.get('password')

    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    # Create new user and store in database
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 200

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # Get JSON data from the frontend
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()

    # Check if user exists and password matches
    if user and user.check_password(password):
        session['username'] = user.username
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"message": "Invalid username or password"}), 401

# Logout route
@app.route('/logout')
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logged out"}), 200

# Home route for testing
@app.route('/')
def index():
    if 'username' in session:
        return f'Logged in as {session["username"]}'
    return 'You are not logged in'

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure the database is created inside the app context
    app.run(debug=True)