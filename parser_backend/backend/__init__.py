import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_sock import Sock
from flask_cors import CORS
test_config = None

app = Flask(__name__, instance_relative_config=True)
app.config.from_mapping(
    SECRET_KEY='dev',
    SQLALCHEMY_DATABASE_URI='sqlite:///app.db',
)

if test_config is None:
    app.config.from_pyfile('config.py', silent=True)
else:
    app.config.from_mapping(test_config)

try:
    os.makedirs(app.instance_path)
except OSError:
    pass

sock = Sock(app)
db = SQLAlchemy(app)
CORS(app)

from backend.models import *
from backend.views import *

migrate = Migrate(app, db)

