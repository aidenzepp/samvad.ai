from flask import Flask, Response, jsonify, request, send_file
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, WriteError
from typing import List, Dict, Optional
from io import BytesIO
import os
import json
import uuid
import datetime
import logging
import pydash as _

# Define logging:
logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        )

# Define schemas:
chats_schema = {
        "bsonType": "object",
        "required": [
                "id",
                "user_group", 
                "file_group",
                "lang_model",
                "created_at",
                "created_by",
                "updated_at",
                "updated_by"
        ],
        "properties": {
                "id": {"bsonType": "string", "description": "must be a UUID"},
                "user_group": {
                        "bsonType": "array",
                        "items": {"bsonType": "string", "description": "must be UUID"},
                        "description": "List of users involved (UUIDs)"
                },
                "file_group": {
                        "bsonType": "array",
                        "items": {"bsonType": "string", "description": "must be UUID"},
                        "description": "List of files involved (UUIDs)"
                },
                "lang_model": {"bsonType": "string", "description": "must be UUID"},
                "created_at": {"bsonType": "date", "description": "must be a DateTime"},
                "created_by": {"bsonType": "string", "description": "must be UUID"},
                "updated_at": {"bsonType": "date", "description": "must be a DateTime"},
                "updated_by": {"bsonType": "string", "description": "must be UUID"}
        }
}

users_schema = {
        "bsonType": "object",
        "required": ["id", "username", "password"],
        "properties": {
                "id": {"bsonType": "string", "description": "must be a UUID"},
                "username": {"bsonType": "string", "description": "must be a string"},
                "password": {"bsonType": "string", "description": "must be a string"}
        }
}

files_schema = {
        "bsonType": "object",
        "required": ["id", "file_name", "file_type", "file_data", "languages"],
        "properties": {
                "id": {"bsonType": "string", "description": "must be a UUID"},
                "file_name": {"bsonType": "string", "description": "must be a string"},
                "file_type": {"bsonType": "string", "description": "must be a string"},
                "file_data": {"bsonType": "binData", "description": "must be binary file data"},
                "languages": {
                        "bsonType": "array",
                        "items": {"bsonType": "string", "description": "must be strings representing languages"},
                        "description": "List of languages detected"
                }
        }
}

models_schema = {
        "bsonType": "object",
        "required": ["id", "model_name"],
        "properties": {
                "id": {"bsonType": "string", "description": "must be a UUID"},
                "model_name": {"bsonType": "string", "description": "must be a string"}
        }
}

#
# Database
#

client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
db = client["samvad"]

def startup():
        logging.info("startup: starting...")

        logging.info("startup: checking for viable database connection")
        if not connectable():
                logging.warning("startup: database connection NOT viable")
                logging.info("startup: attempting to make a new database connection")
                os.system("brew services start mongodb-community@7.0")

        logging.info("startup: verifying database structure")
        existing_collection_names = db.list_collection_names()
        required_collection_pairs = {
                "chats": chats_schema,
                "users": users_schema,
                "files": files_schema,
                "models": models_schema,
        }

        # Check for required collections; if one doesn't exist, create it.
        for collection_name, collection_schema in required_collection_pairs.items():
                if collection_name not in existing_collection_names:
                        logging.info(f"startup: required collection not found, creating collection: {collection_name}")
                        db.create_collection(collection_name, validator={"$jsonSchema": collection_schema})

        logging.info("startup: complete")

def cleanup():
        logging.info("cleanup: starting...")

        # Close the mongodb client.
        client.close()

        # Stop the mongodb process.
        os.system("brew services stop mongodb-community@7.0")

        logging.info("cleanup: complete")

def connectable() -> bool:
        try:
                client.server_info()
                return True
        except ConnectionFailure:
                return False

