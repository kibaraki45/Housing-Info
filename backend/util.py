import json
from ast import literal_eval

import pymysql
from flask import Response

from config import MYSQL_DB, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER

TYPE_LOOKUP = {"str": str, "int": int, "bool": bool, "float": float, "list": list}


def validate_types(input_dict: dict):
    error = None
    for expected_type, values in input_dict.items():
        type_check = TYPE_LOOKUP.get(expected_type, None)
        if type_check is None:
            raise NotImplementedError(f"{expected_type} not valid lookup type")
        for value in values:
            if isinstance(value, str):
                if expected_type != "str" and not value.startswith("0"):
                    try:
                        evald = literal_eval(value)
                    except:
                        error = f"Incorrect input type, expecting a string of {expected_type}"
                    else:
                        if not isinstance(evald, type_check):
                            error = f"Incorrect input type, expecting string of {expected_type}"
            else:
                if expected_type == "str":
                    error = f"Incorrect input type, expecting {expected_type}"
                else:
                    error = f"Incorrect input type, expecting string of {expected_type}"
    return error


def insert_sql(sql):
    db = pymysql.connect(
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        database=MYSQL_DB,
        autocommit=True,
    )

    # print(f"{sql}", flush=True)

    try:
        with db.cursor() as cursor:
            cursor.execute(sql)
        stat = 200
    except:
        # @todo: handle exceptoin cases
        stat = 400
    return stat


def query_sql(sql):
    db = pymysql.connect(
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        database=MYSQL_DB,
        autocommit=True,
    )
    try:
        with db.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()
    except:
        # @todo: handle exception cases
        result = -1
    return result


def insert_appliance(
    email, appliance_type, model_number, appliance_entry, appliance_mfr
):
    # inserts into appliance values
    # if success, return appliance ID, else 400
    if model_number:
        sql_manu = f"""
                SELECT count(*) FROM manufacturer
                WHERE LOWER(manufacturer_name) = '{appliance_mfr.lower()}'
                AND LOWER(model_name) = '{model_number.lower()}';
            """
        insert_manu = f"""INSERT INTO manufacturer (manufacturer_name, model_name) 
                          VALUES ('{appliance_mfr}','{model_number}');"""
    else:
        sql_manu = f"""
                SELECT count(*) FROM manufacturer
                WHERE LOWER(manufacturer_name) = '{appliance_mfr.lower()}';
            """
        insert_manu = f"""INSERT INTO manufacturer (manufacturer_name) 
                          VALUES ('{appliance_mfr}');"""

    man_resp = query_sql(sql_manu)
    if man_resp == -1:
        appliance_status = 400

    elif man_resp[0][0] == 0:
        insert_resp = insert_sql(insert_manu)
        if insert_resp == 400:
            appliance_status = 400
        else:
            sql_appliance = f"""
                INSERT INTO appliance (email, appliance_entry, appliance_type, model_name)
                VALUES ('{email}', '{appliance_entry}', '{appliance_type}', '{model_number}');
                """
            appliance_status = insert_sql(sql_appliance)

    elif man_resp[0][0] > 0:
        sql_appliance = f"""
                        INSERT INTO appliance (email, appliance_entry, appliance_type, model_name)
                        VALUES ('{email}', '{appliance_entry}', '{appliance_type}', '{model_number}');
                        """
        appliance_status = insert_sql(sql_appliance)

    else:
        appliance_status = 400

    return appliance_status


def insert_tv(
    email,
    appliance_type,
    appliance_mfr,
    model_number,
    display_type,
    display_size,
    max_resolution,
    appliance_entry,
):
    display_size = literal_eval(display_size)

    ret = {"message": str()}

    display_types = ["tube", "DLP", "plasma", "LCD", "LED"]
    res_types = [
        "480i",
        "576i",
        "720p",
        "1080i",
        "1080p",
        "1440p",
        "2160p (4K)",
        "4320p (8K)",
    ]

    if display_type not in display_types:
        ret["message"] = "Must have valid display type"
        response = Response(json.dumps(ret), status=400)
        return response

    if max_resolution not in res_types:
        ret["message"] = "Must have valid resolution"
        response = Response(json.dumps(ret), status=400)
        return response

    if (
        display_size is None
        or round(display_size, 1) != display_size
        or type(display_size) == str
    ):
        ret["message"] = "TV size must be a number upt to tenth of an inch"
        response = Response(json.dumps(ret), status=400)
        return response

    appliance_code = insert_appliance(
        email, appliance_type, appliance_mfr, appliance_entry, appliance_mfr
    )

    if appliance_code != 400:
        sql = f"""
            INSERT INTO television (email, manufacturername, appliance_entry, display_type, display_size, max_resolution)
            VALUES ('{email}', '{appliance_mfr}', '{appliance_entry}', '{display_type}', '{display_size}', '{max_resolution}');
            """
        status = insert_sql(sql)

        if status == 200:
            ret["message"] = "TV data inserted into table"
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Failed to insert into TV table"
            response = Response(json.dumps(ret), status=400)
    else:
        ret["message"] = "Failed to insert TV data into appliance table"
        response = Response(json.dumps(ret), status=400)

    return response


