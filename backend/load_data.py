import numpy as np
import pandas as pd
from sqlalchemy import create_engine

import pymysql
from config import MYSQL_DB, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER

pd.options.mode.chained_assignment = None

# Create dataframes
df_postal = pd.read_csv("./../../sample_data/postal_codes.csv")
df_postal.columns = [col.lower() for col in df_postal.columns]
df_postal["zip"] = df_postal["zip"].astype(str).str.zfill(5)
df_postal.drop_duplicates(inplace=True)

df_homes = pd.read_csv("./../../sample_data/Household.tsv", sep="\t")
df_household = df_homes[
    [
        "email",
        "household_type",
        "num_occupants",
        "footage",
        "bedroom_count",
        "postal_code",
    ]
]
df_household.columns = [
    "email",
    "household_type",
    "occupants",
    "square_footage",
    "num_bedrooms",
    "postal_zip",
]
df_household["postal_zip"] = df_household["postal_zip"].astype(str).str.zfill(5)


df_phone = df_homes[["email", "phone_number", "phone_type", "area_code"]]
df_phone["area_code"] = df_phone["area_code"].astype(str).str.zfill(3)
df_phone["phone_number"] = df_phone["phone_number"].astype(str).str.zfill(7)


df_phone.dropna(subset=["phone_type", "area_code"], inplace=True)


df_app = pd.read_csv("./../../sample_data/Appliance.tsv", sep="\t")
df_app["type"] = np.where(
    df_app["refrigerator_type"].notnull(),
    "Refrigerator",
    np.where(
        df_app["display_type"].notnull(),
        "Television",
        np.where(
            df_app["dryer_heat_source"].notnull(),
            "Dryer",
            np.where(df_app["washer_load_type"].notnull(), "Washer", "Cooker"),
        ),
    ),
)


# yes, i know this this is the dumbest way possible below
df_app_manu = df_app[["manufacturer_name", "model"]]
df_app_manu.drop_duplicates(inplace=True)
df_app_manu.columns = ["manufacturer_name", "model_name"]

df_app_insert = df_app[["appliance_number", "household_email", "type", "model"]]
df_app_insert.columns = ["appliance_entry", "email", "appliance_type", "model_name"]


df_fridge = df_app.loc[df_app["type"] == "Refrigerator"]
df_fridge = df_fridge[
    ["appliance_number", "household_email", "manufacturer_name", "refrigerator_type"]
]
df_fridge.columns = [
    "appliance_entry",
    "email",
    "manufacturerName",
    "refrigerator_type",
]

df_tv = df_app.loc[df_app["type"] == "Television"]
df_tv = df_tv[
    [
        "appliance_number",
        "household_email",
        "manufacturer_name",
        "display_size",
        "display_type",
        "resolution",
    ]
]
df_tv.columns = [
    "appliance_entry",
    "email",
    "manufacturerName",
    "display_size",
    "display_type",
    "max_resolution",
]

df_dryer = df_app.loc[df_app["type"] == "Dryer"]
df_dryer = df_dryer[
    ["appliance_number", "household_email", "manufacturer_name", "dryer_heat_source"]
]
df_dryer.columns = ["appliance_entry", "email", "manufacturerName", "heat_source"]

df_washer = df_app.loc[df_app["type"] == "Washer"]
df_washer = df_washer[
    ["appliance_number", "household_email", "manufacturer_name", "washer_load_type"]
]
df_washer.columns = ["appliance_entry", "email", "manufacturerName", "load_type"]

df_cooker = df_app.loc[df_app["type"] == "Cooker"]
df_cooker = df_cooker[["appliance_number", "household_email", "manufacturer_name"]]
df_cooker.columns = ["appliance_entry", "email", "manufacturerName"]

df_oven = df_app.loc[(df_app["type"] == "Cooker") & (df_app["oven_type"].notnull())]
df_oven = df_oven[
    ["appliance_number", "household_email", "oven_type", "oven_heat_sources"]
]
df_oven.columns = ["appliance_entry", "email", "oven_type", "oven_heat_sources"]

