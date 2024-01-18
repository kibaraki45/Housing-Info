
-- CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS gatechUser@localhost IDENTIFIED BY 'gatech123';

DROP DATABASE IF EXISTS `cs6400_fa17_team001`; 
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS cs6400_fa17_team001 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE cs6400_fa17_team001;

GRANT SELECT, INSERT, UPDATE, DELETE, FILE ON *.* TO 'gatechUser'@'localhost';
GRANT ALL PRIVILEGES ON `gatechuser`.* TO 'gatechUser'@'localhost';
GRANT ALL PRIVILEGES ON `cs6400_fa17_team001`.* TO 'gatechUser'@'localhost';
FLUSH PRIVILEGES;

-- Tables 

CREATE TABLE AdminUser (
  adminID int(16) unsigned NOT NULL AUTO_INCREMENT,
  email varchar(250) NOT NULL,
  last_login datetime DEFAULT NULL,
  PRIMARY KEY (adminID), 
  UNIQUE KEY email (email)
);

CREATE TABLE `User` (
  userID int(16) unsigned NOT NULL AUTO_INCREMENT,
  email varchar(250) NOT NULL,
  password varchar(60) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  PRIMARY KEY (userID),
  UNIQUE KEY email (email)
);

CREATE TABLE RegularUser (
  regularUserID int(16) unsigned NOT NULL AUTO_INCREMENT,
  email varchar(250) NOT NULL,
  birthdate date NOT NULL,
  gender ENUM('Male', 'Female') NULL,
  current_city varchar(250) DEFAULT NULL,
  home_town varchar(250) DEFAULT NULL,
  PRIMARY KEY (regularUserID),
  UNIQUE KEY email (email)
);

CREATE TABLE `Comment` (
  email varchar(250) NOT NULL,
  date_time datetime NOT NULL,
  comment_text varchar(1000) NOT NULL,
  su_email varchar(250) NOT NULL,
  su_date_time datetime NOT NULL,
  PRIMARY KEY (email,date_time),
  KEY su_email (su_email,su_date_time)
);

CREATE TABLE StatusUpdate (
  email varchar(250) NOT NULL,
  date_time datetime NOT NULL,
  status_text varchar(1000) NOT NULL,
  PRIMARY KEY (email,date_time),
  KEY date_time (date_time)
);

CREATE TABLE UserInterest (
  email varchar(250) NOT NULL,
  interest varchar(250) NOT NULL,
  PRIMARY KEY (email,interest)
);

CREATE TABLE Friendship (
  email varchar(250) NOT NULL,
  friend_email varchar(250) NOT NULL,
  relationship varchar(50) NOT NULL,
  date_connected date DEFAULT NULL,
  PRIMARY KEY (email,friend_email),
  KEY friend_email (friend_email)
);

CREATE TABLE Employer (
  employer_name varchar(50) NOT NULL,
  PRIMARY KEY (employer_name)
);

CREATE TABLE Employment (
  email varchar(250) NOT NULL,
  employer_name varchar(50) NOT NULL,
  job_title varchar(50) NOT NULL,
  PRIMARY KEY (email,employer_name),
  KEY employer_name (employer_name)
);

CREATE TABLE School (
  school_name varchar(250) NOT NULL,
  school_type varchar(50) DEFAULT NULL,
  PRIMARY KEY (school_name),
  KEY school_type (school_type)
);

CREATE TABLE SchoolType (
  type_name varchar(50) NOT NULL,
  PRIMARY KEY (type_name)
);

CREATE TABLE Attend (
  email varchar(250) NOT NULL,
  school_name varchar(250) NOT NULL,
  year_graduated int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (email,school_name,year_graduated),
  KEY school_name (school_name)
);

-- Constraints   Foreign Keys: FK_ChildTable_childColumn_ParentTable_parentColumn

ALTER TABLE AdminUser
  ADD CONSTRAINT fk_AdminUser_email_User_email FOREIGN KEY (email) REFERENCES `User` (email);
  
ALTER TABLE RegularUser
  ADD CONSTRAINT fk_RegularUser_email_User_email FOREIGN KEY (email) REFERENCES `User` (email);

ALTER TABLE StatusUpdate
  ADD CONSTRAINT fk_StatusUpdate_email_RegularUser_email FOREIGN KEY (email) REFERENCES RegularUser (email);

ALTER TABLE `Comment`
  ADD CONSTRAINT fk_Comment_suemail_sudatetime_StatusUpdate_email_datetime FOREIGN KEY (su_email, su_date_time) REFERENCES StatusUpdate (email, date_time);  

ALTER TABLE UserInterest
  ADD CONSTRAINT fk_UserInterest_email_RegularUser_email FOREIGN KEY (email) REFERENCES RegularUser (email);

ALTER TABLE Friendship
  ADD CONSTRAINT fk_Friendship_email_RegularUser_email FOREIGN KEY (email) REFERENCES RegularUser (email) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_Friendship_freindemail_RegularUser_email FOREIGN KEY (friend_email) REFERENCES RegularUser (email) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Employment
  ADD CONSTRAINT fk_Employment_email_RegularUser_email FOREIGN KEY (email) REFERENCES RegularUser (email),
  ADD CONSTRAINT fk_Employment_employername_Employer_employername FOREIGN KEY (employer_name) REFERENCES Employer (employer_name);

ALTER TABLE School
  ADD CONSTRAINT fk_School_schooltype_SchoolType_typename FOREIGN KEY (school_type) REFERENCES SchoolType (type_name);

ALTER TABLE Attend
  ADD CONSTRAINT fk_Attend_email_RegularUser_email FOREIGN KEY (email) REFERENCES RegularUser (email),
  ADD CONSTRAINT fk_Attend_schoolname_School_schoolname FOREIGN KEY (school_name) REFERENCES School (school_name);

