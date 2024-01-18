import json

import pymysql
from flask import Flask, Response, request
from flask_cors import CORS

from config import MYSQL_DB, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER, SECRET_KEY
from util import (
    insert_cooktop,
    insert_dryer,
    insert_fridge_freezer,
    insert_oven,
    insert_tv,
    insert_washer,
    validate_types,
    run_query,
    run_query_part,
)

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


@app.route("/verify-email/", methods=["POST"])
def verify_email():
    email = request.json["email"]
    ret = {"message": str(), "email": str()}
    message = validate_types({"str": [email]})
    if message is not None:
        ret["message"] = message
        response = Response(json.dumps(ret), status=400)
        return response

    email_domain = email.split("@")
    if len(email_domain) != 2:
        ret["message"] = "Incorrect email format!"
        response = Response(json.dumps(ret), status=400)
        return response
    elif not email_domain[0] or not email_domain[1] or "." not in email_domain[1]:
        ret["message"] = "Incorrect email format!"
        response = Response(json.dumps(ret), status=400)
        return response

    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT email FROM household WHERE household.email='{email}'"""
        )
        results = cursor.fetchone()
    except:
        ret["message"] = "Unable to read household email from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None:
            ret.update({"message": "Success", "email": email})
            response = Response(json.dumps(ret), status=200)
        else:
            ret[
                "message"
            ] = f"Household with email {email} already exists in the database!"
            response = Response(json.dumps(ret), status=400)
    finally:
        cursor.close()

    return response


@app.route("/verify-postal/", methods=["POST"])
def verify_postal():
    postal_code = request.json["postal_code"]
    ret = {"message": str()}
    message = validate_types({"int": [postal_code]})
    if message is not None:
        ret["message"] = message
        response = Response(json.dumps(ret), status=400)
        return response

    if len(postal_code) != 5:
        ret["message"] = "Postal code is incorrect length!"
        response = Response(json.dumps(ret), status=400)
        return response
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT zip, city, state FROM postalcodes WHERE postalcodes.zip='{postal_code}'"""
        )
        results = cursor.fetchone()
    except:
        ret["message"] = f"Unable to read PostalCodes details from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None:
            ret["message"] = "Postal code provided missing from database"
            response = Response(json.dumps(ret), status=400)
        else:
            ret.update(
                {
                    "zip": results[0],
                    "city": results[1],
                    "state": results[2],
                    "message": "Success",
                }
            )
            response = Response(json.dumps(ret), status=200)
    finally:
        cursor.close()
    return response


@app.route("/add-phone/", methods=["POST"])
def verify_phone():
    area_code = request.json["area_code"]
    phone_number = request.json["phone_number"]
    phone_type = request.json["phone_type"]
    ret = {
        "message": str(),
        "area_code": int(),
        "phone_number": int(),
        "phone_type": str(),
    }

    if isinstance(phone_number, str):
        if "-" in phone_number:
            if phone_number.count("-") == 1:
                phone_number = phone_number.replace("-", "")
            else:
                ret["message"] = "Incorrect phone number format!"
                response = Response(json.dumps(ret), status=400)
                return response

    message = validate_types({"int": [area_code, phone_number], "str": [phone_type]})
    if message is not None:
        ret["message"] = message
        response = Response(json.dumps(ret), status=400)
        return response

    if len(area_code) != 3:
        ret["message"] = "Incorrect area code length!"
        response = Response(json.dumps(ret), status=400)
        return response
    if len(phone_number) != 7:
        ret["message"] = "Incorrect phone number length!"
        response = Response(json.dumps(ret), status=400)
        return response
    if phone_type not in ["home", "mobile", "work", "other"]:
        ret["message"] = "Invalid phone type input!"
        response = Response(json.dumps(ret), status=400)
        return response
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT area_code, phone_number FROM phone 
            WHERE phone.area_code='{area_code}' 
            AND phone.phone_number='{phone_number}';"""
        )
        results = cursor.fetchone()
    except:
        ret["message"] = "Unable to read phone details from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None:
            ret.update(
                {
                    "area_code": area_code,
                    "phone_number": phone_number,
                    "phone_type": phone_type,
                    "message": "Success",
                }
            )
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Phone number already exists in the database!"
            response = Response(json.dumps(ret), status=400)
    finally:
        cursor.close()
    return response


@app.route("/add-house-info/", methods=["POST"])
def add_house_info():
    household_type = request.json["household_type"]
    square_footage = request.json["square_footage"]
    occupants = request.json["occupants"]
    num_bedrooms = request.json["num_bedrooms"]
    email = request.json["email"]
    postal_zip = request.json["postal_zip"]
    area_code = request.json["area_code"]
    phone_number = request.json["phone_number"]
    phone_type = request.json["phone_type"]

    ret = {"message": str()}

    message = validate_types(
        {
            "int": [
                square_footage,
                occupants,
                num_bedrooms,
                postal_zip
            ],
            "str": [household_type, email],
        }
    )
    if message is not None:
        ret["message"] = message
        response = Response(json.dumps(ret), status=400)
        return response

    if household_type.lower() not in [
        "house",
        "apartment",
        "townhome",
        "condominium",
        "mobile home",
    ]:
        ret["message"] = "Invalid household type!"
        response = Response(json.dumps(ret), status=400)
        return response

    if int(square_footage) <= 0 or int(occupants) <= 0 or int(num_bedrooms) <= 0:
        ret["message"] = "Inputs cannot be zero!"
        response = Response(json.dumps(ret), status=400)
        return response

    try:
        cursor = db.cursor()
        cursor.execute(
            f"""INSERT INTO household (email, household_type, 
                occupants, square_footage, num_bedrooms, postal_zip) 
            VALUES ('{email}', '{household_type}', '{occupants}', '{square_footage}', '{num_bedrooms}', '{postal_zip}');"""
        )
        if area_code and phone_number and phone_type:
            cursor.execute(
                f"""INSERT INTO phone (email, area_code, phone_number, phone_type)  
                VALUES ('{email}', '{area_code}', '{phone_number}', '{phone_type}');"""
            )
        ret["message"] = "Household details successfully added to database"
        response = Response(json.dumps(ret), status=200)
    except:
        ret["message"] = "Unable to add household details to database"
        response = Response(json.dumps(ret), status=400)
    finally:
        cursor.close()

    return response


@app.route("/get-primary-bath/", methods=["POST"])
def get_primary():
    email = request.json["email"]
    ret = {"message": str(), "primary_exists": bool()}
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT DISTINCT primary_flag FROM fullbathroom 
            WHERE fullbathroom.email='{email}' 
            AND fullbathroom.primary_flag IS NOT NULL 
            AND fullbathroom.primary_flag <> '';"""
        )
        results = cursor.fetchone()
    except:
        ret.update(
            {
                "message": "Unable to gather full bathroom details from database",
                "primary_exists": False,
            }
        )
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None:
            ret.update(
                {"message": "No existing primary bathroom", "primary_exists": False}
            )
            response = Response(json.dumps(ret), status=200)
        else:
            ret.update({"message": "Primary bathroom exists", "primary_exists": True})
            response = Response(json.dumps(ret), status=200)
    finally:
        cursor.close()
    return response


