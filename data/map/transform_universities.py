import pandas as pd
import json

# Load CSV data into a pandas DataFrame
data = pd.read_csv("universitaeten.csv")

# Define a function to calculate total professors and female quota
def calculate_totals(row):
    if not pd.isna(row['Anzahl Juniorprofessuren']) and not pd.isna(row['davon weibl.2']) and not row['Anzahl Juniorprofessuren'] == 'keine Angabe' and not row['davon weibl.2'] == 'keine Angabe':
        total_professors = int(row['Anzahl Professuren']) + int(row['Anzahl Juniorprofessuren'])
        total_female_professors = int(row['davon weibl.1']) + int(row['davon weibl.2'])
        female_quota = (total_female_professors / total_professors) * 100 if total_professors > 0 else 0
    else:
        total_professors = 'keine Angabe'
        female_quota = 'keine Angabe'
    
    return total_professors, female_quota

# Apply the function to calculate additional fields
data[['Total Professors', 'Total Female Quota']] = data.apply(calculate_totals, axis=1, result_type="expand")

# Function to switch coordinates
def switch_coordinates(coords):
    coords = eval(coords)
    if len(coords) == 2:
        return [coords[1], coords[0]]
    return coords

# Convert DataFrame to JSON
result = []

for _, row in data.iterrows():
    entry = {
        "name": row['Name'],
        "rang": row['Rang'],
        "total_professors": row['Anzahl Professuren'],
        "female_professors": row['davon weibl.1'],
        "female_quota": row['Frauenquote (in %)1'],
        "junior_professors": row['Anzahl Juniorprofessuren'],
        "female_junior_professors": row['davon weibl.2'],
        "junior_female_quota": row['Frauenquote (in %)2'],
        "coordinates": switch_coordinates(row['Koordinaten']),
        "total_professors_combined": row['Total Professors'],
        "total_female_quota": row['Total Female Quota']
    }
    result.append(entry)

# Convert the list of dictionaries to JSON
json_result = json.dumps(result, indent=4, ensure_ascii=False)

# Store the JSON result
with open("universities.json", "w", encoding="utf-8") as file:
    file.write(json_result)
