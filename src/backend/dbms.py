# std:
import json
import logging
import os
import platform
from typing import Dict, List, Optional

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

def viable_connection() -> bool:
        try:
                _client.server_info()
        except ConnectionFailure:
                return False

        return True

def start_connection() -> bool:
        connection_commands = {
                "Darwin": "brew services start mongodb-community@7.0",
                "Linux": "sudo systemctl start mongodb",
                "Windows": "net start MongoDB"
        }

        connection_command = connection_commands.get(platform.system())
        if connection_command is not None:
                os.system(connection_command)

                return True

        return False

def close_connection() -> bool:
        disconnection_commands = {
                "Darwin": "brew services stop mongodb-community@7.0",
                "Linux": "sudo systemctl stop mongodb",
                "Windows": "net stop MongoDB"
        }

        disconnection_command = disconnection_commands.get(platform.system())
        if disconnection_command is not None:
                os.system(disconnection_command)

                return True

def create_collection(collection_name: str) -> bool:
        schema_name = f"{collection_name}.json"
        schema_path = os.path.join("schemas", schema_name)

        try:
                with open(schema_path, "r") as schema_file:
                        collection_schema = json.load(schema_file)

                        _samvad.create_collection(collection_name, validator={"$jsonSchema": collection_schema})
        except FileNotFoundError, json.JSONDecodeError:
                return False

        return True

def verify_collection(collection_name: str) -> bool:
        return collection_name in _samvad.list_collection_names()

def start() -> bool:
        if not viable_connection():
                _logger.warning("database connection not viable, creating connection")

                ok = start_connection()
                if not ok:
                        _logger.error("unable to start connection")

                        return False

        for collection_name in ["chats", "files", "users", "models"]:
                ok = verify_collection(collection_name)
                if ok:
                        continue

                ok = create_collection(collection_name)
                if not ok:
                        _logger.error(f"unable to create missing collection {collection_name}")

                        return False

        return True

def close():
        _client.close()

        ok = close_connection()
        if not ok:
                _logger.warning("unable to close connection")

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

def update_all(collection_name: str, ids: List[str], updates: List[Dict]) -> bool:
        # Check if the collection exists in the database.
        if collection_name not in _samvad.list_collection_names():
                return False

        # Check if all the associated records can be found.
        if len(select_ids(collection_name, ids)) != len(ids):
                return False

        # Generate filters as records' ids.
        filters = _.map_(ids, lambda id: {"id": id})

        try:
                for update, filter in zip(updates, filters):
                        _samvad[collection_name].update_many(filter, update)
        except WriteError:
                return False

        return True

def update_one(collection_name: str, id: str, update: Dict) -> bool:
        return update_all(collection_name, [id], [update])