@app.route("/add-bathroom/", methods=["POST"])
def add_bathroom():
    bathroom_type = request.json["bathroom_type"]  # full or half
    email = request.json["email"]
    sinks = request.json["sinks"]
    commodes = request.json["commodes"]
    bidets = request.json["bidets"]
    ret = {"message": str()}

    message = validate_types(
        {"int": [sinks, commodes, bidets], "str": [bathroom_type, email]}
    )
    if message is not None:
        ret["message"] = message
        response = Response(json.dumps(ret), status=400)
        return response

    if int(sinks) < 0 or int(commodes) < 0 or int(bidets) < 0:
        ret["message"] = "Inputs cannot be negative numbers!"
        response = Response(json.dumps(ret), status=400)
        return response
    if sum([int(sinks), int(commodes), int(bidets)]) < 1:
        ret[
            "message"
        ] = "A bathroom must have at least one of the following: sinks, commodes, bidets!"
        response = Response(json.dumps(ret), status=400)
        return response

    # find max bathroom entry across half and full tables
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT MAX(bathroom_entry) FROM bathroom WHERE bathroom.email='{email}';"""
        )
        bath_max = cursor.fetchone()
        bath_max = bath_max[0]
    except:
        ret["message"] = "Unable to read bathroom_entry from database"
        response = Response(json.dumps(ret), status=400)
        return response
    finally:
        cursor.close()

    if bath_max is None:
        bath_max = 0
    bathroom_entry = bath_max + 1

    if bathroom_type == "half":
        name = request.json["half_name"]
        try:
            cursor = db.cursor()
            cursor.execute(
                f"""INSERT INTO bathroom (bathroom_entry, bathroom_type, primary_flag, email) 
                            VALUES ('{bathroom_entry}','half', 0, '{email}');"""
            )
            cursor.execute(
                f"""INSERT INTO halfbathroom (bathroom_entry, sinks, 
                    commodes, bidets, name, email) 
                VALUES ('{bathroom_entry}','{sinks}','{commodes}','{bidets}','{name}', '{email}');"""
            )
            ret["message"] = f"halfbathroom details successfully added to database"
            response = Response(json.dumps(ret), status=200)
        except:
            ret["message"] = f"Unable to add HalfBathroom details to database"
            response = Response(json.dumps(ret), status=400)
        finally:
            cursor.close()

    elif bathroom_type == "full":
        primary = request.json["primary_flag"]
        bathtub_count = request.json["bathtub_count"]
        shower_count = request.json["shower_count"]
        tub_shower_count = request.json["tub_shower_count"]

        message = validate_types(
            {"int": [bathtub_count, shower_count, tub_shower_count], "bool": [primary]}
        )
        if message is not None:
            ret["message"] = message
            response = Response(json.dumps(ret), status=400)
            return response

        if int(bathtub_count) < 0 or int(shower_count) < 0 or int(tub_shower_count) < 0:
            ret["message"] = "Inputs cannot be negative numbers!"
            response = Response(json.dumps(ret), status=400)
            return response
        if sum([int(bathtub_count), int(shower_count), int(tub_shower_count)]) < 1:
            ret[
                "message"
            ] = "A full bathroom must have at least one of the following: bathtub, shower, tub/shower!"
            response = Response(json.dumps(ret), status=400)
            return response

        try:
            primary_flag = 1 if primary == "True" else 0
            cursor = db.cursor()
            cursor.execute(
                f"""INSERT INTO bathroom (bathroom_entry, bathroom_type, primary_flag, email) 
                            VALUES ('{bathroom_entry}','full', {primary_flag}, '{email}');"""
            )
            cursor.execute(
                f"""INSERT INTO fullbathroom(bathroom_entry, sinks, commodes, 
                               bidets, primary_flag, email, bathtub_count, shower_count, tub_shower_count) 
                    VALUES ('{bathroom_entry}','{sinks}','{commodes}',
                                   '{bidets}',{primary_flag}, '{email}', 
                                    {bathtub_count}, {shower_count}, {tub_shower_count});"""
            )
            ret["message"] = "fullbathroom details successfully added to database"
            response = Response(json.dumps(ret), status=200)
        except:
            ret["message"] = f"Unable to add FullBathroom details to database"
            response = Response(json.dumps(ret), status=400)
        finally:
            cursor.close()

    else:
        ret["message"] = "Incorrect bathroom type input"
        response = Response(json.dumps(ret), status=400)
        return response

    return response


@app.route("/get-all-baths/", methods=["POST"])
def get_baths():
    email = request.json["email"]
    ret = {"message": str(), "data": list()}
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT bathroom_entry, bathroom_type, CAST(primary_flag AS UNSIGNED) AS primary_flags
                FROM bathroom WHERE bathroom.email='{email}'
                ORDER BY bathroom_entry"""
        )
        results = cursor.fetchall()
    except:
        ret["message"] = "Unable to gather bathroom details from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None or results == ():
            ret["message"] = "No bathroom data exists"
            response = Response(json.dumps(ret), status=204)
        else:
            ret.update({"message": "Success", "data": results})
            response = Response(json.dumps(ret), status=200)
    finally:
        cursor.close()
    return response


