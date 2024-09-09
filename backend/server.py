from flask import Flask, jsonify, request
from pymongo import MongoClient

server = Flask(__name__)
#client = MongoClient("mongodb://localhost:FIXME/")
#db = client.FIXME

@server.route("/")
def index():
        return "Hello, World!"

if __name__ == "__main__":
        server.run(debug=True)
