import json

import pymysql
from flask import Flask, Response, request, session
from flask_cors import CORS

from config import MYSQL_DB, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER, SECRET_KEY
from util import validate_types

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app)

db = pymysql.connect(
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    host=MYSQL_HOST,
    database=MYSQL_DB,
    autocommit=True,
)


@app.route("/test-appliance-listing/", methods=["GET"])
def test_appliance_listing():
    rows = []
    rows.append(
        {
        "appliance_entry": 1,
        "appliance_type": "Cooker",
        "manufacturer_name": "Kenmore",
        "model_name": "T1000"
        })
    rows.append(
        {
        "appliance_entry": 2,
        "appliance_type": "TV",
        "manufacturer_name": "Sony",
        "model_name": "LED4K"
        })
    print(rows)

    ret = {"message": "Success", "data": rows}
    response = Response(json.dumps(ret), status=200)
    return response

if __name__ == "__main__":
    app.run(debug=True, port=8000)