def sample():
        logging.info("sample: starting...")

        if True:
                logging.info("sample: dropping collections")
                for collection_name in db.list_collection_names():
                        db[collection_name].drop()

        if True:
                logging.info("sample: deleting collections\' contents")
                for collection_name in db.list_collection_names():
                        db[collection_name].delete_many({})

        logging.info("sample: printing collection names")
        for collection_name in db.list_collection_names():
                logging.info(f"\tcollection name: {collection_name}")

        # Sample data for each collection
        chat_data = {
                "id": str(uuid.uuid4()),
                "user_group": [str(uuid.uuid4()), str(uuid.uuid4())],
                "file_group": [str(uuid.uuid4())],
                "lang_model": str(uuid.uuid4()),
                "created_at": datetime.datetime.now(),
                "created_by": str(uuid.uuid4()),
                "updated_at": datetime.datetime.now(),
                "updated_by": str(uuid.uuid4())
        }
        user_data = {
                "id": str(uuid.uuid4()),
                "username": "test_user",
                "password": "hashed_password"
        }
        file_data = {
                "id": str(uuid.uuid4()),
                "file_name": "document.pdf",
                "file_type": "application/pdf",
                "file_data": b"binary content of the file",
                "languages": ["English", "Spanish"]
        }
        model_data = {
                "id": str(uuid.uuid4()),
                "model_name": "gpt-3"
        }

        # Insert data into each collection
        logging.info("sample: inserting example data into collections")
        insert_one("chats", chat_data)
        insert_one("files", file_data)
        insert_one("users", user_data)
        insert_one("models", model_data)

        # Print the contents of each collection
        logging.info("sample: printing contents of \'chat\' collection")
        for chat in select_all("chat"):
                print(json.dumps(chat, indent=4, default=str))

        logging.info("sample: printing contents of \'files\' collection")
        for file in select_all("files"):
                print(json.dumps(file, indent=4, default=str))

        logging.info("sample: printing contents of \'users\' collection")
        for user in select_all("users"):
                print(json.dumps(user, indent=4, default=str))

        logging.info("sample: printing contents of \'models\' collection")
        for model in select_all("models"):
                print(json.dumps(model, indent=4, default=str))

        logging.info("sample: complete")

def select_all(collection_name: str, where: Optional[Dict] = None, filter: Optional[Dict] = None) -> List[Dict]:
        # Check if the collection exists in the database.
        if collection_names not in db.list_collection_names():
                return []

        # Ensure the `where` is set.
        where = where or {}

        # Ensure the omission of the `"_id"` field.
        filter = _.defaults(filter or {}, {"_id": 0})

        return list(db[collection_name].find(where, filter))

def select_one(collection_name: str, where: Optional[Dict] = None, filter: Optional[Dict] = None) -> Optional[Dict]:
        return _.head(select_all(collection_name, where=where, filter=filter))

def select_ids(collection_name: str, ids: List[str], filter: Optional[Dict] = None) -> List[Dict]:
        return select_all(collection_name, where={"id": {"$in": ids}}, filter=filter)

def insert_all(collection_name: str, records: List[Dict]) -> bool:
        # Check if the collection exists in the database.
        if collection_names not in db.list_collection_names():
                return False

        # If a record doesn't contain an `"id"` field, it's not a valid schema anyways.
        try:
                ids = _.map_(records, lambda record: record["id"])
        except KeyError:
                return False

        # Check if any records in the database already have the same `"id"` values.
        if select_ids(collection_name, ids) != []:
                return False

        try:
                db[collection_name].insert_many(records)
        except WriteError:
                return False

        return True


def insert_one(collection_name: str, record: Dict) -> bool:
        return insert_all(collection_name, [record])

def update_all(collection_name: str, records: List[Dict], filters: Optional[List[Dict]] = None) -> bool:
        # Check if the collection exists in the database.
        if collection_names not in db.list_collection_names():
                return False

        # If a record doesn't contain an `"id"` field, it's not a valid schema anyways.
        try:
                ids = _.map_(records, lambda record: record["id"])
        except KeyError:
                return False

        # Generate filters as records' ids, if `filters` isn't set.
        filters = filters or _.map_(ids, lambda id: {"id": id})

        try:
                for record, filter in zip(records, filters):
                        db[collection_names].update_many(filter, {"$set": record})
        except WriteError:
                return False

        return True

