CREATE TABLE jamu (
id_jamu INTEGER PRIMARY KEY AUTOINCREMENT,
nama_jamu TEXT,
khasiat TEXT,
kandungan TEXT,
aturan_minum TEXT,
efek_samping TEXT,
id_kategori INTEGER,
id_jenis INTEGER,
id_produsen INTEGER,
id_lokasi_produksi INTEGER,
id_kabupaten INTEGER,
id_perizinan INTEGER
);


CREATE TABLE kategori (
id_kategori INTEGER PRIMARY KEY AUTOINCREMENT,
nama_kategori TEXT
);

CREATE TABLE jenis (
id_jenis INTEGER PRIMARY KEY AUTOINCREMENT,
nama_jenis TEXT
);

CREATE TABLE produsen (
id_produsen INTEGER PRIMARY KEY AUTOINCREMENT,
nama_produsen TEXT
);

CREATE TABLE lokasi_produksi (
id_lokasi_produksi INTEGER PRIMARY KEY AUTOINCREMENT,
nama_lokasi TEXT
);

CREATE TABLE kabupaten (
id_kabupaten INTEGER PRIMARY KEY AUTOINCREMENT,
nama_kabupaten TEXT
);

CREATE TABLE perizinan (
id_perizinan INTEGER PRIMARY KEY AUTOINCREMENT,
nama_perizinan TEXT
);