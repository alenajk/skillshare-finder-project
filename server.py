"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session, jsonify
from model import User, Hobby, UserHobbyLevel, Location, CheckIn, connect_to_db, db
from twilio.rest import TwilioRestClient
import os

# Get keys into program
account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")

if not account_sid:
    print "Run your script to source the secrets!"

# Set up Twilio's python helper client
client = TwilioRestClient(account_sid, auth_token)

app = Flask(__name__)
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage"""

    # Check to see if logged in. If logged in, check to see if checked in,
    # and if so, pass checkedin to homepage template

    checkedin=None
    # *********
    if 'email' in session.keys():
        user_id=User.query.filter_by(email=session['email']).one().user_id
        checkedin = CheckIn.query.filter_by(user_id=user_id).all()
        if checkedin:
            # Make sure I'm getting the most recent checkin
            # Order by reverse ID
            print "checked in list: ", checkedin
            # iterate through and check to see if checked in?
            checkedin = checkedin[-1].checked_in
            print checkedin
        if checkedin == True:
            check_in_object = CheckIn.query.filter_by(user_id=user_id).all()[-1]
            lat = check_in_object.lat
            lon = check_in_object.lon
            checkin_id = check_in_object.check_in_id
            user_id = check_in_object.user_id
            hobby_id = check_in_object.hobby_id
            # City - str type not working in homepage.html variable def
            checkedin = [lat,lon,checkin_id,user_id,hobby_id]
            print checkedin
        else:
            checkedin = 'false'
    return render_template("homepage.html", checkedin=checkedin)

@app.route('/register', methods=['GET','POST'])
def register():
    
    if request.method == "POST":
       
        name = request.form.get('name')
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        phone = request.form.get('phone')
        pref = request.form.get('pref')

        temp = User.query.filter_by(email=email).all()

        if temp != []:
            flash("That email has already been registered.")
            return redirect('/register')
        else:
            # Create instance of User class with provided info and add to db
            user = User(name=name, username=username, password=password, 
                email=email, phone=phone, contact_pref=pref)
            db.session.add(user)
            db.session.commit()
            flash('You were successfully registered!')
            return redirect('/')
    
    return render_template('register.html')

@app.route('/login', methods=['GET','POST'])
def login():

    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')
        pw_in_db = User.query.filter_by(email=email).all()

        # Check to see if email exists in db
        if pw_in_db == []:
            flash("Looks like that email hasn't been registered yet.")
            return redirect('/register')
        else:
            if pw_in_db[0].password == password:
                print "email: ", email
                session['email'] = email
                print session['email']
                session['password'] = password
                user_id = User.query.filter_by(email=email).one().user_id
                flash("You've been successfully logged in!")
                return redirect("/")
            else:
                flash("Oops - wrong password. Try again.")
                return redirect("/login")

    return render_template("login_form.html")

@app.route('/logout')
def logout():

    session.clear()

    return redirect('/')

@app.route('/get_nearby')
def get_nearby():
    
    city = request.args.get('city')
    
    # Find the CheckIn objects for currently checked in users in same city as searched
    active_nearby_users = CheckIn.query.filter_by(checked_in=True,city=city).all()

    # Create a list of dictionaries containing nearby checked-in user location
    active_nearby_users_dicts = [user.to_dict() for user in active_nearby_users]
    print "active_nearby_users_dicts ", active_nearby_users_dicts

    return jsonify(reply=active_nearby_users_dicts)

@app.route('/checkin', methods=['GET','POST'])
def check_in():

    lat = float(request.form.get('lat'))
    lon = float(request.form.get('lon'))
    city = request.form.get('city')
    
    hobby = request.form.get('hobby')
    hobby_object = Hobby(name=hobby)
    db.session.add(hobby_object)
    db.session.commit()

    hobby_id = Hobby.query.filter_by(name=hobby).all()[0].hobby_id
    email = session['email']
    user = User.query.filter_by(email=email).one()
    user_id = user.user_id
    checkin = CheckIn(user_id=user_id, lat=lat, lon=lon, city=city, hobby_id=hobby_id, checked_in=True)

    # adding the location info to the DB
    db.session.add(checkin)
    db.session.commit()
    print checkin
    check_in_id = checkin.check_in_id
    username = checkin.user.username
    user_id = checkin.user_id
    lat = checkin.lat
    lon = checkin.lon
    city = checkin.city
    hobby = checkin.hobby.name

    reply = {
            'checkinId' : check_in_id,
            'username' : username,
            'userId' : user_id,
            'lat' : lat,
            'lon' : lon,
            'city' : city,
            'hobby' : hobby
            }

    # Send a message if collaborating
    other_username = request.form.get('other_username')
    print other_username
    if request.form.get('send_message'):
        other_user = User.query.filter_by(username=other_username).one()
        message = client.messages.create(body="User " +user.name+ " is on his/her way!",
        to="+1"+str(other_user.phone),
        from_="+16502156412")

    return jsonify(reply=reply)

@app.route('/checkout', methods=['GET','POST'])
def check_out():
    
    check_in_id = request.args.get('check_in_id')
    print "check_in_id", check_in_id
    check_in = CheckIn.query.filter_by(check_in_id=check_in_id).all()
    print "check_in", check_in
    check_in[0].checked_in = False
    db.session.commit()

    return "hi"

if __name__ == "__main__":
    app.debug = True

    connect_to_db(app)
    app.run()