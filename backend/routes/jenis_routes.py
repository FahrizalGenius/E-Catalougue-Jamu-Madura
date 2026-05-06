from flask import Blueprint, jsonify, request
from models import db, JenisJamu 
from flask_jwt_extended import jwt_required

jamu_bp = Blueprint('jamu', __name__)

@jamu_bp.route('/jenis', methods=['GET'])
@jwt_required()
def get_jenis():
    try:
        data_jamu = JenisJamu.query.all()
        hasil_json = [jamu.to_dict() for jamu in data_jamu]

        return jsonify({
            "status": "success",
            "message": "Data berhasil diambil",
            "data": hasil_json
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@jamu_bp.route('/jenis/<int:id_hapus>', methods=['DELETE'])
@jwt_required()
def hapus_jenis(id_hapus):
    try: 
        jamu_target = JenisJamu.query.get(id_hapus)

        if not jamu_target:
            return jsonify({
                "status": "error",
                "message": "data tidak ditemukan"
            }), 404 
        
        db.session.delete(jamu_target)
        db.session.commit()

        return jsonify({"status": "success", "message": "Data berhasil dihapus"}), 200

    except Exception as e: 
        return jsonify({
            "status": "error",
            "message": str(e), 
        }), 500


@jamu_bp.route('/jenis', methods=['POST'])
@jwt_required()
def tambah_jenis():
    try:
        data = request.json
        input_nama = data.get('nama_jenis')

        if not input_nama:
            return jsonify ({
                "status": "error",
                "message" :"Nama jamu tidak boleh kosong"
            }), 400
            
        jenis_baru = JenisJamu(nama_jenis = input_nama)

        db.session.add(jenis_baru)
        db.session.commit()

        return jsonify ({
            "status":"success",
            "message": "Data jamu berhasil di tambahkan"
        }), 201
    except Exception as e:
        return jsonify ({
            "status" : "error",
            "message" : str(e)
        }), 500
    
# ====================================
@jamu_bp.route('/jenis/<int:id_edit>', methods=['PUT'])
@jwt_required()
def edit_jenis(id_edit):
    try:
        jamu_target = JenisJamu.query.get(id_edit)

        if not jamu_target:
            return jsonify ({
                "status" : "error",
                "message" : "Data tidak ditemukan"
            }), 404
      
        data = request.json
        input_nama_baru = data.get('nama_jenis')

        if not input_nama_baru:
            return jsonify ({
                "status" : "error",
                "message" :"Data tidak boleh khosong"
            }), 400
        
        jamu_target.nama_jenis = input_nama_baru
        db.session.commit()

        return jsonify ({
            "status" : "success",
            "message" : "Jenis berhasil di tambahkan cuy"
        }), 200

    except Exception as e: 
        return jsonify ({
            "status": "error",
            "message": str(e)
        }), 500