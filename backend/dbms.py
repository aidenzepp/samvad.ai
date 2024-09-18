# std:
import datetime
import json
import logging
import os
import platform
from typing import Dict, List, Optional
import uuid

# lib:
import pydash as _
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, WriteError

#
# Variables
#

_logger = logging.getLogger(__name__)
_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
_samvad = _client["samvad"]

#
# Functions
#

def startup():
        _logger.info("startup: starting...")

        _logger.info("startup: checking for viable database connection")
        if not connectable():
                _logger.warning("startup: database connection NOT viable")
                _logger.info("startup: attempting to make a new database connection")

                system = platform.system()
                if system == "Darwin":
                        _logger.info("startup: starting mongodb using homebrew on mac os")

                        os.system("brew services start mongodb-community@7.0")
                elif system == "Linux":
                        _logger.info("startup: starting mongodb on linux")

                        os.system("sudo systemctl start mongodb")
                elif system == "Windows":
                        _logger.info("startup: starting mongodb on windows")

                        os.system("net start MongoDB")
                else:
                        raise Exception(f"unsupported operating system: {system}")

        _logger.info("startup: verifying database structure")
        existing_collection_names = _samvad.list_collection_names()
        required_collection_names = ["chats", "files", "users", "models"]

        # Check for required collections; if one doesn't exist, create it.
        for collection_name in required_collection_names:
                if collection_name in existing_collection_names:
                        continue

                _logger.info(f"startup: required collection not found, creating collection: {collection_name}")
                schema_name = f"{collection_name}.json"
                schema_path = os.path.join("schemas", schema_name)
               
                try:
                        _logger.info(f"startup: searching for collection schema file: {schema_name}")
                        with open(schema_path, "r") as schema_file:
                                collection_schema = json.load(schema_file)
                except FileNotFoundError:
                        _logger.error(f"startup: schema file not found for collection: {collection_name}")

                        raise Exception(f"schema file not found: {schema_path}")
                except json.JSONDecodeError:
                        _logger.error(f"startup: failed to parse schema file for collection: {collection_name}")

                        raise Exception(f"schema file is not a valid JSON file: {schema_path}")

                _samvad.create_collection(collection_name, validator={"$jsonSchema": collection_schema})

        _logger.info("startup: complete")

def cleanup():
        _logger.info("cleanup: starting...")

        # Close the mongodb client.
        _client.close()

        # Stop the mongodb process.
        system = platform.system()
        if system == "Darwin":
                _logger.info("cleanup: stopping mongodb using homebrew on mac os")

                os.system("brew services stop mongodb-community@7.0")
        elif system == "Linux":
                _logger.info("cleanup: stopping mongodb on linux")

                os.system("sudo systemctl stop mongodb")
        elif system == "Windows":
                _logger.info("cleanup: stopping mongodb on windows")

                os.system("net stop MongoDB")
        else:
                raise Exception(f"unsupported operating system: {system}")

        _logger.info("cleanup: complete")

def connectable() -> bool:
        try:
                _client.server_info()
                return True
        except ConnectionFailure:
                return False

def sample():
        _logger.info("sample: starting...")

        if False:
                _logger.info("sample: dropping collections")
                for collection_name in _samvad.list_collection_names():
                        _samvad[collection_name].drop()

        if True:
                _logger.info("sample: deleting collections\' contents")
                for collection_name in _samvad.list_collection_names():
                        _samvad[collection_name].delete_many({})

        if False:
                _logger.info("sample: printing collection names")
                for collection_name in _samvad.list_collection_names():
                        _logger.info(f"\tcollection name: {collection_name}")

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
        file_data = {
                "id": str(uuid.uuid4()),
                "file_name": "document.pdf",
                "file_type": "application/pdf",
                "file_data": b"binary content of the file",
                "languages": ["English", "Spanish"]
        }
        user_data = {
                "id": str(uuid.uuid4()),
                "username": "test_user",
                "password": "hashed_password"
        }
        model_data = {
                "id": str(uuid.uuid4()),
                "model_name": "gpt-3"
        }

        # Insert data into each collection
        _logger.info("sample: inserting example data into collections")
        collection_pairs = {
                "chats": chat_data,
                "files": file_data,
                "users": user_data,
                "models": model_data,
        }
        for collection_name, collection_data in collection_pairs.items():
                ok = insert_one(collection_name, collection_data)
                if not ok:
                        raise Exception(f"unable to insert record into {collection_name}")

        for collection_name in _samvad.list_collection_names():
                _logger.info(f"sample: printing contents of \'{collection_name}\' collection")

                for record in select_all(collection_name):
                        print(json.dumps(record, indent=4, default=str))

        _logger.info("sample: complete")

def select_all(collection_name: str, where: Optional[Dict] = None, filter: Optional[Dict] = None) -> List[Dict]:
        # Check if the collection exists in the database.
        if collection_name not in _samvad.list_collection_names():
                return []

        # Ensure the `where` is set.
        where = where or {}

        # Ensure the omission of the `"_id"` field.
        filter = _.defaults(filter or {}, {"_id": 0})

        return list(_samvad[collection_name].find(where, filter))

def select_one(collection_name: str, where: Optional[Dict] = None, filter: Optional[Dict] = None) -> Optional[Dict]:
        return _.head(select_all(collection_name, where=where, filter=filter))

def select_ids(collection_name: str, ids: List[str], where: Optional[Dict] = None, filter: Optional[Dict] = None) -> List[Dict]:
        # Ensure the inclusion of the `"id"` check.
        where = _.defaults(where or {}, {"id": {"$in": ids}})

        return select_all(collection_name, where=where, filter=filter)

def insert_all(collection_name: str, records: List[Dict]) -> bool:
        # Check if the collection exists in the database.
        if collection_name not in _samvad.list_collection_names():
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
                _samvad[collection_name].insert_many(records)
        except WriteError:
                return False

        return True

def insert_one(collection_name: str, record: Dict) -> bool:
        return insert_all(collection_name, [record])

def update_all(collection_name: str, records: List[Dict], filters: Optional[List[Dict]] = None) -> bool:
        # Check if the collection exists in the database.
        if collection_name not in _samvad.list_collection_names():
                return False

        # If a record doesn't contain an `"id"` field, it's not a valid schema anyways.
        try:
                ids = _.map_(records, lambda record: record["id"])
        except KeyError:
                return False

        # Check if all the associated records can be found.
        if len(select_ids(collection_name, ids)) != len(ids):
                return False

        # Generate filters as records' ids, if `filters` isn't set.
        filters = filters or _.map_(ids, lambda id: {"id": id})

        try:
                for record, filter in zip(records, filters):
                        _samvad[collection_name].update_many(filter, {"$set": record})
        except WriteError:
                return False

        return True

def update_one(collection_name: str, record: Dict, filter: Optional[Dict] = None) -> bool:
        # Create `filters` list if applicable.
        filters = [filter] if filter is not None else None

        return update_all(collection_name, [record], filters=filters)

