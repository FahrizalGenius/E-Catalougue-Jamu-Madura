import sqlite3
from backend.conn import get_db
conn = get_db
cursor=conn.cursor()

def get_kategori():
    cursor.execute(
        """
        SELECT * FROM kategori
        """
    )

    conn.close()
    data= cursor.fetchall()
    return [dict(row) for row in data]

def create_kategori(nama):
    cursor.execute(
        """
        INSERT INTO kategori (nama_kategori) VALUE(?)
        """,(nama,)
    )

    conn.close()
    data= cursor.fetchall()
    return [dict(row) for row in data]

def update_kategori(id,nama):
    cursor.execute(
        """
        UPDATE kategori SET nama_kategori=? where id_kategori=?
        """,(nama,id)
    )

    conn.close()
    data= cursor.fetchall()
    return [dict(row) for row in data]

def delete_kategori(id):
    cursor.execute(
        """
        DELETE FROM kategori WHere id_kategori=?
        """,(id)
    )

    conn.close()
    data= cursor.fetchall()
    return [dict(row) for row in data]