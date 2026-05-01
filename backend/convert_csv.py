import pandas as pd

df = pd.read_excel("jamu206.xlsx")
df.to_csv('Data Jamu.csv', index=False)