# std:
import io
import logging

# lib:
import flask
import pydash as _

# dep:
import dbms

#
# Constants
#

DEBUG = True

#
# Variables
#

_logger = logging.getLogger(__name__)
_server = flask.Flask(__name__)

#
# Functions
#

def startup():
        _logger.info("server: starting...")

        _logger.info(f"server: DEBUG={DEBUG}")

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

