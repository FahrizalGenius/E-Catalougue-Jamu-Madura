import os
import joblib  
from flask import Blueprint, jsonify, request
from models.jamu_models import db, Jamu
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from sklearn.base import BaseEstimator, TransformerMixin  
from sklearn.metrics.pairwise import cosine_similarity  # <-- WAJIB UNTUK HITUNG RANKING VEKTOR

jamu_bp = Blueprint('jamu', __name__)

# Folder tempat berkas gambar fisik disimpan di backend
UPLOAD_FOLDER = os.path.join('static', 'uploads')


# ====================================================================
# 🧠 0A. DEFINISI CUSTOM CLASS TEXT PREPROCESSOR (SUNTIK NAMESPACE)
# ====================================================================
class TextPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self):
        from nltk.corpus import stopwords
        self.stop_words = set(stopwords.words('indonesian'))
        self.stop_words.add('melalui')
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return [self.clean_text(text) for text in X]

    def clean_text(self, text):
        import re
        import string
        text = str(text).lower()
        text = re.sub(r'http\S+|www\S+', '', text)
        text = re.sub(r'\d+', '', text)
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = re.sub(r'\s+', ' ', text).strip()
        tokens = text.split()
        tokens = [w for w in tokens if w not in self.stop_words]
        return " ".join(tokens)

# Trik sakti agar unpickling joblib di Flask tidak AttributeError
import __main__
__main__.TextPreprocessor = TextPreprocessor


# ====================================================================
# 🤖 0B. LOAD MODEL MACHINE LEARNING (Melacak folder nlp4)
# ====================================================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  
ROOT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))  
MODEL_PATH = os.path.join(ROOT_DIR, "NLP", "nlp4", "model_pipeline.pkl")

print("\n==============================================")
print(f"🔬 Melacak Model ML ke: {MODEL_PATH}")
print("==============================================\n")

try:
    model_ml = joblib.load(MODEL_PATH)
    print("✅ Model Machine Learning Berhasil Dimuat!")
except Exception as e:
    print(f"⚠️ GAGAL MEMUAT MODEL ML: {e}")
    model_ml = None


# ====================================================================
# 🛠️ 0C. FUNGSI ANTI-TYPO (Kamus Pembersihan Kata Masukan User)
# ====================================================================
def typo_correction(text):
    kamus_typo = {
        "sya": "saya", "pegel": "pegal", "bdan": "badan", "capek": "capai",
        "bnyak": "banyak", "utk": "untuk", "dgn": "dengan", "yg": "yang",
        "smbuh": "sembuh", "skit": "sakit", "kpl": "kepala", "lsh": "lesu",
        "perot": "perut", "kmbug": "kembung", "niri": "nyeri", "lunu": "linu"
    }
    words = str(text).lower().split()
    corrected_words = [kamus_typo.get(w, w) for w in words]
    return " ".join(corrected_words)


