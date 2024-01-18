DROP DATABASE IF EXISTS `cs6400_fa22_team087`;
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS cs6400_fa22_team087
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;
USE cs6400_fa22_team087;
-- Tables

CREATE TABLE postalcodes(
	zip varchar(50) NOT NULL,
	city varchar(50) NOT NULL,
	state varchar(50) NOT NULL,
	latitude float(50) NOT NULL,
	longitude float NOT NULL,
	PRIMARY KEY(zip)
);

CREATE TABLE household(
	email varchar(50) NOT NULL,
	household_type varchar(50) NOT NULL,
	occupants int NOT NULL,
	square_footage int NOT NULL,
	num_bedrooms int NOT NULL,
	postal_zip varchar(50) NOT NULL,
	PRIMARY KEY(email));

CREATE TABLE phone(
	area_code varchar(50) NOT NULL,
	phone_number varchar(50) NOT NULL,
	phone_type varchar(50) NOT NULL,
	email varchar(50) NOT NULL,
	PRIMARY KEY (area_code, phone_number)
);

CREATE TABLE bathroom(
  bathroom_entry int NOT NULL,
  email varchar(250) NOT NULL,
  bathroom_type varchar(250) NOT NULL,
  primary_flag bit NULL,
  PRIMARY KEY (bathroom_entry, email)
);

CREATE TABLE halfbathroom(
	bathroom_entry int NOT NULL,
	sinks int NOT NULL,
	commodes int NOT NULL,
	bidets int NOT NULL,
	name varchar(50) NULL,
	email varchar(50) NOT NULL,
	PRIMARY KEY  (bathroom_entry, email)
);

CREATE TABLE fullbathroom(
	bathroom_entry int NOT NULL,
	sinks int NOT NULL,
	commodes int NOT NULL,
	bidets int NOT NULL,
	primary_flag bit NULL,
	email varchar(50) NOT NULL,
	bathtub_count int NOT NULL,
	shower_count int NOT NULL,
	tub_shower_count int NOT NULL,
	PRIMARY KEY (bathroom_entry, email)
);

-- Constraints
ALTER TABLE household
	ADD CONSTRAINT fk_household_postalcodes_zip  FOREIGN KEY (postal_zip) REFERENCES postalcodes(zip);

ALTER TABLE phone
	ADD CONSTRAINT fk_phone_household_email FOREIGN KEY (email) REFERENCES household (email);

ALTER TABLE bathroom
  ADD CONSTRAINT fk_bathroom_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE halfbathroom
	ADD CONSTRAINT fk_halfbathroom_household_email FOREIGN KEY (email) REFERENCES household (email);

ALTER TABLE fullbathroom
	ADD CONSTRAINT fk_fullbathroom_household_email  FOREIGN KEY (email) REFERENCES household (email);

ALTER TABLE halfbathroom
	ADD CONSTRAINT fk_halfbathroom_entry_bathroom_entry FOREIGN KEY (bathroom_entry)
	REFERENCES bathroom (bathroom_entry);

ALTER TABLE fullbathroom
	ADD CONSTRAINT fk_fullbathroom_entry_bathroom_entry FOREIGN KEY (bathroom_entry)
	REFERENCES bathroom (bathroom_entry);

CREATE TABLE manufacturer (
  manufacturer_entry int NOT NULL AUTO_INCREMENT,
  manufacturer_name varchar(50) NOT NULL,
  model_name varchar(50),
  PRIMARY KEY (manufacturer_entry),
  CONSTRAINT uc_manu UNIQUE (manufacturer_name, model_name)
);

CREATE TABLE appliance(
  appliance_entry int NOT NULL,
  email varchar(250) NOT NULL,
  appliance_type varchar(50),
  model_name varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE refrigerator (
  email varchar(250) NOT NULL,
  manufacturername varchar(50) NOT NULL,
  appliance_entry int NOT NULL,
  refrigerator_type varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE cooker (
  email varchar(250) NOT NULL,
  manufacturername varchar(50) NOT NULL,
  appliance_entry int NOT NULL,
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE oven (
  email varchar(250) NOT NULL,
  appliance_entry int NOT NULL,
  oven_type varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE ovenheatsource(
  email varchar(250) NOT NULL,
  appliance_entry int NOT NULL,
  heat_source varchar(50) NOT NULL,
  PRIMARY KEY (appliance_entry, email, heat_source)
);

CREATE TABLE cooktop (
  email varchar(250) NOT NULL,
  appliance_entry int NOT NULL,
  heat_source varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE washer (
  email varchar(250) NOT NULL,
  manufacturername varchar(50) NOT NULL,
  appliance_entry int NOT NULL,
  load_type varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE dryer (
  email varchar(250) NOT NULL,
  manufacturername varchar(50) NOT NULL,
  appliance_entry int NOT NULL,
  heat_source varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

CREATE TABLE television (
  email varchar(250) NOT NULL,
  manufacturername varchar(50) NOT NULL,
  appliance_entry int NOT NULL,
  display_type varchar(50),
  display_size float,
  max_resolution varchar(50),
  PRIMARY KEY (appliance_entry, email)
);

-- Connects email FK's
ALTER TABLE appliance
  ADD CONSTRAINT fk_appliance_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE refrigerator
  ADD CONSTRAINT fk_refrigerator_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE cooker
  ADD CONSTRAINT fk_cooker_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE washer
  ADD CONSTRAINT fk_washer_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE dryer
  ADD CONSTRAINT fk_dryer_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

ALTER TABLE television
  ADD CONSTRAINT fk_television_email_household_email FOREIGN KEY (email)
  REFERENCES `household` (email);

  -- Entry IDs
  ALTER TABLE refrigerator
	ADD CONSTRAINT fk_refrigerator_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE cooker
	ADD CONSTRAINT fk_cooker_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE oven
	ADD CONSTRAINT fk_oven_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE ovenheatsource
	ADD CONSTRAINT fk_ovenheatsource_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE cooktop
	ADD CONSTRAINT fk_cooktop_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE washer
	ADD CONSTRAINT fk_washer_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE dryer
	ADD CONSTRAINT fk_dryer_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);

ALTER TABLE television
	ADD CONSTRAINT fk_television_entry_appliance_entry FOREIGN KEY (appliance_entry, email)
	REFERENCES appliance (appliance_entry, email);
	
DROP FUNCTION IF EXISTS haversine;

DELIMITER $$
CREATE FUNCTION haversine(
    lat1d double precision,
    lon1d double precision,
    lat2d double precision,
    lon2d double precision)
RETURNS double precision
DETERMINISTIC
BEGIN
    DECLARE lat1 double precision;
    DECLARE lon1 double precision;
    DECLARE lat2 double precision;
    DECLARE lon2 double precision;
    DECLARE d_lat double precision;
    DECLARE d_lon double precision;
    DECLARE a double precision;
    DECLARE c double precision;
    DECLARE R double precision;
    set R = 3958.75;
    set lat1 = RADIANS(lat1d);
    set lon1 = RADIANS(lon1d);
    set lat2 = RADIANS(lat2d);
    set lon2 = RADIANS(lon2d);
    set d_lat = RADIANS(lat2d - lat1d);
    set d_lon = RADIANS(lon2d - lon1d);
    set a = POWER(SIN(d_lat/2),2) + COS(lat1) * COS(lat2) * POWER(SIN(d_lon/2),2);
    set c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN R * c;    
END$$
DELIMITER ;
