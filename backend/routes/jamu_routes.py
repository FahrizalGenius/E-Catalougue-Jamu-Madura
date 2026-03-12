from flask import Blueprint, jsonify
from models.jamu_models import get_jamu

jamu_bp = Blueprint("jamu", __name__)

@jamu_bp.route("/jamu",methods=["GET"])
def get_all_jamu():

    data=get_jamu()
    return jsonify(data)