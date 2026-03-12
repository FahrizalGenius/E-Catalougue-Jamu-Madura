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
    JOIN Katgori ON Jamu.id_kategori = kategori.id_kategori
    """
    )
    data =cursor.fetchall()
    conn.close()

    return [dict(row) for row in data]