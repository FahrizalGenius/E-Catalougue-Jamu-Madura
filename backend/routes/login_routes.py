import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

auth_bp = Blueprint('auth',__name__)

Admin_user= os.getenv('Admin_Username')
Admin_password= os.getenv('Admin_Password')

@auth_bp.route('/4dm13n',methods=['POST'])
def login():
    data = request.json
    input_username=data.get('username')
    input_password=data.get('password')

    if input_username == Admin_user and input_password == Admin_password :
        return jsonify({"message": "Login Admin Berhasil!", "status": "success"}), 200
    
    return jsonify({"message": "Username atau password salah", "status": "error"}), 401