def update_one(collection_name: str, record: Dict, filter: Optional[Dict] = None) -> bool:
        # Create `filters` list if applicable.
        filters = [filter] if filter is not None else None

        return update_all(collection_name, [record], filters=filters)

#
# Server
#

server = Flask(__name__)

def create_err(ex: Exception) -> Response:
        return jsonify({"error": str(ex)})

@server.route("/")
def index():
        return "Hello, World!"

@server.route("/chats", methods=["GET"])
def chats_all():
        try:
                chats = select_all("chats")
                logging.info("server: GET /chats: success")

                return jsonify(chats), 200
        except Exception as ex:
                logging.error("server: GET /chats: failure")

                return create_err(ex), 500

@server.route("/chats/<id>", methods=["GET"])
def chats_one(id: str):
        try:
                chat = select_one("chats", where={"id": id})
                if chat is not None:
                        logging.info(f"server: GET /chats/{id}: success")

                        return jsonify(chat), 200

                raise Exception("chat not found")
        except Exception as ex:
                logging.error(f"server: GET /chats/{id}: failure")

                return create_err(ex), 500

@server.route("/files", methods=["GET"])
def files_all():
        try:
                files = select_all("files", filter={"file_data": 0})
                logging.info("server: GET /files: success")

                return jsonify(files), 200
        except Exception as ex:
                logging.error("server: GET /files: failure")

                return create_err(ex), 500

@server.route("/files/<id>", methods=["GET"])
def files_one(id: str):
        try:
                file = select_one("files", where={"id": id}, filter={"file_data": 0})
                if file is not None:
                        logging.info(f"server: GET /files/{id}: success")

                        return jsonify(file), 200

                raise Exception("file not found")
        except Exception as ex:
                logging.error(f"server: GET /files/{id}: failure")

                return create_err(ex), 500

@server.route("/files/<id>/download", methods=["GET"])
def files_bin(id: str):
        try:
                file = select_one("files", where={"id": id})
                if file is not None:
                        logging.info(f"server: GET /files/{id}/download: success")

                        return send_file(
                                BytesIO(file["file_data"])
                                mimetype=file["file_type"],
                                download_name=file["file_name"],
                                as_attachment=False,
                        )

                raise Exception("file not found")
        except Exception as ex:
                logging.error(f"server: GET /files/{id}/download: failure")

                return create_err(ex), 500

@server.route("/users", methods=["GET"])
def users_all():
        try:
                users = select_all("users")
                logging.info("server: GET /users: success")

                return jsonify(users), 200
        except Exception as ex:
                logging.error("server: GET /users: failure")

                return create_err(ex), 500

@server.route("/users/<id>", methods=["GET"])
def users_one(id: str):
        try:
                user = select_one("users", where={"id": id})
                if user is not None:
                        logging.info(f"server: GET /users/{id}: success")

                        return jsonify(user), 200

                raise Exception("user not found")
        except Exception as ex:
                logging.error(f"server: GET /users/{id}: failure")

                return create_err(ex), 500

@server.route("/models", methods=["GET"])
def models_all():
        try:
                models = select_all("models")
                logging.info("server: GET /models: success")

                return jsonify(models), 200
        except Exception as ex:
                logging.error("server: GET /models: failure")

                return create_err(ex), 500

@server.route("/models/<id>", methods=["GET"])
def models_one(id: str):
        try:
                model = select_one("models", where={"id": id})
                if model is not None:
                        logging.info(f"server: GET /models/{id}: success")

                        return jsonify(model), 200

                raise Exception("model not found")
        except Exception as ex:
                logging.error(f"server: GET /models/{id}: failure")

                return create_err(ex), 500

def main():
        logging.info("main: starting...")

        logging.info("main: starting database")
        try:
                startup()
        except Exception as e:
                logging.error(f"main: an error occurred: {e}")
                return

        logging.info("main: creating sample data")
        sample()

        logging.info("main: starting server")
        server.run(debug=True)

        logging.info("main: starting cleanup processes")
        cleanup()

        logging.info("main: complete")

if __name__ == "__main__":
        main()
         
