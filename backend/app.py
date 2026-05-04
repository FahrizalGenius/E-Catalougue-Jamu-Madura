# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy

# app = Flask(__name__)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# db = SQLAlchemy(app)

# class Jamu(db.model):
#     id=db.Column(db.integer,primary_key=True)
#     nama=db.Column(db.string(100))
#     manfaat =db.Column(db.text)

# /
# with app.app_context():
#     db.create_all()
from flask import Flask
from routes.jamu_routes import jamu_bp
from routes import login
app = Flask(__name__)

app.register_blueprint(jamu_bp)
login(app)

if __name__ == "main":
    app.run(debug=True)

