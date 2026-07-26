import csv
import json
import random
from datetime import datetime, timedelta

# Karnataka Districts with representative center lat/lng and approximate FIR volume weight
DISTRICTS = [
    {"name": "Bengaluru City", "lat": 12.9716, "lng": 77.5946, "weight": 35, "stations": ["Cubbon Park", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "Hebbal", "Yelahanka", "Electronic City"]},
    {"name": "Bengaluru Dist", "lat": 13.0827, "lng": 77.5877, "weight": 8, "stations": ["Nelamangala", "Hosakote", "Doddaballapura", "Devanahalli"]},
    {"name": "Tumakuru", "lat": 13.3379, "lng": 77.1006, "weight": 5, "stations": ["Town PS", "Kyatsandra", "Tiptur", "Gubbi", "Sira"]},
    {"name": "Mysuru", "lat": 12.3051, "lng": 76.6551, "weight": 7, "stations": ["Devaraja PS", "Lashkar PS", "Vidyaranyapuram", "Nazarbad", "KRS Road"]},
    {"name": "Belagavi", "lat": 15.8497, "lng": 74.5165, "weight": 6, "stations": ["Camp PS", "Market PS", "Khade Bazar", "Tilakwadi", "Gokak"]},
    {"name": "Mangaluru", "lat": 12.9141, "lng": 74.8560, "weight": 5, "stations": ["Barkarke", "Panambur", "Kadri", "Urwa", "Surathkal"]},
    {"name": "Hubballi-Dharwad", "lat": 15.3647, "lng": 75.1240, "weight": 5, "stations": ["Suburban PS", "Vidyagiri", "Gokul Road", "Kamripeth", "Dharwad Town"]},
    {"name": "Kalaburagi", "lat": 17.3297, "lng": 76.8343, "weight": 4, "stations": ["Station Bazar", "Brahampur", "University PS", "Ashok Nagar"]},
    {"name": "Shivamogga", "lat": 13.9312, "lng": 75.5678, "weight": 3, "stations": ["Doddapet", "Tunga Nagar", "Vinoba Nagar", "Bhadravathi"]},
    {"name": "Ballari", "lat": 15.1456, "lng": 76.9234, "weight": 3, "stations": ["Cowl Bazar", "Brucepet", "Gandhinagar", "Hospet Town"]},
    {"name": "Udupi", "lat": 13.3409, "lng": 74.7421, "weight": 3, "stations": ["Town PS", "Manipal", "Malpe", "Kundapura"]},
    {"name": "Davanagere", "lat": 14.4678, "lng": 75.9234, "weight": 3, "stations": ["PJ Extension", "Azad Nagar", "Vidyanagar", "Harihar"]},
    {"name": "Hassan", "lat": 13.0075, "lng": 76.1023, "weight": 2, "stations": ["City PS", "Pension Mohalla", "Gorur", "Arsikere"]},
    {"name": "Mandya", "lat": 12.5234, "lng": 76.8956, "weight": 2, "stations": ["Central PS", "East PS", "Maddur", "Srirangapatna"]},
    {"name": "Kolar", "lat": 13.1367, "lng": 78.1345, "weight": 2, "stations": ["Town PS", "Gulpet", "Robertsonpet", "Bangarapet"]},
    {"name": "Kodagu", "lat": 12.4244, "lng": 75.7382, "weight": 1, "stations": ["Madikeri Town", "Gonikoppal", "Somwarpet", "Kushalnagar"]},
    {"name": "Bagalkote", "lat": 16.1856, "lng": 75.6987, "weight": 2, "stations": ["Town PS", "Navanagar", "Jamkhandi", "Ilkal"]},
    {"name": "Bidar", "lat": 17.9104, "lng": 77.5199, "weight": 2, "stations": ["Market PS", "Gandhi Gunj", "Basavakalyan", "Bhalki"]},
    {"name": "Vijayapura", "lat": 16.8302, "lng": 75.7100, "weight": 2, "stations": ["Gol Gumbaz PS", "Gandhi Chowk", "Adarsh Nagar", "Indi"]},
    {"name": "Chikkamagaluru", "lat": 13.3161, "lng": 75.7720, "weight": 1, "stations": ["Town PS", "Basavanahalli", "Kadur", "Tarikere"]},
    {"name": "Raichur", "lat": 16.2076, "lng": 77.3463, "weight": 2, "stations": ["Market PS", "Sadabad", "Manvi", "Sindhanur"]},
    {"name": "Yadgir", "lat": 16.7649, "lng": 77.1378, "weight": 1, "stations": ["Town PS", "Shahapur", "Shorapur"]},
    {"name": "Uttara Kannada", "lat": 14.8058, "lng": 74.1240, "weight": 1, "stations": ["Karwar Town", "Sirsi Town", "Bhatkal", "Dandeli"]},
    {"name": "Ramanagara", "lat": 12.7159, "lng": 77.2814, "weight": 2, "stations": ["Ijoor PS", "Channapatna", "Kanakapura", "Magadi"]},
    {"name": "Chamarajanagar", "lat": 11.9261, "lng": 76.9437, "weight": 1, "stations": ["Town PS", "Gundlupet", "Kollegal"]},
    {"name": "Chitradurga", "lat": 14.2251, "lng": 76.3980, "weight": 2, "stations": ["Town PS", "Kote PS", "Challakere", "Hiriyur"]},
    {"name": "Haveri", "lat": 14.7954, "lng": 75.3992, "weight": 1, "stations": ["Town PS", "Ranebennur", "Byadgi"]},
    {"name": "Gadag", "lat": 15.4319, "lng": 75.6322, "weight": 1, "stations": ["Town PS", "Betageri", "Nargund"]},
    {"name": "Koppal", "lat": 15.3524, "lng": 76.1543, "weight": 1, "stations": ["Town PS", "Gangavathi", "Kushtagi"]},
    {"name": "Chikkaballapura", "lat": 13.4325, "lng": 77.7275, "weight": 1, "stations": ["Town PS", "Gauribidanur", "Chintamani"]},
    {"name": "Vijayanagara", "lat": 15.2721, "lng": 76.3912, "weight": 2, "stations": ["Hospet Town", "Harapanahalli", "Kudligi"]}
]

