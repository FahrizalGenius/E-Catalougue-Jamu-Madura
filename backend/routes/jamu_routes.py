import os
import re
import joblib  
import json
from flask import Blueprint, jsonify, request
from models.jamu_models import db, Jamu
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from sklearn.base import BaseEstimator, TransformerMixin  
from sklearn.metrics.pairwise import cosine_similarity  # <-- Dipertahankan untuk kalkulasi matriks NLP Abang

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

# Trik sakti menyuntikkan kelas ke module __main__ Flask agar unpickling lancar
import __main__
__main__.TextPreprocessor = TextPreprocessor


# ====================================================================
# 🤖 0B. LOAD MODEL MACHINE LEARNING & KAMUS EXTERNAL JSON
# ====================================================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Folder /backend/routes
ROOT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))  # Mundur ke root project
MODEL_PATH = os.path.join(ROOT_DIR, "NLP", "nlp4", "model_pipeline.pkl")
KAMUS_PATH = os.path.join(BASE_DIR, "..", "kamus_typo.json")

print("\n==============================================")
print(f"🔬 Melacak Model ML ke: {MODEL_PATH}")
print("==============================================\n")

try:
    model_ml = joblib.load(MODEL_PATH)
    print("✅ Model Machine Learning Berhasil Dimuat!")
except Exception as e:
    print(f"⚠️ GAGAL MEMUAT MODEL ML: {e}")
    model_ml = None

try:
    with open(KAMUS_PATH, 'r') as f:
        kamus_dict = json.load(f)
    print("✅ Kamus Typo Berhasil Dimuat dari JSON!")
except Exception as e:
    print(f"⚠️ GAGAL MEMUAT KAMUS TYPO: {e}")
    kamus_dict = {}


# ====================================================================
# 🛠️ 0C. FUNGSI ANTI-TYPO (Mendukung Casing & Tanda Baca via JSON)
# ====================================================================
def typo_correction(text):
    if not kamus_dict:
        return text
    tokens = text.split()
    corrected_tokens = []
    
    for token in tokens:
        # Regex memisahkan tanda baca di depan/belakang kata
        match = re.match(r'^([^\w]*)([\w\-\']+)([^\w]*)$', token)
        if match:
            prefix, word, suffix = match.groups()
            word_lower = word.lower()
            if word_lower in kamus_dict:
                corrected_word = kamus_dict[word_lower]
                # Menjaga Title Case atau UPPERCASE asal
                if word.istitle():
                    corrected_word = corrected_word.title()
                elif word.isupper():
                    corrected_word = corrected_word.upper()
                corrected_tokens.append(f"{prefix}{corrected_word}{suffix}")
            else:
                corrected_tokens.append(token)
        else:
            corrected_tokens.append(token)
            
    return " ".join(corrected_tokens)


