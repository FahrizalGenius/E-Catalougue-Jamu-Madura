import csv
from app import db, Jamu

with open('jamu.csv', newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)

    for row in reader:
        jamu = Jamu(
            nama=row['nama'],
            manfaat=row['manfaat'],
            bahan=row['bahan']
        )

        db.session.add(jamu)

    db.session.commit()

print("Data berhasil dimasukkan!")