import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token

load_dotenv()

auth_bp = Blueprint('auth',__name__)

# Mengambil data dari .env
Admin_user = os.getenv('Admin_Username')
Admin_password = os.getenv('Admin_Password')

@auth_bp.route('/4dm13n',methods=['POST'])
def login():
    data = request.json
    input_username = data.get('username')
    input_password = data.get('password')
    # print("=== CEK DATA LOGIN ===")
    # print(f"User dari React : '{input_username}'")
    # print(f"User dari .env  : '{Admin_user}'")
    # print(f"Pass dari React : '{input_password}'")
    # print(f"Pass dari .env  : '{Admin_password}'")
    # print("======================")

    if input_username == Admin_user and input_password == Admin_password :

        new_token = create_access_token(identity=input_username)

        return jsonify({
            "message": "Login Admin Berhasil!", 
            "status": "success",
            "token": new_token # 
        }), 200
    
    return jsonify({"message": "Username atau password salah", "status": "error"}), 401