# ====================================================================
# 🎯 1. GET ALL JAMU (Dashboard Admin)
# ====================================================================
@jamu_bp.route('/jamu', methods=['GET'])
@jwt_required()
def get_all_jamu():
    try:
        data_jamu = Jamu.query.all()
        hasil_json = [item.to_dict() for item in data_jamu] 

        return jsonify({
            "status": "success",
            "message": "Seluruh data Jamu berhasil diambil",
            "data": hasil_json
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ====================================================================
# 🎯 2. GET SINGLE JAMU BY ID + REKOMENDASI TERKAIT (COSINE SIMILARITY)
# ====================================================================
@jamu_bp.route('/jamu/<int:id_jamu>', methods=['GET'])
# @jwt_required()  # 🔥 Tetap dicopot agar bisa diakses oleh Publik (User Umum) tanpa error 401
def get_jamu_by_id(id_jamu):
    try:
        target = Jamu.query.get(id_jamu)
        if not target:
            return jsonify({"status": "error", "message": "Jamu tidak ditemukan"}), 404
            
        jamu_utama_dict = target.to_dict()
        all_jamu = Jamu.query.all()
        saran_jamu_lainnya = []
        
        # Jalankan mesin kalkulasi kemiripan khasiat menggunakan model TF-IDF bawaan pkl Abang
        if model_ml is not None and len(all_jamu) > 1:
            try:
                transformer_prep = model_ml.named_steps['prep']
                transformer_tfidf = model_ml.named_steps['tfidf']

                # Hitung matriks khasiat jamu utama
                khasiat_utama = str(target.khasiat or "")
                query_clean = transformer_prep.transform([khasiat_utama])
                matrix_query = transformer_tfidf.transform(query_clean)

                # Hitung matriks khasiat pembanding dari seluruh baris SQLite
                khasiat_semua = [str(item.khasiat or "") for item in all_jamu]
                dataset_clean = transformer_prep.transform(khasiat_semua)
                matrix_dataset = transformer_tfidf.transform(dataset_clean)

                # Dapatkan skor linear Cosine Similarity
                skor_similarity = cosine_similarity(matrix_query, matrix_dataset).flatten()

                for idx, item in enumerate(all_jamu):
                    # Proteksi: paksa ke integer agar aman dari bug beda tipe data penampung
                    if int(item.id_jamu or 0) == int(target.id_jamu or 0):
                        continue
                        
                    item_dict = item.to_dict()
                    item_dict['skor_matching'] = float(skor_similarity[idx])
                    saran_jamu_lainnya.append(item_dict)

                # Urutkan dari produk dengan kesamaan khasiat tertinggi
                saran_jamu_lainnya.sort(key=lambda x: x['skor_matching'], reverse=True)
                saran_jamu_lainnya = saran_jamu_lainnya[:5]  # Batasi ambil Top 5 saja
                
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

        return jsonify({
            "status": "success",
            "message": f"Jamu {jamu_baru.nama_jamu} berhasil didaftarkan!"
        }), 201
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

        return jsonify({
            "status": "success",
            "message": "Data katalog jamu publik berhasil diambil",
            "data": hasil_json
        }), 200
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
        
        if all_jamu_dict:
            print("\n==================================================================")
            print("🔬 ISI DATA JAMU PERTAMA:", all_jamu_dict[0])
            print("==================================================================\n")
        
        jenis_unik = sorted(list(set([item.get('nama_jenis') for item in all_jamu_dict if item.get('nama_jenis')])))
        kabupaten_unik = sorted(list(set([item.get('nama_kabupaten') for item in all_jamu_dict if item.get('nama_kabupaten')])))
        perizinan_unik = sorted(list(set([item.get('nama_perizinan') for item in all_jamu_dict if item.get('nama_perizinan')])))
        
        return jsonify({
            "status": "success",
            "message": "Data pilihan filter berhasil diekstrak",
            "data": {
                "jenis": jenis_unik,
                "kabupaten": kabupaten_unik,
                "perizinan": perizinan_unik
            }
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
        skip_correction = data.get('skip_correction', False)

        if not teks_input or not teks_input.strip():
            return jsonify({"status": "error", "message": "Teks keluhan tidak boleh kosong!"}), 400

        # 🧠 1. Jalankan Koreksi Kata Typo bawaan model
        teks_terkoreksi_calculated = typo_correction(teks_input)
        teks_terkoreksi = teks_input if skip_correction else teks_terkoreksi_calculated
        
        # Dapatkan prediksi payung kategori Naive Bayes
        label_prediksi = model_ml.predict([teks_terkoreksi])[0]
        probabilitas = model_ml.predict_proba([teks_terkoreksi]).max()

        print("\n================== 🧠 AI PREDICTION LOG ==================")
        print(f"Input User      : {teks_input}")
        print(f"Koreksi Typo    : {teks_terkoreksi}")
        print(f"Hasil Prediksi  : {label_prediksi}")
        print(f"Confidence Score: {probabilitas:.4f}")
        print("==========================================================\n")

        # 🔍 2. Ambil data jamu lengkap dari SQLite untuk perangkingan matematika
        semua_jamu = Jamu.query.all()
        hasil_sementara = []
        
        if semua_jamu:
            prep_transformer = model_ml.named_steps['prep']
            tfidf_vectorizer = model_ml.named_steps['tfidf']
            
            # 1. Transformasi keluhan input user menggunakan pipeline model nlp
            query_clean = prep_transformer.transform([teks_terkoreksi])
            query_vector = tfidf_vectorizer.transform(query_clean)
            
            # 2. Gabungkan nama_jamu dan khasiat untuk pencarian yang lebih optimal
            jamu_texts = [f"{item.nama_jamu or ''} {item.khasiat or ''}" for item in semua_jamu]
            jamu_clean = prep_transformer.transform(jamu_texts)
            jamu_vectors = tfidf_vectorizer.transform(jamu_clean)
            
            # 3. Hitung cosine similarity antara keluhan dan semua jamu
            similarities = cosine_similarity(query_vector, jamu_vectors)[0]
            
            for idx, item in enumerate(semua_jamu):
                skor_persen = round(float(similarities[idx]) * 100, 1)
                
                # Masukkan hanya jamu dengan tingkat kecocokan > 0%
                if skor_persen > 0:
                    item_dict = item.to_dict()
                    item_dict['relevansi'] = skor_persen
                    # Samakan key 'skor_matching' agar frontend React tidak pecah saat rendering data
                    item_dict['skor_matching'] = float(similarities[idx])
                    hasil_sementara.append(item_dict)
                    
        # Urutkan berdasarkan skor tertinggi ke terendah
        hasil_sementara = sorted(hasil_sementara, key=lambda x: x['relevansi'], reverse=True)
        
        # Potong array untuk mengambil Top 10 terbaik
        hasil_json = hasil_sementara[:10]

        return jsonify({
            "status": "success",
            "message": "Model AI berhasil meramu rekomendasi jamu",
            "prediksi_label": str(label_prediksi),
            "confidence": float(probabilitas),
            "teks_asli": teks_input,
            "teks_terkoreksi": teks_terkoreksi_calculated,
            "data": hasil_json
        }), 200

    except Exception as e:
        print(f"❌ ERROR DI RUTE /recommend: {e}")
        return jsonify({"status": "error", "message": str(e), "data": []}), 500