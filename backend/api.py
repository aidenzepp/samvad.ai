# std:
import io
import logging

# lib:
import flask
import pydash as _

# dep:
import dbms

#
# Variables
#

_logger = logging.getLogger(__name__)
_server = flask.Flask(__name__)

#
# Functions
#

def startup(bool debug = True):
        _logger.info("server: starting...")

        _server.run(debug=debug)

        _logger.info("server: startup complete")

def create_err(ex: Exception) -> flask.Response:
        return flask.jsonify({"error": str(ex)})

@server.route("/")
def index():
        return "Hello, World!"

@server.route("/chats", methods=["GET", "POST"])
def chats_all():
        if flask.request.method == "GET":
                try:
                        chats = dbms.select_all("chats")

                        _logger.info("server: GET /chats: success")

                        return flask.jsonify(chats), 200
                except Exception as ex:
                        _logger.error("server: GET /chats: failure")

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        ok = dbms.insert_one("chats", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create chat")

                        _logger.info("server: POST /chats: success")

                        return "", 200
                except Exception as ex:
                        _logger.error("server: POST /chats: failure")

                        return create_err(ex), 500

@server.route("/chats/<id>", methods=["GET", "PUT"])
def chats_one(id: str):
        if flask.request.method == "GET":
                try:
                        chat = dbms.select_one("chats", where={"id": id})
                        if chat is None:
                                raise Exception("chat not found")

                        _logger.info(f"server: GET /chats/{id}: success")

                        return flask.jsonify(chat), 200
                except Exception as ex:
                        _logger.error(f"server: GET /chats/{id}: failure")

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("chats", json_data)
                        if not ok:
                                raise Exception("unable to update chat")

                        _logger.info(f"server: PUT /chats/{id}: success")

                        return "", 200
                except Exception as ex:
                        _logger.error(f"server: PUT /chats/{id}: failure")

                        return create_err(ex), 500

@server.route("/files", methods=["GET", "POST"])
def files_all():
        if flask.request.method == "GET":
                try:
                        files = dbms.select_all("files", filter={"file_data": 0, "file_text": 0})

                        _logger.info("server: GET /files: success")

                        return flask.jsonify(files), 200
                except Exception as ex:
                        _logger.error("server: GET /files: failure")

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

                        # If applicable, create corresponding translation document here?

                        insert_data = json_data.update({
                                "file_data": file_data,
                                "file_text": file_text,
                        })
                        ok = dbms.insert_one("files", insert_data)
                        if not ok:
                                raise Exception("unable to create file")

                        _logger.info("server: POST /files: success")

                        return "", 200
                except Exception as ex:
                        _logger.error("server: POST /files: failure")

                        return create_err(ex), 500

@server.route("/files/<id>", methods=["GET", "PUT"])
def files_one(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", filter={"file_data": 0, "file_text": 0})
                        if file is None:
                                raise Exception("file not found")

                        _logger.info(f"server: GET /files/{id}: success")

                        return flask.jsonify(file), 200
                except Exception as ex:
                        _logger.error(f"server: GET /files/{id}: failure")

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        update_data = {
                                "$set": json_data,
                        }
                        ok = dbms.update_one("files", update_data)
                        if not ok:
                                raise Exception("unable to update file")

                        _logger.info(f"server: PUT /files/{id}: success")

                        return "", 200
                except Exception as ex:
                        _logger.error(f"server: PUT /files/{id}: failure")

                        return create_err(ex), 500

@server.route("/files/<id>/data", methods=["GET"])
def files_data(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", where={"id": id})
                        if file is None:
                                raise Exception("file not found")

                        _logger.info(f"server: GET /files/{id}/data: success")

                        return flask.send_file(
                                io.BytesIO(file["file_data"),
                                mimetype=file["file_type"],
                                download_name=file["file_name"],
                                as_attachment=False,
                        )
                except Exception as ex:
                        _logger.error(f"server: GET /files/{id}/data: failure")

                        return create_err(ex), 500
                
@server.route("/files/<id>/text", methods=["GET"])
def files_text(id: str):
        if flask.request.method == "GET":
                try:
                        file = dbms.select_one("files", where={"id": id})
                        if file is None:
                                raise Exception("file not found")
                        
                        _logger.info(f"server: GET /files/{id}/text: success")

                        return flask.jsonify({"file_text": file["file_text"]}), 200
                except Exception as ex:
                        _logger.error(f"server: GET /files/{id}/text: failure")

                        return create_err(ex), 500

@server.route("/users", methods=["GET", "POST"])
def users_all():
        if flask.request.method == "GET":
                try:
                        users = dbms.select_all("users")

                        _logger.info("server: GET /users: success")

                        return flask.jsonify(users), 200
                except Exception as ex:
                        _logger.error("server: GET /users: failure")

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        ok = dbms.insert_one("users", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create user")

                        _logger.info("server: POST /users: success")

                        return "", 200
                except Exception as ex:
                        _logger.error("server: POST /users: failure")

                        return create_err(ex), 500

@server.route("/users/<id>", methods=["GET", "PUT"])
def users_one(id: str):
        if flask.request.method == "GET":
                try:
                        user = dbms.select_one("users", where={"id": id})
                        if user is None:
                                raise Exception("user not found")

                        _logger.info(f"server: GET /users/{id}: success")

                        return flask.jsonify(user), 200
                except Exception as ex:
                        _logger.error(f"server: GET /users/{id}: failure")

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("users", json_data)
                        if not ok:
                                raise Exception("unable to update user")

                        _logger.info(f"server: PUT /users/{id}: success")

                        return "", 200
                except Exception as ex:
                        _logger.error(f"server: PUT /users/{id}: failure")

                        return create_err(ex), 500

@server.route("/models", methods=["GET", "POST"])
def models_all():
        if flask.request.method == "GET":
                try:
                        models = dbms.select_all("models")

                        _logger.info("server: GET /models: success")

                        return flask.jsonify(models), 200
                except Exception as ex:
                        _logger.error("server: GET /models: failure")

                        return create_err(ex), 500

        if flask.request.method == "POST":
                try:
                        ok = dbms.insert_one("models", flask.request.get_json())
                        if not ok:
                                raise Exception("unable to create model")

                        _logger.info("server: POST /models: success")

                        return "", 200
                except Exception as ex:
                        _logger.error("server: POST /models: failure")

                        return create_err(ex), 500


@server.route("/models/<id>", methods=["GET", "PUT"])
def models_one(id: str):
        if flask.request.method == "GET":
                try:
                        model = dbms.select_one("models", where={"id": id})
                        if model is None:
                                raise Exception("model not found")

                        _logger.info(f"server: GET /models/{id}: success")

                        return flask.jsonify(model), 200
                except Exception as ex:
                        _logger.error(f"server: GET /models/{id}: failure")

                        return create_err(ex), 500

        if flask.request.method == "PUT":
                try:
                        json_data = flask.request.get_json()
                        if json_data.get("id", "") != id:
                                raise Exception("mismatched ids")

                        ok = dbms.update_one("models", json_data)
                        if not ok:
                                raise Exception("unable to update model")

                        _logger.info(f"server: PUT /models/{id}: success")

                        return "", 200
                except Exception as ex:
                        _logger.error(f"server: PUT /models/{id}: failure")

                        return create_err(ex), 500