@app.route("/add-appliance/", methods=["POST"])
def appliance():
    responses = []
    ret = {"message": str()}
    all_data = request.json["appliances"]
    email = request.json["email"]

    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT MAX(appliance_entry) FROM appliance WHERE appliance.email='{email}';"""
        )
        app_max = cursor.fetchone()
        app_max = app_max[0]
    except:
        ret["message"] = "Unable to read bathroom_entry from database"
        response = Response(json.dumps(ret), status=400)
        return response
    finally:
        cursor.close()

    if app_max is None:
        app_max = 0
    appliance_entry = app_max + 1

    for entry in all_data:
        appliance_type = entry["appliance_type"]
        appliance_mfr = entry["appliance_mfr"]
        model_number = entry["model_number"]

        if model_number:
            if len(model_number) < 2:
                ret["message"] = "Model number must be at least 2 characters!"
                response = Response(json.dumps(ret), status=400)
                return response

        if len(appliance_mfr) < 2:
            ret["message"] = "Manufacturer must be at least 2 characters!"
            response = Response(json.dumps(ret), status=400)
            return response

        if appliance_type == "Refrigerator/Freezer":
            refrigerator_type = entry["refrigerator_type"]
            insert_response = insert_fridge_freezer(
                email,
                appliance_type,
                appliance_mfr,
                model_number,
                refrigerator_type,
                appliance_entry,
            )

        elif appliance_type == "Cooker":
            cookerType = entry["type"]

            # @todo:  use eval string literal
            if "Oven" in cookerType:
                oven_type = entry["oven_type"]
                oven_heatsrc = entry["oven_heatsrc"]
                oven_heatsrc_lst = [*oven_heatsrc.split(",")]
                oven_heatsrc_lst = [x.strip() for x in oven_heatsrc_lst]
                insert_response = insert_oven(
                    email,
                    appliance_type,
                    appliance_mfr,
                    model_number,
                    oven_heatsrc_lst,
                    oven_type,
                    appliance_entry,
                )
                if "Cooktop" in cookerType:
                    cooktop_heatsrc = entry["cooktop_heatsrc"]
                    insert_response = insert_cooktop(
                        email,
                        appliance_type,
                        appliance_mfr,
                        model_number,
                        cooktop_heatsrc,
                        appliance_entry,
                        False,
                    )

            elif "Cooktop" in cookerType:
                cooktop_heatsrc = entry["cooktop_heatsrc"]
                insert_response = insert_cooktop(
                    email,
                    appliance_type,
                    appliance_mfr,
                    model_number,
                    cooktop_heatsrc,
                    appliance_entry,
                    True,
                )

        elif appliance_type == "Washer":
            load_type = entry["load_type"]
            insert_response = insert_washer(
                email,
                appliance_type,
                appliance_mfr,
                model_number,
                load_type,
                appliance_entry,
            )

        elif appliance_type == "Dryer":
            dryer_heatsrc = entry["dryer_heat_source"]
            insert_response = insert_dryer(
                email,
                appliance_type,
                appliance_mfr,
                model_number,
                dryer_heatsrc,
                appliance_entry,
            )

        elif appliance_type == "TV":
            display_type = entry["displayType"]
            display_size = entry["displaySize"]
            max_resolution = entry["maxRes"]

            insert_response = insert_tv(
                email,
                appliance_type,
                appliance_mfr,
                model_number,
                display_type,
                display_size,
                max_resolution,
                appliance_entry,
            )
        else:
            insert_response = Response(
                {"message": "invalid appliance type"}, status=400
            )

        responses.append(insert_response.status_code)
        appliance_entry += 1

    responses = list(set(responses))
    if responses != [200]:
        rets = Response(json.dumps({"message": "error"}), status=400)
    else:
        rets = Response(json.dumps({"message": "success"}), status=200)

    return rets


@app.route("/manufacturer-list/", methods=["GET"])
def manufacturer_list():

    sql_str = """
        SELECT DISTINCT manufacturer_name
        FROM manufacturer;
    """

    return run_query(sql_str)


@app.route("/manufacturer-info/", methods=["GET"])
def manufacturer_info():

    sql_str = """
           SELECT q.manufacturername, COUNT(q.appliance_entry) AS count
           FROM (
               SELECT c.manufacturername, c.appliance_entry FROM cooker c
               UNION ALL
               SELECT d.manufacturername, d.appliance_entry FROM dryer d
               UNION ALL
               SELECT r.manufacturername, r.appliance_entry FROM refrigerator r
               UNION ALL
               SELECT t.manufacturername, t.appliance_entry FROM television t
               UNION ALL
               SELECT w.manufacturername, w.appliance_entry FROM washer w) q
           GROUP BY q.manufacturername
           ORDER BY COUNT(q.appliance_entry) DESC
           LIMIT 25;
           """

    return run_query(sql_str)


@app.route("/manufacturer-drill-down/", methods=["POST"])
def manufacturer_drill_down():
    appliance_mfr = request.json["appliance_mfr"]

    sql_str = f"""
       SELECT DISTINCT a.appliance_type, IFNULL(q2.count, 0) AS count FROM appliance a
       LEFT JOIN (SELECT q.appliance_type, COUNT(q.appliance_entry) AS count
       FROM(
        SELECT c.manufacturername, c.appliance_entry, 'Cooker' AS appliance_type FROM cooker c
        UNION ALL
        SELECT d.manufacturername, d.appliance_entry, 'Dryer' AS appliance_type FROM dryer d
        UNION ALL
        SELECT r.manufacturername, r.appliance_entry, 'Refrigerator' AS appliance_type FROM refrigerator r
        UNION ALL
        SELECT t.manufacturername, t.appliance_entry, 'Television' AS appliance_type FROM television t
        UNION ALL
        SELECT w.manufacturername, w.appliance_entry, 'Washer' AS appliance_type FROM washer w) q
       WHERE q.manufacturername = '{appliance_mfr}'
       GROUP BY q.appliance_type) q2
       ON a.appliance_type = q2.appliance_type
    """

    return run_query(sql_str)


@app.route("/manufacturer-model-search/", methods=["POST"])
def manufacturer_model_search():

    search_str = request.json["search_str"].lower()
    sql_str = f"""
        WITH
            all_appliances AS(
            SELECT c.email, c.manufacturername, c.appliance_entry
            FROM cooker c
          UNION ALL
            SELECT d.email, d.manufacturername, d.appliance_entry
            FROM dryer d
          UNION ALL
        	SELECT r.email, r.manufacturername, r.appliance_entry
            FROM refrigerator r
          UNION ALL
        	SELECT t.email, t.manufacturername, t.appliance_entry
        	FROM television t
          UNION ALL
        	SELECT w.email, w.manufacturername, w.appliance_entry
        	FROM washer w)
        SELECT DISTINCT b.manufacturername AS manufacturer_name, a.model_name
        FROM appliance a
        INNER JOIN all_appliances b 
        	ON a.email = b.email 
            AND a.appliance_entry = b.appliance_entry
        WHERE LOWER(b.manufacturername) LIKE '%{search_str}%' 
          OR LOWER(a.model_name) LIKE '%{search_str}%'
        ORDER BY manufacturername, model_name
        LIMIT 25;
        """

    return run_query(sql_str)


@app.route("/avg-tv-display/", methods=["GET"])
def avg_tv_display():

    sql_str = f"""
    SELECT q.state, ROUND(AVG(t.display_size), 1) AS avg_display_size
    FROM television t INNER JOIN
    	(SELECT h.email, p.state
    	 FROM household h 
         INNER JOIN postalcodes p ON h.postal_zip = p.zip) q
    ON t.email = q.email
    GROUP BY q.state;
    """

    return run_query(sql_str)


@app.route("/tv-drill-down/", methods=["POST"])
def tv_drill_down():

    state = request.json["state"].lower()

    sql_str = f"""
    SELECT t.display_type, t.max_resolution, ROUND(AVG(t.display_size),1) AS avg_display_sizes, q.state
    FROM television t INNER JOIN
    	(SELECT h.email, p.state
    	FROM household h INNER JOIN postalcodes p ON h.postal_zip = p.zip) q	
    	ON t.email = q.email
    WHERE q.state = '{state}'
    GROUP BY t.display_type, t.max_resolution;
    """

    return run_query(sql_str)


@app.route("/extra-fridge-count/", methods=["GET"])
def extra_fridge_count():

    sql_str = f"""
    SELECT count(*) AS count 
    FROM (SELECT h.email, COUNT(f.refrigerator_type) AS fridge_count
          FROM household h INNER JOIN refrigerator f ON h.email = f.email
          GROUP BY h.email
          HAVING COUNT(f.refrigerator_type) > 1) 
    AS q;
    """

    return run_query(sql_str)


@app.route("/extra-fridge-report/", methods=["GET"])
def extra_fridge_report():

    sql_str = f"""
    SELECT
    R_state AS state,
    R_count AS multiple_fridge_freezer_count,
    CAST(ROUND((100.0 * c_count/r_count)) AS UNSIGNED) AS chest_percentage,
    CAST(ROUND((100.0 * u_count/r_count)) AS UNSIGNED) AS upright_percentage,
    CAST(ROUND((100.0 * o_count/r_count)) AS UNSIGNED) AS other_percentage
    FROM
    (SELECT
    q.state AS r_state, COUNT(q.count) AS r_count
    FROM (
    	SELECT household.email, COUNT(refrigerator.refrigerator_type) AS count, postalcodes.state
    	FROM household INNER JOIN refrigerator
    	ON household.email = refrigerator.email
    	INNER JOIN postalcodes ON household.postal_zip = postalcodes.zip
    	GROUP BY household.email, postalcodes.state
    	HAVING COUNT(refrigerator.refrigerator_type) > 1) q
    GROUP BY q.state
    ORDER BY COUNT(q.count)
    DESC LIMIT 10) AS r
    LEFT JOIN (
        SELECT c.state AS c_state, COUNT(c.count) AS c_count
        FROM (
            SELECT h.email, COUNT(r.refrigerator_type) AS count, p.state
            FROM household h INNER JOIN refrigerator r
              ON h.email = r.email
              INNER JOIN postalcodes p
            ON h.postal_zip = p.zip
            WHERE EXISTS (
                SELECT * FROM refrigerator r1 
                WHERE h.email = r1.email 
                  AND r1.refrigerator_type = 'chest freezer'
            ) 
            GROUP BY h.email, p.state
            HAVING COUNT(r.refrigerator_type) > 1
            ORDER BY count DESC
            ) c
        GROUP BY c.state) AS c
    ON r.r_state = c.c_state
    LEFT JOIN (
        SELECT u.state AS u_state, COUNT(u.count) AS u_count
        FROM (
            SELECT h.email, COUNT(r.refrigerator_type) AS count, p.state
            FROM household h INNER JOIN refrigerator r
              ON h.email = r.email
              INNER JOIN postalcodes p
            ON h.postal_zip = p.zip
            WHERE EXISTS (
                SELECT * FROM refrigerator r2 
                WHERE h.email = r2.email 
                  AND r2.refrigerator_type = 'upright freezer'
            ) 
            GROUP BY h.email, p.state
            HAVING COUNT(r.refrigerator_type) > 1
            ORDER BY count DESC
            ) u
        GROUP BY u.state) AS u
    ON r.r_state = u.u_state
    LEFT JOIN (
        SELECT o.state AS o_state, COUNT(o.count) AS o_count
        FROM (
            SELECT h.email, COUNT(r.refrigerator_type) AS count, p.state
            FROM household h INNER JOIN refrigerator r
              ON h.email = r.email
              INNER JOIN postalcodes p
            ON h.postal_zip = p.zip
            WHERE EXISTS (
                SELECT * FROM refrigerator r3 
                WHERE h.email = r3.email 
                  AND r3.refrigerator_type != 'upright freezer'
                  AND r3.refrigerator_type != 'chest freezer'
            ) 
            GROUP BY h.email, p.state
            HAVING COUNT(r.refrigerator_type) > 1
            ORDER BY count DESC
            ) o
        GROUP BY o.state) AS o
    ON r.r_state = o.o_state
    """

    return run_query(sql_str)


@app.route("/laundry-center-report1/", methods=["GET"])
def laundry_center_report1():

    sql_str = f"""
    WITH
    -- generate temp table: state | load_type | count
    state_washer(state,load_type,count) AS
    (   SELECT      P.state, W.load_type, COUNT(*)
        FROM        washer AS W 
        LEFT JOIN   household AS H on W.email = H.email
        LEFT JOIN   postalcodes AS P on P.zip = H.postal_zip
        GROUP BY    P.state, W.load_type
        ORDER BY    P.state ASC
    ),
    state_washer2 AS
    (   SELECT      *, ROW_NUMBER()
        OVER        (PARTITION BY state ORDER BY count DESC) as rn
        FROM        state_washer
    ),
    -- generate results: state | common_load_type
    state_washer_common AS
    (   SELECT      state,load_type
        FROM        state_washer2
        WHERE       rn=1
    ),
    -- generate temp table: state | heat_source | count
    state_dryer(state,heat_source,count) AS
    (   SELECT      P.state, D.heat_source, COUNT(*)
        FROM        dryer AS D 
        LEFT JOIN   household AS H on D.email = H.email
        LEFT JOIN   postalcodes AS P on P.zip = H.postal_zip
        GROUP BY    P.state, D.heat_source
        ORDER BY    P.state ASC
    ),
    state_dryer2 AS
    (   SELECT      *, ROW_NUMBER()
        OVER        (PARTITION BY state ORDER BY count DESC) as rn
        FROM        state_dryer
    ),
    -- generate results: state | common_heat_source
    state_dryer_common AS
    (   SELECT      state,heat_source
        FROM        state_dryer2
        WHERE       rn=1
    )
    -- generate final results: state | load_type | heat_source
    SELECT          state,load_type,heat_source
    FROM            state_washer_common
    NATURAL JOIN    state_dryer_common;
    """

    return run_query(sql_str)


@app.route("/laundry-center-report2/", methods=["GET"])
def laundry_center_report2():

    sql_str = f"""
    WITH state_washer AS
    (SELECT     P.state,H.email,COUNT(*)
    FROM        washer AS W
    LEFT JOIN   household AS H on H.email = W.email
    LEFT JOIN   postalcodes AS P on P.zip = H.postal_zip
    GROUP BY    P.state,W.email
    )
    SELECT      W.state, COUNT(*)
    FROM        state_washer AS W
    LEFT JOIN   dryer AS D on W.email = D.email
    WHERE       D.appliance_entry IS NULL
    GROUP BY    W.state
    ORDER BY    COUNT(*) DESC;
    """

    return run_query(sql_str)


@app.route("/bathroom-statistics-report/", methods=["GET"])
def bathroom_statistics_report():
    t = []

    name = "Bathrooms per household"
    sql_str = f"""
        WITH bathroomcnt (email, count) AS
        (SELECT     email,COUNT(*)
        FROM        bathroom
        GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        bathroomcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 1,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Half-Bathrooms per household"
    sql_str = f"""
        WITH bathroomcnt (email, count) AS
        (SELECT     email,COUNT(*)
        FROM        halfbathroom
        GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        bathroomcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 2,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Full-Bathrooms per household"
    sql_str = f"""
        WITH bathroomcnt (email, count) AS
        (SELECT     email,COUNT(*)
        FROM        fullbathroom
        GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        bathroomcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 3,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Commodes per household"
    sql_str = f"""
        WITH commodecnt (email, count) as
            (SELECT     email, sum(commodes)
            FROM        halfbathroom
            GROUP BY    email
            UNION
            SELECT      email, sum(commodes)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT       MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        commodecnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 4,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Sinks per household"
    sql_str = f"""
        WITH sinkcnt (email, count) as
            (SELECT     email, sum(sinks)
            FROM        halfbathroom
            GROUP BY    email
            UNION
            SELECT      email, sum(sinks)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT       MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        sinkcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 5,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Bidets per household"
    sql_str = f"""
        WITH bidetcnt (email, count) as
            (SELECT     email, sum(bidets)
            FROM        halfbathroom
            GROUP BY    email
            UNION
            SELECT      email, sum(bidets)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT       MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        bidetcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 6,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Bathtubs per household"
    sql_str = f"""
        WITH bathtubcnt (email, count) AS
            (SELECT     email,SUM(bathtub_count)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        bathtubcnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 7,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Showers per household"
    sql_str = f"""
        WITH showercnt (email, count) AS
            (SELECT     email,SUM(shower_count)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        showercnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 8,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "Tub/Showers per household"
    sql_str = f"""
        WITH tubshowercnt (email, count) AS
            (SELECT     email,SUM(tub_shower_count)
            FROM        fullbathroom
            GROUP BY    email)
        SELECT      MIN(count),ROUND(AVG(count),1),MAX(count)
        FROM        tubshowercnt;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        t.append(
            {
                "entry": 9,
                "name": name,
                "min": float(val[0]),
                "avg": float(val[1]),
                "max": float(val[2]),
            }
        )

    name = "State with most bidets"
    sql_str = f"""
        WITH state_bidet1(email,sum) AS
            (SELECT     email,SUM(bidets)
            FROM        fullbathroom
            GROUP BY    email
            UNION
            SELECT      email,SUM(bidets)
            FROM        halfbathroom
            GROUP BY    email),
        state_bidet2(email,sum,state) AS
            (SELECT     Z.*,P.state
            FROM        state_bidet1 AS Z
            LEFT JOIN   household as H ON Z.email = H.email
            LEFT JOIN   postalcodes as P on P.zip = H.postal_zip)
        SELECT      state,SUM(sum)
        FROM        state_bidet2
        GROUP BY    state
        ORDER BY    SUM(sum) DESC
        LIMIT 1;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        state_most_bidets = str(val[0])
        most_state_bidets = int(val[1])

    name = "Postal code with most bidets"
    sql_str = f"""
        WITH postal_bidet1(email,sum) AS
            (SELECT     email,SUM(bidets)
            FROM        fullbathroom
            GROUP BY    email
            UNION
            SELECT      email,SUM(bidets)
            FROM        halfbathroom
            GROUP BY    email),
        postal_bidet2(email,sum,postal) AS
            (SELECT     Z.*,P.zip
            FROM        postal_bidet1 AS Z
            LEFT JOIN   household as H ON Z.email = H.email
            LEFT JOIN   postalcodes as P on P.zip = H.postal_zip)
        SELECT      postal,SUM(sum)
        FROM        postal_bidet2
        GROUP BY    postal
        ORDER BY    SUM(sum) DESC
        LIMIT       1;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        postal_most_bidets = str(val[0])
        most_postal_bidets = int(val[1])

    name = "Households with single primary bathroom, no others"
    sql_str = f"""
        WITH householdbathroomcnt AS
            (SELECT     email,bathroom_entry,primary_flag
            FROM        fullbathroom
            UNION ALL
            SELECT      email,bathroom_entry,0
            FROM        halfbathroom
            ORDER BY    email ASC),
        householdbathroomcnt2 AS
            (SELECT     email,primary_flag
            FROM        householdbathroomcnt
            WHERE       primary_flag = 1),
        householdbathroomcnt3 AS
            (SELECT     email,COUNT(*) as Count
            FROM        householdbathroomcnt
            GROUP BY    email
            ORDER BY    email)
        SELECT      COUNT(*)
        FROM        householdbathroomcnt2 AS H2
        LEFT JOIN   householdbathroomcnt3 AS H3 ON H2.email = H3.email
        WHERE       H3.Count = 1;
    """
    ret = run_query_part(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        single_primary_bathrooms = int(val[0])

    ret = {
        "message": "Success",
        "data": {
            "statTable": t,
            "state_most_bidets": state_most_bidets,
            "most_state_bidets": most_state_bidets,
            "postal_most_bidets": postal_most_bidets,
            "most_postal_bidets": most_postal_bidets,
            "single_primary_bathrooms": single_primary_bathrooms,
        },
    }
    print(ret)
    response = Response(json.dumps(ret), status=200)
    return response


@app.route("/household-averages-report/", methods=["POST"])
def household_averages_report():
    postal = request.json["postal"]
    radius = request.json["radius"]
    ret = {"message": str()}

    print("postal:", postal)
    print("radius:", radius)

    # assume postal code has already been validated (i.e. /verify-postal/)
    # grab long, lat of postal code
    # long, lat used below, not returned
    try:
        cursor = db.cursor()
        cursor.execute(
            f"""SELECT zip, latitude, longitude FROM postalcodes WHERE postalcodes.zip='{postal}'"""
        )
        results = cursor.fetchone()
    except:
        ret[
            "message"
        ] = f"Unable to read postalcodes latitude,longitude details from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None:
            ret["message"] = "Postal code provided missing from database"
            response = Response(json.dumps(ret), status=400)
        else:
            # zip = results[0]
            latitude = results[1]
            longitude = results[2]
    finally:
        cursor.close()
    print("latitude:", latitude)
    print("longitude:", longitude)

    #sql_str = f"""
    #DROP TABLE IF EXISTS target_postal;
    #"""
    #run_query(sql_str)

    #sql_str = f"""
    #    CREATE TABLE  target_postal AS
    #    SELECT      *
    #    FROM        postalcodes AS P
    #    WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius};
    #"""
    #app.logger.info(sql_str)
    #run_query(sql_str)

    t = []

    name = "Average Bathroom Count"
    sql_str = f"""    
       WITH target_postal AS(
            SELECT      *
            FROM        postalcodes AS P
            WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
        bathroompostal AS
            (SELECT     B.*, H.postal_zip
            FROM        bathroom AS B
            LEFT JOIN   household AS H ON B.email = H.email),
        bathroomcnt AS
            (SELECT     BP.email,COUNT(*) AS Count
            FROM        bathroompostal AS BP
            WHERE       BP.postal_zip IN (SELECT zip from target_postal)
            GROUP BY    BP.email
            ORDER BY    BP.email)
        SELECT ROUND(AVG(Count),1)
        FROM bathroomcnt;
    """
    app.logger.info(sql_str)

    ret = run_query_part(sql_str)
    app.logger.info(ret)

    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = 0
        else:
            print("type val[0]", type(val[0]))
            value = round(val[0],1)
            value = str(value)
        t.append(
            {
                "entry": 1,
                "name": name,
                "val": value,
            }
        )

    name = "Average Bedroom Count"
    sql_str = f"""
        WITH target_postal AS(
             SELECT      *
             FROM        postalcodes AS P
             WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
        bedroomcnt AS
            (SELECT     H.num_bedrooms
            FROM        household AS H
            WHERE       H.postal_zip IN (SELECT zip from target_postal))
        SELECT      ROUND(AVG(num_bedrooms),1)
        FROM        bedroomcnt;
    """
    app.logger.info(sql_str)
    ret = run_query_part(sql_str)
    app.logger.info(sql_str)

    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = 0
        else:
            value = round(val[0],1)
            value = str(value)
        t.append(
            {
                "entry": 2,
                "name": name,
                "val": value,
            }
        )

    name = "Average Occupant Count"
    sql_str = f"""
        WITH target_postal AS(
             SELECT      *
             FROM        postalcodes AS P
             WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
        occupantcnt AS
            (SELECT     H.occupants
            FROM        household AS H
            WHERE       H.postal_zip IN (SELECT zip from target_postal))
        SELECT      ROUND(AVG(occupants),1)
        FROM        occupantcnt;
    """
    app.logger.info(sql_str)
    ret = run_query_part(sql_str)
    app.logger.info(sql_str)

    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = 0
        else:
            value = round(val[0],1)
            value = str(value)
        t.append(
            {
                "entry": 3,
                "name": name,
                "val": value,
            }
        )

    name = "Ratio Commode to Occupant"
    sql_str = f"""
       WITH target_postal AS(
            SELECT      *
            FROM        postalcodes AS P
            WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
       commodecnt AS
            (SELECT     email, COUNT(commodes) AS Count
            FROM        fullbathroom
            GROUP BY    email),
       commoderto(email,ratio) AS
            (SELECT     H.email,
                cast(H.occupants as double)/cast(C.Count as double)
            FROM        household AS H
            NATURAL LEFT JOIN commodecnt AS C
            WHERE       H.postal_zip IN (SELECT zip from target_postal)        )
        SELECT AVG(ratio) AS total_ratio
        FROM commoderto;
    """
    app.logger.info(sql_str)
    ret = run_query_part(sql_str)
    app.logger.info(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = 0
        else:
            value = round(val[0],1)
            value = "1:"+str(value)
        t.append(
            {
                "entry": 4,
                "name": name,
                "val": value,
            }
        )

    name = "Average Appliance Count"
    sql_str = f"""
       WITH target_postal AS(
            SELECT      *
            FROM        postalcodes AS P
            WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
        apppostal AS
            (SELECT     A.*, H.postal_zip
            FROM        appliance AS A
            LEFT JOIN   household AS H ON A.email = H.email),
        appliancecnt AS
            (SELECT     AP.email,COUNT(*) AS Count
            FROM        apppostal AS AP
            WHERE       AP.postal_zip IN (SELECT zip from target_postal)
            GROUP BY    AP.email
            ORDER BY    AP.email)
        SELECT ROUND(AVG(Count),1)
        FROM appliancecnt;
    """
    app.logger.info(sql_str)
    ret = run_query_part(sql_str)
    app.logger.info(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = 0
        else:
            value = round(val[0],1)
            value = str(value)
        t.append(
            {
                "entry": 5,
                "name": name,
                "val": value,
            }
        )

    name = "Most Common Heat Source"
    sql_str = f"""
       WITH target_postal AS(
            SELECT      *
            FROM        postalcodes AS P
            WHERE       haversine({latitude},{longitude}, P.latitude, P.longitude) <= {radius}),
        targeths AS (
            SELECT      OHS.*,H.postal_zip
            FROM        ovenheatsource AS OHS
            LEFT JOIN   household AS H ON OHS.email = H.email
            WHERE       H.postal_zip IN (SELECT zip from target_postal)
            UNION ALL
            SELECT      C.appliance_entry,C.email,C.heat_source,H.postal_zip
            FROM        cooktop AS C
            LEFT JOIN   household AS H ON C.email=H.email
            WHERE       H.postal_zip IN (SELECT zip from target_postal)
            UNION ALL
            SELECT      D.appliance_entry,D.email,D.heat_source,H.postal_zip
            FROM        dryer AS D
            LEFT JOIN   household AS H on D.email = H.email
            WHERE       H.postal_zip IN (SELECT zip from target_postal)),
        targeths2 AS (
            SELECT      heat_source,COUNT(heat_source) AS Count
            FROM        targeths
            GROUP BY    heat_source
            ORDER BY    Count DESC
            LIMIT       1)
        SELECT      heat_source
        FROM        targeths2;
    """
    app.logger.info(sql_str)
    ret = run_query_part(sql_str)
    app.logger.info(sql_str)
    if ret["message"] != "Success":
        response = Response(json.dumps(ret), status=ret["status"])
        return response
    else:
        val = ret["data"]
        print("val", val)
        if val[0] is None:
            value = "none"
        else:
            value = val[0]
        t.append(
            {
                "entry": 6,
                "name": name,
                "val": value,
            }
        )
        print("added t", t)

    print("t:", t)
    ret = {
        "message": "Success",
        "postal": postal,
        "radius": radius,
        "data": t,
    }

    response = Response(json.dumps(ret), status=200)
    return response


if __name__ == "__main__":
    app.run(debug=True, port=8000)
