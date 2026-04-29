import sqlite3
from backend.conn import get_db


def get_jamu():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT jamu.nama_jamu, kategori.nama_kategori
        FROM jamu
        JOIN kategori ON jamu.id_kategori = kategori.id_kategori
        """
    )
    data = cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]


def create_jamu(nama_jamu, khasiat):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO jamu (nama_jamu, khasiat) VALUES (?, ?)",
        (nama_jamu, khasiat),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {"message": "Data berhasil ditambah", "id_jamu": new_id}


def update_jamu(id_jamu, nama_jamu, khasiat):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE jamu
        SET nama_jamu = ?, khasiat = ?
        WHERE id_jamu = ?
        """,
        (nama_jamu, khasiat, id_jamu),
    )
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return {"message": "Data tidak ditemukan"}
    return {"message": "Data berhasil diupdate"}


def delete_jamu(id_jamu):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM jamu
        WHERE id_jamu = ?
        """,
        (id_jamu,),
    )
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return {"message": "Data tidak ditemukan"}
    return {"message": "Data berhasil dihapus"}