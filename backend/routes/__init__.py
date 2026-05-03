from .login_routes import auth_bp

def login(app):
    app.register_blueprint(auth_bp, url_prefix='/api')