from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 1. PERBAIKAN: Pakai tanda TITIK, bukan koma
class JenisJamu(db.Model): 
    __tablename__ = "jenis"

    # 2. PERBAIKAN: Huruf "I" pada Integer harus besar
    id_jenis = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # 3. PERBAIKAN: Huruf "S" pada String harus besar
    nama_jenis = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "id_jenis": self.id_jenis,
            "nama_jenis": self.nama_jenis
        }