def insert_washer(
    email, appliance_type, appliance_mfr, model_number, load_type, appliance_entry
):
    ret = {"message": str()}
    load_types = ["top", "front"]

    if load_type.lower() not in load_types:
        ret["message"] = "Must have valid load type"
        response = Response(json.dumps(ret), status=400)
        return response

    appliance_code = insert_appliance(
        email, appliance_type, model_number, appliance_entry, appliance_mfr
    )

    if appliance_code != 400:
        sql_washer = f"""
            INSERT INTO washer (email, manufacturername, appliance_entry, load_type)
            VALUES ('{email}', '{appliance_mfr}', '{appliance_entry}', '{load_type}');
            """
        status = insert_sql(sql_washer)

        if status == 200:
            ret["message"] = "Washer data inserted into table"
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Failed to insert into washer table"
            response = Response(json.dumps(ret), status=400)
    else:
        ret["message"] = "Failed to insert washer data into appliance table"
        response = Response(json.dumps(ret), status=400)

    return response


def insert_dryer(
    email, appliance_type, appliance_mfr, model_number, heat_source, appliance_entry
):
    ret = {"message": str()}
    dry_types = ["gas", "electric", "none"]

    if heat_source.lower() not in dry_types:
        ret["message"] = "Must have valid dryer heat source"
        response = Response(json.dumps(ret), status=400)
        return response

    appliance_code = insert_appliance(
        email, appliance_type, model_number, appliance_entry, appliance_mfr
    )

    if appliance_code != 400:
        sql_dryer = f"""
            INSERT INTO dryer (email, manufacturername, appliance_entry, heat_source)
            VALUES ('{email}', '{appliance_mfr}', '{appliance_entry}', '{heat_source}');
            """
        status = insert_sql(sql_dryer)

        if status == 200:
            ret["message"] = "Dryer data inserted into table"
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Failed to insert into dryer table"
            response = Response(json.dumps(ret), status=400)
    else:
        ret["message"] = "Failed to insert dryer data into appliance table"
        response = Response(json.dumps(ret), status=400)

    return response


def insert_oven(
    email,
    appliance_type,
    appliance_mfr,
    model_number,
    oven_heatsrc_lst,
    oven_type,
    appliance_entry,
):
    ret = {"message": str()}
    heat_sources = ["gas", "electric", "microwave"]
    oven_types = ["convection", "conventional"]

    # if oven_heatsrc is None:
    if len(oven_heatsrc_lst) == 0:
        ret["message"] = "Heat source may not be null"
        response = Response(json.dumps(ret), status=400)
        return response
    for heatsrc in oven_heatsrc_lst:
        if heatsrc.lower() not in heat_sources:
            ret["message"] = "Must have valid heat source"
            response = Response(json.dumps(ret), status=400)
            return response

    if oven_type.lower() not in oven_types:
        ret["message"] = "Must be conventional or convection"
        response = Response(json.dumps(ret), status=400)
        return response

    appliance_code = insert_appliance(
        email, appliance_type, model_number, appliance_entry, appliance_mfr
    )

    if appliance_code != 400:

        sql_cooker = f"""
                INSERT INTO cooker (email, manufacturername, appliance_entry)
                VALUES ('{email}', '{appliance_mfr}', '{appliance_entry}');
                """
        cooker_status = insert_sql(sql_cooker)

        if cooker_status == 200:
            sql_oven = f"""
                INSERT INTO oven (email, appliance_entry, oven_type)
                VALUES ('{email}', '{appliance_entry}', '{oven_type}');
                """
            oven_status = insert_sql(sql_oven)

            if oven_status == 200:
                for heatsrc in oven_heatsrc_lst:
                    sql_heatsrc = f"""
                        INSERT INTO ovenheatsource (email, appliance_entry, heat_source)
                        VALUES ('{email}', '{appliance_entry}', '{heatsrc}')
                        """
                    heat_source_status = insert_sql(sql_heatsrc)

                # return must be outside loop
                if heat_source_status == 200:
                    ret["message"] = "Oven data inserted into tables"
                    response = Response(json.dumps(ret), status=200)
                else:
                    ret["message"] = "Failed to insert oven heat source data"
                    response = Response(json.dumps(ret), status=400)
            else:
                ret["message"] = "Failed to insert oven data inserted into oven table"
                response = Response(json.dumps(ret), status=400)
        else:
            ret["message"] = "Failed to insert cooker data inserted into cooker table"
            response = Response(json.dumps(ret), status=400)
    else:
        ret["message"] = "Failed to insert oven data inserted into appliance table"
        response = Response(json.dumps(ret), status=400)
    return response


