import csv
import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

with open('data_jamu_274.csv', newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)

    for row in reader:

        # cek kategori
        cursor.execute(
            "SELECT id_kategori FROM kategori WHERE nama_kategori=?",
            (row["KATEGORI"],)
        )

        kategori = cursor.fetchone()

        if kategori is None:
            cursor.execute(
                "INSERT INTO kategori (nama_kategori) VALUES (?)",
                (row["KATEGORI"],)
            )
            id_kategori = cursor.lastrowid
        else:
            id_kategori = kategori[0]

        # cek jenis
        cursor.execute(
            "SELECT id_jenis FROM jenis WHERE nama_jenis=?",
            (row["JENIS"],)
        )

        jenis = cursor.fetchone()

        if jenis is None:
            cursor.execute(
                "INSERT INTO jenis (nama_jenis) VALUES (?)",
                (row["JENIS"],)
            )
            id_jenis = cursor.lastrowid
        else:
            id_jenis = jenis[0]

        # insert jamu
        cursor.execute("""
        INSERT INTO jamu (
            nama_jamu, khasiat, kandungan, aturan_minum, efek_samping,
            id_kategori, id_jenis
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            row["NAMA JAMU"],
            row["KHASIAT"],
            row["KANDUNGAN"],
            row["ATURAN MINUM"],
            row["EFEK SAMPING"],
            id_kategori,
            id_jenis
        ))

conn.commit()
conn.close()

print("Data berhasil dimasukkan 🚀")