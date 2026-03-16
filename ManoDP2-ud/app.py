import sys
sys.path.append("ai_model")
from ai_model.predict import predict_image
from flask import Flask, render_template, request, redirect, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import sqlite3
from flask import send_from_directory
import requests
from flask import url_for

app = Flask(__name__)   
app.secret_key = "manodp_secret_key"

app.config['SECRET_KEY'] = 'medilinksecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)

def fetch_medicine_from_api(name):

    url = f"https://api.fda.gov/drug/label.json?search=openfda.brand_name:{name}&limit=1"

    response = requests.get(url)

    if response.status_code == 200:

        data = response.json()

        try:

            result = data["results"][0]

            usage = result.get("indications_and_usage", ["Not available"])[0]

            dosage = result.get("dosage_and_administration", ["Not available"])[0]

            side_effects = result.get("adverse_reactions", ["Not available"])[0]

            return {
                "usage": usage,
                "dosage": dosage,
                "side_effects": side_effects
            }

        except:
            return None

    return None

# -------------------- DATABASE MODEL --------------------

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))
    role = db.Column(db.String(50))  # doctor / patient / pharmacy

class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    uses = db.Column(db.Text)
    dosage = db.Column(db.Text)
    side_effects = db.Column(db.Text)
    precautions = db.Column(db.Text)
    manufacturer = db.Column(db.String(200))
    
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------- ROUTES --------------------

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login", methods=["GET","POST"])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            login_user(user)   # IMPORTANT

            return redirect("/dashboard")

        else:
            flash("Invalid email or password")

    return render_template("login.html")

@app.route("/register", methods=["GET","POST"])
def register():

    if request.method == "POST":

        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        role = request.form["role"]

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            flash("Email already registered")
            return redirect("/register")

        hashed_password = generate_password_hash(password)

        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            role=role
        )

        db.session.add(new_user)
        db.session.commit()

        return redirect("/login")

    return render_template("register.html")

@app.route("/dashboard")
@login_required
def dashboard():

    return render_template("dashboard.html")

@app.route("/add_prescription", methods=["GET","POST"])
def add_prescription():

    if request.method == "POST":

        patient = request.form["patient_name"]
        medicine = request.form["medicine_name"]
        dosage = request.form["dosage"]
        notes = request.form["notes"]

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO prescriptions (patient_name, medicine_name, dosage, notes)
        VALUES (?, ?, ?, ?)
        """, (patient, medicine, dosage, notes))

        conn.commit()
        conn.close()

        return redirect("/dashboard")

    return render_template("add_prescription.html")

@app.route("/my_prescriptions")
@login_required
def my_prescriptions():

    if current_user.role == "patient":
        prescriptions = Prescription.query.filter_by(
            patient_id=current_user.id
        ).all()

    elif current_user.role == "doctor":
        prescriptions = Prescription.query.filter_by(
            doctor_id=current_user.id
        ).all()

    else:
        prescriptions = Prescription.query.all()

    return render_template("my_prescriptions.html", prescriptions=prescriptions)

@app.route("/mark_taken/<int:id>")
@login_required
def mark_taken(id):
    prescription = Prescription.query.get(id)
    if prescription and prescription.patient_id == current_user.id:
        prescription.status = "Taken"
        db.session.commit()
    return redirect(url_for("my_prescriptions"))

@app.route("/upload_medicine", methods=["GET", "POST"])
@login_required
def upload_medicine():

    if request.method == "POST":

        file = request.files.get("image")

        if file and file.filename != "":
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)

            result, confidence = predict_image(filepath)
            confidence = round(confidence * 100, 2)

            return render_template(
                "result.html",
                result=result,
                confidence=confidence,
                image=filepath
            )

    return render_template("upload.html")

@app.route("/scanner")
def scanner():
    return render_template("scanner.html")

@app.route("/scan", methods=["POST"])
def scan():

    file = request.files["image"]

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    file.save(filepath)

    # AI Prediction
    result, confidence = predict_image(filepath)

    result = result.lower()

    # Check database
    medicine = Medicine.query.filter_by(name=result).first()

    # If not found in database → call API
    if not medicine:

        api_data = fetch_medicine_from_api(result)

        if api_data:

            medicine = Medicine(
                name=result,
                uses=api_data.get("usage","Not available"),
                dosage=api_data.get("dosage","Not available"),
                side_effects=api_data.get("side_effects","Not available")
            )

            db.session.add(medicine)
            db.session.commit()

        else:

            # If API fails create fallback medicine
            medicine = Medicine(
                name=result,
                uses="Information not available",
                dosage="Consult a doctor",
                side_effects="Unknown"
            )

    return render_template(
        "result.html",
        result=result.capitalize(),
        confidence=round(confidence*100,2),
        image="uploads/" + filename,
        medicine=medicine
    )

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

# -------------------- PRESCRIPTION MODEL --------------------

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer)
    patient_id = db.Column(db.Integer)
    medicine_name = db.Column(db.String(100))
    dosage = db.Column(db.String(100))
    timing = db.Column(db.String(100))
    status = db.Column(db.String(50), default="Pending")

# -------------------- RUN --------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)