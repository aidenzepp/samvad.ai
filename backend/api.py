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
 
#
# Constants
#

DEBUG = True

#
# Variables
#
_logger = logging.getLogger(__name__)
_server = flask.Flask(__name__)
CORS(_server)


# *** TEMPORARY FILE UPLOAD FOR TESTING ***
_server.config['UPLOAD_FOLDER'] = 'uploads/'
if not os.path.exists(_server.config['UPLOAD_FOLDER']):
    os.makedirs(_server.config['UPLOAD_FOLDER'])
# Extraction Usage: curl -X POST -F 'file=@path/to/image.jpg' http://127.0.0.1:5000/extract_text
# Translation Usage: curl -X POST -H "Content-Type: application/json" -d '{"text": "extracted text", "target_language": "en"}' http://127.0.0.1:5000/translate_text


#
# Functions
#

def startup():
        _logger.info("server: starting...")

        _logger.info(f"server: DEBUG={DEBUG}")

        # Replace with a real secret key.
        _server.config["SECRET_KEY"] = "FIXME: secret_key"

        _server.run(debug=DEBUG)

        _logger.info("server: startup complete")

def create_err(ex: Exception) -> flask.Response:
        return flask.jsonify({"error": str(ex)})

def log_success(request, **kwargs):
        if DEBUG:
                _logger.info(f"server: {request.method} {flask.url_for(request.endpoint, **kwargs)}: success")

def log_failure(request, **kwargs):
        if DEBUG:
                _logger.error(f"server: {request.method} {flask.url_for(request.endpoint, **kwargs)}: failure")

@_server.route("/")
def index():
        return "Hello, World!"

