import json

import pymysql
from flask import Flask, Response, session
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


@app.route("/household-averages-report/", methods=["GET"])
def householdAverages():
    reportTable = []
    # generate report data
    #    first element is entry, which is needed for the gui
    reportTable.append((1,"Average number of bathrooms per household", 1.0))
    reportTable.append((2,"Average number of bedrooms per household", 2.0))
    reportTable.append((3,"Average number of occupants per household", 3.0))
    reportTable.append((4,"Ratio of commodes to occupants per household", "1:2.5"))
    reportTable.append((5,"Average number of appliances per household", 5.2))
    reportTable.append((6,"Most common heat source for all appliances", "gas"))
    ret = {
        "message": "Success", 
        "data": reportTable,
        "postal": "60606",  #optional
        "radius": 50        #optional
    }
    response = Response(json.dumps(ret), status=200)
    return response


if __name__ == "__main__":
    app.run(debug=True, port=8000)