# ====================================================================
# 🎯 1. GET ALL JAMU (Dashboard Admin)
# ====================================================================
@jamu_bp.route('/jamu', methods=['GET'])
@jwt_required()
def get_all_jamu():
    try:
        data_jamu = Jamu.query.all()
        hasil_json = [item.to_dict() for item in data_jamu] 
        return jsonify({"status": "success", "message": "Seluruh data Jamu berhasil diambil", "data": hasil_json}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 2. GET SINGLE JAMU BY ID + SARAN TERKAIT (COSINE SIMILARITY)
# ====================================================================
@jamu_bp.route('/jamu/<int:id_jamu>', methods=['GET'])
# @jwt_required()  # 🔥 Lepas untuk publik agar tidak error 401
def get_jamu_by_id(id_jamu):
    try:
        target = Jamu.query.get(id_jamu)
        if not target:
            return jsonify({"status": "error", "message": "Jamu tidak ditemukan"}), 404
            
        jamu_utama_dict = target.to_dict()
        all_jamu = Jamu.query.all()
        saran_jamu_lainnya = []
        
        # Hitung similarity jika model siap dan data pembanding tersedia
        if model_ml is not None and len(all_jamu) > 1:
            try:
                transformer_prep = model_ml.named_steps['prep']
                transformer_tfidf = model_ml.named_steps['tfidf']

                # Ekstrak vektor jamu aktif saat ini
                khasiat_utama = str(target.khasiat or "")
                query_clean = transformer_prep.transform([khasiat_utama])
                matrix_query = transformer_tfidf.transform(query_clean)

                # Ekstrak vektor seluruh dataset di DB
                khasiat_semua = [str(item.khasiat or "") for item in all_jamu]
                dataset_clean = transformer_prep.transform(khasiat_semua)
                matrix_dataset = transformer_tfidf.transform(dataset_clean)

                # Hitung matematika Cosine Similarity
                skor_similarity = cosine_similarity(matrix_query, matrix_dataset).flatten()

                for idx, item in enumerate(all_jamu):
                    # Paksa konversi ke integer murni biar aman dari bug tipe data
                    if int(item.id_jamu or 0) == int(target.id_jamu or 0):
                        continue
                        
                    item_dict = item.to_dict()
                    item_dict['skor_matching'] = float(skor_similarity[idx])
                    saran_jamu_lainnya.append(item_dict)

                # Sortir dari yang paling mirip khasiatnya
                saran_jamu_lainnya.sort(key=lambda x: x['skor_matching'], reverse=True)
                saran_jamu_lainnya = saran_jamu_lainnya[:5]  # Ambil Top 5
                
            except Exception as nlp_err:
                print(f"⚠️ GAGAL MENGHITUNG COSINE SIMILARITY DI DETAIL: {nlp_err}")
                saran_jamu_lainnya = []

        return jsonify({
            "status": "success",
            "message": "Detail data Jamu berhasil diambil",
            "data": jamu_utama_dict,
            "jamu_terkait": saran_jamu_lainnya
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 3. INSERT (Tambah Jamu)
# ====================================================================
@jamu_bp.route('/jamu', methods=['POST'])
@jwt_required()
def tambah_jamu():
    try:
        nama_jamu = request.form.get('nama_jamu')
        if not nama_jamu:
            return jsonify({"status": "error", "message": "Nama jamu tidak boleh kosong!"}), 400
        
        nama_file_gambar = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                nama_file_gambar = filename

        jamu_baru = Jamu(
            nama_jamu=nama_jamu,
            khasiat=request.form.get('khasiat'),
            kandungan=request.form.get('kandungan'),
            aturan_minum=request.form.get('aturan_minum'),
            efek_samping=request.form.get('efek_samping'),
            image=nama_file_gambar,
            id_jenis=request.form.get('id_jenis'),
            id_produsen=request.form.get('id_produsen'),
            id_lokasi_produksi=request.form.get('id_lokasi_produksi'),
            id_kabupaten=request.form.get('id_kabupaten'),
            id_perizinan=request.form.get('id_perizinan'),
            id_lokasi_pemasaran=request.form.get('id_lokasi_pemasaran')
        )
        db.session.add(jamu_baru)
        db.session.commit()
        return jsonify({"status": "success", "message": f"Jamu {jamu_baru.nama_jamu} berhasil didaftarkan!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 4. UPDATE (Edit Jamu)
# ====================================================================
@jamu_bp.route('/jamu/<int:id_edit>', methods=['PUT'])
@jwt_required()
def edit_jamu(id_edit):
    try:
        target = Jamu.query.get(id_edit)
        if not target:
            return jsonify({"status": "error", "message": "Jamu tidak ditemukan"}), 404
        
        target.nama_jamu = request.form.get('nama_jamu', target.nama_jamu)
        target.khasiat = request.form.get('khasiat', target.khasiat)
        target.kandungan = request.form.get('kandungan', target.kandungan)
        target.aturan_minum = request.form.get('aturan_minum', target.aturan_minum)
        target.efek_samping = request.form.get('efek_samping', target.efek_samping)
        
        target.id_jenis = request.form.get('id_jenis', target.id_jenis)
        target.id_produsen = request.form.get('id_produsen', target.id_produsen)
        target.id_lokasi_produksi = request.form.get('id_lokasi_produksi', target.id_lokasi_produksi)
        target.id_kabupaten = request.form.get('id_kabupaten', target.id_kabupaten)
        target.id_perizinan = request.form.get('id_perizinan', target.id_perizinan)
        target.id_lokasi_pemasaran = request.form.get('id_lokasi_pemasaran', target.id_lokasi_pemasaran)

        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                if target.image:
                    path_gambar_lama = os.path.join(UPLOAD_FOLDER, target.image)
                    if os.path.exists(path_gambar_lama):
                        os.remove(path_gambar_lama)
                filename = secure_filename(file.filename)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                target.image = filename 

        db.session.commit()
        return jsonify({"status": "success", "message": "Data Jamu berhasil diupdate"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 5. DELETE (Hapus Jamu)
# ====================================================================
@jamu_bp.route('/jamu/<int:id_hapus>', methods=['DELETE'])
@jwt_required()
def hapus_jamu(id_hapus):
    try:
        target = Jamu.query.get(id_hapus)
        if not target:
            return jsonify({"status": "error", "message": "Data tidak ditemukan"}), 404
        
        if target.image:
            path_file_fisik = os.path.join(UPLOAD_FOLDER, target.image)
            if os.path.exists(path_file_fisik):
                os.remove(path_file_fisik) 

        db.session.delete(target)
        db.session.commit()
        return jsonify({"status": "success", "message": "Jamu beserta file gambarnya berhasil dihapus"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 6. GET ALL JAMU FOR PUBLIC
# ====================================================================
@jamu_bp.route('/jamu/public', methods=['GET'])
def get_public_jamu():
    try:
        data_jamu = Jamu.query.all()
        hasil_json = [item.to_dict() for item in data_jamu] 
        return jsonify({"status": "success", "message": "Data katalog jamu publik berhasil diambil", "data": hasil_json}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 7. GET UNIQUE FILTERS FOR PUBLIC
# ====================================================================
@jamu_bp.route('/jamu/public-filters', methods=['GET'])
def get_public_filters():
    try:
        all_jamu = Jamu.query.all()
        all_jamu_dict = [item.to_dict() for item in all_jamu]
        
        jenis_unik = sorted(list(set([item.get('nama_jenis') for item in all_jamu_dict if item.get('nama_jenis')])))
        kabupaten_unik = sorted(list(set([item.get('nama_kabupaten') for item in all_jamu_dict if item.get('nama_kabupaten')])))
        perizinan_unik = sorted(list(set([item.get('nama_perizinan') for item in all_jamu_dict if item.get('nama_perizinan')])))
        
        return jsonify({
            "status": "success",
            "message": "Data pilihan filter berhasil diekstrak",
            "data": {"jenis": jenis_unik, "kabupaten": kabupaten_unik, "perizinan": perizinan_unik}
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 8. POST RECOMMENDATION VIA ML PIPELINE (SINKRON TOP 10 COSINE SIM)
# ====================================================================
@jamu_bp.route('/jamu/recommend', methods=['POST', 'OPTIONS'])
def dapatkan_rekomendasi_ml():
    if request.method == 'OPTIONS':
        return jsonify({"status": "success"}), 200

    if model_ml is None:
        return jsonify({"status": "error", "message": "Model ML pkl tidak aktif di server", "data": []}), 500

    try:
        data = request.get_json(silent=True) or {}
        teks_input = data.get('keluhan', '')

        if not teks_input or not teks_input.strip():
            return jsonify({"status": "error", "message": "Teks keluhan tidak boleh kosong!"}), 400

        # 🧠 A. Koreksi Typo Keluhan
        teks_terkoreksi = typo_correction(teks_input)
        label_prediksi = model_ml.predict([teks_terkoreksi])[0]
        probabilitas = model_ml.predict_proba([teks_terkoreksi]).max()

        print("\n================== 🧠 AI PREDICTION LOG ==================")
        print(f"Input User      : {teks_input}")
        print(f"Koreksi Typo    : {teks_terkoreksi}")
        print(f"Hasil Prediksi  : {label_prediksi}")
        print(f"Confidence Score: {probabilitas:.4f}")
        print("==========================================================\n")

        # 🔍 B. Ambil Seluruh Baris Data Jamu dari SQLite
        semua_jamu = Jamu.query.all()
        if not semua_jamu:
            return jsonify({"status": "success", "data": []}), 200

        # C. Ekstrak Komponen Pembantu Transformer Dari Objek Pipeline
        transformer_prep = model_ml.named_steps['prep']
        transformer_tfidf = model_ml.named_steps['tfidf']

        # 📊 D. Hitung Vektor TF-IDF Baris Khasiat SQLite & Input Keluhan User
        khasiat_list = [str(item.khasiat or "") for item in semua_jamu]
        dataset_clean = transformer_prep.transform(khasiat_list)
        matrix_tfidf_dataset = transformer_tfidf.transform(dataset_clean)

        query_clean = transformer_prep.transform([teks_terkoreksi])
        matrix_tfidf_query = transformer_tfidf.transform(query_clean)

        # ⚖️ E. Hitung Nilai Keterdekatan Vektor Cosine Similarity
        skor_similarity = cosine_similarity(matrix_tfidf_query, matrix_tfidf_dataset).flatten()

        # 🏆 F. Bundling Data & Slicing Ambil Top 10 Terbaik
        hasil_json = []
        for idx, item in enumerate(semua_jamu):
            item_dict = item.to_dict()
            item_dict['skor_matching'] = float(skor_similarity[idx])
            hasil_json.append(item_dict)

        # Sortir secara descending berdasarkan tingkat kemiripan teks
        hasil_json.sort(key=lambda x: x['skor_matching'], reverse=True)
        top_10_rekomendasi = hasil_json[:10]

        return jsonify({
            "status": "success",
            "message": "Model AI berhasil meramu rekomendasi jamu",
            "prediksi_label": str(label_prediksi),
            "confidence": float(probabilitas),
            "data": top_10_rekomendasi
        }), 200

    except Exception as e:
        print(f"❌ ERROR DI RUTE /recommend: {e}")
        return jsonify({"status": "error", "message": str(e), "data": []}), 500