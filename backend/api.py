# std:
import io
import logging
import os
import sys
import uuid 

# lib:
import flask
from flask_cors import CORS
import pydash as _
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


# dep:
import dbms
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml_models.ocr_translate import extract_text_from_image, google_translate_text
from flask import Flask, request, jsonify
from openai import OpenAI
 
#
# Constants
#

DEBUG = True

#
# Variables
#

_logger = logging.getLogger(__name__)
_openai = OpenAI()
_server = flask.Flask(__name__)
CORS(_server)

# Extraction Usage: curl -X POST -F 'file=@path/to/image.jpg' http://127.0.0.1:5000/extract_text
# Translation Usage: curl -X POST -H "Content-Type: application/json" -d '{"text": "extracted text", "target_language": "en"}' http://127.0.0.1:5000/translate_text


#
# Functions
#

def start() -> bool:
        # *** TEMPORARY FILE UPLOAD FOR TESTING ***
        _server.config['UPLOAD_FOLDER'] = 'uploads/'
        if not os.path.exists(_server.config['UPLOAD_FOLDER']):
                os.makedirs(_server.config['UPLOAD_FOLDER'])

        _server.run(debug=DEBUG)

        return True

def create_err(message: str) -> flask.Response:
        return flask.jsonify({"error": message})

@_server.route("/chats", methods=["GET", "POST"])
def chats_all():
        if flask.request.method == "GET":
                chats = dbms.select_all("chats")

                return flask.jsonify(chats), 200

        if flask.request.method == "POST":
                ok = dbms.insert_one("chats", flask.request.get_json())
                if not ok:
                        return create_err("unable to create chat"), 500

                return "", 200
                
@_server.route("/chats/<id>", methods=["GET", "PUT"])
def chats_one(id: str):
        if flask.request.method == "GET":
                chat = dbms.select_one("chats", where={"id": id})
                if chat is None:
                        return create_err("chat not found"), 500

                return flask.jsonify(chat), 200

        if flask.request.method == "PUT":
                json_data = flask.request.get_json()
                if json_data.get("id", "") != id:
                        return create_err("mismatched ids"), 500

                ok = dbms.update_one("chats", id, {"$set": json_data})
                if not ok:
                        return create_err("unable to update chat"), 500

                return "", 200

@_server.route("/chats/<id>/query", methods=["POST"])
def chats_query(id: str):
        # The proper way to do it. Not necessary for now...
        #chat = dbms.select_one("chats", where={"id": id})
        #if chat is None:
        #        return create_err("chat not found"), 500
        #
        #model = dbms.select_one("models", where={"id": chat["lang_model"]})
        #if model is None:
        #        return create_err("model not found"), 500

        message = flask.request.get_json().get("message", "")
        if message == "":
                return create_err("expected 'message' content, none found"), 500

        completion = _openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": message }
                ]
        )

        return flask.jsonify({"response": completion.choices[0].message}), 200

@_server.route("/users", methods=["GET", "POST"])
def users_all():
        if flask.request.method == "GET":
                users = dbms.select_all("users")

                return flask.jsonify(users), 200

        if flask.request.method == "POST":
                json_data = flask.request.get_json()

                password = json_data.get("password", "")
                if password == "":
                        return create_err("expected 'password' content, none found"), 500

                # Store only the hash of the password. Technically, the front-end should be doing this prior 
                # to sending the JSON data, but for the purposes of this project it doesn't matter.
                json_data["password"] = generate_password_hash(password)

                ok = dbms.insert_one("users", flask.request.get_json())
                if not ok:
                        return create_err("unable to create user"), 500

                return "", 200

@_server.route("/users/<id>", methods=["GET", "PUT"])
def users_one(id: str):
        if flask.request.method == "GET":
                user = dbms.select_one("users", where={"id": id})
                if user is None:
                        return create_err("user not found"), 500

                return flask.jsonify(user), 200

        if flask.request.method == "PUT":
                json_data = flask.request.get_json()
                if json_data.get("id", "") != id:
                        return create_err("mismatched ids"), 500

                ok = dbms.update_one("users", id, {"$set": json_data})
                if not ok:
                        return create_err("unable to update user"), 500

                return "", 200

@_server.route("/login", methods=["POST"])
def users_login():
        json_data = flask.request.get_json()

        username = json_data.get("username", "")
        if username == "":
                return create_err("expected 'username' content, none found"), 500

        password = json_data.get("password", "")
        if password == "":
                return create_err("expected 'password' content, none found"), 500

        user = dbms.select_one("users", where={"username": username})
        if user is None:
                return create_err("user not found"), 500

        password_check = check_password_hash(user["password"], password)
        if DEBUG:
                _logger.info(f"Stored password hash: {user["password"]}")
                _logger.info(f"Password received for login: {password}")
                _logger.info(f"Password check result: {password_check}")
        if not password_check:
                return create_err("invalid password"), 500

        flask.session["username"] = username

        return "", 200

@_server.route("/logout", methods=["POST"])
def users_logout():
        session.pop("username", None)

        return "", 200

@_server.route("/models/<id>", methods=["GET", "PUT"])
def models_one(id: str):
        if flask.request.method == "GET":
                model = dbms.select_one("models", where={"id": id})
                if model is None:
                        return create_err("model not found"), 500

                return flask.jsonify(model), 200

        if flask.request.method == "PUT":
                json_data = flask.request.get_json()
                if json_data.get("id", "") != id:
                        return create_err("mismatched ids"), 500

                ok = dbms.update_one("models", id, {"$set": json_data})
                if not ok:
                        return create_err("unable to update model"), 500

                return "", 200

@_server.route("/extract_text", methods=["POST"])
def extract_text():
    try:
        if 'file' not in flask.request.files:
            return flask.jsonify({'error': 'No file part'}), 400

        file = flask.request.files['file']

        if file.filename == '':
            return flask.jsonify({'error': 'No selected file'}), 400

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(_server.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            extracted_text = extract_text_from_image(file_path)

            return flask.jsonify({'extracted_text': extracted_text}), 200
    except Exception as ex:
        _logger.error(f"extract_text: {ex}")
        return create_err(ex), 500
    
@_server.route("/translate_text", methods=["POST"])
def translate_text():
    try:
        data = flask.request.get_json()
        if 'text' not in data or 'target_language' not in data:
            return flask.jsonify({'error': 'Invalid input'}), 400

        text = data['text']
        target_language = data['target_language']

        translated_text = google_translate_text(text, target_language)

        return flask.jsonify({'translated_text': translated_text}), 200
    except Exception as ex:
        _logger.error(f"translate_text: {ex}")
        return create_err(ex), 500

