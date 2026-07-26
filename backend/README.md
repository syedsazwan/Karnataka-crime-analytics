# Backend — Data Pipeline

This folder contains the raw datasets and Python scripts used to process and generate the static data files served by the frontend.

## Folder Structure

```
backend/
├── datasets/        # Raw source CSV files (FIR data, police locations, etc.)
├── scripts/
│   ├── generate_data.py      # Generates processed JSON/CSV from raw datasets
│   └── process_datasets.py   # Additional dataset processing/merging
└── output/          # Processed output files (can be gitignored if large)
```

## How to Run

1. Make sure you have Python 3.8+ installed.
2. Install dependencies (if any):
   ```bash
   pip install pandas numpy
   ```
3. Run the data pipeline from the `backend/` directory:
   ```bash
   python scripts/process_datasets.py
   python scripts/generate_data.py
   ```
4. Copy the generated files from `output/` to `../frontend/public/data/` so the frontend can serve them.

## Data Sources

| File | Description |
|------|-------------|
| `datasets/FIR1.csv` … `FIR9.csv` | Raw FIR (First Information Report) records |
| `datasets/Karnataka_All_Police_Locations*.csv` | Police station coordinates |
| `datasets/Karnataka_Crime_Master_Dataset.csv` | Aggregated crime master data |
| `datasets/Karnataka_District_Crime_Master.csv` | District-level crime summary |
| `datasets/Karnataka_District_Demographics_Census2011*.csv` | Census demographic data |
| `datasets/Karnataka_Districts*.geojson` | District boundary GeoJSON |
| `datasets/Merged_Crime_Review_2025*.csv` | Monthly crime review data |
