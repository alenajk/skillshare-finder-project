"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session, jsonify
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

    print "hi"
    print request.args.get('lat')
    lat = int(round(float(request.args.get('lat'))))
    lon = int(round(float(request.args.get('lon'))))
    city = request.args.get('city')
    checkin = CheckIn(lat=lat, lon=lon, city=city, checked_in=True)

    # adding the location info to the DB
    db.session.add(checkin)
    db.session.commit()
    check_in_id = checkin.check_in_id
    print check_in_id
    reply = {'check_in_id' : check_in_id}
    return jsonify(reply=reply)

@app.route('/checkout', methods=['GET','POST'])
def check_out():
    
    print "hello"
    check_in_id = request.args.get('check_in_id')
    print "check_in_id", check_in_id
    check_in = CheckIn.query.filter_by(check_in_id=check_in_id).all()
    print "check_in", check_in
    check_in[0].checked_in = False
    db.session.commit()

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