@_server.route("/chats", methods=["GET", "POST"])
def chats_all():
        if flask.request.method == "GET":
                try:
                        chats = dbms.select_all("chats")

                        log_success(flask.request)

                        return flask.jsonify(chats), 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500
        if flask.request.method == "POST":
                try:
                        ok = dbms.insert_one("chats", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create chat")

                        log_success(flask.request)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

@_server.route("/chats/<id>", methods=["GET", "PUT"])
def chats_one(id: str):
        if flask.request.method == "GET":
                try:
                        chat = dbms.select_one("chats", where={"id": id})
                        if chat is None:
                                raise Exception("chat not found")

                        log_success(flask.request, id=id)

                        return flask.jsonify(chat), 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("chats", id, {"$set": json_data})
                        if not ok:
                                raise Exception("unable to update chat")

                        log_success(flask.request, id=id)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

@_server.route("/files", methods=["GET", "POST"])
def files_all():
        if flask.request.method == "GET":
                try:
                        files = dbms.select_all("files", filter={"file_data": 0, "file_text": 0})

                        log_success(flask.request)

                        return flask.jsonify(files), 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        if "json" not in flask.request.form:
                                raise Exception("expected \'json\' content, none found")

                        if "file" not in flask.request.files:
                                raise Exception("expected \'file\' content, none found")

                        json_data = json.loads(flask.request.form.get("json"))
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        file_data = flask.request.files.get("file").read()
                        if len(file_data) == 0:
                                raise Exception("no file data")

                        # TODO: Extract file text and set `"file_text"`.
                        file_text = ""

                        # Create corresponding translation document here?

                        # Join JSON data with the required file data and file text fields.
                        insert_data = json_data | {"file_data": file_data, "file_text": file_text}

                        ok = dbms.insert_one("files", insert_data)
                        if not ok:
                                raise Exception("unable to create file")

                        log_success(flask.request)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

@_server.route("/files/<id>", methods=["GET", "PUT"])
def files_one(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", filter={"file_data": 0, "file_text": 0})
                        if file is None:
                                raise Exception("file not found")

                        log_success(flask.request, id=id)

                        return flask.jsonify(file), 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("files", id, {"$set": json_data})
                        if not ok:
                                raise Exception("unable to update file")

                        log_success(flask.request, id=id)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

@_server.route("/files/<id>/translations", methods=["GET"])
def files_from(id: str):
        if flask.request.method == "GET":
                try:
                        files = dbms.select_all("files", where={"file_from": id})

                        log_success(flask.request, id=id)

                        return flask.jsonify(files), 200
                except Exception as ex:
                        log_success(flask.request, id=id)

                        return create_err(ex), 500

@_server.route("/files/<id>/data", methods=["GET"])
def files_data(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", where={"id": id})
                        if file is None:
                                raise Exception("file not found")

                        log_success(flask.request, id=id)

                        return flask.send_file(
                                io.BytesIO(file["file_data"]),
                                mimetype=file["file_type"],
                                download_name=file["file_name"],
                                as_attachment=False,
                        )
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500
                
@_server.route("/files/<id>/text", methods=["GET"])
def files_text(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", where={"id": id})
                        if file is None:
                                raise Exception("file not found")
                        
                        log_success(flask.request, id=id)

                        # Send file instead?
                        return flask.jsonify({"file_text": file["file_text"]}), 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

@_server.route("/users", methods=["GET", "POST"])
def users_all():
        if flask.request.method == "GET":
                try:
                        users = dbms.select_all("users")

                        log_success(flask.request)

                        return flask.jsonify(users), 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        json_data = flask.request.get_json()

                        password = json_data.get("password", "")
                        if password == "":
                                raise Exception("expected password, none found")

                        # Store only the hash of the password. Technically, the front-end should be doing this prior 
                        # to sending the JSON data, but for the purposes of this project it doesn't matter.
                        json_data["password"] = generate_password_hash(password)

                        ok = dbms.insert_one("users", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create user")

                        log_success(flask.request)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

@_server.route("/users/<id>", methods=["GET", "PUT"])
def users_one(id: str):
        if flask.request.method == "GET":
                try:
                        user = dbms.select_one("users", where={"id": id})
                        if user is None:
                                raise Exception("user not found")

                        log_success(flask.request, id=id)

                        return flask.jsonify(user), 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("users", id, {"$set": json_data})
                        if not ok:
                                raise Exception("unable to update user")

                        log_success(flask.request, id=id)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

@_server.route("/login", methods=["POST"])
def users_login():
        if flask.request.method == "POST":
                try:
                        json_data = flask.request.get_json()

                        id = json_data.get("id", "")
                        if id == "":
                                raise Exception("expected id, found none")

                        username = json_data.get("username", "")
                        if username == "":
                                raise Exception("expected username, found none")

                        password = json_data.get("password", "")
                        if password == "":
                                raise Exception("expected password, found none")

                        user = dbms.select_one("users", where={"id": id})
                        if user is None:
                                raise Exception("user not found")

                        if not check_password_hash(user["password"], password):
                                raise Exception("invalid password")

                        flask.session["username"] = username
                        log_success(flask.request)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

@_server.route("/logout", methods=["POST"])
def users_logout():
        if flask.request.method == "POST":
                flask.session.pop("username", None)

                log_success(flask.request)

                return "", 200
                        
@_server.route("/models", methods=["GET", "POST"])
def models_all():
        if flask.request.method == "GET":
                try:
                        models = dbms.select_all("models")

                        log_success(flask.request)

                        return flask.jsonify(models), 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        ok = dbms.insert_one("models", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create model")

                        log_success(flask.request)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request)

                        return create_err(ex), 500


@_server.route("/models/<id>", methods=["GET", "PUT"])
def models_one(id: str):
        if flask.request.method == "GET":
                try:
                        model = dbms.select_one("models", where={"id": id})
                        if model is None:
                                raise Exception("model not found")

                        log_success(flask.request, id=id)

                        return flask.jsonify(model), 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("models", id, {"$set": json_data})
                        if not ok:
                                raise Exception("unable to update model")

                        log_success(flask.request, id=id)

                        return "", 200
                except Exception as ex:
                        log_failure(flask.request, id=id)

                        return create_err(ex), 500
                

@_server.route('/register', methods=['POST'])
def register():
    try:
        # Get data from request
        data = flask.request.json
        
        # Generate a UUID for the new user
        data["id"] = str(uuid.uuid4())  # Add an ID field
        
        # Example validation
        if not all(k in data for k in ("id", "username", "password")):
            return flask.jsonify({"error": "Missing required fields"}), 400
        
        # Insert into the database
        success = dbms.insert_one("users", data)
        
        if not success:
            return flask.jsonify({"error": "Failed to register user"}), 500

        return flask.jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        _logger.error(f"Error during registration: {str(e)}")
        return flask.jsonify({"error": "Internal server error"}), 500



                
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



