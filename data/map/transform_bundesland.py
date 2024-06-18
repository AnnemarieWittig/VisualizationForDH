import pandas as pd
import json

# Laden der CSV-Datei
df = pd.read_csv('./bundeslanddata.csv')

# Erstellen des gewünschten JSON-Formats
json_data = {}
for index, row in df.iterrows():
    bundesland = row['Bundesland']
    json_data[bundesland] = {
        "female": row['Weiblich'],
        "male": row['Männlich'],
        "total": row['Insgesamt']
    }

# Konvertieren in JSON und speichern in einer Datei
json_output = json.dumps(json_data, indent=4)
with open('output.json', 'w') as json_file:
    json_file.write(json_output)
