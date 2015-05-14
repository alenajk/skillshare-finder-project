"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session
from model import User, Hobby, UserHobbyLevel, Location, CheckIn, connect_to_db, db

app = Flask(__name__)

app.secret_key = "ABC"

app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage"""

    return render_template("homepage.html")

@app.route('/checkin', methods=['GET','POST'])
def check_in():

    print request.args.get('lat')
    lat = int(round(float(request.args.get('lat'))))
    lon = int(round(float(request.args.get('lon'))))
    city = request.args.get('city')
    checkin = CheckIn(lat=lat, lon=lon, city=city)

    # adding the location info to the DB
    db.session.add(checkin)
    print "hi"
    db.session.commit()
    print "hi"
    
    return "hi"

@app.route('/register', methods=['GET','POST'])
def register():
    
    if request.method == "POST":
        username = reguest.form.get('username')
        password = reqeust.form.get('password')

        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()

        return redirect('/')
    return render_template('register.html')

if __name__ == "__main__":
    app.debug = True

    connect_to_db(app)
    app.run()