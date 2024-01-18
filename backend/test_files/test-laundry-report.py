import json

import pymysql
from flask import Flask, Response, request, session
from flask_cors import CORS

from Phase_3_working.backend.config import MYSQL_DB, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER, SECRET_KEY

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


@app.route("/laundry-center-report1/", methods=["GET"])
def laundry_center_report1():
    rows = []
    rows.append(
        {
        "entry": 1,
        "state": "CA",
        "common_washer_type": "front",
        "common_dryer_heat": "gas",
        })
    rows.append(
        {
        "entry": 2,
        "state": "GA",
        "common_washer_type": "top",
        "common_dryer_heat": "electric",
        })
    rows.append(
        {
        "entry": 3,
        "state": "TX",
        "common_washer_type": "front",
        "common_dryer_heat": "electric",
        })
    print(rows)

    ret = {"message": "Success", "data": rows}
    response = Response(json.dumps(ret), status=200)
    return response

@app.route("/laundry-center-report2/", methods=["GET"])
def laundry_center_report2():
    rows = []
    rows.append(
        {
        "entry": 1,
        "state": "CA",
        "washer_no_dryer": 100,
        })
    rows.append(
        {
        "entry": 2,
        "state": "GA",
        "washer_no_dryer": 36,
        })
    rows.append(
        {
        "entry": 3,
        "state": "TX",
        "washer_no_dryer": 12,
        })
    print(rows)

    ret = {"message": "Success", "data": rows}
    response = Response(json.dumps(ret), status=200)
    return response

if __name__ == "__main__":
    app.run(debug=True, port=8000)
