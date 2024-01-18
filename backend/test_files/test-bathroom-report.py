import json

import pymysql
from flask import Flask, Response
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


@app.route("/bathroom-statistics-report/", methods=["GET"])
def bathroom_statistics_report():
    t = []
    t.append(
        {
        "entry": 1,
        "name": "Bathrooms",
        "min": "1.0",
        "avg": "1.3",
        "max": "5.0",
        })
    t.append(
        {
        "entry": 2,
        "name": "HalfBathrooms",
        "min": "0.0",
        "avg": "1.7",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 3,
        "name": "FullBathrooms",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 4,
        "name": "Commodes",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 5,
        "name": "Sinks",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 6,
        "name": "Bidets",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 7,
        "name": "Bathtubs",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 8,
        "name": "Showers",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    t.append(
        {
        "entry": 9,
        "name": "TubShowers",
        "min": "1.0",
        "avg": "2.1",
        "max": "2.0",
        })
    print(t)

    ret = {
        "message": "Success", 
        "data": { 
          "statTable": t,  # an array with uniq entry, name, min, avg, max (see t above)
          "state_most_bidets": "CA",
          "most_state_bidets": 50,
          "postal_most_bidets": "60601",
          "most_postal_bidets": 23,
          "single_primary_bathrooms": 4
        }
    }
    response = Response(json.dumps(ret), status=200)
    return response


if __name__ == "__main__":
    app.run(debug=True, port=8000)
