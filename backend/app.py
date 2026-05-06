import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager 
from routes.login_routes import auth_bp 
from models.jenis_models import db

# from routes.jenis_routes import jam

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))

app.config# Ganti URL jadi URI
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + os.path.join(basedir, 'jamu.db')

# Tambahin huruf S di belakang MODIFICATIONS
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'rahasia-jamu-madura-123' 

jwt = JWTManager(app)
db.init_app(app)


# Daftarin rute
app.register_blueprint(auth_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)