df_oven_heat = df_oven[["appliance_entry", "email", "oven_heat_sources"]]
df_oven.drop(columns=["oven_heat_sources"], inplace=True)
df_split = df_oven_heat["oven_heat_sources"].str.split(";", expand=True)
df_oven_heat["heat_one"] = df_split[0]
df_oven_heat["heat_two"] = df_split[1]
df_oven_heat["heat_three"] = df_split[2]
df_1 = df_oven_heat[["appliance_entry", "email", "heat_one"]].rename(
    columns={"heat_one": "heat_source"}
)
df_2 = df_oven_heat[["appliance_entry", "email", "heat_two"]].rename(
    columns={"heat_two": "heat_source"}
)
df_3 = df_oven_heat[["appliance_entry", "email", "heat_three"]].rename(
    columns={"heat_three": "heat_source"}
)
df_oven_heat = pd.concat([df_1, df_2, df_3])
df_oven_heat.drop_duplicates(inplace=True)
df_oven_heat.dropna(inplace=True)

df_cooktop = df_app.loc[
    (df_app["type"] == "Cooker") & (df_app["cooktop_heat_source"].notnull())
]
df_cooktop = df_cooktop[["appliance_number", "household_email", "cooktop_heat_source"]]
df_cooktop.columns = ["appliance_entry", "email", "heat_source"]

df_bathroom = pd.read_csv("./../../sample_data/Bathrooms.tsv", sep="\t")
df_bathroom.rename(
    columns={
        "bathroom_number": "bathroom_entry",
        "household_email": "email",
        "bathroom_name": "name",
        "primary_bathroom": "primary_flag",
        "sink_count": "sinks",
        "bidet_count": "bidets",
        "commode_count": "commodes",
        "tub_count": "bathtub_count",
    },
    inplace=True,
)

df_bathroom["bathroom_type"] = np.where(
    (
        df_bathroom["bathtub_count"]
        + df_bathroom["shower_count"]
        + df_bathroom["tub_shower_count"]
    )
    > 0,
    "full",
    "half",
)

df_bath = df_bathroom[["bathroom_entry", "email", "bathroom_type", "primary_flag"]]
df_half = df_bathroom.loc[df_bathroom["bathroom_type"] == "half"][
    ["bathroom_entry", "sinks", "commodes", "bidets", "name", "email"]
]
df_full = df_bathroom.loc[df_bathroom["bathroom_type"] == "full"][
    [
        "bathroom_entry",
        "sinks",
        "commodes",
        "bidets",
        "primary_flag",
        "email",
        "bathtub_count",
        "shower_count",
        "tub_shower_count",
    ]
]

engine = create_engine(
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
)

# Execute the to_sql for writting DF into SQL
df_app_manu.to_sql("manufacturer", engine, if_exists="append", index=False)
df_postal.to_sql("postalcodes", engine, if_exists="append", index=False)
df_household.to_sql("household", engine, if_exists="append", index=False)
df_phone.to_sql("phone", engine, if_exists="append", index=False)
df_app_insert.to_sql("appliance", engine, if_exists="append", index=False)
df_cooker.to_sql("cooker", engine, if_exists="append", index=False)
df_oven.to_sql("oven", engine, if_exists="append", index=False)
df_oven_heat.to_sql("ovenheatsource", engine, if_exists="append", index=False)
df_washer.to_sql("washer", engine, if_exists="append", index=False)
df_dryer.to_sql("dryer", engine, if_exists="append", index=False)
df_tv.to_sql("television", engine, if_exists="append", index=False)
df_fridge.to_sql("refrigerator", engine, if_exists="append", index=False)
df_cooktop.to_sql("cooktop", engine, if_exists="append", index=False)
df_bath.to_sql("bathroom", engine, if_exists="append", index=False)
df_half.to_sql("halfbathroom", engine, if_exists="append", index=False)
df_full.to_sql("fullbathroom", engine, if_exists="append", index=False)