CRIME_TYPES = [
    {"type": "MOTOR VEHICLE ACCIDENTS NON-FATAL", "weight": 27, "ipc": "Sec 279, 337 IPC", "risk": "Medium"},
    {"type": "THEFT", "weight": 18, "ipc": "Sec 379 IPC", "risk": "Medium"},
    {"type": "CrPC OFFENCES", "weight": 15, "ipc": "Sec 107, 151 CrPC", "risk": "Low"},
    {"type": "HURT / ASSAULT", "weight": 14, "ipc": "Sec 323, 324, 504 IPC", "risk": "High"},
    {"type": "MISSING PERSON", "weight": 14, "ipc": "Sec 363 IPC", "risk": "Medium"},
    {"type": "KPA 1963 VIOLATIONS", "weight": 12, "ipc": "Sec 78, 87 KPA", "risk": "Low"},
    {"type": "BURGLARY / HOUSE BREAKING", "weight": 8, "ipc": "Sec 454, 457, 380 IPC", "risk": "High"},
    {"type": "ROBBERY / DACOITY", "weight": 5, "ipc": "Sec 392, 395 IPC", "risk": "Critical"},
    {"type": "CYBER CRIME & FRAUD", "weight": 7, "ipc": "Sec 66D IT Act, 420 IPC", "risk": "High"},
    {"type": "NARCOTICS (NDPS)", "weight": 4, "ipc": "Sec 20(b), 22 NDPS Act", "risk": "Critical"}
]

STATUSES = ["Investigating", "Solved", "Pending", "Closed", "Charge Sheeted"]

def generate_fir_dataset(num_records=5000):
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 7, 25)
    total_days = (end_date - start_date).days

    district_weights = [d["weight"] for d in DISTRICTS]
    crime_weights = [c["weight"] for c in CRIME_TYPES]

    firs = []
    for i in range(1, num_records + 1):
        dist = random.choices(DISTRICTS, weights=district_weights)[0]
        crime = random.choices(CRIME_TYPES, weights=crime_weights)[0]
        station = random.choice(dist["stations"])
        
        # Jitter latitude/longitude around district center
        lat = round(dist["lat"] + random.uniform(-0.08, 0.08), 4)
        lng = round(dist["lng"] + random.uniform(-0.08, 0.08), 4)
        
        random_day = random.randint(0, total_days)
        fir_date = start_date + timedelta(days=random_day, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        date_str = fir_date.strftime("%Y-%m-%d %H:%M:%S")
        
        fir_num = f"KSP/{dist['name'].upper()[:3]}/{fir_date.year}/{i:05d}"
        status = random.choice(STATUSES)
        
        # AI prediction confidence calculation simulation
        ai_pred_score = round(random.uniform(85.0, 98.5), 1)
        pred_label = "High Risk Zone" if crime["risk"] in ["High", "Critical"] else "Standard Monitoring"
        
        firs.append({
            "FIR_Number": fir_num,
            "Crime_Type": crime["type"],
            "District": dist["name"],
            "Police_Station": station,
            "Latitude": lat,
            "Longitude": lng,
            "Date": date_str,
            "Status": status,
            "IPC_Sections": crime["ipc"],
            "Risk_Level": crime["risk"],
            "AI_Confidence": ai_pred_score,
            "Prediction_Flag": pred_label
        })

    with open("public/data/karnataka_fir_dataset.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=firs[0].keys())
        writer.writeheader()
        writer.writerows(firs)
    print(f"Generated {len(firs)} FIR records in public/data/karnataka_fir_dataset.csv")

def generate_karnataka_geojson():
    # Simplified feature collection of Karnataka District polygons for interactive GIS map display
    features = []
    for d in DISTRICTS:
        lat, lng = d["lat"], d["lng"]
        # Generate octagon polygon shape around lat/lng
        r_lat, r_lng = 0.18, 0.22
        coords = [
            [lng - r_lng, lat - r_lat/2],
            [lng - r_lng/2, lat - r_lat],
            [lng + r_lng/2, lat - r_lat],
            [lng + r_lng, lat - r_lat/2],
            [lng + r_lng, lat + r_lat/2],
            [lng + r_lng/2, lat + r_lat],
            [lng - r_lng/2, lat + r_lat],
            [lng - r_lng, lat + r_lat/2],
            [lng - r_lng, lat - r_lat/2]
        ]
        features.append({
            "type": "Feature",
            "properties": {
                "district": d["name"],
                "weight": d["weight"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            }
        })
        
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open("public/data/karnataka_districts.json", "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print("Generated public/data/karnataka_districts.json GeoJSON boundary")

if __name__ == "__main__":
    generate_fir_dataset(5500)
    generate_karnataka_geojson()
