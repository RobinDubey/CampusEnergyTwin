
from flask import Flask, render_template, jsonify
from datetime import datetime
import random

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")
@app.route("/buildings")
def buildings_page():
    return render_template("buildings.html")


@app.route("/analytics")
def analytics_page():
    return render_template("analytics.html")


@app.route("/schedule")
def schedule_page():
    return render_template("schedule.html")


@app.route("/alerts")
def alerts_page():
    return render_template("alerts.html")

@app.route("/api/dashboard")
def dashboard():
    buildings = {
    "Admin Block": 290,
    "Auditorium": 350,
    "Computer Lab": 680,
    "Library": 420,
    "Science Block": 510,
    "Engineering Block": 460,
    "Canteen": 180,
    "Girls Hostel": 390,
    "Boys Hostel": 440,
    "Sports Complex": 260,
    "Seminar Hall": 220,
    "Research Centre": 570,
    "Workshop": 330,
    "Parking Area": 150,
    "Medical Room": 120,
    "IT Centre": 490,
    "Mechanical Lab": 380,
    "Electrical Lab": 310,
    "Main Campus Office": 240,
    "Student Activity Centre": 200
    }

    total_energy = sum(buildings.values())

    carbon_intensity = [
        random.randint(250, 500) for _ in range(24)
    ]

    anomalies = [
        {
            "building": "Computer Lab",
            "hour": 14,
            "usage": 180,
            "average": 95,
            "message": "Unusually high energy consumption detected."
        }
    ]

    schedule = [
        {
            "task": "EV Charging",
            "hour": "08:00",
            "energy_kwh": 50,
            "carbon_intensity": 280,
            "estimated_emissions_kg": 14
        },
        {
            "task": "Classroom Lighting",
            "hour": "08:30",
            "energy_kwh": 20,
            "carbon_intensity": 300,
            "estimated_emissions_kg": 6
        },
        {
            "task": "Computer Lab",
            "hour": "09:00",
            "energy_kwh": 65,
            "carbon_intensity": 270,
            "estimated_emissions_kg": 17.55
        },
        {
            "task": "Library AC",
            "hour": "10:00",
            "energy_kwh": 45,
            "carbon_intensity": 260,
            "estimated_emissions_kg": 11.7
        },
        {
            "task": "Water Pumping",
            "hour": "10:30",
            "energy_kwh": 30,
            "carbon_intensity": 320,
            "estimated_emissions_kg": 9.6
        },
        {
            "task": "Auditorium Lighting",
            "hour": "11:00",
            "energy_kwh": 25,
            "carbon_intensity": 290,
            "estimated_emissions_kg": 7.25
        },
        {
            "task": "Cafeteria Equipment",
            "hour": "11:30",
            "energy_kwh": 35,
            "carbon_intensity": 340,
            "estimated_emissions_kg": 11.9
        },
        {
            "task": "Admin Block AC",
            "hour": "12:00",
            "energy_kwh": 55,
            "carbon_intensity": 310,
            "estimated_emissions_kg": 17.05
        },
        {
            "task": "Server Room Cooling",
            "hour": "12:30",
            "energy_kwh": 60,
            "carbon_intensity": 350,
            "estimated_emissions_kg": 21
        },
        {
            "task": "Projector and Smart Boards",
            "hour": "13:00",
            "energy_kwh": 18,
            "carbon_intensity": 300,
            "estimated_emissions_kg": 5.4
        },
        {
            "task": "Research Lab Equipment",
            "hour": "13:30",
            "energy_kwh": 40,
            "carbon_intensity": 360,
            "estimated_emissions_kg": 14.4
        },
        {
            "task": "Computer Lab Cooling",
            "hour": "14:00",
            "energy_kwh": 70,
            "carbon_intensity": 380,
            "estimated_emissions_kg": 26.6
        },
        {
            "task": "Lift and Elevators",
            "hour": "14:30",
            "energy_kwh": 22,
            "carbon_intensity": 330,
            "estimated_emissions_kg": 7.26
        },
        {
            "task": "Sports Complex Lighting",
            "hour": "15:00",
            "energy_kwh": 28,
            "carbon_intensity": 300,
            "estimated_emissions_kg": 8.4
        },
        {
            "task": "Laundry and Cleaning",
            "hour": "15:30",
            "energy_kwh": 15,
            "carbon_intensity": 290,
            "estimated_emissions_kg": 4.35
        },
        {
            "task": "Lab Equipment",
            "hour": "16:00",
            "energy_kwh": 40,
            "carbon_intensity": 410,
            "estimated_emissions_kg": 16.4
        },
        {
            "task": "EV Charging Evening",
            "hour": "17:00",
            "energy_kwh": 50,
            "carbon_intensity": 270,
            "estimated_emissions_kg": 13.5
        },
        {
            "task": "Outdoor Campus Lighting",
            "hour": "18:00",
            "energy_kwh": 15,
            "carbon_intensity": 250,
            "estimated_emissions_kg": 3.75
        },
        {
            "task": "Security Systems",
            "hour": "20:00",
            "energy_kwh": 12,
            "carbon_intensity": 260,
            "estimated_emissions_kg": 3.12
        },
        {
            "task": "Night Building Ventilation",
            "hour": "21:00",
            "energy_kwh": 32,
            "carbon_intensity": 240,
            "estimated_emissions_kg": 7.68
        }
    ]

    return jsonify({
        "total_energy_kwh": total_energy,
        "estimated_emissions_kg": round(
            sum(item["estimated_emissions_kg"] for item in schedule), 2
        ),
        "anomaly_count": len(anomalies),
        "building_totals": buildings,
        "carbon_intensity": carbon_intensity,
        "anomalies": anomalies,
        "schedule": schedule,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "data_mode": "Demo data"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)