def insert_cooktop(
    email,
    appliance_type,
    appliance_mfr,
    model_number,
    cooktop_heatsrc,
    appliance_entry,
    make_appliance,
):
    ret = {"message": str()}

    heat_sources = ["gas", "electric", "radiant electric", "induction"]
    if cooktop_heatsrc.lower() not in heat_sources:
        ret["message"] = "Cooktop heat source not correct"
        response = Response(json.dumps(ret), status=400)
        return response

    if make_appliance:
        appliance_code = insert_appliance(
            email, appliance_type, model_number, appliance_entry, appliance_mfr
        )

        if appliance_code != 400:
            sql_cooker = f"""
                INSERT INTO cooker (email, appliance_entry, manufacturername)
                VALUES ('{email}', '{appliance_entry}', '{appliance_mfr}');
                """
            status_cooker = insert_sql(sql_cooker)

            if status_cooker == 200:
                sql_cooktop = f"""
                    INSERT INTO cooktop (email, appliance_entry, heat_source)
                    VALUES ('{email}', '{appliance_entry}', '{cooktop_heatsrc}');
                    """
                status = insert_sql(sql_cooktop)

                if status == 200:
                    ret["message"] = "cooktop data inserted into tables"
                    response = Response(json.dumps(ret), status=200)
                else:
                    ret["message"] = "Failed ot insert into cooktop table"
                    response = Response(json.dumps(ret), status=400)
            else:
                ret["message"] = "Failed to insert cooktop data into cooker table"
                response = Response(json.dumps(ret), status=400)
        else:
            ret["message"] = "Failed to insert cooktop data into appliance table"
            response = Response(json.dumps(ret), status=400)
    else:
        sql_cooktop = f"""INSERT INTO cooktop (email, appliance_entry, heat_source)
                        VALUES ('{email}', '{appliance_entry}', '{cooktop_heatsrc}');"""
        status = insert_sql(sql_cooktop)

        if status == 200:
            ret["message"] = "cooktop data inserted into tables"
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Failed ot insert into cooktop table"
            response = Response(json.dumps(ret), status=400)

    return response


def insert_fridge_freezer(
    email,
    appliance_type,
    appliance_mfr,
    model_number,
    refrigerator_type,
    appliance_entry,
):
    # returns 200 or 400 based upon success of inserts
    ret = {"message": str()}

    fridges = [
        "bottom freezer refrigerator",
        "french door refrigerator",
        "side-by-side",
        "refrigerator",
        "top freezer refrigerator",
        "chest freezer",
        "upright freezer",
    ]

    if refrigerator_type.lower() not in fridges:
        ret["message"] = "Fridge type not correct"
        response = Response(json.dumps(ret), status=400)
        return response

    appliance_code = insert_appliance(
        email, appliance_type, model_number, appliance_entry, appliance_mfr
    )

    if appliance_code != 400:
        sql_fridge_freezer = f"""
            INSERT INTO refrigerator (email, manufacturername, appliance_entry, refrigerator_type)
            VALUES ('{email}', '{appliance_mfr}', '{appliance_entry}', '{refrigerator_type}');
            """

        status = insert_sql(sql_fridge_freezer)

        if status == 200:
            ret["message"] = "Fridge data inserted into fridge table"
            response = Response(json.dumps(ret), status=200)
        else:
            ret["message"] = "Failed to insert fridge data"
            response = Response(json.dumps(ret), status=400)
    else:
        ret["message"] = "Failed to insert fridge data into appliance table"
        response = Response(json.dumps(ret), status=400)

    return response


def run_query(sql_str):
    ret = {"message": str(), "data": list()}

    db = pymysql.connect(
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        database=MYSQL_DB,
        autocommit=True,
    )

    # print(f"{sql_str}", flush=True)

    try:
        cursor = db.cursor()
        cursor.execute(sql_str)
        results = cursor.fetchall()
        #app.logger.info(sql_str)
    except:
        ret["message"] = "Unable to get data from database"
        response = Response(json.dumps(ret), status=400)
    else:
        if results is None or results == ():
            ret["message"] = "No data returned"
            response = Response(json.dumps(ret), status=204)
        else:
            ret.update({"message": "Success", "data": results})
            response = Response(json.dumps(ret), status=200)
    finally:
        cursor.close()
    return response


'''
  used by bathroom statistics report. it runs 9 different queries and combines them
'''
def run_query_part(sql_str):
    ret = {"message": str(), "data": list(), "status": int()}

    db = pymysql.connect(
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        database=MYSQL_DB,
        autocommit=True,
    )
    try:
        #cursor = db.cursor(dictonary=True)
        cursor = db.cursor()
        cursor.execute(sql_str)
        results = cursor.fetchone()
    except:
        ret["message"] = "Unable to get data from database"
        ret["status"] = 400
    else:
        if results is None or results == ():
            ret["message"] = "No data returned"
            ret["status"] = 204
        else:
            ret.update({"message": "Success", "data": results})
            ret["message"] = "Success"
            ret["status"] = 200
            ret["data"] = results
            print("util: returning", ret)
    finally:
        cursor.close()
    return ret

