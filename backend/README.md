## How to start the Flask server

### Create and activate Python virtual environment
```python
cd Phase_3_working
python3 -m venv env
source env/bin/activate
python3 -m pip install -r requirements.txt
```

### Create config file
Create a config file with the following contents in the backend folder
```python
MYSQL_HOST = '127.0.0.1'
MYSQL_USER = 'user'
MYSQL_PASSWORD = 'password'
MYSQL_DB = 'db_name'
SECRET_KEY = 'something unique'
```

Note: I found I had to make a user on the table we create with appropriate access

### Start the Flask application
```python
python3 backend/app.py
```

From here the routes defined in app.py are reachable via postman