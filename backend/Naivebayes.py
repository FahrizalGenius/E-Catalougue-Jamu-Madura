# ======================
# IMPORT LIBRARY
# ======================
import pandas as pd
import numpy as np
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

from rank_bm25 import BM25Okapi

# ======================
# LOAD DATA
# ======================
df = pd.read_excel("jamu206.xlsx")

# ======================
# CLEANING
# ======================
df = df.dropna(subset=['KHASIAT'])

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['clean'] = df['KHASIAT'].apply(preprocess)

# ======================
# TOKEN BM25
# ======================
df['tokens'] = df['clean'].apply(lambda x: x.split())

# ======================
# LABELING
# ======================
label_map = {
    'kesehatan_wanita': ['keputih', 'kewanitaan', 'haid', 'miss v', 'rahim'],
    'pencernaan': ['perut', 'lambung', 'maag', 'diare', 'sembelit'],
    'metabolisme': ['nafsu makan', 'kurus', 'gemuk'],
    'nyeri': ['pegal', 'linu', 'nyeri', 'sendi', 'asam urat'],
    'imunitas': ['flu', 'batuk', 'demam'],
    'stamina': ['lelah', 'capek', 'energi']
}

def labeling(text):
    text = str(text).lower()
    scores = {label: 0 for label in label_map}

    for label, keywords in label_map.items():
        for keyword in keywords:
            if keyword in text:
                scores[label] += 1

    best_label = max(scores, key=scores.get)
    return best_label if scores[best_label] > 0 else 'stamina'

df['label'] = df['KHASIAT'].apply(labeling)

# ======================
# SPLIT
# ======================
X = df['clean']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ======================
# STOPWORDS
# ======================
custom_stopwords = [
    'dan','yang','untuk','dengan','atau','pada','dari','ke'
]

# ======================
# MODEL NB + NGRAM
# ======================
model = Pipeline([
    ('bow', CountVectorizer(
        ngram_range=(1,3),
        stop_words=custom_stopwords
    )),
    ('nb', MultinomialNB())
])

model.fit(X_train, y_train)

# ======================
# EVALUASI
# ======================
y_pred = model.predict(X_test)

print("\n=== HASIL NB + NGRAM ===")
print(classification_report(y_test, y_pred))
print("Akurasi:", accuracy_score(y_test, y_pred))

# ======================
# REKOMENDASI BM25
# ======================
def rekomendasi_jamu(query, top_n=10):
    query_clean = preprocess(query)
    query_tokens = query_clean.split()

    pred_label = model.predict([query_clean])[0]

    filtered_df = df[df['label'] == pred_label].copy()

    bm25 = BM25Okapi(filtered_df['tokens'].tolist())
    scores = bm25.get_scores(query_tokens)

    filtered_df['score'] = scores

    hasil = filtered_df.sort_values(by='score', ascending=False)

    print("\nKeluhan:", query)
    print("Kategori:", pred_label)

    return hasil[['NAMA JAMU','KHASIAT','score']].head(top_n)

# ======================
# TEST
# ======================
print(rekomendasi_jamu("pegal nyeri sendi dan asam urat"))