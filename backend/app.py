from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager 

# Import blueprint abang (sesuaikan nama file abang ya)
from routes.login_routes import auth_bp 

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'rahasia-jamu-madura-123' 

jwt = JWTManager(app)

# Daftarin rute
app.register_blueprint(auth_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)