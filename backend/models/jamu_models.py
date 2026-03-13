import sqlite3
from backend.conn import get_db

get_db()

def get_jamu():
    conn =get_db()
    cursor=conn.cursor()

    cursor.execute(
    """
    SELECT jamu.nama_jamu, kategori.nama_kategori
    FROM jamu
    JOIN Kategori ON Jamu.id_kategori = kategori.id_kategori
    """
    )
    data =cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]

def create_jamu(nama_jamu, khasiat):
    conn =get_db()
    cursor=conn.cursor()

    cursor.execute(
    """
    INSERT INTO jamu (nama_jamu,khasiat) VALUES (?,?)
    """
    )
    data =cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]

def update_jamu(id ,nama_jamu, khasiat):
    conn =get_db()
    cursor=conn.cursor()

    cursor.execute(
    """
    UPDATE jamu SET nama_jamu=?,khasiat=? WHERE id_jamu=?
    """
    )
    data =cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]

def delete_jamu(id):
    conn =get_db()
    cursor=conn.cursor()

    cursor.execute(
    """
    DELETE FROM jamu WHERE id_jamu=?,
    """
    )
    data =cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]