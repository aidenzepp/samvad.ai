from flask import Flask, Response, jsonify, request, send_file
from pymongo import MongoClient
from typing import List, Dict, Optional
from io import BytesIO
import json
import uuid
import datetime
import logging

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

client = MongoClient("mongodb://localhost:27017/")
db = client["samvad"]

def startup():
        logging.info("startup: starting...")

        # Variables needed to verify database structure.
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
                        logging.info(f"startup: creating collection: {collection_name}")
                        db.create_collection(collection_name, validator={ "$jsonSchema": collection_schema })

        logging.info("startup: complete")

def cleanup():
        logging.info("cleanup: starting...")

        client.close()

        logging.info("cleanup: complete")

def run():
        logging.info("run: starting...")

        db = client["samvad"]

        if True:
                logging.debug("run: dropping collections")
                for collection_name in db.list_collection_names():
                        db[collection_name].drop()

        if True:
                logging.debug("run: deleting collections\' contents")
                for collection_name in db.list_collection_names():
                        db[collection_name].delete_many({})

        logging.debug("run: printing collection names")
        for collection_name in db.list_collection_names():
                logging.debug(f"\tcollection name: {collection_name}")

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
        logging.debug("run: inserting example data into collections")
        db["chats"].insert_one(chat_data)
        db["users"].insert_one(user_data)
        db["files"].insert_one(file_data)
        db["models"].insert_one(model_data)

        # Print the contents of each collection
        logging.debug("run: printing contents of \'chat\' collection")
        for chat in db["chats"].find():
                print(json.dumps(chat, indent=4, default=str))

        logging.debug("run: printing contents of \'users\' collection")
        for user in db["users"].find():
                print(json.dumps(user, indent=4, default=str))

        logging.debug("run: printing contents of \'files\' collection")
        for file in db["files"].find():
                print(json.dumps(file, indent=4, default=str))

        logging.debug("run: printing contents of \'models\' collection")
        for model in db["models"].find():
                print(json.dumps(model, indent=4, default=str))

        logging.info("run: complete")

def select_all(collection_name: str, filter: Dict = {}) -> List[Dict]:
        # Check if the collection exists in the database.
        if collection_name not in db.list_collection_names():
                return []

        # Ensure the omission of the `"_id"` field.
        filter["_id"] = 0

        return list(db[collection_name].find({}, filter))

def select_one(collection_name: str, id: str, filter: Dict = {}) -> Optional[Dict]:
        # Check if the collection exists in the database.
        if collection_name not in db.list_collection_names():
                return None

        # Ensure the omission of the `"_id"` field.
        filter["_id"] = 0

        return db[collection_name].find_one({"id": id}, filter)


def select_ids(collection_name: str, ids: List[str], filter: Dict = {}) -> List[Dict]:
        # Check if the collection exists in the database.
        if collection_name not in db.list_collection_names():
                return []

        # Ensure the omission of the `"_id"` field.
        filter["_id"] = 0

        return list(db[collection_name].find({"id": {"$in": ids}}, filter))

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

@server.route("/files", methods=["GET"])
def files_all():
        try:
                files = select_all("files", filter={"file_data": 0})
                logging.info("server: GET /files: success")

                return jsonify(files), 200
        except Exception as ex:
                logging.error("server: GET /files: failure")

                return create_err(ex), 500

@server.route("/files/<id>/download", methods=["GET"])
def files_bin(id: str):
        try:
                file = select_one("files", id)
                if file != None:
                        logging.info(f"server: GET /files/{id}/download: success")
                        file_data = BytesIO(file["file_data"])

                        return send_file(
                                file_data,
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

@server.route("/models", methods=["GET"])
def models_all():
        try:
                models = select_all("models")
                logging.info("server: GET /models: success")

                return jsonify(models), 200
        except Exception as ex:
                logging.error("server: GET /models: failure")

                return create_err(ex), 500

def main():
        logging.info("main: starting...")

        logging.info("main: starting database")
        try:
                startup()
        except Exception as e:
                logging.error(f"main: an error occurred: {e}")
                return

        logging.info("main: running test data")
        run()

        # Server?...
        logging.info("main: starting server")
        server.run(debug=True)

        logging.info("main: starting cleanup processes")
        cleanup()

        logging.info("main: complete")

if __name__ == "__main__":
        main()
         
