from flask import Blueprint, jsonify
from models.jamu_models import get_jamu, delete_jamu, update_jamu, create_jamu


jamu_bp = Blueprint("jamu", __name__)

@jamu_bp.route("/jamu",methods=["GET"])
def get_all_jamu():
    data=get_jamu()
    return jsonify(data)

@jamu_bp.route("/jamu/<int:id>", methods=["DELETE"])
def delete_jamu(id):
    data=delete_jamu(id)
    return jsonify({"message": "deleted", "data": data})

# @jamu_bp.route("/jamu/ini")