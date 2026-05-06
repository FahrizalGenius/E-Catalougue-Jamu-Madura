import sqlite3
from backend.conn import get_db


def get_jenis():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT jenis.id_jenis,jenis.nama_jenis
        FROM jenis
        
        """
    )
    data = cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]


def create_jenis(nama_jenis, khasiat):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO jenis (nama_jenis, khasiat) VALUES (?, ?)",
        (nama_jenis, khasiat),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {"message": "Data berhasil ditambah", "id_jenis": new_id}


def update_jenis(id_jenis, nama_jenis, khasiat):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE jenis
        SET nama_jenis = ?, khasiat = ?
        WHERE id_jenis = ?
        """,
        (nama_jenis, khasiat, id_jenis),
    )
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return {"message": "Data tidak ditemukan"}
    return {"message": "Data berhasil diupdate"}


def delete_jenis(id_jenis):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM jenis
        WHERE id_jenis = ?
        """,
        (id_jenis,),
    )
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return {"message": "Data tidak ditemukan"}
    return {"message": "Data berhasil dihapus"}