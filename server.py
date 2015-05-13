"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session
from model import User, Hobby, UserHobbyLevel, connect_to_db, db

app = Flask(__name__)

app.secret_key = "ABC"

app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage"""

    return render_template("homepage.html")

@app.route('/store_latlon', methods=['GET','POST'])
def store_latlon():

    lat = request.args.get('lat')
    lon = request.args.get('lon')
    lat = int(round(float(lat)))
    lon = int(round(float(lon)))
    print lat, lon
    try:
        location = User(name=lat,phone=lon)
    except Exception as e:
        print e
    print location
    # adding the user's location info to the DB
    db.session.add(location)
    db.session.commit()

    return "hi"
    

if __name__ == "__main__":
    app.debug = True

    connect_to_db(app)
    app.run()